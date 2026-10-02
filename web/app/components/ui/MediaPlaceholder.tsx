import type { CSSProperties } from "react";
import { LogoMark } from "~/components/brand/Logo";
import styles from "./MediaPlaceholder.module.css";

/**
 * Generierte Fläche, solange kein Bild vorhanden ist (Prototyp / fehlendes Cover).
 * Nutzt die Projektfarbe als Basis – rein dekorativ.
 */
export function MediaPlaceholder({ color, label }: { color?: string | null; label?: string }) {
  return (
    <div
      className={styles.placeholder}
      style={{ "--_color": color ?? "#1d2b33" } as CSSProperties}
      aria-hidden="true"
    >
      <LogoMark className={styles.mark} />
      {label && <span className={styles.label}>{label}</span>}
    </div>
  );
}
