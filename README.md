# CRIDEN — boceto inicial

Next.js App Router + TypeScript + Tailwind. Hosting previsto: Vercel.

## Ejecutar

Requiere Node.js >= 20.9.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Abrir http://localhost:3000. Validar con `npm run typecheck` y `npm run build`.

## Qué incluye

- Inicio ES/EN con nosotros, equipo, proyectos y contacto.
- Perfiles reutilizables y caso de estudio Super Gol Kids.
- Contenido editable en `content/`, separado de los componentes.
- Diseño adaptable, enlaces reales, foco visible y movimiento reducido.
- Metadata, favicon, robots y sitemap (requiere NEXT_PUBLIC_SITE_URL).
- Documento original incorporado como CLAUDE.md.

Las iniciales sustituyen fotografías pendientes. La ilustración de Super Gol Kids es conceptual, no una captura real. No se inventaron CV, apellidos, enlaces, correos ni testimonios.

## Límites del boceto

El formulario de contacto y la administración de la web pública (`/admin`) todavía no están hechos. El login con Google, la sala de trabajo y la conexión con Google Calendar sí funcionan. El código está en `grupocriden-sys/criden`.

## Desplegar en Vercel

La cuenta de Vercel no tiene que ser la misma que la de GitHub: solo necesita tener vinculada una cuenta de GitHub con acceso al repositorio `grupocriden-sys/criden`.

1. En Vercel: Add New → Project → Import `criden`. Next.js se detecta solo; no hay que cambiar el comando de build.
2. En **Environment Variables**, pegar el bloque de variables (ver abajo). Los secretos se pegan a mano, nunca van al repositorio.
3. Deploy. Con la dirección que entregue Vercel (por ejemplo `https://criden.vercel.app`):
   - agregar `NEXT_PUBLIC_SITE_URL` con esa dirección y volver a desplegar;
   - Supabase → Authentication → URL Configuration: poner esa dirección en *Site URL* y agregar `<dirección>/auth/callback` en *Redirect URLs*;
   - Google Cloud → Google Auth Platform → Clientes → agregar `<dirección>` como origen de JavaScript y `<dirección>/api/calendar/callback` como URI de redireccionamiento (la de Supabase se queda).

Variables de producción: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `TOKEN_ENCRYPTION_KEY` y `NEXT_PUBLIC_SITE_URL`. La `TOKEN_ENCRYPTION_KEY` debe ser **la misma** que en local mientras ambos usen el mismo proyecto de Supabase; con otra clave los calendarios conectados no se podrían leer.

## Acceso privado (Supabase + Google)

- `/admin` y `/workspace` exigen sesión; sin ella redirigen a `/login`.
- Solo entra la cuenta registrada en `public.allowed_accounts` (grupocriden@gmail.com). Se valida en servidor (`lib/auth/account.ts`) y en la base con `public.is_allowed()`.
- Migraciones en `supabase/migrations/`: ejecutarlas en Supabase → SQL Editor.
- Variables necesarias en `.env.local`: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` y `TOKEN_ENCRYPTION_KEY` (ver `.env.example`).

## Formulario "Cuéntanos tu proyecto"

Lo que escribe el visitante llega por correo mediante [Formspree](https://formspree.io) (plan gratuito). Para activarlo:

1. Crear una cuenta en Formspree con el correo donde quieren recibir los mensajes (por ejemplo `grupocriden@gmail.com`) y crear un formulario nuevo.
2. Copiar el identificador del formulario (la parte final de `https://formspree.io/f/XXXXXXXX`).
3. Guardarlo como `FORM_SPREE_ID` en `.env.local` (local) y en las variables de entorno de Vercel (producción). Es secreto de servidor: no lleva `NEXT_PUBLIC_`.
4. En Formspree, confirmar el correo la primera vez que llegue el aviso.

Sin esa variable el formulario no se rompe: ofrece WhatsApp y correo con el mensaje ya escrito. La ruta del servidor es `app/api/cotizar/route.ts` (valida los datos, descarta bots con un campo trampa y limita 5 envíos por IP cada 10 minutos). Los textos del formulario están en `content/settings/site.json` (`quote`).

## Siguiente fase

Ver la sección 0 del CLAUDE.md: login con Google, admin propio sobre Supabase y sala de trabajo. La preview HTML es una maqueta autónoma del inicio ES para revisar sin instalar herramientas; la implementación oficial está en `app/`.

## Verificación de esta entrega

`npm run typecheck` y `npm run build` completados correctamente con Next.js 16.3.8. `boceto.html` es una captura HTML autónoma del inicio real generado por Next.js; los enlaces de perfiles e idioma están simplificados en esa captura. Para navegar todas las rutas ejecutar la aplicación.
