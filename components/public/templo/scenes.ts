// @ts-nocheck
// Dibujo del mundo del Templo: capas del mapa y una escena interior por sala. Son piezas de SVG
// armadas como texto (código de ilustración portado de la maqueta, sin lógica de negocio).
// Los textos visibles llegan en `SceneData`; los kanji son adornos (aria-hidden en la interfaz).
import { avatarSvg, type AvatarTraits } from "@/lib/avatar";

export type SceneData = {
  halls: Record<string, { name: string; nav: string }>;
  values: { title: string }[];
  projects: { name: string; sub: string }[];
  team: { name: string; role: string; avatar: AvatarTraits }[];
};

export const W = 2400;
export const H = 1400;
const FAR = 2400;

/* ---------- Piezas ---------- */
function roof(w, h, fill, edge) {
  var t = w / 2 + 20;
  return (
    '<path d="M' +
    -w * 0.3 +
    " " +
    -h +
    " L" +
    w * 0.3 +
    " " +
    -h +
    " Q" +
    w * 0.44 +
    " " +
    -h * 0.35 +
    " " +
    t +
    " -8 Q" +
    w * 0.32 +
    " 7 0 7 Q" +
    -w * 0.32 +
    " 7 " +
    -t +
    " -8 Q" +
    -w * 0.44 +
    " " +
    -h * 0.35 +
    " " +
    -w * 0.3 +
    " " +
    -h +
    'Z" fill="' +
    (fill || "#1b2433") +
    '" stroke="' +
    (edge || "#e8b84a") +
    '" stroke-width="3"/>'
  );
}
function pillars(w, h, n) {
  var s = "";
  for (var i = 0; i < n; i++) {
    var x = -w / 2 + (w / (n - 1)) * i;
    s += '<rect x="' + (x - 5) + '" y="' + -h + '" width="10" height="' + h + '" fill="#d6322b"/>';
  }
  return s;
}
function lantern(x, y, r) {
  return (
    '<g transform="translate(' +
    x +
    " " +
    y +
    ')"><line y1="-14" y2="0" stroke="#3a1f14" stroke-width="3"/><circle class="glow" r="' +
    r * 3.4 +
    '" fill="url(#lg)"/><rect x="' +
    -r * 0.7 +
    '" y="0" width="' +
    r * 1.4 +
    '" height="' +
    r * 1.8 +
    '" rx="' +
    r * 0.5 +
    '" fill="#d6322b" stroke="#3a1f14" stroke-width="2"/><rect class="lit" x="' +
    -r * 0.3 +
    '" y="' +
    r * 0.3 +
    '" width="' +
    r * 0.6 +
    '" height="' +
    r * 1.2 +
    '" rx="3" fill="#ffb86b"/></g>'
  );
}
function pine(x, y, s, o) {
  return (
    '<g transform="translate(' +
    x +
    " " +
    y +
    ") scale(" +
    s +
    ')" opacity="' +
    (o || 1) +
    '"><rect x="-6" y="-30" width="12" height="40" fill="#3a1f14"/><ellipse cx="0" cy="-58" rx="56" ry="20" fill="#16402f"/><ellipse cx="6" cy="-84" rx="44" ry="17" fill="#1b5a40"/><ellipse cx="-4" cy="-106" rx="30" ry="14" fill="#16402f"/></g>'
  );
}
function sakura(x, y, s) {
  var d = "";
  [
    [-40, -90, 38],
    [20, -110, 44],
    [60, -70, 34],
    [-10, -60, 40],
    [-60, -50, 28],
    [30, -40, 30],
  ].forEach(function (c) {
    d +=
      '<circle cx="' + c[0] + '" cy="' + c[1] + '" r="' + c[2] + '" fill="#ffb7cf" opacity=".92"/>';
  });
  return (
    '<g transform="translate(' +
    x +
    " " +
    y +
    ") scale(" +
    s +
    ')"><path d="M0 0 C-6 -30 8 -50 0 -80" stroke="#3a1f14" stroke-width="12" fill="none" stroke-linecap="round"/>' +
    d +
    "</g>"
  );
}
function torii(x, y) {
  return (
    '<g transform="translate(' +
    x +
    " " +
    y +
    ')"><rect x="-96" y="-250" width="22" height="250" fill="#d6322b"/><rect x="74" y="-250" width="22" height="250" fill="#d6322b"/><rect x="-100" y="-4" width="30" height="10" fill="#111"/><rect x="70" y="-4" width="30" height="10" fill="#111"/><rect x="-96" y="-200" width="192" height="16" fill="#d6322b"/><path d="M-140 -262 Q0 -236 140 -262 L152 -290 Q0 -262 -152 -290Z" fill="#111" stroke="#e8b84a" stroke-width="3"/><rect x="-18" y="-250" width="36" height="52" fill="#1b2433" stroke="#e8b84a" stroke-width="2"/></g>'
  );
}
function hall(x, y) {
  return (
    '<g transform="translate(' +
    x +
    " " +
    y +
    ')"><rect x="-250" y="-6" width="500" height="26" fill="#8e97a8"/><rect x="-224" y="-26" width="448" height="22" fill="#a6aebd"/><rect x="-190" y="-120" width="380" height="94" fill="#2a1a14"/>' +
    pillars(380, 94, 7).replace(/y="-94"/g, 'y="-120"') +
    [-110, -34, 42, 118]
      .map(function (cx) {
        return (
          '<rect class="lit" x="' +
          (cx - 24) +
          '" y="-108" width="48" height="68" fill="#e8b84a" stroke="#3a1f14" stroke-width="2"/><path d="M' +
          cx +
          " -108v68M" +
          (cx - 24) +
          ' -74h48" stroke="#3a1f14" stroke-width="2"/>'
        );
      })
      .join("") +
    '<g transform="translate(0 -118)">' +
    roof(440, 64) +
    '</g><rect x="-150" y="-248" width="300" height="70" fill="#2a1a14"/><g transform="translate(0 -178)">' +
    pillars(300, 70, 5) +
    '</g><g transform="translate(0 -244)">' +
    roof(330, 70) +
    '</g><rect x="-4" y="-372" width="8" height="64" fill="#e8b84a"/><circle cy="-382" r="10" fill="#e8b84a"/>' +
    lantern(-130, -120, 16) +
    lantern(130, -120, 16) +
    "</g>"
  );
}
function gallery(x, y) {
  var sc = [-90, 0, 90]
    .map(function (cx, i) {
      return (
        '<g transform="translate(' +
        cx +
        ' -96)"><rect x="-26" y="-6" width="52" height="8" fill="#8a5a35"/><rect x="-22" y="2" width="44" height="64" fill="' +
        ["#d6322b", "#e8b84a", "#2f5d8a"][i] +
        '" stroke="#3a1f14" stroke-width="2"/><rect x="-26" y="64" width="52" height="8" fill="#8a5a35"/><path d="M-12 20h24M-12 32h24M-12 44h18" stroke="#fff" stroke-width="3" opacity=".8"/></g>'
      );
    })
    .join("");
  return (
    '<g transform="translate(' +
    x +
    " " +
    y +
    ')"><rect x="-200" y="-6" width="400" height="22" fill="#8e97a8"/><rect x="-170" y="-150" width="340" height="146" fill="#2a1a14"/>' +
    sc +
    '<g transform="translate(0 -150)">' +
    roof(380, 66) +
    "</g>" +
    lantern(-168, -150, 14) +
    lantern(168, -150, 14) +
    '<g transform="translate(0 -216)"><rect x="-90" y="-60" width="180" height="56" fill="#2a1a14"/>' +
    roof(210, 50) +
    "</g></g>"
  );
}
function tea(x, y) {
  return (
    '<g transform="translate(' +
    x +
    " " +
    y +
    ')"><ellipse cx="0" cy="14" rx="170" ry="16" fill="#0006"/><rect x="-130" y="-10" width="260" height="14" fill="#8e97a8"/><rect x="-110" y="-110" width="220" height="100" fill="#2a1a14"/>' +
    pillars(220, 100, 5).replace(/y="-100"/g, 'y="-110"') +
    [-66, 0, 66]
      .map(function (cx) {
        return (
          '<rect class="lit" x="' +
          (cx - 26) +
          '" y="-96" width="52" height="76" fill="#f1e5c8" stroke="#3a1f14" stroke-width="2"/><path d="M' +
          cx +
          " -96v76M" +
          (cx - 26) +
          ' -58h52" stroke="#3a1f14" stroke-width="2"/>'
        );
      })
      .join("") +
    '<g transform="translate(0 -108)">' +
    roof(250, 56, "#3a2a1c", "#c9a15a") +
    '</g><g opacity=".8"><path class="steam" d="M146 -30c-10 -16 10 -24 0 -40" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round"/><path class="steam" style="animation-delay:-1.6s" d="M160 -30c-10 -16 10 -24 0 -40" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round"/></g>' +
    lantern(-120, -108, 12) +
    "</g>"
  );
}
function bridge(x, y) {
  return (
    '<g transform="translate(' +
    x +
    " " +
    y +
    ')"><path d="M-210 20 Q0 -130 210 20" fill="none" stroke="#7d8798" stroke-width="30" stroke-linecap="round"/><path d="M-210 4 Q0 -146 210 4" fill="none" stroke="#d6322b" stroke-width="10" stroke-linecap="round"/><path d="M-210 -22 Q0 -172 210 -22" fill="none" stroke="#d6322b" stroke-width="6" stroke-linecap="round"/>' +
    [-160, -80, 0, 80, 160]
      .map(function (cx) {
        var yy = -130 * (1 - Math.pow(cx / 210, 2));
        return (
          '<line x1="' +
          cx +
          '" y1="' +
          (yy * 0.98 + 4) +
          '" x2="' +
          cx +
          '" y2="' +
          (yy * 1.16 - 18) +
          '" stroke="#d6322b" stroke-width="5"/>'
        );
      })
      .join("") +
    lantern(-218, -30, 14) +
    lantern(218, -30, 14) +
    "</g>"
  );
}
function farPagoda(x, y, s, o, col) {
  var t = "";
  for (var i = 0; i < 4; i++) {
    var w = 130 - i * 22;
    t +=
      '<g transform="translate(0 ' +
      -i * 54 +
      ')"><rect x="' +
      -w * 0.36 +
      '" y="-40" width="' +
      w * 0.72 +
      '" height="34" fill="' +
      col +
      '"/>' +
      roof(w, 22, col, col) +
      "</g>";
  }
  return (
    '<g class="far" transform="translate(' +
    x +
    " " +
    y +
    ") scale(" +
    s +
    ')" opacity="' +
    o +
    '">' +
    t +
    '<rect x="-3" y="-290" width="6" height="60" fill="' +
    col +
    '"/></g>'
  );
}
function house(x, y, s) {
  return (
    '<g transform="translate(' +
    x +
    " " +
    y +
    ") scale(" +
    s +
    ')" opacity=".75"><rect x="-40" y="-34" width="80" height="34" fill="#22294a"/><path d="M-58 -34 Q0 -62 58 -34 L44 -50 Q0 -70 -44 -50Z" fill="#161b34"/><rect class="lit" x="-12" y="-24" width="24" height="24" fill="#2b3560"/></g>'
  );
}
function plaque(name, kanji) {
  var w = 80 + name.length * 13;
  return (
    '<g class="plaque" transform="translate(0 52)"><rect x="' +
    -w / 2 +
    '" y="0" width="' +
    w +
    '" height="46" rx="4" fill="#3a1f14" stroke="#e8b84a" stroke-width="3"/><text x="' +
    (-w / 2 + 40) +
    '" y="30" style="font-family:var(--serif)" font-weight="800" font-size="22" fill="#fff">' +
    name +
    '</text><rect x="' +
    (-w / 2 + 6) +
    '" y="6" width="30" height="34" fill="#d6322b"/><text x="' +
    (-w / 2 + 21) +
    '" y="31" text-anchor="middle" style="font-family:var(--serif)" font-weight="800" font-size="22" fill="#fff">' +
    kanji +
    "</text></g>"
  );
}
function bird(y, d, dur) {
  return (
    '<g class="bird" style="animation-duration:' +
    dur +
    "s;animation-delay:" +
    d +
    's"><path transform="translate(0 ' +
    y +
    ')" d="M0 0 Q10 -12 20 0 Q30 -12 40 0" fill="none" stroke="#1b2433" stroke-width="3" stroke-linecap="round" opacity=".75"/></g>'
  );
}

// Silueta de montañas / colinas que se extiende muy lejos para que nunca se vea vacío
function ridge(id, base, amp, seed, step, volcano) {
  var d = "M" + -FAR + " 5200",
    x = -FAR,
    i = 0;
  while (x <= W + FAR) {
    var y =
      base - Math.abs(Math.sin(i * 1.3 + seed) * amp) - Math.sin(i * 0.7 + seed * 2) * amp * 0.4;
    d += " L" + x + " " + Math.round(y);
    x += step * (0.6 + (Math.sin(i * 2.1 + seed) + 1) * 0.4);
    i++;
  }
  return '<path id="' + id + '" d="' + d + " L" + (W + FAR) + ' 5200Z" fill="#445"/>';
}
function hills(id, y0, amp, seed) {
  var d = "M" + -FAR + " 5200";
  for (var x = -FAR; x <= W + FAR; x += 80)
    d +=
      " L" +
      x +
      " " +
      Math.round(
        y0 + Math.sin(x * 0.0031 + seed) * amp + Math.sin(x * 0.0087 + seed * 2) * amp * 0.4,
      );
  return '<path id="' + id + '" d="' + d + " L" + (W + FAR) + ' 5200Z" fill="#234"/>';
}

// Piezas sueltas, para armar otras composiciones (recorrido vertical en trail-scenes.ts).
export const PIECES = { torii, hall, gallery, tea, bridge, pine, sakura, lantern, plaque, ridge, farPagoda, house };

export function buildMap(d: SceneData): string {
  return (
    '<defs><radialGradient id="lg"><stop offset="0" stop-color="#ffb86b" stop-opacity=".9"/><stop offset="1" stop-color="#ffb86b" stop-opacity="0"/></radialGradient><linearGradient id="mist" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity=".5"/></linearGradient></defs>' +
    '<g id="L1">' +
    ridge("mFar", 650, 160, 1, 240) +
    farPagoda(1500, 600, 0.9, 0.5, "#2a3568") +
    farPagoda(520, 650, 0.8, 0.45, "#2a3568") +
    farPagoda(-700, 640, 0.9, 0.45, "#2a3568") +
    farPagoda(3100, 620, 1, 0.45, "#2a3568") +
    farPagoda(2420, 630, 0.7, 0.4, "#2a3568") +
    "</g>" +
    '<g class="mist" opacity=".7"><ellipse cx="900" cy="660" rx="900" ry="60" fill="url(#mist)"/><ellipse cx="2000" cy="620" rx="800" ry="50" fill="url(#mist)"/><ellipse cx="-600" cy="640" rx="700" ry="50" fill="url(#mist)"/></g>' +
    '<g id="L2">' +
    ridge("mMid", 820, 180, 3, 200) +
    "</g>" +
    '<g class="mist" style="animation-delay:-14s" opacity=".6"><ellipse cx="1200" cy="830" rx="1100" ry="70" fill="url(#mist)"/><ellipse cx="3000" cy="800" rx="900" ry="60" fill="url(#mist)"/></g>' +
    '<g id="L3">' +
    ridge("mNear", 990, 140, 5, 180) +
    house(250, 1010, 1) +
    house(780, 1000, 0.8) +
    house(1180, 1000, 0.9) +
    house(1700, 990, 0.8) +
    house(2300, 1000, 1) +
    house(-300, 1010, 1) +
    house(2800, 1000, 0.9) +
    "</g>" +
    hills("hill1", 1010, 36, 1) +
    hills("hill2", 1090, 30, 4) +
    hills("water", 1190, 14, 2) +
    '<path class="water-l" d="M-300 1260 H300 M600 1290 H1300 M1500 1260 H2100 M2300 1290 H2900" stroke="#fff" stroke-width="5" stroke-dasharray="40 80" opacity=".55" fill="none"/>' +
    '<g class="boat"><g transform="translate(300 1235)"><path d="M-46 0 Q0 20 46 0 L34 -10 H-34Z" fill="#3a1f14" stroke="#e8b84a" stroke-width="2"/><path d="M0 -10 V-70 L40 -16Z" fill="#f1e5c8" stroke="#3a1f14" stroke-width="2"/></g></g>' +
    '<path d="M360 1070 C560 1030 640 880 960 850 S1300 960 1460 940 S1750 800 1900 790 S2250 1000 2150 1170" fill="none" stroke="#e8b84a" stroke-width="7" stroke-dasharray="4 18" stroke-linecap="round" opacity=".85"/>' +
    sakura(640, 990, 1.3) +
    sakura(1230, 1010, 1.1) +
    sakura(2060, 900, 1.2) +
    sakura(-120, 1030, 1.2) +
    sakura(2700, 1030, 1.1) +
    pine(120, 1075, 1.4) +
    pine(250, 1045, 1) +
    pine(2300, 1030, 1.3) +
    pine(2200, 1055, 0.9) +
    pine(1090, 1010, 0.8, 0.9) +
    pine(1700, 960, 0.8) +
    pine(560, 900, 0.7, 0.8) +
    pine(-300, 1060, 1.3) +
    pine(2650, 1060, 1.2) +
    pine(-600, 1050, 1) +
    pine(3000, 1050, 1.1) +
    '<g class="bldg" id="b-puerta" tabindex="0" role="button" aria-label="' +
    d.halls.puerta.name +
    ": " +
    d.halls.puerta.nav +
    '" data-id="puerta">' +
    torii(360, 1070) +
    '<g transform="translate(360 1070)">' +
    plaque(d.halls.puerta.name, "門") +
    "</g></g>" +
    '<g class="bldg" id="b-salon" tabindex="0" role="button" aria-label="' +
    d.halls.nosotros.name +
    ": " +
    d.halls.nosotros.nav +
    '" data-id="nosotros">' +
    hall(960, 850) +
    '<g transform="translate(960 850)">' +
    plaque(d.halls.nosotros.name, "殿") +
    "</g></g>" +
    '<g class="bldg" id="b-perg" tabindex="0" role="button" aria-label="' +
    d.halls.proyectos.name +
    ": " +
    d.halls.proyectos.nav +
    '" data-id="proyectos">' +
    gallery(1460, 940) +
    '<g transform="translate(1460 940)">' +
    plaque(d.halls.proyectos.name, "巻") +
    "</g></g>" +
    '<g class="bldg" id="b-te" tabindex="0" role="button" aria-label="' +
    d.halls.equipo.name +
    ": " +
    d.halls.equipo.nav +
    '" data-id="equipo">' +
    tea(1900, 790) +
    '<g transform="translate(1900 790)">' +
    plaque(d.halls.equipo.name, "茶") +
    "</g></g>" +
    '<g class="bldg" id="b-puente" tabindex="0" role="button" aria-label="' +
    d.halls.contacto.name +
    ": " +
    d.halls.contacto.nav +
    '" data-id="contacto">' +
    bridge(2150, 1170) +
    '<g transform="translate(2150 1170)">' +
    plaque(d.halls.contacto.name, "橋") +
    "</g></g>" +
    lantern(660, 1060, 18) +
    lantern(1260, 1070, 18) +
    lantern(1700, 1000, 18) +
    lantern(2050, 1000, 18) +
    bird(300, -4, 46) +
    bird(380, -22, 58) +
    bird(240, -34, 70) +
    Array.apply(null, Array(14))
      .map(function (_, i) {
        return (
          '<ellipse class="lamp" cx="' +
          (-300 + i * 230) +
          '" cy="' +
          (1300 + (i % 3) * 60) +
          '" rx="12" ry="16" fill="#ffb86b" style="animation-duration:' +
          (22 + (i % 5) * 4) +
          "s;animation-delay:-" +
          i * 3 +
          's"/>'
        );
      })
      .join("") +
    hills("bank", 1345, 22, 6)
  );
}

var GLOW =
  '<radialGradient id="lg2"><stop offset="0" stop-color="#ffb86b" stop-opacity=".85"/><stop offset="1" stop-color="#ffb86b" stop-opacity="0"/></radialGradient>';
function lampI(x, y, r, len) {
  return (
    '<g transform="translate(' +
    x +
    " " +
    y +
    ')"><line y1="' +
    -(len || 300) +
    '" y2="0" stroke="#2a150d" stroke-width="3"/><circle class="flk" r="' +
    r * 4.2 +
    '" fill="url(#lg2)"/><rect x="' +
    -r +
    '" y="0" width="' +
    2 * r +
    '" height="' +
    r * 2.4 +
    '" rx="' +
    r * 0.6 +
    '" fill="#d6322b" stroke="#2a150d" stroke-width="3"/><rect x="' +
    -r * 0.5 +
    '" y="' +
    r * 0.4 +
    '" width="' +
    r +
    '" height="' +
    r * 1.5 +
    '" rx="4" fill="#ffd36b"/></g>'
  );
}
function room(c) {
  var ln = "",
    bm = "",
    i;
  for (i = -8; i <= 16; i++)
    ln += '<line x1="800" y1="400" x2="' + (i * 200 - 400) + '" y2="900"/>';
  [640, 668, 704, 752, 820].forEach(function (y) {
    ln += '<line x1="0" y1="' + y + '" x2="1600" y2="' + y + '"/>';
  });
  [40, 100, 150].forEach(function (y) {
    var o = (y / 180) * 400;
    bm +=
      '<rect x="' +
      o +
      '" y="' +
      (y - 8) +
      '" width="' +
      (1600 - 2 * o) +
      '" height="16" fill="' +
      c.beam +
      '"/>';
  });
  return (
    '<defs><clipPath id="fl"><polygon points="0,900 1600,900 1200,620 400,620"/></clipPath><linearGradient id="wg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' +
    c.wall2 +
    '"/><stop offset="1" stop-color="' +
    c.wall +
    '"/></linearGradient>' +
    GLOW +
    "</defs>" +
    '<rect width="1600" height="900" fill="' +
    c.wall +
    '"/><polygon points="0,0 1600,0 1200,180 400,180" fill="' +
    c.ceil +
    '"/>' +
    bm +
    '<rect x="400" y="180" width="800" height="440" fill="url(#wg)"/><polygon points="0,0 400,180 400,620 0,900" fill="' +
    c.side +
    '"/><polygon points="1600,0 1200,180 1200,620 1600,900" fill="' +
    c.side2 +
    '"/>' +
    '<polygon points="0,900 1600,900 1200,620 400,620" fill="' +
    c.floor +
    '"/><g clip-path="url(#fl)" stroke="' +
    c.fl +
    '" stroke-width="3" opacity=".55">' +
    ln +
    "</g>"
  );
}
function banner(x, y, w, h, col, title, kanji) {
  return (
    '<g transform="translate(' +
    x +
    " " +
    y +
    ')"><rect x="' +
    (-w / 2 - 8) +
    '" y="-8" width="' +
    (w + 16) +
    '" height="14" rx="5" fill="#2a150d"/><path d="M' +
    -w / 2 +
    " 6 H" +
    w / 2 +
    " V" +
    h +
    " L0 " +
    (h - 28) +
    " L" +
    -w / 2 +
    " " +
    h +
    'Z" fill="' +
    col +
    '" stroke="#e8b84a" stroke-width="3"/><text x="0" y="' +
    h * 0.42 +
    '" text-anchor="middle" style="font-family:var(--serif)" font-weight="800" font-size="' +
    w * 0.46 +
    '" fill="#fff" opacity=".95">' +
    kanji +
    '</text><text x="0" y="' +
    h * 0.72 +
    '" text-anchor="middle" style="font-family:var(--serif)" font-weight="800" font-size="22" fill="#fff">' +
    title +
    "</text></g>"
  );
}
function gate(s, by) {
  return '<g transform="translate(800 ' + by + ") scale(" + s + ')">' + torii(0, 0) + "</g>";
}
function stone(x, y, s) {
  return (
    '<g transform="translate(' +
    x +
    " " +
    y +
    ") scale(" +
    s +
    ')"><rect x="-26" y="-18" width="52" height="18" fill="#7d8798"/><rect x="-10" y="-80" width="20" height="62" fill="#9aa3b3"/><rect x="-30" y="-120" width="60" height="40" fill="#7d8798"/><rect class="flk" x="-14" y="-112" width="28" height="24" fill="#ffd36b"/><path d="M-46 -120 L0 -154 L46 -120Z" fill="#5d6678"/></g>'
  );
}
function stars(n, seed) {
  var s = "",
    i,
    a = seed;
  for (i = 0; i < n; i++) {
    a = (a * 9301 + 49297) % 233280;
    var x = (a / 233280) * 1600;
    a = (a * 9301 + 49297) % 233280;
    var y = (a / 233280) * 480;
    s +=
      '<circle cx="' +
      x.toFixed(0) +
      '" cy="' +
      y.toFixed(0) +
      '" r="' +
      (1 + (i % 3) * 0.6) +
      '" fill="#fff" opacity="' +
      (0.5 + (i % 4) * 0.12) +
      '"/>';
  }
  return s;
}
export const SCENES: Record<string, (d: SceneData) => string> = {
  puerta: function (d) {
    return (
      '<defs><linearGradient id="isk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5b4b94"/><stop offset=".62" stop-color="#ffb98a"/><stop offset="1" stop-color="#ffd0a0"/></linearGradient>' +
      GLOW +
      "</defs>" +
      '<rect width="1600" height="900" fill="url(#isk)"/><circle cx="800" cy="410" r="170" fill="#fff3c0" opacity=".3"/><circle cx="800" cy="410" r="72" fill="#fff7c8"/>' +
      '<path d="M0 520 L220 360 L380 470 L560 330 L760 480 L940 380 L1140 500 L1340 350 L1600 520 L1600 580 L0 580Z" fill="#7a68ad" opacity=".85"/><path d="M0 570 L180 470 L360 540 L560 480 L800 560 L1040 490 L1260 550 L1440 480 L1600 540 L1600 620 L0 620Z" fill="#4a3d80"/>' +
      '<rect y="575" width="1600" height="325" fill="#2d6a4a"/><polygon points="560,900 1040,900 830,575 770,575" fill="#e3d2a8"/><path d="M650 900 L792 575 M950 900 L808 575 M800 900 L800 575" stroke="#c9b583" stroke-width="3" fill="none"/>' +
      sakura(170, 720, 1.7) +
      sakura(1440, 720, 1.7) +
      pine(330, 650, 0.9, 0.95) +
      pine(1270, 650, 0.9, 0.95) +
      pine(520, 610, 0.5, 0.9) +
      pine(1080, 610, 0.5, 0.9) +
      gate(0.5, 585) +
      gate(0.9, 650) +
      gate(1.45, 770) +
      stone(640, 720, 0.85) +
      stone(960, 720, 0.85) +
      gate(2.6, 915) +
      stone(450, 900, 1.5) +
      stone(1150, 900, 1.5)
    );
  },
  nosotros: function (d) {
    return (
      room({
        wall: "#6e2f1a",
        wall2: "#b0602e",
        floor: "#4a2a18",
        fl: "#2b160a",
        side: "#58261a",
        side2: "#4a2016",
        ceil: "#2b140c",
        beam: "#1c0d07",
      }) +
      banner(560, 196, 150, 210, "#d6322b", d.values[0].title, "使") +
      banner(800, 196, 150, 224, "#2f5d8a", d.values[1].title, "視") +
      banner(1040, 196, 150, 210, "#c58a1c", d.values[2].title, "標") +
      '<polygon points="500,650 1100,650 1050,598 550,598" fill="#7a4a28" stroke="#2a150d" stroke-width="3"/><polygon points="550,598 1050,598 1010,560 590,560" fill="#a8703f" stroke="#2a150d" stroke-width="3"/>' +
      '<rect x="738" y="452" width="124" height="110" fill="#d6322b" stroke="#e8b84a" stroke-width="4"/><rect x="726" y="432" width="148" height="26" fill="#e8b84a" stroke="#2a150d" stroke-width="3"/><text x="800" y="528" text-anchor="middle" style="font-family:var(--serif)" font-weight="800" font-size="52" fill="#fff">殿</text>' +
      '<rect x="262" y="132" width="44" height="566" fill="#d6322b"/><rect x="1294" y="132" width="44" height="566" fill="#d6322b"/><rect x="254" y="120" width="60" height="22" fill="#e8b84a"/><rect x="1286" y="120" width="60" height="22" fill="#e8b84a"/>' +
      '<rect x="50" y="0" width="100" height="900" fill="#c22a24"/><rect x="1450" y="0" width="100" height="900" fill="#c22a24"/><rect x="40" y="0" width="120" height="40" fill="#e8b84a"/><rect x="1440" y="0" width="120" height="40" fill="#e8b84a"/>' +
      lampI(400, 330, 20) +
      lampI(1200, 330, 20) +
      lampI(800, 150, 26, 150)
    );
  },
  proyectos: function (d) {
    var P = function (i) {
      return d.projects[i] || { name: "", sub: "" };
    };
    function frame(x, y, w, h, c1, c2, title, sub) {
      return (
        '<g transform="translate(' +
        x +
        " " +
        y +
        ')"><rect width="' +
        w +
        '" height="' +
        h +
        '" fill="#1b1410" stroke="#e8b84a" stroke-width="5"/><rect x="10" y="10" width="' +
        (w - 20) +
        '" height="' +
        (h - 20) +
        '" fill="url(#' +
        c1 +
        ')"/><rect x="26" y="26" width="' +
        w * 0.5 +
        '" height="10" rx="3" fill="#fff" opacity=".85"/><rect x="26" y="48" width="' +
        w * 0.32 +
        '" height="8" rx="3" fill="#fff" opacity=".5"/><rect x="26" y="' +
        (h - 74) +
        '" width="' +
        w * 0.28 +
        '" height="34" rx="4" fill="' +
        c2 +
        '"/><rect x="' +
        w * 0.4 +
        '" y="' +
        h * 0.45 +
        '" width="' +
        w * 0.46 +
        '" height="' +
        h * 0.3 +
        '" rx="6" fill="#fff" opacity=".18"/><text x="' +
        w / 2 +
        '" y="' +
        (h + 44) +
        '" text-anchor="middle" style="font-family:var(--serif)" font-weight="800" font-size="26" fill="#fff">' +
        title +
        '</text><text x="' +
        w / 2 +
        '" y="' +
        (h + 70) +
        '" text-anchor="middle" style="font-family:var(--font-dm),sans-serif" font-size="17" fill="#f3e6c4">' +
        sub +
        "</text></g>"
      );
    }
    var rolls = "";
    ["#d6322b", "#e8b84a", "#2f5d8a", "#f1e5c8", "#d6322b", "#e8b84a"].forEach(function (c, i) {
      rolls +=
        '<rect x="' +
        (610 + i * 62) +
        '" y="622" width="48" height="16" rx="8" fill="' +
        c +
        '" stroke="#2a150d" stroke-width="2"/>';
    });
    return (
      room({
        wall: "#3a2a20",
        wall2: "#6a4a34",
        floor: "#5a3a22",
        fl: "#2a150d",
        side: "#2e2018",
        side2: "#281b14",
        ceil: "#241610",
        beam: "#150b07",
      }) +
      '<defs><linearGradient id="gA" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2f5d8a"/><stop offset="1" stop-color="#14395f"/></linearGradient><linearGradient id="gB" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#b3531f"/><stop offset="1" stop-color="#5a2a14"/></linearGradient><linearGradient id="gC" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4a3d80"/><stop offset="1" stop-color="#241a50"/></linearGradient></defs>' +
      frame(612, 232, 376, 230, "gA", "#e8b84a", P(0).name, P(0).sub) +
      frame(436, 272, 150, 110, "gB", "#e8b84a", P(1).name, P(1).sub) +
      frame(1014, 272, 150, 110, "gC", "#e8b84a", P(2).name, P(2).sub) +
      '<polygon points="560,700 1040,700 1000,640 600,640" fill="#7a4a28" stroke="#2a150d" stroke-width="3"/>' +
      rolls +
      lampI(330, 300, 18) +
      lampI(1270, 300, 18) +
      '<rect x="50" y="0" width="90" height="900" fill="#4b2f1c"/><rect x="1460" y="0" width="90" height="900" fill="#4b2f1c"/>'
    );
  },
  equipo: function (d) {
    var T = function (i) {
      return d.team[i] || d.team[0];
    };
    var grid = "";
    for (var i = 0; i <= 4; i++)
      grid +=
        '<line x1="' +
        (600 + i * 100) +
        '" y1="230" x2="' +
        (600 + i * 100) +
        '" y2="520" stroke="#2a150d" stroke-width="7"/>';
    for (i = 0; i <= 3; i++)
      grid +=
        '<line x1="600" y1="' +
        (230 + i * 97) +
        '" x2="1000" y2="' +
        (230 + i * 97) +
        '" stroke="#2a150d" stroke-width="7"/>';
    function tag(x, name, role) {
      return (
        '<g transform="translate(' +
        x +
        ' 300)"><line y1="-120" y2="0" stroke="#2a150d" stroke-width="3"/><rect x="-78" width="156" height="78" rx="4" fill="#3a1f14" stroke="#e8b84a" stroke-width="3"/><text x="0" y="36" text-anchor="middle" style="font-family:var(--serif)" font-weight="800" font-size="25" fill="#fff">' +
        name +
        '</text><text x="0" y="60" text-anchor="middle" style="font-family:var(--font-dm),sans-serif" font-size="14" fill="#f3e6c4">' +
        role +
        "</text></g>"
      );
    }
    return (
      room({
        wall: "#1c2340",
        wall2: "#2f3a78",
        floor: "#3a2a1c",
        fl: "#1a0e07",
        side: "#171c36",
        side2: "#141830",
        ceil: "#0e1124",
        beam: "#07081a",
      }) +
      '<rect x="600" y="230" width="400" height="290" fill="#1f2c66"/><circle cx="880" cy="330" r="80" fill="#c9d4ff" opacity=".18"/><circle cx="880" cy="330" r="46" fill="#fff"/><path d="M600 520 L690 430 L780 480 L880 410 L1000 500 L1000 520Z" fill="#0f1646"/><path d="M600 300 Q690 260 740 330 M620 420 Q720 360 760 410" stroke="#ffb7cf" stroke-width="9" fill="none" opacity=".9"/>' +
      grid +
      '<rect x="592" y="222" width="416" height="306" fill="none" stroke="#3a1f14" stroke-width="12"/>' +
      tag(480, T(0).name.split(" ")[0], T(0).role) +
      tag(1120, T(1).name.split(" ")[0], T(1).role) +
      '<ellipse cx="800" cy="762" rx="230" ry="52" fill="#000" opacity=".35"/><ellipse cx="800" cy="720" rx="210" ry="46" fill="#7a4a28" stroke="#2a150d" stroke-width="4"/><ellipse cx="800" cy="712" rx="196" ry="38" fill="#9a6034"/>' +
      '<ellipse cx="780" cy="690" rx="38" ry="28" fill="#d6322b" stroke="#2a150d" stroke-width="3"/><path d="M820 686 Q850 670 846 650" stroke="#2a150d" stroke-width="8" fill="none" stroke-linecap="round"/><ellipse cx="780" cy="664" rx="18" ry="6" fill="#2a150d"/><ellipse cx="700" cy="716" rx="22" ry="9" fill="#f1e5c8" stroke="#2a150d" stroke-width="2"/><ellipse cx="900" cy="716" rx="22" ry="9" fill="#f1e5c8" stroke="#2a150d" stroke-width="2"/>' +
      '<g opacity=".7"><path class="steam" d="M780 640c-12 -18 12 -28 0 -48" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round"/><path class="steam" style="animation-delay:-1.8s" d="M796 640c-12 -18 12 -28 0 -48" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round"/></g>' +
      avatarSvg(T(0).avatar, 'x="335" y="515" width="270" height="270"', T(0).name) +
      avatarSvg(T(1).avatar, 'x="995" y="515" width="270" height="270"', T(1).name) +
      '<ellipse cx="470" cy="800" rx="120" ry="38" fill="#d6322b" stroke="#2a150d" stroke-width="4"/><ellipse cx="1130" cy="800" rx="120" ry="38" fill="#2f5d8a" stroke="#2a150d" stroke-width="4"/>' +
      lampI(300, 330, 20) +
      lampI(1300, 330, 20) +
      lampI(800, 130, 24, 130)
    );
  },
  contacto: function (d) {
    var posts = "",
      k;
    [0, 0.26, 0.5, 0.72].forEach(function (t) {
      var lx = 360 + (750 - 360) * t,
        ly = 900 + (590 - 900) * t,
        rx = 1240 + (850 - 1240) * t,
        h = 150 * (1 - t * 0.65),
        r = 15 * (1 - t * 0.55);
      posts +=
        '<line x1="' +
        lx +
        '" y1="' +
        ly +
        '" x2="' +
        lx +
        '" y2="' +
        (ly - h) +
        '" stroke="#d6322b" stroke-width="' +
        10 * (1 - t * 0.6) +
        '"/><line x1="' +
        rx +
        '" y1="' +
        ly +
        '" x2="' +
        rx +
        '" y2="' +
        (ly - h) +
        '" stroke="#d6322b" stroke-width="' +
        10 * (1 - t * 0.6) +
        '"/>' +
        lampI(lx, ly - h, r, 30) +
        lampI(rx, ly - h, r, 30);
    });
    return (
      '<defs><linearGradient id="nsk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0a0d2c"/><stop offset=".75" stop-color="#3a2a6a"/><stop offset="1" stop-color="#6a4a8a"/></linearGradient><linearGradient id="wat" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1a2468"/><stop offset="1" stop-color="#0a1038"/></linearGradient>' +
      GLOW +
      "</defs>" +
      '<rect width="1600" height="900" fill="url(#nsk)"/>' +
      stars(80, 7) +
      '<circle cx="1200" cy="190" r="110" fill="#c9d4ff" opacity=".14"/><circle cx="1200" cy="190" r="58" fill="#fff"/>' +
      '<path d="M0 470 L200 330 L380 430 L600 300 L800 440 L1000 340 L1240 450 L1420 330 L1600 450 L1600 560 L0 560Z" fill="#141a52"/>' +
      farPagoda(1230, 560, 1.1, 0.95, "#0b1038") +
      farPagoda(330, 560, 0.8, 0.9, "#0b1038") +
      '<rect y="560" width="1600" height="340" fill="url(#wat)"/><ellipse cx="1200" cy="640" rx="40" ry="90" fill="#fff" opacity=".12"/><g stroke="#8da0ff" stroke-width="3" opacity=".25"><line x1="120" y1="620" x2="320" y2="620"/><line x1="1260" y1="700" x2="1500" y2="700"/><line x1="200" y1="780" x2="440" y2="780"/><line x1="1100" y1="840" x2="1380" y2="840"/></g>' +
      '<polygon points="340,900 1260,900 855,585 745,585" fill="#4a2e1a" stroke="#2a150d" stroke-width="4"/><g stroke="#2a150d" stroke-width="3" opacity=".7"><line x1="800" y1="900" x2="800" y2="585"/><line x1="600" y1="900" x2="780" y2="585"/><line x1="1000" y1="900" x2="820" y2="585"/><line x1="470" y1="900" x2="765" y2="585"/><line x1="1130" y1="900" x2="835" y2="585"/></g>' +
      '<g class="flk">' +
      posts +
      "</g>" +
      '<text x="800" y="500" text-anchor="middle" style="font-family:var(--serif)" font-weight="800" font-size="46" fill="#fff" opacity=".9">橋</text>'
    );
  },
};
