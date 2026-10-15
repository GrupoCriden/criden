# CRIDEN — Contexto del proyecto (web corporativa + administración + workspace privado)

## 1. Qué es Criden
Criden es un equipo de desarrollo de software formado por dos personas: **Cristian** y **Denis** (Ecuador).

Su primer proyecto real es **Super Gol Kids**, una plataforma de gestión de campeonatos de fútbol formativo desarrollada con Next.js, Supabase, Tailwind, Vercel y GitHub.

La plataforma de Criden tendrá **tres áreas claramente separadas**:

1. **Web pública**: carta de presentación de Criden, equipo, trayectoria, proyectos, casos de estudio y contacto.
2. **Administración pública**: panel para editar todo el contenido visible de la web sin tocar código.
3. **Workspace privado**: espacio interno de trabajo de Cristian y Denis para gestionar proyectos, ideas, tareas, calendario, archivos y actividad del equipo.

---

# 0. Decisiones vigentes (2026-10-03) — prevalecen sobre el resto del documento

1. **Una sola cuenta de acceso**: `grupocriden@gmail.com`. Es la única cuenta que puede entrar a `/admin` y `/workspace`, mediante inicio de sesión con Google (Supabase Auth). La restricción se valida en servidor y en RLS, no solo en la interfaz.
2. **Sin TinaCMS**: la administración pública se construye a medida sobre Supabase (tablas de contenido público + Supabase Storage para fotos). Lo público y lo privado siguen separados por tablas y políticas distintas. Donde este documento diga TinaCMS/TinaCloud, entender "admin propio sobre Supabase".
3. **Admin = editar todo lo público**: textos, perfiles, fotos, proyectos, testimonios, SEO, subir imágenes.
4. **Trabajo local por ahora**: no conectar Vercel ni depender del push a GitHub hasta nuevo aviso. Todos trabajan sobre `main`.
5. **Sala de trabajo (workspace)**, además de lo descrito en las secciones 10–16:
   - Proyecto: repositorio GitHub vinculado, contexto del proyecto, imágenes/archivos, ideas, checklist (pendiente / hecho / por revisar) con nota opcional "qué se hizo" al completar, cronograma propio.
   - Pantalla principal: calendario general con el Google Calendar de cada uno (libre/ocupado) y actividades ligadas a proyecto + tarea (ej.: "martes 19:00 · Tienda · hacer X" aparece en el calendario y en el checklist del proyecto).
   - Ideas: captura rápida desde el celular, incluso por voz (dictado del dispositivo primero; IA para estructurar después). Presentación visual, nada de texto plano. Una idea puede convertirse en proyecto.
   - Futuro: "red de ideas" (grafo de ideas relacionadas). El modelo de datos debe permitir enlazar ideas entre sí desde el inicio.
   - Instalable en el celular (PWA). Menos es más: sin ruido visual.
6. **Lenguaje visual vigente** (reemplaza "sombras suaves" y "bordes redondeados 10–22 px" de §19; colores y tipografías no cambian): contorno de 2 px en `navy`, sombra dura sin difuminar (`4px 4px 0`), esquinas de 6–12 px, piezas con inclinación leve, una tarjeta de color distinto por bloque, luz que sigue al puntero (`Spotlight`) y letra manuscrita (Caveat) solo para notas puntuales. Se evitan las tarjetas todas iguales con borde fino y sombra difusa. La zona privada usa el mismo sistema pero sin inclinaciones ni adornos: menos es más.
7. **Portada**: el hero tiene una ventana con selector de proyectos (`components/public/hero-stage.tsx`). Los textos salen de `content/settings/site.json` y los proyectos de `content/projects/projects.json`; el campo `visual` de cada proyecto elige su pantalla ilustrativa. Cuando existan capturas reales, reemplazan esas pantallas.
8. **Sala de trabajo implementada (2026-10-04)**: `/workspace` con Inicio, Calendario, Proyectos (con checklist pendiente / por revisar / hecha y nota opcional), Ideas (captura rápida, dictado por voz del navegador, convertir en proyecto) y Etiquetas. Tablas en `supabase/migrations/20261004000000_sala_de_trabajo.sql` (`tags`, `projects`, `tasks`, `events`, `ideas`), todas con RLS vía `is_allowed()`. Los textos están en `content/private/es.json`. Zona horaria fija America/Guayaquil (UTC-5) en `lib/workspace/dates.ts`. Las ideas ya guardan `related_ids` para la futura red de ideas.
9. **Etiquetas y Google Calendar (diseño)**: cada etiqueta tiene un color de una paleta de 8 que equivale a un `colorId` de Google Calendar (`lib/workspace/tags.ts`). Al sincronizar, el evento sale con el color de su primera etiqueta y guarda en `extendedProperties.private` el proyecto y las etiquetas. `events.google_event_id` y `google_calendar_id` ya existen. Cada miembro (Cristian, Dennys) conecta su propia cuenta de Google con OAuth, aparte del login compartido; los tokens se guardan solo en el servidor y no son legibles desde el navegador. Pendiente: activar Calendar API en Google Cloud, añadir el alcance, tabla `calendar_connections` y la sincronización.
10. **Siempre funcional en celular y computador**: toda pantalla nueva de `/workspace` y `/admin` debe probarse en ancho de celular (375), tableta (768) y escritorio (1280+), sin scroll horizontal. En escritorio hay barra lateral; en celular y tableta, barra superior breve y pestañas abajo (`.ws-tabs`, se reparten solas y hacen scroll si hay muchos módulos). Botones y campos de al menos 44 px de alto.
11. **Cómo crecer sin rehacer** (puntos de extensión):
   - **Módulo nuevo en la sala**: carpeta en `app/workspace/<ruta>/page.tsx` + una línea en `lib/workspace/modules.ts` + su nombre en `content/private/es.json` (`workspace.nav`). La navegación se arma sola.
   - **Calendario externo nuevo** (Outlook, Apple…): un archivo en `lib/calendar/providers/` que implemente `CalendarProvider` (`lib/calendar/types.ts`) + una línea en el registro de `lib/calendar/index.ts`. La pantalla Conexiones, la lectura de eventos, el envío y la disponibilidad lo usan sin cambios.
   - **Personas nuevas**: hoy `owner` admite `cristian`, `denis` y `ambos` (CHECK en `events` y `calendar_connections`). Para sumar a alguien se amplía ese CHECK y `EVENT_OWNERS` / `OWNERS`; el siguiente paso natural es una tabla `members`.
   - **Etiquetas, ideas y proyectos** ya usan `tag_ids` y `related_ids`, listos para filtros, reportes y la red de ideas.
12. **Google Calendar implementado (2026-10-04)**: cada persona conecta su cuenta en `/workspace/conexiones` (OAuth con alcances mínimos: eventos y disponibilidad). El token de renovación se guarda cifrado (AES-256-GCM, clave `TOKEN_ENCRYPTION_KEY` solo en el servidor). Los eventos externos se leen en vivo y no se copian a la base; los de Criden se pueden enviar al calendario de su responsable (no a "Ambos") y los cambios y borrados se propagan. El evento sale con el color de su primera etiqueta y guarda proyecto y etiquetas en `extendedProperties.private`. El calendario muestra los horarios libres comunes (08:00–20:00, bloques de 30 min o más) cuando ambas cuentas están conectadas. Variables: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `TOKEN_ENCRYPTION_KEY`. Dirección de retorno en Google Cloud: `<sitio>/api/calendar/callback`.
13. **Orden de trabajo**: (1) ordenar código base, (2) Supabase + login Google, (3) admin público, (4) workspace base: proyectos, checklist, ideas, (5) archivos, GitHub y cronograma por proyecto, (6) Google Calendar, (7) red de ideas + IA. Deploy en Vercel cuando se decida.
14. **Estilos de la portada (2026-10-10)**: la portada `/[lang]` tiene un botón "Estilo" que cambia toda la presentación sin cambiar el contenido: **Templo oriental** (mapa interactivo con salas que se visitan por dentro; `components/public/templo/`), **Ejecutivo** y **Noche** (pieles de una misma portada, `app/skins.css` + `components/public/site/exec-view.tsx`). El estilo elegido se guarda en el navegador y se escribe en `<html data-style>` antes de pintar (script en `app/layout.tsx`); el de por defecto está en `content/settings/site.json` (`defaultStyle`). La portada tradicional siempre queda en el documento (buscadores, lectores de pantalla); el Templo se descarga solo si se elige. Todos los textos salen de `site.json`, `projects.json` y `members.json`. Para sumar un estilo: agregarlo a `lib/styles.ts`, escribir su piel o vista y sus textos en `style.options`. Avatares ilustrados por miembro en `members.json` (`avatar`), dibujados por `lib/avatar.ts`. El workspace NO usa estos estilos: se mantiene sobrio. Perfiles y casos de estudio siguen con el estilo anterior (pendiente adaptarlos).
15. **Formulario de contacto (2026-10-14)**: "Cuéntanos tu proyecto" (`components/public/quote-form.tsx`) aparece en el Puente del Templo y en la sección de contacto de Ejecutivo/Noche. Envía a `app/api/cotizar/route.ts`, que lo reenvía por correo vía Formspree con `FORM_SPREE_ID` (solo servidor). Sin esa variable ofrece WhatsApp/correo con el mensaje prellenado. En la galería de proyectos, los trabajos individuales (`type: "independiente"`) se muestran aparte de los de Criden.

---

# 2. Principios principales

## 2.1 Nada visible escrito en piedra
- Ningún texto visible debe quedar hardcodeado dentro de los componentes.
- Títulos, misión, visión, roles, bios, experiencia, proyectos, contacto, botones y textos de interfaz deben salir de archivos de contenido o del CMS correspondiente.
- Los componentes deben encargarse de leer y presentar datos.
- Agregar un proyecto público, miembro, idioma o testimonio no debe requerir modificar componentes.

## 2.2 Separar lo público de lo privado
La web pública, el panel administrativo y el workspace privado deben ser módulos distintos.

- `/[lang]` → web pública.
- `/admin` → administración del contenido público.
- `/workspace` → espacio privado de trabajo.

No mezclar tareas, ideas o gestión interna dentro del CMS público.

## 2.3 Seguridad primero
- Nunca subir credenciales al repositorio.
- Usar `.env.local` para secretos.
- Mantener `.env.example` con nombres de variables, sin valores reales.
- Toda ruta privada debe estar protegida por autenticación.
- Las reglas de acceso deben validarse también del lado del servidor/base de datos, no solo en la interfaz.

---

# 3. Stack tecnológico

| Capa | Tecnología |
|---|---|
| Framework | Next.js (App Router, última versión estable) + TypeScript |
| Estilos | Tailwind CSS |
| Web pública | Next.js |
| Contenido público | Archivos JSON/Markdown + TinaCMS |
| Administración pública | TinaCMS + TinaCloud |
| Workspace privado | Next.js + Supabase |
| Base de datos privada | Supabase PostgreSQL |
| Autenticación | Supabase Auth |
| Archivos privados | Supabase Storage |
| Calendario | Google Calendar API / OAuth |
| Hosting | Vercel |
| Repositorio | GitHub |
| Analítica | Vercel Analytics |
| Formulario público | Formspree o alternativa definida en fase de contacto |

## 3.1 Base de datos
Sí se utilizará base de datos, pero **solo para la parte privada y funcional**.

TinaCMS seguirá gestionando el contenido público editable.

Supabase se utilizará para:
- usuarios;
- perfiles privados;
- proyectos internos;
- tareas;
- ideas;
- estados;
- comentarios;
- actividad del equipo;
- archivos privados;
- integraciones;
- datos necesarios del workspace.

No guardar contenido sensible innecesario.

---

# 4. Arquitectura general

```text
CRIDEN
│
├── Web pública
│   ├── Inicio
│   ├── Nosotros
│   ├── Equipo
│   ├── Perfiles
│   ├── Proyectos
│   ├── Casos de estudio
│   └── Contacto
│
├── Administración
│   └── /admin
│       └── Edita contenido público mediante TinaCMS
│
└── Workspace privado
    └── /workspace
        ├── Dashboard
        ├── Proyectos
        ├── Tareas
        ├── Ideas
        ├── Calendario
        ├── Archivos
        ├── Actividad
        └── Configuración
```

---

# 5. Idiomas (ES / EN)

- Rutas públicas: `/es/...` y `/en/...`.
- `/` redirige a `/es`.
- Selector ES/EN en el header que mantiene la página actual al cambiar de idioma.
- Cada campo público editable debe poder tener versión `es` y `en`.
- Si un texto en inglés está vacío, mostrar español como respaldo.
- Los textos de interfaz pública también deben poder editarse.

El workspace privado puede iniciar solo en español. La internacionalización del workspace se deja preparada, pero no es prioridad inicial.

---

# 6. Web pública

## 6.1 Inicio `/[lang]`
Orden base de secciones:

1. **Header**
   - logo;
   - nombre Criden;
   - Inicio;
   - Nosotros;
   - Equipo;
   - Proyectos;
   - selector ES/EN;
   - botón Contáctanos;
   - menú hamburguesa en móvil.

2. **Hero**
   - etiqueta pequeña;
   - título principal;
   - subtítulo;
   - botón Ver proyectos;
   - botón Hablemos;
   - captura del proyecto destacado;
   - tarjeta “Proyecto destacado · Super Gol Kids”.

3. **Nosotros**
   - Misión;
   - Visión;
   - Objetivo.

4. **Equipo**
   - tarjeta Cristian;
   - tarjeta Denis;
   - foto;
   - nombre;
   - rol;
   - botón Ver perfil;
   - toda la tarjeta debe ser clicable mediante `<Link>`.

5. **Proyectos**
   - un proyecto destacado;
   - grilla con proyectos adicionales;
   - tecnologías;
   - enlace al caso de estudio.

6. **Referencias**
   - mostrar solo si existen testimonios cargados.

7. **Contacto**
   - WhatsApp;
   - correo;
   - formulario.

8. **Footer**
   - Criden;
   - año;
   - Hecho en Ecuador.

---

# 7. Perfil de miembro

Ruta:

```text
/[lang]/equipo/[slug]
```

Una única plantilla reutilizable para cualquier miembro.

Contenido:
- Volver a Criden;
- foto;
- etiqueta Cofundador de Criden;
- nombre;
- rol;
- bio corta;
- Contactar;
- Descargar CV;
- LinkedIn;
- GitHub;
- experiencia;
- estudios;
- habilidades;
- proyectos relacionados.

Los botones cuyos enlaces estén vacíos no deben mostrarse.

Tipos de proyecto mostrados:
- `Criden`;
- `Independiente`.

---

# 8. Página pública de proyecto

Ruta:

```text
/[lang]/proyectos/[slug]
```

Debe funcionar como caso de estudio.

Contenido:
- nombre;
- resumen;
- problema;
- solución;
- capturas;
- tecnologías;
- URL del sitio;
- miembros participantes;
- tipo de proyecto;
- estado público cuando corresponda.

---

# 9. Administración del contenido público

Ruta:

```text
/admin
```

Su función es **editar exclusivamente lo público**.

Se utilizará TinaCMS para editar:
- settings;
- miembros;
- proyectos públicos;
- testimonios;
- textos de interfaz;
- SEO;
- imágenes públicas.

## Colecciones TinaCMS

### `settings`
- logo;
- nombre;
- hero;
- misión;
- visión;
- objetivo;
- WhatsApp;
- correo;
- redes;
- textos de interfaz;
- SEO;
- imagen para compartir.

### `members`
- slug;
- nombre;
- apellido;
- foto;
- rol;
- bio;
- LinkedIn;
- GitHub;
- CV;
- experiencia[];
- estudios[];
- habilidades[];
- orden.

### `projects`
- slug;
- nombre;
- resumen;
- problema;
- solución;
- capturas[];
- tecnologías[];
- URL;
- tipo (`criden` | `independiente`);
- miembros[];
- destacado;
- orden.

### `testimonials`
- texto;
- nombre;
- cargo;
- empresa;
- foto;
- proyecto relacionado.

Todas las imágenes públicas administradas por TinaCMS se guardarán dentro de `/public/uploads`.

---

# 10. Workspace privado

Ruta:

```text
/workspace
```

Solo pueden entrar usuarios autorizados.

Usuarios iniciales:
- Cristian;
- Denis.

El workspace es un sistema interno de trabajo de Criden y no debe ser accesible públicamente.

---

# 11. Dashboard privado

La pantalla principal debe mostrar información útil y resumida.

Ejemplo de bloques:
- saludo;
- actividades de hoy;
- próximas reuniones;
- tareas pendientes;
- tareas en progreso;
- proyectos activos;
- ideas recientes;
- actividad del equipo;
- próximos eventos de calendario.

Evitar dashboards decorativos sin información útil.

---

# 12. Proyectos internos

Ruta sugerida:

```text
/workspace/proyectos
```

Un proyecto interno puede contener más información que su versión pública.

Campos iniciales:
- nombre;
- descripción;
- cliente;
- estado;
- responsables;
- fecha de inicio;
- fecha objetivo;
- repositorio GitHub;
- URL de producción;
- tecnologías;
- tareas;
- notas;
- archivos;
- enlaces;
- reuniones;
- actividad;
- visibilidad pública.

Estados sugeridos:
- idea;
- planificación;
- en desarrollo;
- revisión;
- pausado;
- terminado;
- archivado.

La información privada jamás debe exponerse automáticamente en la web pública.

Si se implementa publicación desde el workspace, cada campo público debe seleccionarse de manera explícita.

---

# 13. Tareas

Ruta sugerida:

```text
/workspace/tareas
```

Campos mínimos:
- título;
- descripción;
- proyecto;
- responsable;
- creador;
- prioridad;
- estado;
- fecha límite;
- fecha de creación;
- comentarios;
- archivos.

Estados iniciales:
- pendiente;
- en progreso;
- bloqueada;
- terminada.

Vista inicial:
- lista;
- filtros;
- opcionalmente Kanban.

No empezar con automatizaciones complejas.

---

# 14. Ideas

Ruta sugerida:

```text
/workspace/ideas
```

Objetivo: guardar ideas de productos, mejoras o futuros proyectos de Criden.

Campos:
- título;
- descripción;
- problema detectado;
- posible solución;
- tecnologías posibles;
- autor;
- fecha;
- notas;
- estado.

Estados sugeridos:
- idea;
- investigando;
- validando;
- aprobada;
- descartada;
- convertida en proyecto.

Debe existir una acción futura para convertir una idea aprobada en proyecto.

---

# 15. Google Calendar

La integración con Google Calendar se implementará después de tener funcionando:

1. autenticación;
2. workspace;
3. proyectos;
4. tareas;
5. dashboard.

Cada miembro debe conectar su propia cuenta de Google mediante OAuth.

Objetivos:
- mostrar próximos eventos;
- distinguir eventos de Cristian y Denis;
- crear eventos asociados a proyectos;
- crear reuniones;
- consultar disponibilidad cuando sea necesario;
- permitir abrir el evento original en Google Calendar.

No almacenar contraseñas de Google.

Los tokens deben manejarse de forma segura.

---

# 16. Archivos privados

Los documentos internos pueden guardarse en Supabase Storage.

Ejemplos:
- contratos;
- propuestas;
- documentación técnica;
- capturas;
- entregables;
- archivos de proyecto.

Los archivos deben poder relacionarse con:
- proyectos;
- tareas;
- ideas;
- usuarios.

No utilizar `/public` de Next.js para documentos privados.

---

# 17. Roles y permisos

Roles iniciales:

```text
OWNER
```

Cristian y Denis tendrán permisos completos inicialmente.

Dejar preparada la arquitectura para futuras extensiones:
- ADMIN;
- COLABORADOR;
- CLIENTE.

No es necesario implementar todos esos roles en la primera versión.

Un futuro rol CLIENTE debería poder ver únicamente proyectos autorizados expresamente.

---

# 18. Supabase — modelo inicial

Tablas sugeridas:

```text
profiles
projects
project_members
tasks
ideas
comments
activity_logs
files
calendar_connections
```

No crear todas las tablas de una sola vez sin necesidad.

Implementar cada tabla cuando la fase correspondiente lo requiera.

## Reglas
- utilizar UUID;
- `created_at` y `updated_at` donde corresponda;
- relaciones mediante foreign keys;
- índices cuando exista una necesidad real;
- Row Level Security habilitado en tablas privadas;
- políticas RLS explícitas;
- no confiar únicamente en controles del frontend.

---

# 19. Diseño

Diseño aprobado: minimalista, limpio, profesional y rápido.

## Colores

| Token | Hex | Uso |
|---|---|---|
| `bg` | `#F6F8FB` | Fondo general |
| `surface` | `#FFFFFF` | Secciones alternas y tarjetas |
| `navy` | `#1F3A5F` | Títulos, footer, tarjeta destacada |
| `primary` | `#2F5D8A` | Botones, links, acentos |
| `navy-soft` | `#2A4B75` | Chips sobre fondo oscuro |
| `tint` | `#DCE7F3` | Etiquetas, fondos de foto |
| `tint-2` | `#EEF3F9` | Selector de idioma y chips |
| `border` | `#D9E2EC` | Bordes |
| `muted` | `#4A5B70` | Texto secundario |

## Tipografías
- **Sora** para títulos.
- **DM Sans** para texto.
- Utilizar `next/font`.

## Reglas visuales
- bordes redondeados entre 10 y 22 px;
- sombras suaves;
- iconos de línea con `lucide-react`;
- sin emojis dentro de la interfaz;
- secciones alternadas entre `bg` y `surface`;
- padding amplio;
- animaciones discretas;
- respetar `prefers-reduced-motion`;
- mobile first;
- botones táctiles de al menos 44 px;
- evitar scroll horizontal.

---

# 20. Accesibilidad

- contraste mínimo AA;
- `alt` en imágenes;
- usar `<a>` y `<Link>` reales;
- evitar `div` clicables;
- navegación por teclado;
- estados focus visibles;
- labels correctos en formularios;
- no depender únicamente del color para comunicar estados.

---

# 21. SEO y rendimiento

Aplicar a la web pública:
- metadata por página e idioma;
- Open Graph;
- vista previa adecuada para WhatsApp;
- `hreflang` ES/EN;
- `sitemap.xml`;
- `robots.txt`;
- `next/image`;
- páginas públicas estáticas cuando sea posible;
- Lighthouse objetivo >= 90.

Las rutas privadas no deben indexarse.

---

# 22. Estructura sugerida

```text
/app
  /[lang]
    /page.tsx
    /equipo/[slug]/page.tsx
    /proyectos/[slug]/page.tsx

  /admin

  /workspace
    /page.tsx
    /proyectos
    /tareas
    /ideas
    /calendario
    /configuracion

/components
  /public
  /workspace
  /shared

/content
  /settings
  /members
  /projects
  /testimonials

/lib
  /content
  /i18n
  /supabase
  /auth
  /google
  /helpers

/tina
  /config.ts

/public
  /uploads

/supabase
  /migrations
```

La estructura puede ajustarse si Next.js o TinaCMS requieren otra organización, pero mantener siempre la separación público / admin / workspace.

---

# 23. Variables de entorno

Crear `.env.example` desde el inicio.

Ejemplo:

```env
NEXT_PUBLIC_SITE_URL=

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

FORM_SPREE_ID=

TINA_CLIENT_ID=
TINA_TOKEN=
```

Nunca escribir valores reales en documentación pública ni commits.

---

# 24. GitHub

Repositorio sugerido:

```text
criden-web
```

Reglas:
- commits pequeños;
- commits descriptivos en español;
- no subir secretos;
- mantener `main` estable;
- trabajar con ramas cuando el cambio sea grande;
- documentar cambios importantes;
- evitar dependencias innecesarias.

Ejemplos de commits:

```text
feat: crear estructura base del proyecto
feat: agregar pagina publica de inicio
feat: implementar autenticacion con supabase
feat: crear dashboard privado
fix: corregir selector de idioma en movil
```

---

# 25. Deploy

Hosting principal:

```text
Vercel
```

Flujo:

```text
GitHub
  ↓
Vercel
  ↓
Criden
```

Supabase se mantiene como servicio externo de base de datos, autenticación y almacenamiento.

Utilizar Preview Deployments de Vercel para probar cambios antes de producción.

---

# 26. Contenido inicial

No inventar datos personales.

Utilizar placeholders mientras falte información real:
- `[Rol]`;
- `[Foto]`;
- `[Apellido]`;
- `[Bio]`;
- `[LinkedIn]`;
- `[GitHub]`;
- `[CV]`.

Proyecto real inicial:
- **Super Gol Kids**.

Textos iniciales editables:

### Misión
> Creamos soluciones tecnológicas a la medida de cada cliente, adaptándonos a sus necesidades para ayudarle a llegar de forma innovadora al mercado que busca.

### Visión
> Ser en los próximos 5 años un referente en desarrollo de soluciones digitales en Ecuador, reconocidos por la cercanía con nuestros clientes y la calidad de lo que construimos.

### Objetivo
> Acompañar a cada cliente desde la idea hasta el lanzamiento, entregando soluciones funcionales, escalables y fáciles de usar.

### Hero
> Tecnología que se adapta a tu proyecto.

> Somos Criden. Diseñamos y construimos plataformas web y soluciones digitales pensadas para lo que tu negocio realmente necesita.

---

# 27. Plan de trabajo por fases

No saltar fases sin una razón clara.

## Fase 1 — Base
- crear proyecto Next.js + TypeScript;
- Tailwind;
- fuentes;
- tokens de diseño;
- estructura de carpetas;
- `.env.example`;
- primer commit;
- conexión GitHub;
- deploy inicial en Vercel.

## Fase 2 — Contenido público + i18n
- contenido inicial;
- placeholders;
- rutas `/es` y `/en`;
- selector de idioma;
- helpers de contenido.

## Fase 3 — Web pública
- Header;
- Hero;
- Nosotros;
- Equipo;
- Proyectos;
- Referencias;
- Contacto visual;
- Footer;
- responsive.

## Fase 4 — Perfiles + páginas de proyecto
- perfil reutilizable;
- experiencia;
- habilidades;
- proyectos por miembro;
- caso de estudio de proyecto.

## Fase 5 — TinaCMS
- colecciones;
- edición pública;
- `/admin`;
- TinaCloud;
- carga de imágenes.

## Fase 6 — Supabase + autenticación
- crear proyecto Supabase;
- configurar cliente;
- Supabase Auth;
- usuarios Cristian y Denis;
- middleware/protección de rutas;
- RLS;
- layout privado.

## Fase 7 — Workspace base
- dashboard;
- navegación privada;
- proyectos internos;
- tareas;
- ideas;
- actividad básica.

## Fase 8 — Archivos y colaboración
- Supabase Storage;
- comentarios;
- archivos por proyecto;
- filtros;
- mejoras de actividad.

## Fase 9 — Google Calendar
- OAuth Google;
- conexión individual;
- lectura de eventos;
- próximos eventos;
- creación de reuniones;
- asociación con proyectos.

## Fase 10 — Contacto, SEO y analítica
- formulario real;
- metadata;
- Open Graph;
- sitemap;
- robots;
- Vercel Analytics;
- optimización Lighthouse.

## Fase 11 — Producción
- revisión de seguridad;
- revisión responsive;
- revisión de errores;
- dominio propio;
- correo con dominio;
- lanzamiento.

---

# 28. Cómo trabajar con este proyecto

- Explicar brevemente qué hace cada cambio importante.
- Ser directo si una propuesta técnica no conviene.
- No cambiar arquitectura sin justificarlo.
- No agregar dependencias innecesarias.
- Si se agrega una dependencia, explicar para qué sirve.
- Hacer cambios pequeños y comprobables.
- Antes de avanzar de fase, verificar la fase actual.
- Al terminar una fase:
  1. explicar qué se hizo;
  2. indicar cómo probarlo;
  3. señalar errores o pendientes;
  4. esperar confirmación antes de continuar.

---

# 29. Prioridad actual

La prioridad inmediata es:

1. crear o preparar el repositorio `criden-web`;
2. conectar el proyecto con GitHub;
3. iniciar Fase 1;
4. desplegar una versión base en Vercel;
5. continuar con la web pública;
6. luego implementar autenticación y workspace.

No empezar Google Calendar, automatizaciones avanzadas ni roles complejos antes de tener estable la base del proyecto.

---

# 30. Objetivo final

Criden debe terminar siendo una sola plataforma con tres funciones bien separadas:

```text
WEB PÚBLICA
Presentar la marca y conseguir clientes

ADMIN
Editar el contenido público sin tocar código

WORKSPACE
Gestionar el trabajo interno de Criden
```

La arquitectura debe permitir crecer sin rehacer el proyecto cuando se agreguen nuevos miembros, clientes, proyectos o integraciones.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
