import crypto from "node:crypto";

const SESSION_COOKIE_NAME = "rdash_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

function base64UrlEncode(value) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function base64UrlDecode(value) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function createSignature(payload, secret) {
  return crypto.createHmac("sha256", secret).update(payload).digest("base64url");
}

export function getConfiguredUser() {
  const email = process.env.DASHBOARD_EMAIL?.trim().toLowerCase();
  const password = process.env.DASHBOARD_PASSWORD;
  const passwordSha256 = process.env.DASHBOARD_PASSWORD_SHA256?.trim().toLowerCase();

  if (!email || (!password && !passwordSha256)) {
    return null;
  }

  return { email, password, passwordSha256 };
}

export function parseCookies(req) {
  const cookieHeader = req.headers.cookie || "";
  return cookieHeader
    .split(";")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .reduce((acc, pair) => {
      const eq = pair.indexOf("=");
      if (eq === -1) return acc;
      const key = pair.slice(0, eq);
      const value = pair.slice(eq + 1);
      acc[key] = decodeURIComponent(value);
      return acc;
    }, {});
}

export function verifyPassword(inputPassword, configuredUser) {
  if (!configuredUser) return false;

  const inputDigest = crypto.createHash("sha256").update(inputPassword || "", "utf8").digest("hex");

  if (configuredUser.password) {
    const configuredDigest = crypto.createHash("sha256").update(configuredUser.password, "utf8").digest("hex");
    return inputDigest === configuredDigest;
  }

  return inputDigest === configuredUser.passwordSha256;
}

export function createSessionToken(email) {
  const sessionSecret = process.env.SESSION_SECRET;
  if (!sessionSecret) {
    throw new Error("Missing SESSION_SECRET");
  }

  const payload = JSON.stringify({
    email,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  });

  const encodedPayload = base64UrlEncode(payload);
  const signature = createSignature(encodedPayload, sessionSecret);
  return `${encodedPayload}.${signature}`;
}

export function readSessionFromRequest(req) {
  const sessionSecret = process.env.SESSION_SECRET;
  if (!sessionSecret) {
    return null;
  }

  const cookies = parseCookies(req);
  const token = cookies[SESSION_COOKIE_NAME];
  if (!token) return null;

  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature) return null;

  const expected = createSignature(encodedPayload, sessionSecret);
  if (signature !== expected) return null;

  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload));
    if (!payload?.email || !payload?.exp) return null;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return { email: payload.email };
  } catch {
    return null;
  }
}

export function setSessionCookie(res, token) {
  const secure = process.env.NODE_ENV === "production" ? "Secure; " : "";
  res.setHeader(
    "Set-Cookie",
    `${SESSION_COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; ${secure}SameSite=Lax; Max-Age=${SESSION_TTL_SECONDS}`
  );
}

export function clearSessionCookie(res) {
  const secure = process.env.NODE_ENV === "production" ? "Secure; " : "";
  res.setHeader(
    "Set-Cookie",
    `${SESSION_COOKIE_NAME}=; Path=/; HttpOnly; ${secure}SameSite=Lax; Max-Age=0`
  );
}
