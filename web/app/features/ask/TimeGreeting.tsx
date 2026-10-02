import { useLocale } from "~/i18n";
import { useTimeGreeting } from "./greeting";
import styles from "./TimeGreeting.module.css";

/**
 * „Guten Abend – Was möchtest du über Achim wissen?“ über dem Chatfenster.
 * `hidden`: blendet die Zeile weich aus (sobald ein Gespräch läuft).
 */
export function TimeGreeting({ hidden }: { hidden: boolean }) {
  const locale = useLocale();
  const greeting = useTimeGreeting(locale);
  return (
    <div className={styles.greeting} data-hidden={hidden || undefined} inert={hidden}>
      <div className={styles.inner}>
        <p className={styles.content} data-ready={greeting ? true : undefined}>
          <span className={styles.title}>{greeting?.title ?? " "}</span>
          <span className={styles.prompt}>{greeting?.prompt ?? " "}</span>
        </p>
      </div>
    </div>
  );
}
