# DealFlow AI — Landing Site

A single-page React (Vite) landing page. This README is the complete deploy guide.

## What this is
- `index.html` — page entry
- `src/main.jsx` — React mount
- `src/App.jsx` — the entire landing page
- `package.json`, `vite.config.js` — build config

You do NOT need to edit any code to deploy. Just follow the steps.

---

## Deploy to Vercel (free, ~10 minutes)

### Step 1 — Put these files in a GitHub repo
Option A (browser, easiest):
1. Go to github.com → New repository → name it `dealflow-landing` → Create.
2. On the new repo page, click **"uploading an existing file"**.
3. Drag in ALL these files, keeping the folder structure:
   - `index.html`
   - `package.json`
   - `vite.config.js`
   - `.gitignore`
   - `src/main.jsx`
   - `src/App.jsx`
   (To upload the `src` folder, drag the whole `src` folder in — GitHub preserves it.)
4. Commit.

Option B (terminal, if you prefer):
```
cd dealflow-site
git init
git add -A
git commit -m "DealFlow AI landing page"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/dealflow-landing.git
git push -u origin main
```

### Step 2 — Connect Vercel (this part must be you — it's your login)
1. Go to vercel.com → sign in with GitHub.
2. Click **Add New… → Project**.
3. Select the `dealflow-landing` repo → Import.
4. Vercel auto-detects Vite. Leave all settings default.
5. Click **Deploy**.
6. ~60 seconds later you get a live URL: `dealflow-landing.vercel.app`

That URL is what you send people. Done.

### Step 3 (optional) — Custom domain
In the Vercel project → Settings → Domains, add a domain you buy
(~$12/yr from Namecheap/Cloudflare). Point it and you're at `dealflow.ai`.

---

## To run locally first (optional sanity check)
```
npm install
npm run dev
```
Opens at localhost:5173.

## To update the page later
Edit `src/App.jsx`, push to GitHub. Vercel auto-redeploys on every push.
