# 🚀 Deploying the portfolio to Vercel

This is a **static site** (plain HTML/CSS/JS) — no build step, no environment
variables needed. The AI chat works out of the box (offline resume mode).

---

## Option A — Drag & drop (2 minutes, no GitHub)

1. Go to **https://vercel.com** and sign up/log in (GitHub or email).
2. Click **Add New… → Project**.
3. Drag the **`kartik-portfolio` folder** (the folder that contains
   `index.html`) onto the page — look for the *"Deploy a project without Git"*
   area at the bottom of the import screen.
4. Wait ~30 seconds. You get a live URL like `kartik-portfolio.vercel.app`.
5. Rename it under **Project → Settings → Domains**
   (e.g. `kartik-bhatia.vercel.app`).

✅ Done. Share the link on your resume and LinkedIn.

---

## Option B — GitHub + Vercel (auto-deploys on every push)

1. Create a repo on GitHub and upload/push the contents of this folder:
   ```bash
   cd kartik-portfolio
   git init
   git add .
   git commit -m "Portfolio"
   git branch -M main
   git remote add origin https://github.com/KB1801/<your-repo>.git
   git push -u origin main
   ```
2. On Vercel: **Add New… → Project → Import** the repo.
3. Framework Preset: **Other** (leave Build Command / Output Directory empty).
4. Click **Deploy**.
5. Any future `git push` redeploys automatically.

---

## Optional upgrades after deploy

### 1) Feedback form → messages land in your inbox
- Create a free form at https://formspree.io (1 minute).
- Copy the form endpoint, e.g. `https://formspree.io/f/abcdwxyz`.
- Open `js/main.js`, set:
  ```js
  const FORMSPREE_ENDPOINT = 'https://formspree.io/f/abcdwxyz';
  ```
- Redeploy. Until this is set, the form opens the visitor's email app.

### 2) Real Groq LLM for the chat (instead of offline mode)
- Get a free key: https://console.groq.com/keys
- Deploy the `backend/` folder on https://render.com (free tier):
  - Root Directory: `backend`
  - Build: `pip install -r requirements.txt`
  - Start: `uvicorn main:app --host 0.0.0.0 --port $PORT`
  - Env var: `GROQ_API_KEY = gsk_...`
- Copy the Render URL, e.g. `https://kartik-portfolio-api.onrender.com`
- Open `js/chat.js` and add at the very top:
  ```js
  window.CHAT_BACKEND_URL = 'https://kartik-portfolio-api.onrender.com';
  ```
- Redeploy the frontend. (Free Render sleeps when idle — the site
  automatically falls back to offline mode if it's asleep.)

---

## Checklist before sharing
- [x] Resume PDF is in `assets/resume/Kartik-Bhatia-Resume.pdf`
- [ ] Add your photo (optional) → `assets/profile.jpg` + uncomment the photo block in `index.html`
- [ ] Add CGPA (optional) → `cgpa: "8.x CGPA"` in `js/data.js`
- [x] GitHub/LinkedIn links point to your real profiles
- [ ] (Optional) Formspree endpoint in `js/main.js`
- [ ] (Optional) Groq backend URL in `js/chat.js`
