import { clearSessionCookie, json } from "./_lib/auth.js";

export const config = { path: "/api/logout" };

export default async () => {
  return json({ ok: true }, 200, { "Set-Cookie": clearSessionCookie() });
};
