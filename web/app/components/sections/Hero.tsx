import { Container } from "~/components/ui/Container";
import { AskWidget } from "~/features/ask";
import { useT } from "~/i18n";
import styles from "./Hero.module.css";

/**
 * Startseiten-Hero: bewusst reduziert – nur das „Frag Achim“-Chatfenster
 * auf einfarbigem Hintergrund. Die H1 ist unsichtbar (Screenreader & SEO).
 */
export function Hero() {
  const t = useT();
  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <h1 id="hero-title" className="sr-only">
        {t.hero.title}
      </h1>
      <Container className={styles.inner}>
        <AskWidget />
      </Container>
    </section>
  );
}
