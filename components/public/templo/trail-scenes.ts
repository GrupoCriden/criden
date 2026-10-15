import type { HallId } from "./types";

// Escenas panorámicas para escritorio y composiciones verticales para móvil/tablet.
// Cada ilustración mantiene el mismo atardecer y valle para que las paradas se fundan.
export const STOP_MEDIA: Record<HallId, string> = {
  puerta: "/uploads/templo-stop-puerta.webp",
  nosotros: "/uploads/templo-stop-gran-salon.webp",
  proyectos: "/uploads/templo-stop-pergaminos.webp",
  equipo: "/uploads/templo-stop-casa-te.webp",
  contacto: "/uploads/templo-stop-puente.webp",
};

export const STOP_MEDIA_MOBILE: Record<HallId, string> = {
  puerta: "/uploads/templo-stop-puerta-mobile.webp",
  nosotros: "/uploads/templo-stop-gran-salon-mobile.webp",
  proyectos: "/uploads/templo-stop-pergaminos-mobile.webp",
  equipo: "/uploads/templo-stop-casa-te-mobile.webp",
  contacto: "/uploads/templo-stop-puente-mobile.webp",
};
