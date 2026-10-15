import { NextResponse } from "next/server";

// Recibe el formulario "Cuéntanos tu proyecto" y lo reenvía por correo mediante Formspree.
// El identificador del formulario (FORM_SPREE_ID) vive solo en el servidor. Si falta, responde
// 503 y la web ofrece WhatsApp y correo directo como respaldo.

const LIMITS = { name: 80, contact: 120, type: 80, deadline: 80, message: 2000 };

// Freno básico por IP (en memoria; basta para frenar abuso casual en una instancia).
const hits = new Map<string, number[]>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_HITS = 5;
function limited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > MAX_HITS;
}

function text(v: unknown, max: number) {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

export async function POST(req: Request) {
  const id = process.env.FORM_SPREE_ID;
  if (!id) return NextResponse.json({ error: "not_configured" }, { status: 503 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  // Campo trampa: las personas no lo ven ni lo llenan; los bots sí. Se responde "ok" sin enviar nada.
  if (text(body.website, 200)) return NextResponse.json({ ok: true });

  const name = text(body.name, LIMITS.name);
  const contact = text(body.contact, LIMITS.contact);
  const type = text(body.type, LIMITS.type);
  const deadline = text(body.deadline, LIMITS.deadline);
  const message = text(body.message, LIMITS.message);
  if (name.length < 2 || contact.length < 5 || message.length < 10) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (limited(ip)) return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  try {
    const res = await fetch(`https://formspree.io/f/${encodeURIComponent(id)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        _subject: `Nuevo proyecto: ${name} (${type || "sin tipo"})`,
        nombre: name,
        contacto: contact,
        "qué necesita": type,
        "para cuándo": deadline,
        mensaje: message,
        idioma: text(body.lang, 5),
      }),
    });
    if (!res.ok) return NextResponse.json({ error: "upstream" }, { status: 502 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "upstream" }, { status: 502 });
  }
}
