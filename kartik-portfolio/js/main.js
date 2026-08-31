/* ============================================================
   main.js — v8 premium portfolio.
   Renders sections from CANDIDATE, animations, theme toggle,
   GitHub activity (live API + contribution chart), feedback
   form (Formspree-ready) and the resume viewer modal.
   ============================================================ */
(function () {
  const C = CANDIDATE;
  const GH_USER = 'KB1801';
  const RESUME_URL = 'assets/resume/Kartik-Bhatia-Resume.pdf';
  /* 👉 To receive form entries in your inbox: create a free form at
        https://formspree.io  (1 minute) and paste its endpoint below.
        Until then, the form opens the visitor's email app automatically. */
  const FORMSPREE_ENDPOINT = 'https://formspree.io/f/mwlkvgzp';   // e.g. 'https://formspree.io/f/abcdwxyz'

  const $ = (s) => document.querySelector(s);

  $('#year').textContent = new Date().getFullYear();

  /* ---------- Tags ---------- */
  $('#interestTags').innerHTML = C.interests.map(t => `<span class="tag">${t}</span>`).join('');
  $('#softTags').innerHTML = C.softSkills.map(t => `<span class="tag">${t}</span>`).join('');

  /* ---------- Skills ---------- */
  $('#skillsGrid').innerHTML = C.skills.map(s => `
    <div class="card tilt skill-card reveal">
      <span class="skill-icon">${s.icon}</span>
      <h3 class="card-title">${s.category}</h3>
      <div class="skill-bar"><i data-level="${s.level}"></i></div>
      <div class="skill-items">${s.items.map(i => `<span>${i}</span>`).join('')}</div>
    </div>`).join('');

  /* ---------- Projects ---------- */
  $('#projectsGrid').innerHTML = C.projects.map(p => `
    <article class="card tilt project-card reveal">
      <span class="project-badge">${p.badge}</span>
      <h3>${p.name}</h3>
      <ul>${p.points.map(pt => `<li>${pt}</li>`).join('')}</ul>
      <div class="project-tech">${p.tech.map(t => `<span>${t}</span>`).join('')}</div>
      ${p.repo ? `<a class="project-code" href="${p.repo}" target="_blank" rel="noopener">View Code ↗</a>` : ''}
    </article>`).join('');

  /* ---------- Education ---------- */
  $('#timeline').innerHTML = C.education.map(e => `
    <div class="tl-item reveal">
      <span class="tl-period">${e.period}</span>
      <h3>${e.degree}</h3>
      <p><b>${e.institution}</b></p>
      <p>${e.detail}</p>
    </div>`).join('');

  /* ---------- Certifications ---------- */
  $('#certsGrid').innerHTML = C.certifications.map(cert => `
    <div class="card tilt cert-card reveal">
      <div class="cert-icon">${cert.icon}</div>
      <div><h4>${cert.title}</h4><p>${cert.issuer}</p></div>
    </div>`).join('');

  /* ---------- Stagger children in grids ---------- */
  document.querySelectorAll('.skills-grid, .projects-grid, .certs-grid, .contact-grid')
    .forEach(grid => [...grid.children].forEach((child, i) => child.style.setProperty('--i', i)));

  /* ---------- Marquee ---------- */
  const track = $('#marqueeTrack');
  if (track) {
    const words = [...C.skills.flatMap(s => s.items), 'Generative AI', 'LLMs', 'TensorFlow', 'PyTorch', 'Keras', 'Open Source'];
    const line = words.map(w => `<span>${w}</span>`).join('');
    track.innerHTML = line + line;
  }

  /* ---------- Typing animation ---------- */
  const typedEl = $('#typed');
  let roleIdx = 0, charIdx = 0, deleting = false;
  (function typeLoop() {
    const word = C.roles[roleIdx];
    typedEl.textContent = word.slice(0, charIdx);
    let delay;
    if (!deleting && charIdx < word.length) { charIdx++; delay = 80; }
    else if (!deleting) { deleting = true; delay = 1500; }
    else if (charIdx > 0) { charIdx--; delay = 38; }
    else { deleting = false; roleIdx = (roleIdx + 1) % C.roles.length; delay = 250; }
    setTimeout(typeLoop, delay);
  })();

  /* ---------- Reveal on scroll ---------- */
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      en.target.classList.add('visible');
      en.target.querySelectorAll('.skill-bar i').forEach(bar =>
        requestAnimationFrame(() => (bar.style.width = bar.dataset.level + '%')));
      io.unobserve(en.target);
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  /* ---------- Counters ---------- */
  const counterIO = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      en.target.querySelectorAll('.stat-num[data-count]').forEach(num => {
        const target = +num.dataset.count, suffix = num.dataset.suffix || '';
        let cur = 0;
        const step = Math.max(1, Math.ceil(target / 30));
        (function tick() {
          cur = Math.min(target, cur + step);
          num.textContent = cur + suffix;
          if (cur < target) requestAnimationFrame(tick);
        })();
      });
      counterIO.unobserve(en.target);
    });
  }, { threshold: 0.4 });
  counterIO.observe($('.hero-stats'));

  /* ---------- Subtle 3D tilt ---------- */
  if (matchMedia('(pointer: fine)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.addEventListener('mousemove', e => {
      document.querySelectorAll('.tilt:hover').forEach(card => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - .5;
        const y = (e.clientY - r.top) / r.height - .5;
        card.style.transform = `perspective(900px) rotateY(${x * 5}deg) rotateX(${-y * 5}deg) translateY(-4px)`;
      });
    });
  }

  /* ---------- Theme ---------- */
  const themeToggle = $('#themeToggle');
  const saved = localStorage.getItem('kb_theme') || 'light';
  document.documentElement.dataset.theme = saved;
  themeToggle.textContent = saved === 'dark' ? '☀️' : '🌙';
  themeToggle.addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    localStorage.setItem('kb_theme', next);
    themeToggle.textContent = next === 'dark' ? '☀️' : '🌙';
  });

  /* ---------- Mobile nav ---------- */
  const hamburger = $('#hamburger'), navLinks = $('#navLinks');
  hamburger.addEventListener('click', () => navLinks.classList.toggle('open'));
  navLinks.querySelectorAll('a, button').forEach(el =>
    el.addEventListener('click', () => navLinks.classList.remove('open')));

  /* ============================================================
     GITHUB ACTIVITY
     ============================================================ */
  const LANG_COLORS = { Python:'#3572A5', JavaScript:'#f1e05a', HTML:'#e34c26', CSS:'#563d7c', Java:'#b07219', Jupyter:'#DA5B0B', TypeScript:'#3178c6', C:'#555555', Cpp:'#f34b7d' };

  async function loadGithub() {
    try {
      const [userRes, reposRes] = await Promise.all([
        fetch(`https://api.github.com/users/${GH_USER}`),
        fetch(`https://api.github.com/users/${GH_USER}/repos?sort=updated&per_page=6`)
      ]);
      if (!userRes.ok) throw new Error('api');
      const user = await userRes.json();
      const repos = await reposRes.json();

      $('#ghRepos').textContent = user.public_repos ?? '—';
      $('#ghFollowers').textContent = user.followers ?? '—';
      const langCount = {};
      (Array.isArray(repos) ? repos : []).forEach(r => { if (r.language) langCount[r.language] = (langCount[r.language] || 0) + 1; });
      const topLang = Object.entries(langCount).sort((a, b) => b[1] - a[1])[0];
      $('#ghLang').textContent = topLang ? topLang[0] : '—';

      const box = $('#ghRepoList');
      if (!Array.isArray(repos) || !repos.length) {
        box.innerHTML = `<p class="gh-loading">No public repositories yet — <a href="https://github.com/${GH_USER}" target="_blank" style="color:var(--accent)">view profile ↗</a></p>`;
        return;
      }
      box.innerHTML = repos.map(r => `
        <a class="card tilt repo-card reveal visible" href="${r.html_url}" target="_blank" rel="noopener">
          <span class="repo-name">📦 ${r.name}</span>
          <span class="repo-desc">${r.description ? r.description.replace(/</g,'&lt;') : 'No description provided.'}</span>
          <span class="repo-meta">
            ${r.language ? `<span><i class="repo-lang-dot" style="background:${LANG_COLORS[r.language] || '#8b949e'}"></i>${r.language}</span>` : ''}
            <span>★ ${r.stargazers_count}</span>
            <span>⑂ ${r.forks_count}</span>
            <span>· ${new Date(r.updated_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
          </span>
        </a>`).join('');
    } catch (e) {
      $('#ghRepos').textContent = '—';
      $('#ghFollowers').textContent = '—';
      $('#ghLang').textContent = '—';
      const box = $('#ghRepoList');
      box.className = '';
      box.innerHTML = `<p class="gh-error card">Couldn't fetch live GitHub data right now (rate limit or offline).
        <a href="https://github.com/${GH_USER}" target="_blank" style="color:var(--accent)">See @${GH_USER} on GitHub ↗</a></p>`;
    }
  }
  loadGithub();

  /* ============================================================
     CODE SNIPPETS (syntax highlighted, like a real code window)
     ============================================================ */
  const SNIPPETS = {
    nlp: [
      'import nltk',
      'import spacy',
      'from nltk.stem import WordNetLemmatizer',
      'from sklearn.feature_extraction.text import TfidfVectorizer',
      '',
      'nlp = spacy.load("en_core_web_sm")',
      'lemmatizer = WordNetLemmatizer()',
      '',
      'def preprocess(text):',
      '    # tokenize -> lowercase -> lemmatize -> drop stop-words',
      '    doc = nlp(text.lower())',
      '    tokens = [',
      '        lemmatizer.lemmatize(tok.text)',
      '        for tok in doc',
      '        if not tok.is_stop and not tok.is_punct',
      '    ]',
      '    return " ".join(tokens)',
      '',
      '# build intent features from cleaned queries',
      'vectorizer = TfidfVectorizer()',
      'X = vectorizer.fit_transform([',
      '    preprocess(q) for q in training_queries',
      '])'
    ],
    jarvis: [
      'import speech_recognition as sr',
      'import pyttsx3',
      '',
      'engine = pyttsx3.init()',
      'recognizer = sr.Recognizer()',
      '',
      'def speak(text):',
      '    # text-to-speech: Jarvis answers out loud',
      '    engine.say(text)',
      '    engine.runAndWait()',
      '',
      'def listen():',
      '    # speech-to-text with a safe fallback on failure',
      '    with sr.Microphone() as source:',
      '        audio = recognizer.listen(source)',
      '    try:',
      '        return recognizer.recognize_google(audio)',
      '    except Exception:',
      '        speak("Sorry, I did not catch that.")',
      '        return ""'
    ]
  };

  function highlight(line) {
    const safe = line.replace(/&/g, '&amp;').replace(/</g, '&lt;');
    return safe.replace(
      /(#[^\n]*)|("(?:[^"\\]|\\.)*")|\b(import|from|def|return|for|in|if|not|with|as|try|except|class|while)\b|([A-Za-z_]\w*)(\()?/g,
      (m, com, str, kw, ident, paren) => {
        if (com) return `<span class="sy-com">${m}</span>`;
        if (str) return `<span class="sy-str">${m}</span>`;
        if (kw) return `<span class="sy-kw">${m}</span>`;
        if (ident) return `<span class="${paren ? 'sy-fn' : ''}">${ident}</span>${paren || ''}`;
        return m;
      }
    );
  }

  const snipNlp = $('#snip-nlp'), snipJarvis = $('#snip-jarvis');
  if (snipNlp && snipJarvis) {
    snipNlp.innerHTML = SNIPPETS.nlp.map(highlight).join('\n');
    snipJarvis.innerHTML = SNIPPETS.jarvis.map(highlight).join('\n');
    document.querySelectorAll('.code-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.code-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.code-snippet').forEach(s => s.classList.remove('active'));
        tab.classList.add('active');
        $('#snip-' + tab.dataset.snip).classList.add('active');
      });
    });
  }

  /* ============================================================
     RESUME MODAL — on phones open the PDF directly (Chrome
     cannot embed PDFs in iframes); on desktop show the modal.
     ============================================================ */
  const modal = $('#resumeModal'), frame = $('#resumeFrame');
  function openResume() {
    if (window.matchMedia('(max-width: 900px)').matches) {
      window.open(RESUME_URL, '_blank', 'noopener');
      return;
    }
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    frame.src = RESUME_URL;
  }
  function closeResume() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    frame.src = 'about:blank';
  }
  ['navResumeBtn', 'heroResumeBtn', 'heroResumeBtn2', 'footerResumeBtn'].forEach(id =>
    document.getElementById(id)?.addEventListener('click', openResume));
  modal.querySelectorAll('[data-close]').forEach(el => el.addEventListener('click', closeResume));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeResume(); });

  /* ============================================================
     FEEDBACK FORM (Formspree-ready, mailto fallback)
     ============================================================ */
  const form = $('#feedbackForm');
  const status = $('#formStatus');
  const submitBtn = $('#formSubmitBtn');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
      name: $('#fName').value.trim(),
      email: $('#fEmail').value.trim(),
      role: $('#fRole').value,
      rating: $('#fRating').value,
      message: $('#fMessage').value.trim()
    };
    if (!data.name || !data.email || !data.message) {
      status.textContent = '⚠️ Please fill in your name, email and message.';
      status.className = 'form-status err';
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      status.textContent = '⚠️ Please enter a valid email address.';
      status.className = 'form-status err';
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';
    status.textContent = '';

    if (FORMSPREE_ENDPOINT) {
      try {
        const res = await fetch(FORMSPREE_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({
            name: data.name, email: data.email,
            _subject: `Portfolio feedback from ${data.name} (${data.role})`,
            message: `Role: ${data.role}\nRating: ${data.rating}/5\n\n${data.message}\n\nReply to: ${data.email}`
          })
        });
        if (res.ok) {
          status.textContent = '✅ Thanks! Your message has been sent — Kartik will reply within ~24 hours.';
          status.className = 'form-status ok';
          form.reset();
        } else throw new Error('send failed');
      } catch {
        mailtoFallback(data);
        status.textContent = '⚠️ Form service unavailable — opening your email app instead.';
        status.className = 'form-status err';
      }
    } else {
      mailtoFallback(data);
      status.textContent = '📧 Opening your email app… (tip: connect Formspree to send directly — see js/main.js)';
      status.className = 'form-status ok';
      form.reset();
    }
    submitBtn.disabled = false;
    submitBtn.textContent = 'Send message →';
  });

  function mailtoFallback(d) {
    const subject = encodeURIComponent(`Portfolio feedback from ${d.name} (${d.role})`);
    const body = encodeURIComponent(`${d.message}\n\n— ${d.name}\n${d.email}\nRating: ${d.rating}/5`);
    window.location.href = `mailto:${C.email}?subject=${subject}&body=${body}`;
  }
})();
