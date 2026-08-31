/* ============================================================
   scene3d.js — subtle warp starfield for the professional
   dark theme. Slow, dim, blue/cyan particles in 3D space with
   gentle mouse parallax. Pure Canvas 2D, zero dependencies.
   ============================================================ */
(function () {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let w, h, cx, cy;
  const mouse = { x: 0, y: 0 };
  const particles = [];
  const STAR_COUNT = () => (w < 700 ? 130 : 280);
  const palette = ['#6c8eff', '#38bdf8', '#a5b4fc', '#cdd9f2'];

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    cx = w / 2; cy = h / 2;
  }

  function makeStar(randomZ = true) {
    return {
      x: (Math.random() - 0.5) * w * 2,
      y: (Math.random() - 0.5) * h * 2,
      z: randomZ ? Math.random() * w : w,
      pz: 0,
      color: palette[Math.floor(Math.random() * palette.length)],
      size: 0.5 + Math.random() * 1.4
    };
  }

  function init() {
    resize();
    particles.length = 0;
    for (let i = 0; i < STAR_COUNT(); i++) particles.push(makeStar());
  }

  let running = true;
  document.addEventListener('visibilitychange', () => { running = !document.hidden; if (running) raf(); });
  window.addEventListener('resize', init);
  window.addEventListener('mousemove', (e) => {
    mouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
    mouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  function frame() {
    ctx.clearRect(0, 0, w, h);
    const speed = reduceMotion ? 0.3 : 1.1;           // slow, calm drift
    const px = mouse.x * 40, py = mouse.y * 40;

    for (const s of particles) {
      s.pz = s.z;
      s.z -= speed;
      if (s.z < 1) {
        Object.assign(s, makeStar(false));
        s.pz = s.z;
      }
      const sx = (s.x / s.z) * 320 + cx + px * (1 - s.z / w);
      const sy = (s.y / s.z) * 320 + cy + py * (1 - s.z / w);
      const px2 = (s.x / s.pz) * 320 + cx + px * (1 - s.pz / w);
      const py2 = (s.y / s.pz) * 320 + cy + py * (1 - s.pz / w);

      if (sx < -50 || sx > w + 50 || sy < -50 || sy > h + 50) continue;

      const depth = 1 - s.z / w;
      const r = s.size * depth * 1.3;
      ctx.globalAlpha = Math.max(0.04, depth * 0.7);
      ctx.strokeStyle = s.color;
      ctx.lineWidth = Math.max(0.5, r * 0.7);
      ctx.beginPath();
      ctx.moveTo(px2, py2);
      ctx.lineTo(sx, sy);
      ctx.stroke();

      if (depth > 0.8) {
        ctx.globalAlpha = depth * 0.45;
        ctx.fillStyle = s.color;
        ctx.beginPath();
        ctx.arc(sx, sy, r * 0.75, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  }

  function raf() {
    if (!running) return;
    frame();
    requestAnimationFrame(raf);
  }

  init();
  raf();
})();
