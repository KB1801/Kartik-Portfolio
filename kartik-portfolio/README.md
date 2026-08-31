# 💻 Kartik Bhatia — Portfolio, Code Editor Edition

**Your portfolio <i>is</i> a VS Code–style IDE: an explorer sidebar, tabs, syntax-highlighted files, a terminal, a blue status bar — and an AI "Copilot" panel where recruiters chat with an AI trained on your resume.**

---

## ✨ What's inside

| Feature | Status |
|---|---|
| 🖤 Professional dark theme (refined light mode in the toggle) | ✅ |
| 🌌 3D animated starfield background (pure Canvas, zero libraries) | ✅ |
| 🧊 Rotating 3D monogram cube (drop in your photo anytime) | ✅ |
| 💬 **AI chat widget** that answers recruiter questions **only from your resume** | ✅ |
| 🔌 Works **offline instantly** (rule-based, no API key) + **Groq LLM mode ready** | ✅ |
| 🧠 Conversation memory ("which project was hardest?" understands context) | ✅ |
| 📋 **Job Description matching** — suitability score 0–100%, matched/missing skills | ✅ |
| 🎤 Voice input (speech-to-text) & 🔊 text-to-speech | ✅ |
| ❓ AI-generated interview questions | ✅ |
| ⌨️ Typing animation · streaming text · auto-scroll | ✅ |
| 🌙 Dark / ☀️ light mode toggle (remembers choice) | ✅ |
| 📱 Fully mobile responsive · Enter-to-send · clear chat · copy message | ✅ |
| 🚀 FastAPI backend with **SSE streaming** + Pydantic validation | ✅ (in `/backend`) |

---

## 📁 Project structure

```
kartik-portfolio/
├── index.html              ← the whole site (open this!)
├── css/style.css           ← all styling, 3D, dark/light themes
├── js/
│   ├── data.js             ← 👉 YOUR PROFILE — edit this file only
│   ├── scene3d.js          ← 3D starfield background
│   ├── chat.js             ← AI chat (offline engine + Groq streaming)
│   └── main.js             ← rendering, animations, theme
├── assets/                 ← put profile.jpg here (optional)
├── vercel.json             ← frontend deploy config
└── backend/                ← optional FastAPI + Groq LLM server
    ├── main.py             ← /chat (streaming) + /match-jd (JSON)
    ├── candidate.json      ← same profile data for the LLM
    ├── requirements.txt
    └── render.yaml
```

---

## 🚀 How to launch

### Option A — Just see it (30 seconds, no install)

Open `index.html` in your browser (double-click it). **Done.** The chat works
immediately in offline mode — it answers from your resume data with no API key.

> Tip: for best results serve it locally:
> ```bash
> cd kartik-portfolio
> python -m http.server 8000
> # open http://localhost:8000
> ```

### Option B — Switch on the real LLM (Groq, free)

1. **Get a free Groq API key** → https://console.groq.com/keys (sign up, "Create API Key", copy `gsk_...`).
2. **Run the backend locally:**
   ```bash
   cd backend
   pip install -r requirements.txt
   # Linux/Mac:
   export GROQ_API_KEY=gsk_your_key_here
   # Windows (PowerShell):
   $env:GROQ_API_KEY="gsk_your_key_here"

   uvicorn main:app --reload --port 8000
   # check http://localhost:8000/health -> {"status":"ok", ...}
   ```
3. **Point the frontend at it** — open `js/chat.js`, at the top set:
   ```js
   window.CHAT_BACKEND_URL = 'http://localhost:8000';   // add this line at the very top of the file
   ```
   (Or after deploying the backend, use its public URL.)

Reload the site — the chat header will show *"AI mode · Groq LLM"* and responses
now **stream token-by-token** from the LLM, with full conversation memory and
AI-powered JD analysis.

### Option C — Deploy free, forever

**Backend** (Render.com, free tier):
1. Push this folder to GitHub (see below).
2. Go to https://render.com → **New → Web Service** → pick your repo.
3. Settings: **Root Directory** = `backend`, **Build** = `pip install -r requirements.txt`,
   **Start** = `uvicorn main:app --host 0.0.0.0 --port $PORT`.
4. Add environment variable: `GROQ_API_KEY` = your key.
5. Deploy → copy the URL, e.g. `https://kartik-portfolio-api.onrender.com`.

*(Koyeb and Railway work the same way — `uvicorn main:app --host 0.0.0.0 --port $PORT`.)*

**Frontend** (Vercel, free):
1. Go to https://vercel.com → **Add New Project** → import the GitHub repo.
2. Framework preset: **Other** (static site) — no build command needed.
3. Before/after deploy: set `window.CHAT_BACKEND_URL` in `js/chat.js` to your Render URL and push.
4. Done — you get `https://your-name.vercel.app`. 🎉

> Free Render services sleep after ~15 min idle — the first request may take ~30 s.
> That's also why the frontend **automatically falls back to offline mode** if the backend is asleep/unreachable.

### Push to GitHub

```bash
cd kartik-portfolio
git init
git add .
git commit -m "3D AI portfolio — Kartik Bhatia"
git branch -M main
git remote add origin https://github.com/KB1801/kartik-portfolio.git
git push -u origin main
```

---

## ✏️ How to customize (only one file matters)

Edit **`js/data.js`** — every section of the site and every chat answer reads from
the `CANDIDATE` object. Add CGPA: set `cgpa: "8.2 CGPA"`. Add projects, skills,
certifications — the UI and AI update automatically. Keep `backend/candidate.json`
in sync if you use the LLM backend.

**Add your photo:** save a square photo as `assets/profile.jpg`, then in
`index.html` follow the commented "PHOTO SLOT" instructions in the hero section.

---

## 🧠 How the AI stays honest

* **Offline mode** is a rule-based engine over `data.js` — it literally cannot
  say anything that isn't in your profile; missing info gets an explicit
  *"that isn't on the resume"* answer.
* **Groq mode** uses a strict system prompt (`backend/main.py`): answer only from
  the provided JSON, never hallucinate, say "I don't have that information"
  otherwise, and use message history to resolve references like *"that one"*.

## ⭐ Bonus challenges checklist

- [x] Suitability score (0–100%) for pasted JD
- [x] Generate interview questions from the resume
- [x] Voice input (speech-to-text) + AI speaks answers (TTS)
- [x] "Why should we hire this candidate?" mode (ask the chat!)
- [ ] Upload a new resume without changing code *(idea: add an upload route that rewrites candidate.json)*
- [ ] Export chat as PDF *(idea: window.print() on the chat panel)*
- [ ] Multilingual EN/HI *(the Groq llama model can handle Hindi prompts — try asking in Hindi!)*
