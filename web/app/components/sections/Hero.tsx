import { Container } from "~/components/ui/Container";
import type { AskProject } from "~/content/types";
import { AskWidget } from "~/features/ask";
import { useT } from "~/i18n";
import styles from "./Hero.module.css";

/**
 * Startseiten-Hero: bewusst reduziert – nur das „Frag Achim“-Chatfenster
 * auf einfarbigem Hintergrund. Die H1 ist unsichtbar (Screenreader & SEO).
 */
/** `projects`: Projektwissen für den Chat (kommt vom Loader der Startseite). */
export function Hero({ projects }: { projects?: AskProject[] }) {
  const t = useT();
  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <h1 id="hero-title" className="sr-only">
        {t.hero.title}
      </h1>
      <Container className={styles.inner}>
        <AskWidget projects={projects} />
      </Container>
    </section>
  );
}
