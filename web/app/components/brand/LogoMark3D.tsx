import { useId, type SVGProps } from "react";
import { LOGO_MARK_PATH } from "./Logo";

/**
 * Bildmarke als kleines „3D-Objekt“: Verlauf + gestapelte Kopien als Tiefe.
 * Reines SVG – wird z. B. als Avatar im „Frag Achim“-Chat verwendet.
 * `depth` = Anzahl der Tiefen-Ebenen (0 = flach).
 */
export function LogoMark3D({
  depth = 8,
  title,
  ...props
}: { depth?: number; title?: string } & SVGProps<SVGSVGElement>) {
  // eindeutige IDs pro Instanz (für Verläufe), nur erlaubte Zeichen
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const shape = `${id}-shape`;
  const face = `${id}-face`;
  const side = `${id}-side`;
  const shine = `${id}-shine`;

  return (
    <svg
      viewBox="0 0 1180 1200"
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      {...props}
    >
      <defs>
        <path id={shape} d={LOGO_MARK_PATH} />
        <linearGradient id={face} x1="0.1" y1="0" x2="0.9" y2="1">
          <stop offset="0" stopColor="#9be0ff" />
          <stop offset="0.3" stopColor="#2fb4c9" />
          <stop offset="0.7" stopColor="#007588" />
          <stop offset="1" stopColor="#003f4a" />
        </linearGradient>
        <linearGradient id={side} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#0b3f4b" />
          <stop offset="1" stopColor="#021317" />
        </linearGradient>
        <linearGradient id={shine} x1="0" y1="0" x2="0.8" y2="0.8">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.7" />
          <stop offset="0.45" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>
      {Array.from({ length: depth }, (_, i) => {
        const step = depth - i;
        return (
          <use
            key={i}
            href={`#${shape}`}
            fill={`url(#${side})`}
            transform={`translate(${step * 12} ${step * 16})`}
          />
        );
      })}
      <use href={`#${shape}`} fill={`url(#${face})`} />
      <use href={`#${shape}`} fill={`url(#${shine})`} opacity="0.35" />
      <use href={`#${shape}`} fill="none" stroke="#ffffff" strokeOpacity="0.35" strokeWidth="6" />
    </svg>
  );
}
