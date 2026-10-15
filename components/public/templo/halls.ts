import { avatarSvg } from "@/lib/avatar";
import type { HallId, TemploData } from "./types";

// Las cinco salas del templo: dónde está cada edificio en el mapa y el contenido de su pergamino.
// Los textos salen de content/ (settings, proyectos y miembros); aquí solo se arma el HTML.
export type Hall = {
  id: HallId;
  name: string;
  nav: string;
  k: string;
  x: number;
  y: number;
  w: number;
  html: string;
};

const GEOM: Record<HallId, { k: string; x: number; y: number; w: number }> = {
  puerta: { k: "門", x: 360, y: 880, w: 900 },
  nosotros: { k: "殿", x: 960, y: 660, w: 1000 },
  proyectos: { k: "巻", x: 1460, y: 760, w: 1000 },
  equipo: { k: "茶", x: 1900, y: 640, w: 800 },
  contacto: { k: "橋", x: 2150, y: 1050, w: 900 },
};
export const HALL_IDS = Object.keys(GEOM) as HallId[];

export function esc(s: string): string {
  return String(s).replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );
}

export function buildHalls(d: TemploData): Hall[] {
  const { t, lang } = d;
  const h = t.templo.halls;
  const items = (list: { title: string; text: string }[]) =>
    list.map((i) => `<div><b>${esc(i.title)}</b>${esc(i.text)}</div>`).join("");
  const head = (id: HallId, kicker: string, title: string, k: string) =>
    `<p class="kicker">${esc(kicker)}</p><h2 id="templo-room-heading-${id}" tabindex="-1">${esc(title)}</h2><span class="stamp" aria-hidden="true">${k}</span>`;
  // Botón al final de cada pergamino: lleva a la sala siguiente (la última vuelve a la puerta).
  const next = (id: HallId, alt = false) => {
    const target = HALL_IDS[(HALL_IDS.indexOf(id) + 1) % HALL_IDS.length];
    return `<div class="row"><button class="go${alt ? " alt" : ""}" data-next="${target}">${esc(h[id].next)}</button></div>`;
  };

  const projectCards = d.projects
    .filter((p) => p.type === "criden" || p.idea)
    .map((p) => {
      const tags = [
        p.idea ? `<span class="soon">${esc(t.ideaStatus)}</span>` : "",
        ...[...p.technologies, ...p.tags].map((v) => `<span>${esc(v)}</span>`),
      ].join("");
      const link = p.idea
        ? ""
        : `<a class="lnk" href="/${lang}/proyectos/${p.slug}">${esc(t.case)} →</a>`;
      return `<div class="sc"><h3>${esc(p.name)}</h3><p>${esc(p[lang].summary || p.es.summary)}</p><div class="tags">${tags}</div>${link}</div>`;
    })
    .join("");

  const team = d.members
    .map((m) => {
      const name = [m.name, m.surname].filter(Boolean).join(" ");
      return `<div class="m">${avatarSvg(m.avatar, 'class="av"', name)}<div><b>${esc(name)}</b><span>${esc(m.role[lang] || m.role.es || t.role)}${m.bio[lang] || m.bio.es ? ". " + esc(m.bio[lang] || m.bio.es) : ""}</span><a class="lnk" href="/${lang}/equipo/${m.slug}">${esc(t.profile)} →</a></div></div>`;
    })
    .join("");

  const html: Record<HallId, string> = {
    puerta:
      head("puerta", t.servicesLabel, t.servicesTitle, GEOM.puerta.k) +
      `<div class="services">${items(t.services)}</div><p style="margin-top:14px">${esc(t.templo.gateText)}</p>` +
      next("puerta"),
    nosotros:
      head("nosotros", t.aboutLabel, t.about, GEOM.nosotros.k) +
      `<div class="pillars">${items(t.values)}</div>` +
      next("nosotros"),
    proyectos:
      head("proyectos", t.projectsLabel, t.projectsTitle, GEOM.proyectos.k) +
      `<div class="scrolls">${projectCards}</div>` +
      next("proyectos"),
    equipo:
      head("equipo", t.teamLabel, t.teamTitle, GEOM.equipo.k) +
      `<div class="masters">${team}</div>` +
      next("equipo"),
    contacto:
      head("contacto", t.contact, t.contactTitle, GEOM.contacto.k) +
      `<p>${esc(t.contactText)} ${esc(t.templo.bridgeText)}</p><div class="row"><a class="go" href="https://wa.me/${esc(d.contact.whatsapp)}" target="_blank" rel="noopener noreferrer">${esc(t.whatsappCta)}</a><a class="go alt" href="mailto:${esc(d.contact.email)}">${esc(d.contact.email)}</a></div>` +
      next("contacto", true),
  };

  return HALL_IDS.map((id) => ({
    id,
    name: h[id].name,
    nav: h[id].nav,
    ...GEOM[id],
    html: html[id],
  }));
}
