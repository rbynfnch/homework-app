import { usersStore, familyDataStore } from "./_lib/store.js";
import { getSessionEmail, json } from "./_lib/auth.js";

export const config = { path: "/api/data" };

export default async (req) => {
  let email;
  try {
    email = getSessionEmail(req);
  } catch (e) {
    return json({ error: "Server error: " + e.message }, 500);
  }
  if (!email) return json({ error: "Not logged in" }, 401);

  try {
    const users = usersStore();
    const user = await users.get(`user:${email}`, { type: "json" });
    if (!user) return json({ error: "Not logged in" }, 401);

    const familyCode = user.familyCode;
    const store = familyDataStore();
    const url = new URL(req.url);

    if (req.method === "GET") {
      const key = url.searchParams.get("key");
      if (!key) return json({ error: "Missing key" }, 400);
      const value = await store.get(`${familyCode}:${key}`, { type: "text" });
      return json({ value: value ?? null });
    }

    if (req.method === "POST") {
      let body;
      try {
        body = await req.json();
      } catch {
        return json({ error: "Invalid request body." }, 400);
      }
      const { key, value } = body;
      if (!key || value == null) return json({ error: "Missing key or value" }, 400);
      await store.set(`${familyCode}:${key}`, value);
      return json({ ok: true });
    }

    if (req.method === "DELETE") {
      const key = url.searchParams.get("key");
      if (!key) return json({ error: "Missing key" }, 400);
      await store.delete(`${familyCode}:${key}`);
      return json({ ok: true });
    }

    return json({ error: "Method not allowed" }, 405);
  } catch (e) {
    return json({ error: "Server error: " + e.message }, 500);
  }
};
