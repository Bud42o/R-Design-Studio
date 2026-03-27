import { createSessionToken, getConfiguredUser, setSessionCookie, verifyPassword } from "./_auth.js";

export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const configuredUser = getConfiguredUser();
  if (!configuredUser) {
    return res.status(500).json({
      error: "Dashboard auth is not configured. Set DASHBOARD_EMAIL and DASHBOARD_PASSWORD (or DASHBOARD_PASSWORD_SHA256).",
    });
  }

  const email = String(req.body?.email || "").trim().toLowerCase();
  const password = String(req.body?.password || "");

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  if (email !== configuredUser.email || !verifyPassword(password, configuredUser)) {
    return res.status(401).json({ error: "Invalid email or password." });
  }

  try {
    const token = createSessionToken(email);
    setSessionCookie(res, token);
    return res.status(200).json({ ok: true, user: { email } });
  } catch {
    return res.status(500).json({ error: "Session signing is not configured. Set SESSION_SECRET." });
  }
}
