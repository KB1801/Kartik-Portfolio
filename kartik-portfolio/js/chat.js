/* ============================================================
   chat.js — the AI representative.
   • OFFLINE MODE (default): answers ONLY from CANDIDATE data.
     If info is missing -> says so honestly. No hallucinations.
   • GROQ MODE: set window.CHAT_BACKEND_URL (or localStorage
     'kb_backend_url') to your deployed FastAPI URL, e.g.
     https://your-api.onrender.com  -> real LLM streaming +
     LLM-powered JD analysis.
   Features: conversation memory, streaming text, typing
   indicator, auto-scroll, copy, clear, voice input (🎤),
   text-to-speech (🔊) and Job-Description suitability scoring.
   ============================================================ */
(function () {
  const C = CANDIDATE;
  const BACKEND_URL = (window.CHAT_BACKEND_URL || localStorage.getItem('kb_backend_url') || '').replace(/\/$/, '');

  // ---------- DOM ----------
  const panel = document.getElementById('chatPanel');
  const fab = document.getElementById('chatFab');
  const closeBtn = document.getElementById('closeChatBtn');
  const clearBtn = document.getElementById('clearChatBtn');
  const jdBtn = document.getElementById('jdModeBtn');
  const jdBox = document.getElementById('jdBox');
  const jdInput = document.getElementById('jdInput');
  const jdAnalyze = document.getElementById('jdAnalyzeBtn');
  const messagesEl = document.getElementById('chatMessages');
  const form = document.getElementById('chatForm');
  const input = document.getElementById('chatInput');
  const sendBtn = document.getElementById('sendBtn');
  const chips = document.getElementById('chatChips');
  const statusEl = document.getElementById('chatStatus');

  let history = [];           // {role:'user'|'assistant', content}
  let lastTopic = null;       // light memory for follow-ups
  let busy = false;

  statusEl.innerHTML = BACKEND_URL
    ? '<i class="dot"></i> AI mode · Groq LLM'
    : '<i class="dot"></i> Online · offline resume mode';

  // ---------- panel open/close ----------
  function openPanel() {
    panel.classList.add('open');
    panel.setAttribute('aria-hidden', 'false');
    input.focus();
  }
  function closePanel() { panel.classList.remove('open'); panel.setAttribute('aria-hidden', 'true'); }
  fab.addEventListener('click', openPanel);
  closeBtn.addEventListener('click', closePanel);
  document.getElementById('navChatBtn')?.addEventListener('click', openPanel);
  document.getElementById('heroChatBtn')?.addEventListener('click', openPanel);
  document.getElementById('footerChatBtn')?.addEventListener('click', openPanel);

  clearBtn.addEventListener('click', () => {
    history = []; lastTopic = null;
    messagesEl.innerHTML = '';
    greet();
  });

  jdBtn.addEventListener('click', () => {
    const hidden = jdBox.hasAttribute('hidden');
    if (hidden) { jdBox.removeAttribute('hidden'); jdBtn.classList.add('active'); jdInput.focus(); }
    else { jdBox.setAttribute('hidden', ''); jdBtn.classList.remove('active'); }
  });

  // ---------- message rendering ----------
  function scrollBottom() { messagesEl.scrollTop = messagesEl.scrollHeight; }

  function addMessage(role, htmlContent) {
    const wrap = document.createElement('div');
    wrap.className = 'msg ' + (role === 'user' ? 'msg-user' : 'msg-ai');
    wrap.innerHTML = htmlContent;
    if (role === 'assistant') {
      const copy = document.createElement('button');
      copy.className = 'copy-msg';
      copy.textContent = '📋 Copy';
      copy.addEventListener('click', () => {
        navigator.clipboard.writeText(wrap.innerText.replace('📋 Copy', '').replace('🔊 Listen', ''));
        copy.textContent = '✅ Copied';
        setTimeout(() => (copy.textContent = '📋 Copy'), 1500);
      });
      const speak = document.createElement('button');
      speak.className = 'copy-msg';
      speak.textContent = '🔊 Listen';
      speak.addEventListener('click', () => {
        const u = new SpeechSynthesisUtterance(wrap.innerText.replace(/📋 Copy|🔊 Listen/g, ''));
        u.rate = 1.05;
        speechSynthesis.cancel();
        speechSynthesis.speak(u);
      });
      wrap.appendChild(document.createElement('br'));
      wrap.appendChild(copy);
      wrap.appendChild(speak);
    }
    messagesEl.appendChild(wrap);
    scrollBottom();
    return wrap;
  }

  function showTyping() {
    const t = document.createElement('div');
    t.className = 'msg msg-ai';
    t.id = 'typing-indicator';
    t.innerHTML = '<span class="typing-dots"><i></i><i></i><i></i></span>';
    messagesEl.appendChild(t);
    scrollBottom();
  }
  function hideTyping() { document.getElementById('typing-indicator')?.remove(); }

  // typewriter stream into an element
  async function streamInto(el, text, speed = 14) {
    const step = text.length > 400 ? 4 : 2;
    for (let i = 0; i < text.length; i += step) {
      el.textContent = text.slice(0, i + step);
      scrollBottom();
      await new Promise(r => setTimeout(r, speed));
    }
    el.textContent = text;
    scrollBottom();
  }

  // ---------- greeting ----------
  function greet() {
    const msg = `Hi 👋 I'm the AI representative of ${C.name}.

I can answer questions about his education, skills, projects, certifications and how to reach him — using only information from his real resume.

Try: "Tell me about Kartik", "What are his skills?", "Describe his projects" or hit the 📋 JD button to paste a Job Description for a suitability score.`;
    const el = addMessage('assistant', '');
    streamInto(el, msg, 10);
    history.push({ role: 'assistant', content: msg });
  }

  // ============================================================
  // OFFLINE ANSWER ENGINE (rule-based, strictly resume data)
  // ============================================================
  function qHas(q, ...words) { return words.some(w => q.includes(w)); }

  function offlineAnswer(question) {
    const q = ' ' + question.toLowerCase().replace(/[^a-z0-9\s+#./-]/g, ' ').replace(/\s+/g, ' ') + ' ';
    const talkedProjects = history.some(m => /project|built|jarvis|chatbot/.test(m.content)) || lastTopic === 'projects';

    // --- follow-ups that need memory ---
    if (qHas(q, 'hardest', 'difficult', 'challenging', 'tough') && talkedProjects) {
      lastTopic = 'projects';
      return { topic: 'projects', text:
        `Good question! Based on his resume, the **AI Chatbot using NLP** was likely the most technically involved: it required chaining tokenization, lemmatization, stop-word removal, intent classification and response optimization together — and making them work reliably as a conversational pipeline.

The **Jarvis AI Assistant** had its own complexity too: real-time speech-to-text, text-to-speech, command recognition, plus error handling and offline functionality.

Both projects taught him modular, scalable code design. (For deeper implementation details, Kartik would be happy to walk you through the code in an interview!)` };
    }

    if (qHas(q, 'which one', 'that one', 'the second', 'first one', 'tell me more', 'elaborate') && talkedProjects) {
      lastTopic = 'projects';
      return { topic: 'projects', text: projectDetails() };
    }

    // --- greetings / identity ---
    if (qHas(q, ' hello ', ' hi ', ' hey ', 'namaste', 'good morning', 'good evening', 'good afternoon'))
      return { text: `Hello! 😊 I'm ${C.name}'s AI representative. Ask me anything about his skills, projects, education or certifications — or paste a Job Description using the 📋 JD button.` };

    if (qHas(q, 'who are you', 'what are you', 'your name', 'are you a chatbot', 'are you ai', 'are you kartik'))
      return { text: `I'm an AI assistant built to represent **${C.name}**. I answer recruiter questions using only the information from his resume — I never invent facts. If something isn't on his resume, I'll tell you honestly.` };

    if (qHas(q, 'thank', 'thanks', 'great', 'awesome', 'nice'))
      return { text: `You're welcome! 🙌 If you'd like, I can also generate sample interview questions for Kartik, or you can paste a Job Description (📋 JD button) to check his suitability.` };

    if (qHas(q, ' bye', 'goodbye', 'see you', 'later'))
      return { text: `Goodbye! 👋 If ${C.name} seems like a fit, reach out at ${C.email}. Have a great day!` };

    // --- about / summary ---
    if (qHas(q, 'about', 'introduce', 'summary', 'background', 'who is', 'tell me more about him', 'profile', 'overview', 'describe him', 'tell me about kartik', 'tell me about the candidate', 'tell me about yourself')) {
      lastTopic = 'about';
      return { topic: 'about', text:
        `**${C.name}** — ${C.title}, based in ${C.location}.

${C.summary[0]}

${C.summary[1]}

He is currently ${C.summary[2].charAt(0).toLowerCase() + C.summary[2].slice(2)}` };
    }

    // --- why hire / strengths ---
    if (qHas(q, 'why should', 'hire', 'strength', 'why you', 'why him', 'good fit', 'suitable for', 'bring to', 'value')) {
      lastTopic = 'hire';
      return { topic: 'hire', text:
        `Here's why ${C.name.split(' ')[0]} could be a great addition to your team:

✅ **Hands-on AI/NLP build experience** — he didn't just study ML; he built a working NLP chatbot (NLTK, spaCy, scikit-learn) and a voice-controlled AI assistant with speech-to-text and text-to-speech.

✅ **Strong CS fundamentals** — Data Structures & Algorithms, OOP, competitive programming and problem solving.

✅ **Engineering discipline** — modular, scalable code with error handling and fallback logic.

✅ **Curiosity-driven** — 6 certifications across Generative AI, LLMs, TensorFlow, PyTorch, Keras, Deep Learning and Cybersecurity, plus active interest in open source and emerging tech.

✅ **Communication & leadership** — strong soft skills to go with the technical ones.

He's actively looking for **Software Engineer / Python / Web / AI-ML internships** and is ready to contribute from day one. 🚀` };
    }

    // --- weaknesses / gaps (honest mode) ---
    if (qHas(q, 'weakness', 'missing', 'gap', 'lack', 'improve', 'not know', "don't know", 'doesnt know', 'limitation')) {
      lastTopic = 'gap';
      return { topic: 'gap', text:
        `Honest answer, as promised:

• His database experience is at the **basic SQL / database design** level.
• Deep learning knowledge is at the **fundamentals** stage (backed by certifications, not large-scale production models).
• The resume shows **academic projects** so far — he's actively seeking his first internship to gain production experience.
• His web stack covers HTML/CSS/JavaScript; advanced frameworks (React, etc.) aren't listed on the resume.

That said, he learns fast — six certifications in one year show that — and his CS fundamentals make picking up new tools much easier.` };
    }

    // --- skills ---
    if (qHas(q, 'skill', 'tech stack', 'technology', 'technologies', 'know', 'knows', 'language', 'python', 'java', 'javascript', 'stack', 'tool', 'proficient', 'good at')) {
      lastTopic = 'skills';
      return { topic: 'skills', text: skillsText() };
    }

    // --- projects ---
    if (qHas(q, 'project', 'built', 'build', 'made', 'created', 'work experience', 'portfolio', 'jarvis', 'chatbot', 'nlp', 'experience')) {
      lastTopic = 'projects';
      return { topic: 'projects', text: projectsText() };
    }

    // --- education / cgpa ---
    if (qHas(q, 'educat', 'college', 'university', 'school', 'degree', 'b.tech', 'btech', 'study', 'studies', 'cgpa', 'gpa', 'percentage', 'grade', 'academic', 'graduat')) {
      lastTopic = 'education';
      let extra = C.cgpa
        ? `\n\nHis current CGPA is **${C.cgpa}**.`
        : `\n\nHis CGPA/percentage isn't listed on the resume — he can share it directly if needed (${C.email}).`;
      return { topic: 'education', text:
        `**Education:**

🎓 ${C.education[0].degree}
   ${C.education[0].institution} — ${C.education[0].period}

🏫 ${C.education[1].degree}
   ${C.education[1].institution} — ${C.education[1].period}${extra}` };
    }

    // --- certifications ---
    if (qHas(q, 'certif', 'course', 'training', 'credential', 'linkedin learning', 'diploma')) {
      lastTopic = 'certs';
      return { topic: 'certs', text:
        `**Certifications** (all via LinkedIn Learning):\n\n` +
        C.certifications.map((c, i) => `${i + 1}. ${c.title}`).join('\n') +
        `\n\nThat's a focused track: Generative AI & LLMs → TensorFlow → PyTorch → Keras → Deep Learning fundamentals, plus Cybersecurity awareness.` };
    }

    // --- contact ---
    if (qHas(q, 'contact', 'email', 'mail', 'phone', 'call', 'reach', 'linkedin', 'github', 'connect', 'where is he', 'location', 'haryana', 'faridabad', 'hire him')) {
      lastTopic = 'contact';
      return { topic: 'contact', text:
        `You can reach **${C.name}** here:

📧 Email: ${C.email}
📞 Phone: ${C.phone}
📍 Location: ${C.location}
💼 LinkedIn: ${C.socials.linkedin}
🐙 GitHub: ${C.socials.github}

He's actively looking for internship opportunities — messages are welcome!` };
    }

    // --- interests / hobbies ---
    if (qHas(q, 'hobby', 'hobbies', 'interest', 'free time', 'fun', 'outside of work', 'music', 'sport')) {
      lastTopic = 'interests';
      return { topic: 'interests', text:
        `Beyond coding, his interests include: ${C.interests.slice(7).join(', ')}.

Technically he's passionate about: ${C.interests.slice(0, 7).join(', ')}.` };
    }

    // --- interview questions ---
    if (qHas(q, 'interview question', 'interview me', 'ask me', 'question for him', 'quiz', 'viva', 'assess him')) {
      lastTopic = 'interview';
      return { topic: 'interview', text: interviewQuestions() };
    }

    // --- JD / suitability nudge ---
    if (qHas(q, 'job description', ' jd ', 'suitable', 'match', 'role', 'position', 'opening', 'vacancy'))
      return { text: `I can score his fit for a role! Click the **📋 JD** button at the top of this chat, paste the Job Description, and I'll give you a suitability score (0–100%), matched skills, missing skills and an interview recommendation.` };

    // --- fallback: honest ---
    return { text:
      `That information isn't on Kartik's resume, so I won't guess. 🤷

I can reliably tell you about his:
• Summary & goals
• Technical skills
• Projects (AI Chatbot/NLP, Jarvis AI Assistant)
• Education
• Certifications
• Contact details

Try one of the suggestion chips below, or rephrase your question!` };
  }

  function skillsText() {
    let t = '**Technical skills:**\n\n';
    C.skills.forEach(s => { t += `${s.icon} **${s.category}:** ${s.items.join(', ')}\n`; });
    t += `\n**Soft skills:** ${C.softSkills.join(', ')}\n\n`;
    t += `His strongest languages are **Python** and **Java**, and his practical AI work centers on **NLP** (NLTK, spaCy, scikit-learn) and speech-based systems.`;
    return t;
  }

  function projectsText() {
    let t = '';
    C.projects.forEach((p, i) => {
      t += `**${i + 1}. ${p.name}** _(${p.badge})_\n`;
      p.points.forEach(pt => { t += `   • ${pt}\n`; });
      t += `   🛠️ Tech: ${p.tech.join(', ')}\n\n`;
    });
    return t.trim();
  }

  function projectDetails() {
    return `Here's a closer look at both projects:\n\n${projectsText()}\n\nWant to know which was hardest? Just ask! 😄`;
  }

  function interviewQuestions() {
    return `Here are interview questions tailored to his resume:\n\n` +
      `1. Walk us through your NLP chatbot's pipeline — what happens to a user's sentence from input to response?\n` +
      `2. Why did you use both NLTK and spaCy? What did each handle better?\n` +
      `3. How does intent classification work in your chatbot, and how did you measure conversational accuracy?\n` +
      `4. In Jarvis, how did you implement speech-to-text and text-to-speech, and how do you handle recognition errors?\n` +
      `5. Explain "modular programming" as you applied it in these projects.\n` +
      `6. Difference between tokenization, stemming and lemmatization — and when does each matter?\n` +
      `7. How would you deploy your chatbot as a web service? (hint: this portfolio is part of that answer!)\n\n` +
      `Kartik, if you can answer these clearly, you're interview-ready. 💪`;
  }

  // ============================================================
  // JOB DESCRIPTION MATCHING
  // ============================================================
  const MASTER_SKILLS = [
    'python', 'java', 'javascript', 'typescript', 'c++', 'c#', 'go', 'rust', 'html', 'css', 'react', 'node',
    'next.js', 'flask', 'django', 'fastapi', 'sql', 'mysql', 'postgresql', 'mongodb', 'nosql',
    'machine learning', 'deep learning', 'nlp', 'natural language processing', 'computer vision',
    'tensorflow', 'pytorch', 'keras', 'pandas', 'numpy', 'scikit-learn', 'nltk', 'spacy', 'langchain',
    'llm', 'large language model', 'generative ai', 'data structures', 'algorithms', 'oop',
    'git', 'github', 'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'linux', 'rest api',
    'cybersecurity', 'agile', 'selenium', 'tableau', 'power bi', 'excel', 'communication', 'leadership',
    'speech', 'automation', 'vs code'
  ];

  // canonical alias map: synonyms -> single canonical skill id
  const CANON = {
    'ml': 'machine learning', 'ai': 'artificial intelligence',
    'natural language processing': 'nlp', 'large language model': 'llm',
    'large language models': 'llm', 'js': 'javascript', 'ts': 'typescript',
    'mysql': 'sql', 'postgresql': 'sql', 'sqlite': 'sql', 'sql server': 'sql',
    'pl/sql': 'sql', 'database': 'sql'
  };
  const canon = s => CANON[s] || s;

  function analyzeJDOffline(jd) {
    const text = ' ' + jd.toLowerCase().replace(/[^a-z0-9+#.\s]/g, ' ').replace(/\s+/g, ' ') + ' ';
    const candidateSet = new Set(C.skillKeywords.map(k => canon(k.toLowerCase())));
    const required = [];
    MASTER_SKILLS.forEach(s => {
      const needle = /[.+#]/.test(s) ? s.replace(/[.+#]/g, m => '\\' + m) : s;
      if (new RegExp('\\b' + needle + '\\b').test(text) && !required.includes(s)) required.push(s);
    });
    const matched = required.filter(r => candidateSet.has(canon(r)));
    const missing = required.filter(r => !matched.includes(r));
    const score = required.length ? Math.round((matched.length / required.length) * 100) : 0;

    let verdict, color, recommendation;
    if (score >= 75) { verdict = 'Strong match'; color = 'var(--good)'; recommendation = '✅ Recommended to interview — Kartik covers the core of this role and his project experience is directly relevant.'; }
    else if (score >= 50) { verdict = 'Good potential'; color = 'var(--warn)'; recommendation = '⚠️ Worth interviewing — strong fundamentals and relevant projects; check the missing skills below against role priorities.'; }
    else { verdict = 'Partial fit'; color = 'var(--bad)'; recommendation = '❌ Consider for junior/intern tracks only — several required skills are outside his current resume, but his fundamentals make ramp-up feasible.'; }

    return { score, verdict, color, matched, missing, recommendation, requiredCount: required.length };
  }

  function renderJD(r) {
    const barColor = r.score >= 75 ? 'var(--good)' : r.score >= 50 ? 'var(--warn)' : 'var(--bad)';
    const miss = r.missing.length ? r.missing.map(m => `• ${m.replace(/\b\w/g, c => c.toUpperCase())}`).join('\n') : '• None detected — great coverage! 🎉';
    const match = r.matched.length ? r.matched.map(m => `• ${m.replace(/\b\w/g, c => c.toUpperCase())}`).join('\n') : '• No direct skill overlaps detected.';
    return `**Job Description analysis** _(${r.requiredCount} skills detected in JD)_\n\n` +
      `**Suitability score: ${r.score}/100** — <span class="match-pill" style="background:color-mix(in srgb, ${r.color} 20%, transparent);color:${r.color};border-color:${r.color}">${r.verdict}</span>\n\n` +
      `<div class="score-wrap"><div class="score-bar"><i style="width:${r.score}%;background:${barColor}"></i></div></div>\n` +
      `**✅ Matched skills (${r.matched.length}):**\n${match}\n\n` +
      `**🔍 Missing / to verify (${r.missing.length}):**\n${miss}\n\n` +
      `**Recommendation:** ${r.recommendation}\n\n_Note: scoring is based strictly on resume keywords — projects and learning agility often close small gaps._`;
  }

  jdAnalyze.addEventListener('click', async () => {
    const jd = jdInput.value.trim();
    if (jd.length < 20) { jdInput.focus(); jdInput.style.borderColor = 'var(--bad)'; setTimeout(() => jdInput.style.borderColor = '', 1200); return; }
    addMessage('user', '📋 *Analyze this Job Description:* ' + escapeHtml(jd.slice(0, 160)) + (jd.length > 160 ? '…' : ''));
    history.push({ role: 'user', content: '[Job Description] ' + jd });
    showTyping(); busy = true;
    try {
      let result;
      if (BACKEND_URL) {
        const res = await fetch(`${BACKEND_URL}/match-jd`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jd })
        });
        if (res.ok) result = await res.json();
      }
      if (!result) { await new Promise(r => setTimeout(r, 700)); result = analyzeJDOffline(jd); }
      hideTyping();
      const el = addMessage('assistant', '');
      el.innerHTML = '';
      await streamInto(el, stripHtml(renderJD(result)).replace(/\*\*/g, '').replace(/\*/g, ''), 8);
      el.innerHTML = renderJD(result);
      history.push({ role: 'assistant', content: el.innerText });
    } catch (e) {
      hideTyping();
      const r = analyzeJDOffline(jd);
      const el = addMessage('assistant', renderJD(r));
      history.push({ role: 'assistant', content: el.innerText });
    } finally { busy = false; }
  });

  function stripHtml(s) { const d = document.createElement('div'); d.innerHTML = s; return d.textContent || s; }

  // ============================================================
  // MAIN CHAT FLOW
  // ============================================================
  async function handleSend(text) {
    if (busy || !text.trim()) return;
    addMessage('user', escapeHtml(text));
    history.push({ role: 'user', content: text });
    input.value = '';
    showTyping();
    busy = true;
    sendBtn.disabled = true;

    const el = addMessage('assistant', '');
    hideTyping(); // typing indicator replaced by streaming bubble

    try {
      if (BACKEND_URL) {
        await streamFromBackend(el, text);
      } else {
        await new Promise(r => setTimeout(r, 350));
        const ans = offlineAnswer(text);
        await streamInto(el, ans.text, 10);
        history.push({ role: 'assistant', content: ans.text });
      }
    } catch (e) {
      // backend failed -> graceful fallback to offline
      const ans = offlineAnswer(text);
      await streamInto(el, '⚠️ Could not reach the AI server — answering in offline mode.\n\n' + ans.text, 10);
      history.push({ role: 'assistant', content: el.textContent });
    } finally {
      busy = false;
      sendBtn.disabled = false;
      input.focus();
    }
  }

  async function streamFromBackend(el, text) {
    const res = await fetch(`${BACKEND_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: history.slice(-12) })
    });
    if (!res.ok) throw new Error('backend ' + res.status);
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let full = '', buffer = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop();
      for (const line of lines) {
        if (!line.startsWith('data:')) continue;
        const payload = line.slice(5).trim();
        if (payload === '[DONE]') continue;
        try {
          const obj = JSON.parse(payload);
          const token = obj.token || obj.content || obj.delta || '';
          full += token;
          el.textContent = full;
          scrollBottom();
        } catch { full += payload; el.textContent = full; }
      }
    }
    if (!full) { el.textContent = '(No response from AI server.)'; full = el.textContent; }
    history.push({ role: 'assistant', content: full });
  }

  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
  }

  form.addEventListener('submit', e => { e.preventDefault(); handleSend(input.value); });
  chips.addEventListener('click', e => { if (e.target.classList.contains('chip')) handleSend(e.target.textContent); });

  // ---------- voice input (Web Speech API, Chrome/Edge) ----------
  const micBtn = document.createElement('button');
  micBtn.type = 'button';
  micBtn.className = 'icon-btn';
  micBtn.title = 'Voice input (speech-to-text)';
  micBtn.textContent = '🎤';
  micBtn.style.cssText = 'width:44px;border-radius:12px;font-size:1rem;';
  form.insertBefore(micBtn, sendBtn);

  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (SR) {
    const rec = new SR();
    rec.lang = 'en-US';
    let listening = false;
    micBtn.addEventListener('click', () => {
      if (listening) { rec.stop(); return; }
      try { rec.start(); listening = true; micBtn.classList.add('active'); input.placeholder = '🎙️ Listening…'; } catch {}
    });
    rec.onresult = e => { input.value = e.results[0][0].transcript; };
    rec.onend = () => { listening = false; micBtn.classList.remove('active'); input.placeholder = 'Ask about skills, projects, education…'; };
    rec.onerror = () => { listening = false; micBtn.classList.remove('active'); };
  } else {
    micBtn.title = 'Voice input not supported in this browser (try Chrome/Edge)';
    micBtn.addEventListener('click', () => addMessage('assistant', 'Voice input needs Chrome or Edge (Web Speech API). You can still type your question!'));
  }

  // ---------- boot ----------
  greet();
})();
