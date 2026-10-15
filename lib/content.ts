import site from "@/content/settings/site.json";
import projectsData from "@/content/projects/projects.json";

export { default as members } from "@/content/members/members.json";
export const brand = site.brand;
export const contactInfo = site.contactInfo;
export const temploMedia = site.temploMedia;
export const projects = projectsData;
export const cridenProjects = projectsData.filter((p) => p.type === "criden" && !p.idea);
export const ideaProjects = projectsData.filter((p) => p.idea);

export type Lang = "es" | "en";

export function isLang(s: string): s is Lang {
  return s === "es" || s === "en";
}

// Textos de interfaz del idioma pedido; los vacíos caen al español.
export function content(lang: Lang) {
  return {
    ...site.es,
    ...Object.fromEntries(Object.entries(site[lang]).filter(([, v]) => v !== "")),
  } as typeof site.es;
}
