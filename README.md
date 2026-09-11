# Homework App — Netlify hosting

This is the same app, rebuilt to run on Netlify instead of GoDaddy/PHP/MySQL.
No database to set up — accounts and the shared homework list are stored in
**Netlify Blobs**, which is built into every Netlify site automatically.

```
public/index.html          — the app itself (unchanged, just points at /api/* now)
netlify/functions/         — the backend, as small Node.js functions
  register.js  login.js  logout.js  me.js  data.js
  _lib/auth.js             — session cookies, password hashing, family codes
  _lib/store.js            — Netlify Blobs helpers
netlify.toml                — tells Netlify where the site & functions live
package.json                 — the one dependency (@netlify/blobs)
```

## 1. Put this in a GitHub repo

1. Create a new (empty) repository on [github.com](https://github.com) —
   call it whatever you like, e.g. `homework-app`.
2. Push everything in this folder to it. If you're comfortable with git:
   ```
   cd homework-app-netlify
   git init
   git add .
   git commit -m "Homework app"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/homework-app.git
   git push -u origin main
   ```
   If you'd rather not use the command line, GitHub's web UI lets you drag
   and drop all these files/folders directly into a new repo (github.com →
   your new repo → "uploading an existing file").

## 2. Connect it to Netlify

1. Go to [app.netlify.com](https://app.netlify.com) and sign up / log in
   (you can sign up directly with your GitHub account, which makes the
   next step automatic).
2. Click **Add new site → Import an existing project**.
3. Choose **GitHub**, authorize Netlify if asked, and pick your repo.
4. Netlify should auto-detect the settings from `netlify.toml` (publish
   directory `public`, functions in `netlify/functions`). Leave the build
   command as `npm install` — there's no actual build step, that command
   just installs the one dependency.
5. Click **Deploy**.

## 3. Set your session secret

Before logging in will work, you need one environment variable:

1. In your new site's Netlify dashboard: **Site configuration → Environment
   variables → Add a variable**.
2. Key: `SESSION_SECRET`
   Value: any long random string — for example, run this on your own
   computer to generate one:
   ```
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
   (or just mash the keyboard for 40+ characters — it only needs to be
   long and unpredictable, nobody needs to type it in).
3. Save, then go to **Deploys** and click **Trigger deploy → Deploy site**
   once so the function picks up the new variable.

That's it — no database, no credentials to match up, nothing else to
configure. Netlify Blobs is available automatically to every function on
your site.

## 4. Try it

Visit the `https://your-site-name.netlify.app` URL Netlify gives you. You
should see the "Homework" welcome screen with **Log in** / **Sign up**.

1. Sign up as a parent, choosing **Create a family** — you'll be shown a
   family code immediately.
2. In a private/incognito window (or on your student's device), sign up,
   choose **Join a family**, and enter that code with role **Student**.
3. Both accounts now share the same class subjects and assignments.

## How accounts work

- The first person signs up and **creates a family**, generating a short
  family code (like `7QQMPX`).
- Everyone else joins that family with the code.
- Everyone has their own email/password login; everyone in the family
  shares one homework list. The family code is always visible again later
  under the account icon (top right of the app).
- Tap the palette icon to pick a color scheme — School Colors, Boho
  Neutral, Happy Kid Colors, or Colorblind Friendly. Whoever picks it sets
  it for the whole family.

## Notes

- **Passwords** are salted and hashed with scrypt (Node's built-in,
  industry-standard password hashing) — never stored in plain text.
- **Sessions** are a signed cookie (HMAC-SHA256, no server-side session
  store needed) — this is what `SESSION_SECRET` protects. If that value
  ever leaks, rotate it in the Netlify dashboard and everyone will need to
  log in again.
- **Family data** is stored in Netlify Blobs under keys scoped to each
  family's code, and every function checks the logged-in user's own
  session before reading or writing — one family can't see another's data.
- A custom domain (instead of `*.netlify.app`) can be added for free under
  **Domain management** in the site's Netlify dashboard whenever you're
  ready.
- Local testing before pushing to GitHub is possible with the
  [Netlify CLI](https://docs.netlify.com/cli/get-started/)
  (`npm install -g netlify-cli`, then `netlify dev` from this folder) if
  you ever want it, but isn't required — pushing to GitHub and letting
  Netlify build it is enough on its own.
