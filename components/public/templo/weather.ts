// Clima del Templo: capa de partículas sobre las escenas (lluvia, tormenta, nieve, luciérnagas, viento).
// Solo cambia el ambiente: no toca los edificios ni las ilustraciones. Se dibuja en un <canvas> fijo
// que no recibe clics. Con "reducir movimiento" no hay partículas (queda solo el tinte de la escena).

export type Weather = "clear" | "wind" | "rain" | "storm" | "snow" | "fireflies";
export const WEATHER_ORDER: Weather[] = ["clear", "wind", "rain", "storm", "snow", "fireflies"];

type Drop = { x: number; y: number; vy: number; len: number; z: number };
type Flake = { x: number; y: number; r: number; vy: number; amp: number; ph: number; sp: number };
type Fly = { bx: number; by: number; ax: number; ay: number; sp: number; ph: number; r: number };
type Streak = { x: number; y: number; len: number; vx: number; amp: number; a: number };
type Petal = { x: number; y: number; vx: number; vy: number; rot: number; vr: number; s: number };
type Splash = { x: number; y: number; life: number };

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const rand = (a: number, b: number) => a + Math.random() * (b - a);

export function mountWeather(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!ctx) return { set() {}, destroy() {} };

  let w = 0;
  let h = 0;
  let mode: Weather = "clear";
  let wanted: Weather = "clear";
  let alpha = 0; // 0..1: aparece y desaparece suavemente al cambiar de clima
  let raf = 0;
  let last = 0;
  let drops: Drop[] = [];
  let flakes: Flake[] = [];
  let flies: Fly[] = [];
  let streaks: Streak[] = [];
  let petals: Petal[] = [];
  let splashes: Splash[] = [];
  let nextBolt = 0;
  let bolt: { pts: [number, number][]; life: number } | null = null;
  let flash = 0;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = innerWidth;
    h = innerHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    build();
  }

  // Crea las partículas del clima actual según el tamaño de la pantalla.
  function build() {
    const area = w * h;
    drops = [];
    flakes = [];
    flies = [];
    streaks = [];
    petals = [];
    splashes = [];
    if (mode === "rain" || mode === "storm") {
      const n = Math.round(
        clamp(area / (mode === "storm" ? 2400 : 4200), 90, mode === "storm" ? 700 : 420),
      );
      for (let i = 0; i < n; i++) {
        const z = Math.random() < 0.35 ? 1 : 0;
        drops.push({
          x: rand(-100, w + 100),
          y: rand(-h, h),
          vy: z ? rand(22, 32) : rand(14, 21),
          len: z ? rand(18, 30) : rand(10, 18),
          z,
        });
      }
    } else if (mode === "snow") {
      const n = Math.round(clamp(area / 6500, 80, 230));
      for (let i = 0; i < n; i++) {
        flakes.push({
          x: rand(0, w),
          y: rand(-h, h),
          r: rand(1.5, 4.4),
          vy: rand(0.5, 1.5),
          amp: rand(10, 38),
          ph: rand(0, 6.3),
          sp: rand(0.004, 0.012),
        });
      }
    } else if (mode === "fireflies") {
      const n = Math.round(clamp(area / 18000, 30, 70));
      for (let i = 0; i < n; i++) {
        flies.push({
          bx: rand(0, w),
          by: rand(h * 0.25, h),
          ax: rand(20, 90),
          ay: rand(14, 60),
          sp: rand(0.0003, 0.0009),
          ph: rand(0, 6.3),
          r: rand(16, 32),
        });
      }
    } else if (mode === "wind") {
      for (let i = 0; i < 20; i++) {
        streaks.push({
          x: rand(-w, w),
          y: rand(0, h),
          len: rand(140, 420),
          vx: rand(22, 40),
          amp: rand(6, 26),
          a: rand(0.12, 0.34),
        });
      }
      const n = Math.round(clamp(area / 22000, 26, 70));
      for (let i = 0; i < n; i++) {
        petals.push({
          x: rand(-w * 0.3, w),
          y: rand(0, h),
          vx: rand(7, 17),
          vy: rand(-1.5, 3),
          rot: rand(0, 6.3),
          vr: rand(-0.12, 0.12),
          s: rand(5, 11),
        });
      }
    }
  }

  function makeBolt() {
    const pts: [number, number][] = [];
    let x = rand(w * 0.15, w * 0.85);
    let y = 0;
    const end = rand(h * 0.45, h * 0.75);
    while (y < end) {
      pts.push([x, y]);
      y += rand(18, 46);
      x += rand(-34, 34);
    }
    bolt = { pts, life: 1 };
    flash = 1;
  }

  function draw(dt: number, now: number) {
    ctx!.clearRect(0, 0, w, h);
    if (alpha <= 0) return;
    const a = alpha;

    if (mode === "rain" || mode === "storm") {
      const slope = mode === "storm" ? 0.38 : 0.16;
      const far = new Path2D();
      const near = new Path2D();
      for (const d of drops) {
        d.y += d.vy * dt;
        d.x += d.vy * slope * dt;
        if (d.y > h + 20) {
          if (d.z && splashes.length < 36 && Math.random() < 0.5) {
            splashes.push({ x: d.x, y: h - rand(0, h * 0.14), life: 1 });
          }
          d.y = -d.len;
          d.x = rand(-100, w + 100);
        }
        const p = d.z ? near : far;
        p.moveTo(d.x, d.y);
        p.lineTo(d.x - d.len * slope, d.y - d.len);
      }
      ctx!.lineCap = "round";
      ctx!.strokeStyle = `rgba(190,210,245,${0.4 * a})`;
      ctx!.lineWidth = 1.2;
      ctx!.stroke(far);
      ctx!.strokeStyle = `rgba(225,236,255,${0.78 * a})`;
      ctx!.lineWidth = mode === "storm" ? 2.1 : 1.6;
      ctx!.stroke(near);
      // Salpicaduras al llegar abajo
      ctx!.lineWidth = 1;
      for (let i = splashes.length - 1; i >= 0; i--) {
        const s = splashes[i];
        s.life -= 0.05 * dt;
        if (s.life <= 0) {
          splashes.splice(i, 1);
          continue;
        }
        ctx!.strokeStyle = `rgba(210,225,255,${0.45 * s.life * a})`;
        ctx!.beginPath();
        ctx!.ellipse(s.x, s.y, 3 + (1 - s.life) * 12, 1 + (1 - s.life) * 3, 0, 0, 6.283);
        ctx!.stroke();
      }
      if (mode === "storm") {
        if (now > nextBolt) {
          makeBolt();
          nextBolt = now + rand(3200, 8000);
          // Segundo destello breve, como un trueno real
          if (Math.random() < 0.5) setTimeout(() => (flash = Math.max(flash, 0.7)), 170);
        }
        if (flash > 0) {
          ctx!.fillStyle = `rgba(215,228,255,${flash * 0.34 * a})`;
          ctx!.fillRect(0, 0, w, h);
          flash = Math.max(0, flash - 0.045 * dt);
        }
        if (bolt) {
          bolt.life -= 0.05 * dt;
          if (bolt.life <= 0) bolt = null;
          else {
            ctx!.save();
            ctx!.lineJoin = "round";
            ctx!.shadowColor = `rgba(190,210,255,${bolt.life})`;
            ctx!.shadowBlur = 22;
            ctx!.strokeStyle = `rgba(245,248,255,${bolt.life * a})`;
            ctx!.lineWidth = 2.6;
            ctx!.beginPath();
            bolt.pts.forEach(([x, y], i) => (i ? ctx!.lineTo(x, y) : ctx!.moveTo(x, y)));
            ctx!.stroke();
            ctx!.restore();
          }
        }
      }
    } else if (mode === "snow") {
      ctx!.fillStyle = `rgba(255,255,255,${0.85 * a})`;
      ctx!.beginPath();
      for (const f of flakes) {
        f.y += f.vy * dt;
        f.ph += f.sp * 16.7 * dt;
        if (f.y > h + 6) {
          f.y = -6;
          f.x = rand(0, w);
        }
        const x = f.x + Math.sin(f.ph) * f.amp;
        ctx!.moveTo(x + f.r, f.y);
        ctx!.arc(x, f.y, f.r, 0, 6.283);
      }
      ctx!.fill();
    } else if (mode === "fireflies") {
      for (const f of flies) {
        const x = f.bx + Math.sin(now * f.sp + f.ph) * f.ax;
        const y = f.by + Math.cos(now * f.sp * 0.8 + f.ph) * f.ay;
        const pulse = 0.45 + 0.55 * Math.sin(now * 0.0021 + f.ph * 3);
        const g = ctx!.createRadialGradient(x, y, 0, x, y, f.r);
        g.addColorStop(0, `rgba(255,244,190,${1 * pulse * a})`);
        g.addColorStop(0.22, `rgba(255,216,110,${0.65 * pulse * a})`);
        g.addColorStop(1, "rgba(255,200,90,0)");
        ctx!.fillStyle = g;
        ctx!.beginPath();
        ctx!.arc(x, y, f.r, 0, 6.283);
        ctx!.fill();
      }
    } else if (mode === "wind") {
      ctx!.lineCap = "round";
      ctx!.lineWidth = 1.6;
      for (const s of streaks) {
        s.x += s.vx * dt;
        if (s.x - s.len > w) {
          s.x = -s.len - rand(0, w * 0.5);
          s.y = rand(0, h);
        }
        ctx!.strokeStyle = `rgba(255,255,255,${s.a * a})`;
        ctx!.beginPath();
        ctx!.moveTo(s.x - s.len, s.y);
        ctx!.quadraticCurveTo(s.x - s.len / 2, s.y - s.amp, s.x, s.y + s.amp * 0.3);
        ctx!.stroke();
      }
      ctx!.fillStyle = `rgba(255,186,210,${0.9 * a})`;
      for (const p of petals) {
        p.x += p.vx * dt;
        p.y += p.vy * dt + Math.sin(p.rot) * 0.6;
        p.rot += p.vr * dt;
        if (p.x > w + 20) {
          p.x = -20;
          p.y = rand(0, h);
        }
        if (p.y > h + 20) p.y = -20;
        ctx!.save();
        ctx!.translate(p.x, p.y);
        ctx!.rotate(p.rot);
        ctx!.beginPath();
        ctx!.ellipse(0, 0, p.s, p.s * 0.55, 0, 0, 6.283);
        ctx!.fill();
        ctx!.restore();
      }
    }
  }

  function frame(now: number) {
    const dt = Math.min((now - (last || now)) / 16.67, 3);
    last = now;
    // Transición: desvanece el clima anterior y deja entrar el nuevo.
    if (mode !== wanted) {
      alpha -= dt * 0.05;
      if (alpha <= 0) {
        alpha = 0;
        mode = wanted;
        bolt = null;
        flash = 0;
        nextBolt = now + 1200;
        build();
      }
    } else if (mode !== "clear" && alpha < 1) {
      alpha = Math.min(1, alpha + dt * 0.03);
    }
    draw(dt, now);
    if (mode === "clear" && alpha <= 0 && wanted === "clear") {
      raf = 0; // nada que dibujar: se detiene hasta el próximo cambio de clima
      return;
    }
    raf = requestAnimationFrame(frame);
  }

  resize();
  window.addEventListener("resize", resize);

  return {
    set(next: Weather) {
      wanted = next;
      if (reduce) {
        mode = next;
        alpha = 0;
        return;
      }
      last = 0;
      if (!raf) raf = requestAnimationFrame(frame);
    },
    destroy() {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    },
  };
}
