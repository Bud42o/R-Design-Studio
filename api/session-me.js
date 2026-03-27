import { readSessionFromRequest } from "./_auth.js";

export default function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const session = readSessionFromRequest(req);
  if (!session) {
    return res.status(401).json({ error: "Not signed in." });
  }

  return res.status(200).json({ ok: true, user: { email: session.email } });
}
