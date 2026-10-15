import { buildMap, SCENES, W, H, type SceneData } from "./scenes";
import { buildHalls, esc, type Hall } from "./halls";
import type { HallId, TemploData } from "./types";

// Motor del Templo: cámara del mapa (arrastrar, acercar, volar a una sala), cielo que cambia con el
// recorrido y entrada a cada sala por sus puertas. Trabaja sobre el esqueleto que dibuja templo.tsx.
// `mountTemplo` devuelve la función que lo desmonta y limpia todo.

type Cam = { x: number; y: number; w: number };

const hex = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
function mix(a: string, b: string, t: number) {
  const A = hex(a),
    B = hex(b);
  return (
    "#" +
    A.map((v, i) =>
      Math.round(v + (B[i] - v) * t)
        .toString(16)
        .padStart(2, "0"),
    ).join("")
  );
}
export function keyed(keys: string[], t: number) {
  const n = keys.length - 1,
    p = Math.min(Math.max(t, 0), 1) * n,
    i = Math.min(Math.floor(p), n - 1);
  return mix(keys[i], keys[i + 1], p - i);
}
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

// Colores de cada capa del paisaje a lo largo del día: amanecer, mediodía, tarde, atardecer, noche.
export const PAINT: Record<string, string[]> = {
  mFar: ["#a58bc4", "#8fb7e6", "#8f9fd6", "#7a5a98", "#262f6e"],
  mMid: ["#7467ad", "#5f8fc4", "#5a73b0", "#52407e", "#19234f"],
  mNear: ["#3f4f8c", "#2f6aa0", "#35508f", "#352b66", "#111b3f"],
  hill1: ["#2b4670", "#2c6b8a", "#2a4f7a", "#2a2f5a", "#0e1b36"],
  hill2: ["#1e3b61", "#245d7e", "#203f66", "#201f4a", "#0b142b"],
  water: ["#8fb1dc", "#4aa0d8", "#5b8fd0", "#6a5a9c", "#1c2b5c"],
  bank: ["#14304f", "#17496a", "#143a5c", "#161a3c", "#070d1f"],
};
export const SKY_A = ["#5b4b94", "#4aa3e8", "#3d7bd6", "#4a3a8a", "#050b1c"];
export const SKY_B = ["#ffd0a0", "#bfe6ff", "#ffe3a8", "#ff8a6a", "#3b3566"];
export const FAR_COL = ["#9d86c2", "#7f9fd8", "#7c88c4", "#5b4580", "#1c2558"];

export function mountTemplo(root: HTMLElement, data: TemploData): () => void {
  const q = <T extends Element = HTMLElement>(s: string) => root.querySelector(s) as T;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const timers: number[] = [];
  const later = (fn: () => void, ms: number) => void timers.push(window.setTimeout(fn, ms));
  const t = data.t;

  const stage = q(".tp-stage"),
    map = q<SVGSVGElement>("#map");
  const skyEl = q("#sky"),
    sunEl = q("#sun"),
    moonEl = q("#moon"),
    starsEl = q("#stars");
  const hintEl = q("#hint"),
    halls = q("#halls"),
    paper = q("#paper"),
    scrollEl = q("#scroll");
  const inter = q("#interior"),
    scene = q("#scene"),
    whereEl = q("#where"),
    nightBtn = q("#night");

  const HALLS: Hall[] = buildHalls(data);
  const hallById = (id: string | null) => HALLS.find((h) => h.id === id);

  const sceneData: SceneData = {
    halls: Object.fromEntries(HALLS.map((h) => [h.id, { name: esc(h.name), nav: esc(h.nav) }])),
    values: t.values.map((v) => ({ title: esc(v.title) })),
    projects: data.projects
      .filter((p) => p.type === "criden" || p.idea)
      .slice(0, 3)
      .map((p) => ({
        name: esc(p.name),
        sub: esc(p.idea ? t.ideaStatus : p.technologies.join(" · ")),
      })),
    team: data.members.map((m) => ({
      name: esc([m.name, m.surname].filter(Boolean).join(" ")),
      role: esc(t.role),
      avatar: m.avatar,
    })),
  };

  /* ---------- Mundo ---------- */
  map.innerHTML = buildMap(sceneData);
  const layers = [
    ["L1", 0.14],
    ["L2", 0.24],
    ["L3", 0.36],
  ].map(([id, k]) => ({
    el: map.querySelector("#" + id) as SVGGElement,
    k: k as number,
  }));

  let tt = 0,
    target = 0,
    forceNight = false,
    raf = 0,
    alive = true;
  function paintSky(v: number) {
    skyEl.style.setProperty("--s1", keyed(SKY_A, v));
    skyEl.style.setProperty("--s2", keyed(SKY_B, v));
    for (const id of Object.keys(PAINT))
      map.querySelector("#" + id)?.setAttribute("fill", keyed(PAINT[id], v));
    map.querySelectorAll(".far path, .far rect").forEach((e) => {
      e.setAttribute("fill", keyed(FAR_COL, v));
      e.setAttribute("stroke", keyed(FAR_COL, v));
    });
    const sunT = Math.min(v / 0.72, 1),
      sy = 60 - Math.sin(Math.PI * sunT) * 46;
    sunEl.style.left = 8 + sunT * 80 + "%";
    sunEl.style.top = sy + "%";
    sunEl.style.opacity = String(v > 0.66 ? Math.max(0, 1 - (v - 0.66) * 8) : 1);
    moonEl.style.opacity = String(v > 0.74 ? Math.min(1, (v - 0.74) * 6) : 0);
    starsEl.style.opacity = String(Math.max(0, Math.min(1, (v - 0.68) * 4)));
    root.classList.toggle("night", v > 0.74);
  }
  function loop() {
    if (!alive) return;
    const d = target - tt;
    if (Math.abs(d) > 0.0004) {
      tt += d * (reduce ? 1 : 0.07);
      paintSky(tt);
    }
    raf = requestAnimationFrame(loop);
  }

  /* ---------- Cámara ---------- */
  const cam: Cam = { x: 0, y: 0, w: W };
  let anim = 0;
  const size = () => {
    const r = stage.getBoundingClientRect();
    return { w: r.width || innerWidth || 1000, h: r.height || innerHeight || 700 };
  };
  function clamp() {
    const s = size();
    cam.w = Math.max(520, Math.min(Math.max(W * 1.25, (H * 1.25 * s.w) / s.h), cam.w));
    const h = (cam.w * s.h) / s.w;
    let cx = cam.x + cam.w / 2,
      cy = cam.y + h / 2;
    cx = Math.max(-300, Math.min(W + 300, cx));
    cy = Math.max(-1600, Math.min(1500, cy));
    cam.x = cx - cam.w / 2;
    cam.y = cy - h / 2;
  }
  function apply() {
    clamp();
    const s = size(),
      h = (cam.w * s.h) / s.w;
    map.setAttribute("viewBox", `${cam.x} ${cam.y} ${cam.w} ${h}`);
    const cx = cam.x + cam.w / 2 - W / 2,
      cy = cam.y + h / 2 - H / 2;
    layers.forEach((l) =>
      l.el.setAttribute("transform", `translate(${cx * l.k} ${cy * l.k * 0.5})`),
    );
    target = forceNight ? 1 : Math.max(0, Math.min(1, (cam.x + cam.w / 2 - 260) / (W - 520)));
  }
  function homeView() {
    const s = size(),
      wide = innerWidth > 900,
      mob = innerWidth <= 720;
    const w = mob ? 1500 : Math.max(W * 1.04, (H * 1.15 * s.w) / s.h);
    const shift = wide ? (300 * w) / s.w : 0,
      vh = (w * s.h) / s.w;
    return { x: mob ? 1250 : W / 2 - shift, y: mob ? 900 - 0.22 * vh : 700, w };
  }
  function fly(tx: number, ty: number, tw: number, ms: number) {
    cancelAnimationFrame(anim);
    const s = size(),
      th = (tw * s.h) / s.w;
    const to = { x: tx - tw / 2, y: ty - th / 2, w: tw },
      from = { ...cam };
    const t0 = performance.now(),
      dur = reduce ? 0 : ms;
    function step(now: number) {
      const p = dur ? Math.min((now - t0) / dur, 1) : 1,
        e = ease(p);
      cam.x = from.x + (to.x - from.x) * e;
      cam.y = from.y + (to.y - from.y) * e;
      cam.w = from.w + (to.w - from.w) * e;
      apply();
      if (p < 1 && alive) anim = requestAnimationFrame(step);
    }
    anim = requestAnimationFrame(step);
  }
  function zoomAt(f: number, px: number, py: number) {
    const s = size(),
      wx = cam.x + (px / s.w) * cam.w,
      wy = cam.y + (py / s.h) * ((cam.w * s.h) / s.w);
    cam.w = cam.w / f;
    clamp();
    const h = (cam.w * s.h) / s.w;
    cam.x = wx - (px / s.w) * cam.w;
    cam.y = wy - (py / s.h) * h;
    apply();
  }

  /* ---------- Entrada con puntero ---------- */
  const ptrs: Record<number, { x: number; y: number }> = {};
  let moved = 0,
    lastDist = 0;
  const on = <K extends keyof HTMLElementEventMap>(
    el: HTMLElement,
    ev: K,
    fn: (e: HTMLElementEventMap[K]) => void,
    opt?: AddEventListenerOptions,
  ) => {
    el.addEventListener(ev, fn as EventListener, opt);
    cleanups.push(() => el.removeEventListener(ev, fn as EventListener));
  };
  const cleanups: (() => void)[] = [];

  on(stage, "pointerdown", (e) => {
    cancelAnimationFrame(anim);
    ptrs[e.pointerId] = { x: e.clientX, y: e.clientY };
    moved = 0;
    lastDist = 0;
    stage.classList.add("drag");
    hintEl.classList.add("off");
  });
  on(stage, "pointermove", (e) => {
    const p = ptrs[e.pointerId];
    if (!p) return;
    const s = size(),
      ids = Object.keys(ptrs);
    if (ids.length === 2) {
      const a = ptrs[+ids[0]],
        b = ptrs[+ids[1]];
      p.x = e.clientX;
      p.y = e.clientY;
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      if (lastDist) zoomAt(d / lastDist, (a.x + b.x) / 2, (a.y + b.y) / 2);
      lastDist = d;
      moved += 10;
      return;
    }
    const dx = e.clientX - p.x,
      dy = e.clientY - p.y;
    moved += Math.abs(dx) + Math.abs(dy);
    p.x = e.clientX;
    p.y = e.clientY;
    if (moved > 6) {
      cam.x -= (dx * cam.w) / s.w;
      cam.y -= (dy * cam.w) / s.w;
      apply();
    }
  });
  on(stage, "pointerup", (e) => {
    const wasTap = moved < 8 && Object.keys(ptrs).length === 1;
    delete ptrs[e.pointerId];
    lastDist = 0;
    if (!Object.keys(ptrs).length) stage.classList.remove("drag");
    if (wasTap) {
      const b = (e.target as Element).closest?.(".bldg") as HTMLElement | null;
      if (b) openHall(b.dataset.id as HallId);
    }
  });
  on(stage, "pointercancel", (e) => {
    delete ptrs[e.pointerId];
    stage.classList.remove("drag");
  });
  on(
    stage,
    "wheel",
    (e) => {
      e.preventDefault();
      zoomAt(Math.exp(-e.deltaY * 0.0016), e.clientX, e.clientY);
      hintEl.classList.add("off");
    },
    { passive: false },
  );
  on(q("#zin"), "click", () => {
    const s = size();
    zoomAt(1.35, s.w / 2, s.h / 2);
  });
  on(q("#zout"), "click", () => {
    const s = size();
    zoomAt(1 / 1.35, s.w / 2, s.h / 2);
  });

  /* ---------- Salas: entrar, cambiar de sala, salir ---------- */
  let cur: HallId | null = null,
    busy = false,
    introClosed = false;
  const markNav = (id: string | null) =>
    [...halls.children].forEach((b) =>
      b.setAttribute("aria-current", String((b as HTMLElement).dataset.id === id)),
    );
  function closeScroll() {
    scrollEl.classList.remove("open");
    [...halls.children].forEach((b) => b.removeAttribute("aria-current"));
  }
  function showPaper(h: Hall) {
    paper.innerHTML = h.html;
    paper.scrollTop = 0;
    scrollEl.classList.add("open");
  }
  function setScene(h: Hall) {
    scene.innerHTML = `<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${esc(h.name)}">${SCENES[h.id](sceneData)}</svg>`;
    whereEl.innerHTML = `<span class="seal" aria-hidden="true">${h.k}</span>${esc(h.name)}`;
  }
  function openHall(id: HallId) {
    const h = hallById(id);
    if (!h || busy) return;
    if (cur === id) {
      showPaper(h);
      return;
    }
    busy = true;
    root.classList.remove("intro");
    closeScroll();
    markNav(id);
    hintEl.classList.add("off");
    if (cur) {
      // Ya estamos dentro: cruzamos a la sala siguiente por sus puertas.
      inter.classList.remove("open");
      later(() => {
        cur = id;
        setScene(h);
        inter.classList.add("open");
        later(() => {
          showPaper(h);
          busy = false;
        }, 700);
      }, 950);
    } else {
      // Desde el mapa: nos acercamos a la puerta del edificio y entramos.
      cancelAnimationFrame(anim);
      fly(h.x, h.y + 70, h.w * 0.3, 950);
      later(
        () => {
          cur = id;
          setScene(h);
          root.classList.add("in");
          inter.setAttribute("aria-hidden", "false");
          inter.classList.add("on");
          later(
            () => {
              inter.classList.add("open");
              later(() => {
                showPaper(h);
                busy = false;
              }, 800);
            },
            reduce ? 0 : 380,
          );
        },
        reduce ? 0 : 900,
      );
    }
  }
  function exitHall(then?: () => void) {
    if (!cur || busy) {
      if (then && !cur) then();
      return;
    }
    const h = hallById(cur)!;
    busy = true;
    closeScroll();
    inter.classList.remove("open");
    later(
      () => {
        inter.classList.remove("on");
        inter.setAttribute("aria-hidden", "true");
        root.classList.remove("in");
        cur = null;
        busy = false;
        markNav(null);
        later(() => (then ? then() : fly(h.x, h.y, h.w, 1000)), 250);
      },
      reduce ? 0 : 950,
    );
  }
  function goHomeMap() {
    closeScroll();
    if (!introClosed) root.classList.add("intro");
    const v = homeView();
    fly(v.x, v.y, v.w, 1000);
  }

  /* ---------- Botones y teclado ---------- */
  halls.innerHTML = HALLS.map(
    (h) =>
      `<button type="button" data-id="${h.id}" title="${esc(h.name)}"><span class="seal" aria-hidden="true">${h.k}</span><span class="t">${esc(h.nav)}</span></button>`,
  ).join("");
  on(halls, "click", (e) => {
    const b = (e.target as Element).closest("button");
    if (b) openHall(b.dataset.id as HallId);
  });
  on(paper, "click", (e) => {
    const n = (e.target as Element).closest("[data-next]") as HTMLElement | null;
    if (n) openHall(n.dataset.next as HallId);
  });
  on(q("#close"), "click", closeScroll);
  on(q("#introX"), "click", () => {
    introClosed = true;
    root.classList.remove("intro");
  });
  on(q("#explore"), "click", () => openHall("puerta"));
  on(q("#talk"), "click", () => openHall("contacto"));
  on(q("#exit"), "click", () => exitHall());
  on(q("#home"), "click", () => (cur ? exitHall(goHomeMap) : goHomeMap()));
  on(nightBtn, "click", () => {
    forceNight = !forceNight;
    nightBtn.setAttribute("aria-pressed", String(forceNight));
    nightBtn.textContent = forceNight ? t.templo.day : t.templo.night;
    apply();
  });

  const onKey = (e: KeyboardEvent) => {
    const tg = e.target as HTMLElement;
    if (tg.closest?.("input,textarea") || root.style.display === "none") return;
    const s = size(),
      st = cam.w * 0.06;
    if (e.key === "ArrowLeft") {
      cam.x -= st;
      apply();
    } else if (e.key === "ArrowRight") {
      cam.x += st;
      apply();
    } else if (e.key === "ArrowUp") {
      cam.y -= st;
      apply();
    } else if (e.key === "ArrowDown") {
      cam.y += st;
      apply();
    } else if (e.key === "+" || e.key === "=") zoomAt(1.2, s.w / 2, s.h / 2);
    else if (e.key === "-") zoomAt(1 / 1.2, s.w / 2, s.h / 2);
    else if (e.key === "Escape") {
      if (cur) exitHall();
      else closeScroll();
    } else if (e.key === "Enter" && tg.classList?.contains("bldg"))
      openHall(tg.dataset.id as HallId);
  };
  document.addEventListener("keydown", onKey);
  window.addEventListener("resize", apply);

  // Pétalos que caen (adorno)
  if (!reduce) {
    const pe = q("#petals");
    for (let i = 0; i < 26; i++) {
      const p = document.createElement("i");
      p.style.left = Math.random() * 100 + "%";
      p.style.setProperty("--sx", Math.random() * 160 - 40 + "px");
      p.style.animationDuration = 9 + Math.random() * 9 + "s";
      p.style.animationDelay = -Math.random() * 16 + "s";
      p.style.transform = `scale(${0.6 + Math.random() * 0.9})`;
      pe.appendChild(p);
    }
  }

  /* ---------- Arranque ---------- */
  root.classList.add("intro");
  const v = homeView();
  cam.w = v.w;
  cam.x = v.x - v.w / 2;
  cam.y = v.y - (v.w * size().h) / size().w / 2;
  apply();
  tt = target;
  paintSky(tt);
  loop();

  return () => {
    alive = false;
    cancelAnimationFrame(raf);
    cancelAnimationFrame(anim);
    timers.forEach(clearTimeout);
    cleanups.forEach((f) => f());
    document.removeEventListener("keydown", onKey);
    window.removeEventListener("resize", apply);
  };
}
