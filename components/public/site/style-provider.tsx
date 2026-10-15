"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { LogoReveal } from "@/components/public/logo-reveal";
import { DEFAULT_STYLE, STYLE_IDS, STYLE_KEY, isStyle, type StyleId } from "@/lib/styles";

type Labels = {
  button: string;
  title: string;
  text: string;
  close: string;
  current: string;
  options: Record<string, { name: string; text: string }>;
};

type Ctx = {
  ready: boolean;
  style: StyleId;
  setStyle: (id: StyleId) => void;
  openPicker: () => void;
  labels: Labels;
};
const StyleCtx = createContext<Ctx | null>(null);

export function useStyle() {
  const c = useContext(StyleCtx);
  if (!c) throw new Error("useStyle debe usarse dentro de StyleProvider");
  return c;
}

const SWATCH: Record<StyleId, string> = { templo: "t1", ejecutivo: "t2", noche: "t3" };

// Guarda el estilo elegido, lo escribe en <html data-style> y ofrece la ventana para cambiarlo.
export function StyleProvider({ labels, children }: { labels: Labels; children: React.ReactNode }) {
  const [style, setStyleState] = useState<StyleId>(DEFAULT_STYLE);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<"" | "in" | "out">("");
  const lastFocus = useRef<HTMLElement | null>(null);

  // El script de <head> ya decidió el estilo; aquí solo lo leemos.
  useEffect(() => {
    const s = document.documentElement.dataset.style;
    if (isStyle(s)) setStyleState(s);
    setReady(true);
  }, []);

  const apply = useCallback((id: StyleId) => {
    document.documentElement.dataset.style = id;
    try {
      localStorage.setItem(STYLE_KEY, id);
    } catch {}
    setStyleState(id);
    window.scrollTo(0, 0);
    setTimeout(() => window.dispatchEvent(new Event("resize")), 30);
  }, []);

  const setStyle = useCallback(
    (id: StyleId) => {
      if (id === style) return;
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) return apply(id);
      // El telón sube, el logo se anima entero sobre él y recién entonces se abre al nuevo estilo.
      setPhase("in");
      setTimeout(() => apply(id), 560);
      setTimeout(() => {
        setPhase("out");
        setTimeout(() => setPhase(""), 560);
      }, 2000);
    },
    [style, apply],
  );

  const openPicker = useCallback(() => {
    lastFocus.current = document.activeElement as HTMLElement | null;
    setOpen(true);
  }, []);
  const closePicker = useCallback(() => {
    setOpen(false);
    lastFocus.current?.focus?.();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        closePicker();
      }
    };
    document.addEventListener("keydown", onKey, true);
    return () => document.removeEventListener("keydown", onKey, true);
  }, [open, closePicker]);

  return (
    <StyleCtx.Provider value={{ ready, style, setStyle, openPicker, labels }}>
      {children}
      {open && (
        <div className="pk-back" onClick={(e) => e.target === e.currentTarget && closePicker()}>
          <div className="pk" role="dialog" aria-modal="true" aria-labelledby="pk-title">
            <h2 id="pk-title">{labels.title}</h2>
            <p>{labels.text}</p>
            <div className="pk-opts">
              {STYLE_IDS.map((id) => (
                <button
                  key={id}
                  type="button"
                  className="pk-opt"
                  aria-pressed={style === id}
                  autoFocus={style === id}
                  onClick={() => {
                    closePicker();
                    setStyle(id);
                  }}
                >
                  <div className={`pk-sw ${SWATCH[id]}`} />
                  <div className="pk-tx">
                    <b>
                      {labels.options[id]?.name ?? id}
                      {style === id && <i>{labels.current}</i>}
                    </b>
                    <span>{labels.options[id]?.text}</span>
                  </div>
                </button>
              ))}
            </div>
            <button type="button" className="pk-close" onClick={closePicker}>
              {labels.close}
            </button>
          </div>
        </div>
      )}
      <div className={`curtain ${phase}`} aria-hidden="true">
        {phase && <LogoReveal replay />}
      </div>
    </StyleCtx.Provider>
  );
}

export function StyleButton({ className = "xv-style" }: { className?: string }) {
  const { openPicker, labels } = useStyle();
  return (
    <button type="button" className={className} onClick={openPicker} aria-haspopup="dialog">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="13.5" cy="6.5" r="2.5" />
        <circle cx="17.5" cy="10.5" r="2.5" />
        <circle cx="8.5" cy="7.5" r="2.5" />
        <circle cx="6.5" cy="12.5" r="2.5" />
        <path d="M12 22a10 10 0 110-20c5.5 0 10 3.6 10 8 0 3-2.5 4-4.5 4H15a2 2 0 00-1.5 3.3c.6.8.5 2.7-1.5 4.7z" />
      </svg>
      <span>{labels.button}</span>
    </button>
  );
}
