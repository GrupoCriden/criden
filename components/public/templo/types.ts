import type { content, Lang, members, projects, contactInfo } from "@/lib/content";

// Todo lo que el Templo necesita para dibujarse. Llega desde la página (servidor) ya resuelto al idioma.
export type TemploData = {
  lang: Lang;
  brand: string;
  // Fondos completos de portada adaptados a escritorio, tableta y móvil.
  media: { wide: string; tablet: string; tall: string };
  t: ReturnType<typeof content>;
  members: typeof members;
  projects: typeof projects;
  contact: typeof contactInfo;
};

export type HallId = "puerta" | "nosotros" | "proyectos" | "equipo" | "contacto";
