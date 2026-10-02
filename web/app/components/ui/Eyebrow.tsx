import type { ReactNode } from "react";
import styles from "./Eyebrow.module.css";

/** Kleine Überzeile in Mono-Schrift über Überschriften. */
export function Eyebrow({ children, as: Tag = "p" }: { children: ReactNode; as?: "p" | "span" }) {
  return <Tag className={styles.eyebrow}>{children}</Tag>;
}
