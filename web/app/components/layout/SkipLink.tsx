import { useT } from "~/i18n";
import styles from "./SkipLink.module.css";

/** Erster fokussierbarer Link – springt per Tastatur direkt zum Inhalt. */
export function SkipLink() {
  const t = useT();
  return (
    <a href="#main" className={styles.skip}>
      {t.a11y.skipToContent}
    </a>
  );
}
