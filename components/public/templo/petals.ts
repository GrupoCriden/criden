// Pétalos de cerezo que caen (adorno del Templo), en tres planos de profundidad: los del fondo son
// pequeños, lentos y tenues; los del primer plano, grandes, rápidos, escasos y desenfocados.
type Layer = {
  name: "back" | "middle" | "front";
  count: number;
  mobile: number;
  sides: number;
  size: [number, number];
  duration: [number, number];
  opacity: [number, number];
};

const LAYERS: Layer[] = [
  {
    name: "back",
    count: 14,
    mobile: 7,
    sides: 12,
    size: [5, 11],
    duration: [16, 25],
    opacity: [0.25, 0.55],
  },
  {
    name: "middle",
    count: 12,
    mobile: 6,
    sides: 10,
    size: [10, 19],
    duration: [10, 17],
    opacity: [0.65, 0.95],
  },
  {
    name: "front",
    count: 5,
    mobile: 2,
    sides: 4,
    size: [21, 34],
    duration: [7, 12],
    opacity: [0.55, 0.85],
  },
];

// Pares claro / oscuro para el degradado de cada pétalo.
const COLORS = [
  ["#fff0f5", "#f5a5c3"],
  ["#ffd6e5", "#df7ca7"],
  ["#ffb9d2", "#d86b9b"],
  ["#ffe1ed", "#ee9cbd"],
];

const rnd = (min: number, max: number) => min + Math.random() * (max - min);

function createPetal(layer: Layer, index: number, left: number): HTMLElement {
  const petal = document.createElement("span");
  petal.className = `petal petal--${layer.name}`;
  const [light, dark] = COLORS[Math.floor(Math.random() * COLORS.length)];
  const id = `sakura-${layer.name}-${index}`;
  petal.innerHTML =
    '<span class="petal__sway"><span class="petal__flip"><svg viewBox="0 0 40 44">' +
    `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0.8" y2="1"><stop offset="0%" stop-color="${light}"/><stop offset="100%" stop-color="${dark}"/></linearGradient></defs>` +
    `<path d="M20 4C15 -2 3 2 3 13C1 27 13 36 20 42C28 34 39 24 37 12C35 2 25 -1 20 4Z" fill="url(#${id})" stroke="#ffe0eb" stroke-width="0.7"/>` +
    '<path d="M20 40Q16 25 20 10" stroke="#bb5c87" stroke-width="0.6" opacity="0.3" fill="none"/>' +
    "</svg></span></span>";

  const duration = rnd(...layer.duration);
  const set = (name: string, value: string) => petal.style.setProperty(name, value);
  set("--left", `${left}%`);
  set("--size", `${rnd(...layer.size)}px`);
  set("--duration", `${duration}s`);
  set("--delay", `${-rnd(0, duration)}s`);
  set("--opacity", String(rnd(...layer.opacity)));
  set("--drift", `${rnd(-120, 170)}px`);
  set("--sway-duration", `${rnd(2, 5)}s`);
  set("--flip-duration", `${rnd(1.5, 4)}s`);
  set("--blur", `${rnd(0.8, 1.8)}px`);
  return petal;
}

// Llena `container` con los pétalos y devuelve la función que los quita. Con movimiento reducido
// no crea ninguno, y se actualiza si el usuario cambia esa preferencia.
export function mountPetals(container: HTMLElement): () => void {
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  const render = () => {
    container.replaceChildren();
    if (motion.matches) return;
    const mobile = innerWidth < 768;
    // En pantallas anchas el texto va al centro: los pétalos de más caen por los lados.
    const wide = innerWidth >= 1000;
    const fragment = document.createDocumentFragment();
    for (const layer of LAYERS) {
      const count = mobile ? layer.mobile : layer.count;
      for (let i = 0; i < count; i++) fragment.appendChild(createPetal(layer, i, rnd(0, 100)));
      for (let i = 0; wide && i < layer.sides; i++) {
        const left = Math.random() < 0.5 ? rnd(0, 20) : rnd(80, 100);
        fragment.appendChild(createPetal(layer, count + i, left));
      }
    }
    container.appendChild(fragment);
  };
  render();
  let resizeRaf = 0;
  let profile = `${innerWidth < 768 ? "mobile" : "wide"}:${innerWidth >= 1000 ? "sides" : "none"}`;
  const onResize = () => {
    if (resizeRaf) return;
    resizeRaf = requestAnimationFrame(() => {
      resizeRaf = 0;
      const nextProfile = `${innerWidth < 768 ? "mobile" : "wide"}:${innerWidth >= 1000 ? "sides" : "none"}`;
      if (nextProfile !== profile) {
        profile = nextProfile;
        render();
      }
    });
  };
  motion.addEventListener("change", render);
  window.addEventListener("resize", onResize, { passive: true });
  return () => {
    motion.removeEventListener("change", render);
    window.removeEventListener("resize", onResize);
    cancelAnimationFrame(resizeRaf);
    container.replaceChildren();
  };
}
