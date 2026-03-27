import { BetaAnalyticsDataClient } from "@google-analytics/data";
import { readSessionFromRequest } from "./_auth.js";

function buildDateKey(offsetDays) {
  const date = new Date();
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() - offsetDays);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}${month}${day}`;
}

function sumWindow(values, count, offset = 0) {
  const start = Math.max(0, values.length - offset - count);
  const end = values.length - offset;
  return values.slice(start, end).reduce((sum, value) => sum + value, 0);
}

function percentDelta(current, previous) {
  if (!previous && !current) return 0;
  if (!previous) return 100;
  return Number((((current - previous) / previous) * 100).toFixed(1));
}

function createAnalyticsClient() {
  const clientEmail = process.env.GA4_CLIENT_EMAIL;
  const privateKey = process.env.GA4_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (clientEmail && privateKey) {
    return new BetaAnalyticsDataClient({
      credentials: {
        client_email: clientEmail,
        private_key: privateKey,
      },
    });
  }

  return new BetaAnalyticsDataClient();
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const session = readSessionFromRequest(req);
  if (!session) {
    return res.status(401).json({ error: "Not signed in." });
  }

  const propertyId = process.env.GA4_PROPERTY_ID;
  if (!propertyId) {
    return res.status(500).json({ error: "Missing GA4_PROPERTY_ID." });
  }

  try {
    const analytics = createAnalyticsClient();
    const [report] = await analytics.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: "365daysAgo", endDate: "today" }],
      dimensions: [{ name: "date" }],
      metrics: [{ name: "activeUsers" }],
      orderBys: [{ dimension: { dimensionName: "date" }, desc: false }],
      limit: 400,
    });

    const rowMap = new Map();
    for (const row of report.rows || []) {
      const key = row.dimensionValues?.[0]?.value;
      const value = Number(row.metricValues?.[0]?.value || 0);
      if (key) rowMap.set(key, value);
    }

    const series = [];
    for (let i = 364; i >= 0; i -= 1) {
      const key = buildDateKey(i);
      series.push({
        date: key,
        value: rowMap.get(key) || 0,
      });
    }

    const values = series.map((entry) => entry.value);
    const last30 = sumWindow(values, 30, 0);
    const prev30 = sumWindow(values, 30, 30);
    const last7 = sumWindow(values, 7, 0);
    const prev7 = sumWindow(values, 7, 7);
    const today = values[values.length - 1] || 0;
    const yesterday = values[values.length - 2] || 0;

    return res.status(200).json({
      ok: true,
      user: { email: session.email },
      totals: {
        days30: last30,
        days7: last7,
        today,
        change30: percentDelta(last30, prev30),
        change7: percentDelta(last7, prev7),
        changeToday: percentDelta(today, yesterday),
      },
      series,
    });
  } catch (error) {
    console.error("dashboard-metrics error", error);
    return res.status(500).json({
      error:
        "Failed to read analytics data. Confirm GA4_PROPERTY_ID, GA4_CLIENT_EMAIL, GA4_PRIVATE_KEY, and that the service account has GA4 access.",
    });
  }
}
