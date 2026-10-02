import { Container } from "~/components/ui/Container";
import { useT } from "~/i18n";
import styles from "./ComingSoon.module.css";

/** Platzhalter-Hinweis für Seiten, deren Inhalt noch folgt (Prototyp). */
export function ComingSoon({ text }: { text?: string }) {
  const t = useT();
  return (
    <Container>
      <div className={styles.box}>
        <p className={styles.label}>{t.placeholder.comingSoon}</p>
        <p className={styles.text}>{text ?? t.placeholder.note}</p>
      </div>
    </Container>
  );
}
