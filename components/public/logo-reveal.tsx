"use client";

import { useEffect, useState } from "react";

// Trazo de public/brand/criden-logo.svg, separado por piezas para animarlas.
const C_AZUL =
  "M197,512.5 H297 L271,552 H213.5 L162.5,619.5 Q161,621.5 162.5,623.5 L213.5,690.5 H302 L276,730.5 H197 Q192,730.5 189,726.5 L118.5,631 Q112.5,621.5 118.5,612 L189,516.5 Q192,512.5 197,512.5 Z";
const D_NAVY =
  "M409,730.5 H309 L334,691 H392.5 L443.5,623.5 Q445,621.5 443.5,619.5 L392.5,552.5 H304 L329,512.5 H409 Q414,512.5 417,516.5 L487.5,612 Q493.5,621.5 487.5,631 L417,726.5 Q414,730.5 409,730.5 Z";
const PIECES = [
  ["c", C_AZUL],
  ["d", D_NAVY],
] as const;
const MARK_BOX = "110 510 386 223";
const WORD_BOX = "538 572 599 96";
// Capas que dan grosor a cada pieza mientras gira; la 0 es la cara frontal.
const LAYERS = [5, 4, 3, 2, 1, 0];

// Solo se anima al cargar o actualizar la página, no al navegar entre páginas.
let played = false;

const nth = (n: number) => ({ "--n": n }) as React.CSSProperties;

// `replay` lo anima aunque ya se haya mostrado y lo retrasa medio segundo: es el logo del telón
// del cambio de estilo, que espera a que el telón cubra la pantalla.
export function LogoReveal({
  animate = true,
  replay = false,
}: {
  animate?: boolean;
  replay?: boolean;
}) {
  const [run] = useState(() => animate && (replay || !played));
  useEffect(() => {
    played = true;
  }, []);

  return (
    <span
      className={`logo${run ? " logo-reveal" : ""}${run && replay ? " logo-late" : ""}`}
      aria-hidden="true"
    >
      <span className="logo-mark">
        <span className="logo-turn">
          {PIECES.map(([id, d]) => (
            <span key={id} className={`logo-piece logo-${id}`}>
              {LAYERS.map((i) => (
                <svg
                  key={i}
                  viewBox={MARK_BOX}
                  className={i ? "logo-side" : undefined}
                  style={{ "--i": i } as React.CSSProperties}
                >
                  <path d={d} />
                </svg>
              ))}
            </span>
          ))}
          <svg viewBox={MARK_BOX} className="logo-detail">
            <g className="logo-lines">
              <rect x="212" y="601" width="49" height="15" style={nth(0)} />
              <rect x="212" y="625" width="75" height="15" style={nth(1)} />
            </g>
            <g className="logo-bars">
              <rect x="331" y="658" width="17" height="22" style={nth(0)} />
              <rect x="357" y="636" width="17" height="44" style={nth(1)} />
              <path d="M383,610 H401 V666 L391,680 H383 Z" style={nth(2)} />
            </g>
          </svg>
        </span>
      </span>
      <svg viewBox={WORD_BOX} className="logo-word">
        <path d="M615,572 H556 Q538,572 538,590 V650 Q538,668 556,668 H615 V652 H559 Q553,652 553,646 V593 Q553,587 559,587 H615 Z" />
        <path
          fillRule="evenodd"
          d="M654,572 H718 Q736,572 736,590 V617 Q736,631 720,634 L736,668 H718.5 L701.5,634 H670 V668 H654 Z M670,587 H713 Q720,587 720,594 V611 Q720,618 713,618 H670 Z"
        />
        <rect x="772" y="572" width="16" height="96" />
        <path
          fillRule="evenodd"
          d="M827,572 H889 Q909,572 909,592 V647 Q909,668 889,668 H827 Z M843,587 H885 Q893,587 893,595 V645 Q893,652 885,652 H843 Z"
        />
        <path d="M946,572 H1020 V587 H962 V612 H1013 V627 H962 V652 H1020 V668 H946 Z" />
        <path d="M1058,572 H1076 L1121,638 V572 H1137 V668 H1121 L1074,602 V668 H1058 Z" />
      </svg>
    </span>
  );
}
