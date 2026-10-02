import { useState, type ReactNode } from "react";
import { useT } from "~/i18n";
import type { OptionalConsentId } from "./config";
import { useConsent } from "./ConsentProvider";
import styles from "./ConsentGate.module.css";

/**
 * Zwei-Klick-Lösung für externe Inhalte (Videos, Karten …):
 * Der Inhalt wird erst gerendert, wenn die Kategorie erlaubt ist ODER
 * der Besucher ihn einmalig aktiv lädt.
 *
 *   <ConsentGate category="media" provider="Vimeo">
 *     <iframe src="https://player.vimeo.com/video/…" />
 *   </ConsentGate>
 */
export function ConsentGate({
  category,
  provider,
  children,
}: {
  category: OptionalConsentId;
  provider: string;
  children: ReactNode;
}) {
  const t = useT();
  const consent = useConsent();
  const [loadOnce, setLoadOnce] = useState(false);

  if (consent.has(category) || loadOnce) return <>{children}</>;

  return (
    <div className={styles.gate}>
      <p className={styles.provider}>{provider}</p>
      <p className={styles.text}>{t.consent.gateText}</p>
      <div className={styles.actions}>
        <button type="button" className={styles.button} onClick={() => setLoadOnce(true)}>
          {t.consent.gateButton}
        </button>
        <button
          type="button"
          className={styles.textButton}
          onClick={() => consent.save({ ...consent.choices, [category]: true })}
        >
          {t.consent.gateAlways}
        </button>
      </div>
    </div>
  );
}
