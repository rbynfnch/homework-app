import { usersStore } from "./_lib/store.js";
import { getSessionEmail, json } from "./_lib/auth.js";

export const config = { path: "/api/me" };

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

    return json({
      user: {
        email: user.email,
        displayName: user.displayName,
        role: user.role,
        familyCode: user.familyCode,
        familyName: user.familyName,
      },
    });
  } catch (e) {
    return json({ error: "Server error: " + e.message }, 500);
  }
};
