import type { ReactNode } from "react";
import { Container } from "./Container";
import { Eyebrow } from "./Eyebrow";
import styles from "./Section.module.css";

/**
 * Standard-Sektion einer Seite: optionale Überzeile + H2 + Inhalt.
 * Überschriften-Hierarchie: Jede Seite hat genau EINE H1 (im Seitenkopf/Hero),
 * Sektionen nutzen H2.
 */
export function Section({
  eyebrow,
  title,
  actions,
  footer,
  children,
  id,
  className,
}: {
  eyebrow?: string;
  title?: ReactNode;
  /** rechts neben der Überschrift */
  actions?: ReactNode;
  /** zentriert unter dem Inhalt (z. B. „Alle Projekte“) */
  footer?: ReactNode;
  children: ReactNode;
  id?: string;
  className?: string;
}) {
  const headingId = id ? `${id}-title` : undefined;
  return (
    <section
      id={id}
      aria-labelledby={title ? headingId : undefined}
      className={[styles.section, className].filter(Boolean).join(" ")}
    >
      <Container>
        {(eyebrow || title) && (
          <header className={styles.header} data-reveal>
            <div>
              {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
              {title && (
                <h2 id={headingId} className={styles.title}>
                  {title}
                </h2>
              )}
            </div>
            {actions && <div className={styles.actions}>{actions}</div>}
          </header>
        )}
        {children}
        {footer && <div className={styles.footer}>{footer}</div>}
      </Container>
    </section>
  );
}
