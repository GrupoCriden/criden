"use client";

import { useId, useState } from "react";
import { CheckCircle2, Mail, MessageCircle, Send } from "lucide-react";
import "./quote-form.css";

// Formulario "Cuéntanos tu proyecto". Envía a /api/cotizar (que reenvía el correo). Si el envío no
// está disponible o falla, ofrece WhatsApp y correo con el mensaje ya escrito, sin perder lo digitado.
// Todos los textos llegan por `labels` (content/settings/site.json → quote).

export type QuoteLabels = {
  title: string;
  intro: string;
  name: string;
  contact: string;
  contactHint: string;
  type: string;
  types: string[];
  deadline: string;
  deadlines: string[];
  message: string;
  messagePlaceholder: string;
  send: string;
  sending: string;
  success: string;
  successNote: string;
  again: string;
  error: string;
  fallback: string;
  privacy: string;
  required: string;
  mailLabel: string;
  mailSubject: string;
};

type Status = "idle" | "sending" | "ok" | "error" | "unavailable";

export function QuoteForm({
  labels: l,
  lang,
  whatsapp,
  email,
  showTitle = true,
}: {
  labels: QuoteLabels;
  lang: string;
  whatsapp: string;
  email: string;
  showTitle?: boolean;
}) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const [status, setStatus] = useState<Status>("idle");
  const [draft, setDraft] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    const data = {
      name: String(f.get("name") ?? ""),
      contact: String(f.get("contact") ?? ""),
      type: String(f.get("type") ?? ""),
      deadline: String(f.get("deadline") ?? ""),
      message: String(f.get("message") ?? ""),
      website: String(f.get("website") ?? ""),
      lang,
    };
    // Resumen listo para WhatsApp o correo si el envío directo no está disponible.
    setDraft(
      `${data.name} · ${data.contact}\n${l.type} ${data.type}\n${l.deadline} ${data.deadline}\n\n${data.message}`,
    );
    setStatus("sending");
    try {
      const res = await fetch("/api/cotizar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        setStatus("ok");
        form.reset();
      } else {
        setStatus(res.status === 503 ? "unavailable" : "error");
      }
    } catch {
      setStatus("error");
    }
  }

  if (status === "ok") {
    return (
      <div className="qf qf-done" role="status">
        <CheckCircle2 size={40} aria-hidden="true" />
        <h3>{l.success}</h3>
        <p>{l.successNote}</p>
        <button type="button" className="qf-link" onClick={() => setStatus("idle")}>
          {l.again}
        </button>
      </div>
    );
  }

  const direct = status === "unavailable" || status === "error";
  return (
    <form className="qf" onSubmit={onSubmit} aria-busy={status === "sending"}>
      {showTitle && (
        <>
          <h3 className="qf-title">{l.title}</h3>
          <p className="qf-intro">{l.intro}</p>
        </>
      )}

      <div className="qf-row">
        <div className="qf-field">
          <label htmlFor={`${uid}-name`}>{l.name}</label>
          <input
            id={`${uid}-name`}
            name="name"
            type="text"
            autoComplete="name"
            required
            minLength={2}
            maxLength={80}
          />
        </div>
        <div className="qf-field">
          <label htmlFor={`${uid}-contact`}>{l.contact}</label>
          <input
            id={`${uid}-contact`}
            name="contact"
            type="text"
            autoComplete="email"
            required
            minLength={5}
            maxLength={120}
            placeholder={l.contactHint}
          />
        </div>
      </div>

      <fieldset className="qf-chips">
        <legend>{l.type}</legend>
        {l.types.map((v, i) => (
          <label key={v}>
            <input type="radio" name="type" value={v} defaultChecked={i === 0} />
            <span>{v}</span>
          </label>
        ))}
      </fieldset>

      <fieldset className="qf-chips">
        <legend>{l.deadline}</legend>
        {l.deadlines.map((v, i) => (
          <label key={v}>
            <input type="radio" name="deadline" value={v} defaultChecked={i === 0} />
            <span>{v}</span>
          </label>
        ))}
      </fieldset>

      <div className="qf-field">
        <label htmlFor={`${uid}-msg`}>{l.message}</label>
        <textarea
          id={`${uid}-msg`}
          name="message"
          rows={4}
          required
          minLength={10}
          maxLength={2000}
          placeholder={l.messagePlaceholder}
        />
      </div>

      {/* Campo trampa contra bots: las personas no lo ven */}
      <div className="qf-trap" aria-hidden="true">
        <input type="text" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <button className="qf-send" type="submit" disabled={status === "sending"}>
        <Send size={18} aria-hidden="true" />
        {status === "sending" ? l.sending : l.send}
      </button>
      <p className="qf-privacy">{l.privacy}</p>

      {direct && (
        <div className="qf-direct" role="alert">
          <p>{status === "unavailable" ? l.fallback : l.error}</p>
          <div>
            <a
              href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(draft)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle size={16} aria-hidden="true" /> WhatsApp
            </a>
            <a
              href={`mailto:${email}?subject=${encodeURIComponent(l.mailSubject)}&body=${encodeURIComponent(draft)}`}
            >
              <Mail size={16} aria-hidden="true" /> {l.mailLabel}
            </a>
          </div>
        </div>
      )}
    </form>
  );
}
