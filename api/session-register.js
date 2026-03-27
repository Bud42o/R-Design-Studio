export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  return res.status(403).json({
    error:
      "Self-registration is disabled for this dashboard. Ask the site owner to configure DASHBOARD_EMAIL and DASHBOARD_PASSWORD in Vercel.",
  });
}
