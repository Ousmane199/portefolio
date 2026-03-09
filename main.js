/* ═══════════════════════════════════════
   PORTFOLIO — CISSE Ousmane N'Faly
   main.js
   ═══════════════════════════════════════ */

/* ══════════════════════════════
   CUSTOM CURSOR
   ══════════════════════════════ */
const cursor = document.getElementById("cursor");
const ring = document.getElementById("cursor-ring");
let mx = 0,
  my = 0,
  rx = 0,
  ry = 0;

document.addEventListener("mousemove", (e) => {
  mx = e.clientX;
  my = e.clientY;
});

(function animCursor() {
  rx += (mx - rx) * 0.12;
  ry += (my - ry) * 0.12;
  cursor.style.left = mx + "px";
  cursor.style.top = my + "px";
  ring.style.left = rx + "px";
  ring.style.top = ry + "px";
  requestAnimationFrame(animCursor);
})();

// Agrandir le curseur au survol des éléments interactifs
document
  .querySelectorAll("a, button, .skill-card, .project-card")
  .forEach((el) => {
    el.addEventListener("mouseenter", () => {
      cursor.style.width = "20px";
      cursor.style.height = "20px";
      ring.style.width = "60px";
      ring.style.height = "60px";
      ring.style.opacity = "1";
    });
    el.addEventListener("mouseleave", () => {
      cursor.style.width = "12px";
      cursor.style.height = "12px";
      ring.style.width = "40px";
      ring.style.height = "40px";
      ring.style.opacity = "0.5";
    });
  });

/* ══════════════════════════════
   AURORA — EFFET SOURIS (canvas)
   Optimisé : particules réduites,
   throttle souris, pas de gradient
   par orbe, offscreen batching.
   ══════════════════════════════ */
const canvas = document.getElementById("aurora");
const ctx = canvas.getContext("2d", { alpha: true });
let W, H;

const resize = () => {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
};
resize();
window.addEventListener("resize", resize);

// ── Throttle mousemove (max 1 event / 30ms) ──
let lastMove = 0;
document.addEventListener(
  "mousemove",
  (e) => {
    const now = Date.now();
    if (now - lastMove < 30) return;
    lastMove = now;

    mx = e.clientX;
    my = e.clientY;

    // Spawner une particule de temps en temps
    if (Math.random() < 0.25) {
      const p = particles[Math.floor(Math.random() * particles.length)];
      p.x = mx + (Math.random() - 0.5) * 30;
      p.y = my + (Math.random() - 0.5) * 30;
      p.life = 0;
    }
  },
  { passive: true },
);

// ── Particules (30 au lieu de 80) ──
class Particle {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = mx || Math.random() * W;
    this.y = my || Math.random() * H;
    this.vx = (Math.random() - 0.5) * 1.0;
    this.vy = (Math.random() - 0.5) * 1.0;
    this.life = 0;
    this.maxLife = 50 + Math.random() * 60;
    this.size = 1 + Math.random() * 2;
    this.hue = [155, 350, 260][Math.floor(Math.random() * 3)];
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.life++;
    if (this.life > this.maxLife) this.reset();
  }

  draw() {
    const alpha = Math.sin((this.life / this.maxLife) * Math.PI) * 0.7;
    ctx.globalAlpha = alpha;
    ctx.fillStyle =
      this.hue === 155 ? "#00ff88" : this.hue === 350 ? "#ff4d6d" : "#7b61ff";
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

const particles = Array.from({ length: 30 }, () => new Particle());

// ── Halo souris : un seul gradient, recalculé à chaque frame ──
(function drawAurora() {
  ctx.clearRect(0, 0, W, H);
  ctx.globalAlpha = 1;

  // Halo principal (un seul fillRect)
  const g = ctx.createRadialGradient(mx, my, 0, mx, my, 260);
  g.addColorStop(0, "rgba(0,255,136,.07)");
  g.addColorStop(0.6, "rgba(123,97,255,.025)");
  g.addColorStop(1, "transparent");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  // Particules
  particles.forEach((p) => {
    p.update();
    p.draw();
  });
  ctx.globalAlpha = 1;

  requestAnimationFrame(drawAurora);
})();

/* ══════════════════════════════
   ONGLETS PROJETS
   ══════════════════════════════ */
document.querySelectorAll(".proj-tab").forEach((btn) => {
  btn.addEventListener("click", () => {
    document
      .querySelectorAll(".proj-tab")
      .forEach((b) => b.classList.remove("active"));
    document
      .querySelectorAll(".proj-panel")
      .forEach((p) => p.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById("tab-" + btn.dataset.tab).classList.add("active");
  });
});

/* ══════════════════════════════
   CARROUSELS D'IMAGES
   ══════════════════════════════ */
document.querySelectorAll("[data-slider]").forEach((wrap) => {
  const track = wrap.querySelector(".slider-track");
  const dots = wrap.querySelectorAll(".slider-dot");
  const slides = wrap.querySelectorAll(".slide");
  let cur = 0;

  const goTo = (n) => {
    cur = (n + slides.length) % slides.length;
    track.style.transform = `translateX(-${cur * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle("active", i === cur));
  };

  wrap.querySelector(".prev").addEventListener("click", () => goTo(cur - 1));
  wrap.querySelector(".next").addEventListener("click", () => goTo(cur + 1));
  dots.forEach((d, i) => d.addEventListener("click", () => goTo(i)));

  // Défilement automatique toutes les 3.2 secondes
  let timer = setInterval(() => goTo(cur + 1), 3200);
  wrap.addEventListener("mouseenter", () => clearInterval(timer));
  wrap.addEventListener("mouseleave", () => {
    timer = setInterval(() => goTo(cur + 1), 3200);
  });
});

/* ══════════════════════════════
   SCROLL REVEAL
   ══════════════════════════════ */
const revealObs = new IntersectionObserver(
  (entries) => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        e.target.style.transitionDelay = i * 0.07 + "s";
        e.target.classList.add("visible");
      }
    });
  },
  { threshold: 0.1 },
);

document.querySelectorAll(".reveal").forEach((el) => revealObs.observe(el));
