import type { ReactNode } from "react";
import { Link } from "react-router";
import { Container } from "~/components/ui/Container";
import { Eyebrow } from "~/components/ui/Eyebrow";
import { Icon } from "~/components/ui/Icon";
import styles from "./PageHeader.module.css";

/** Seitenkopf aller Unterseiten – enthält die (einzige) H1 der Seite. */
export function PageHeader({
  eyebrow,
  title,
  intro,
  back,
  children,
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
  back?: { to: string; label: string };
  children?: ReactNode;
}) {
  return (
    <header className={styles.header}>
      <Container>
        {back && (
          <Link to={back.to} className={styles.back}>
            <Icon name="arrowLeft" size={14} />
            {back.label}
          </Link>
        )}
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        <h1 className={styles.title}>{title}</h1>
        {intro && <p className={styles.intro}>{intro}</p>}
        {children && <div className={styles.extra}>{children}</div>}
      </Container>
    </header>
  );
}
