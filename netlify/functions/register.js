import { usersStore, familiesStore } from "./_lib/store.js";
import { hashPassword, makeSessionCookie, randomFamilyCode, json } from "./_lib/auth.js";

export const config = { path: "/api/register" };

export default async (req) => {
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  let body;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid request body." }, 400);
  }

  const mode = body.mode;
  const displayName = String(body.displayName || "").trim();
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");
  const role = body.role;

  if (!displayName || !email || password.length < 6) {
    return json({ error: "Fill in your name, email, and a password of at least 6 characters." }, 400);
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ error: "That email address doesn't look right." }, 400);
  }
  if (!["parent", "student"].includes(role)) {
    return json({ error: "Invalid role." }, 400);
  }
  if (!["create", "join"].includes(mode)) {
    return json({ error: "Invalid signup mode." }, 400);
  }

  let users, families;
  try {
    users = usersStore();
    families = familiesStore();
  } catch (e) {
    return json({ error: "Server error: " + e.message }, 500);
  }

  try {
    const existing = await users.get(`user:${email}`, { type: "json" });
    if (existing) {
      return json({ error: "An account with that email already exists — try logging in instead." }, 409);
    }

    let familyCode, familyName;

    if (mode === "create") {
      familyName = String(body.familyName || "").trim() || `${displayName}'s Family`;
      let code;
      do {
        code = randomFamilyCode();
      } while (await families.get(`family:${code}`, { type: "json" }));
      familyCode = code;
      await families.setJSON(`family:${familyCode}`, { code: familyCode, name: familyName });
    } else {
      const code = String(body.familyCode || "").trim().toUpperCase();
      if (!code) return json({ error: "Enter the family code your parent or student shared with you." }, 400);
      const famRecord = await families.get(`family:${code}`, { type: "json" });
      if (!famRecord) {
        return json({ error: "We couldn't find a family with that code. Double check it and try again." }, 404);
      }
      familyCode = famRecord.code;
      familyName = famRecord.name;
    }

    const user = {
      email,
      displayName,
      role,
      familyCode,
      familyName,
      passwordHash: hashPassword(password),
      createdAt: Date.now(),
    };
    await users.setJSON(`user:${email}`, user);

    const cookie = makeSessionCookie(email);
    return json(
      { user: { email, displayName, role, familyCode, familyName } },
      200,
      { "Set-Cookie": cookie }
    );
  } catch (e) {
    return json({ error: "Server error: " + e.message }, 500);
  }
};
