import { usersStore } from "./_lib/store.js";
import { verifyPassword, makeSessionCookie, json } from "./_lib/auth.js";

export const config = { path: "/api/login" };

export default async (req) => {
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  let body;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid request body." }, 400);
  }

  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");
  if (!email || !password) return json({ error: "Enter your email and password." }, 400);

  try {
    const users = usersStore();
    const user = await users.get(`user:${email}`, { type: "json" });
    if (!user || !verifyPassword(password, user.passwordHash)) {
      return json({ error: "That email and password don't match." }, 401);
    }

    const cookie = makeSessionCookie(email);
    return json(
      {
        user: {
          email: user.email,
          displayName: user.displayName,
          role: user.role,
          familyCode: user.familyCode,
          familyName: user.familyName,
        },
      },
      200,
      { "Set-Cookie": cookie }
    );
  } catch (e) {
    return json({ error: "Server error: " + e.message }, 500);
  }
};
