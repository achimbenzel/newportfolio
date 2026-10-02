import { ButtonLink } from "~/components/ui/Button";
import { Container } from "~/components/ui/Container";
import { useLocale, useT } from "~/i18n";
import { paths } from "~/lib/paths";
import { PageHeader } from "./PageHeader";
import styles from "./NotFound.module.css";

/** 404 innerhalb des Seitenlayouts (mit Header & Footer). */
export function NotFound() {
  const t = useT();
  const locale = useLocale();
  return (
    <>
      <PageHeader eyebrow={t.notFound.eyebrow} title={t.notFound.title} intro={t.notFound.text} />
      <Container>
        <div className={styles.actions}>
          <ButtonLink to={paths.home(locale)} variant="primary">
            {t.notFound.home}
          </ButtonLink>
          <ButtonLink to={paths.work(locale)}>{t.nav.work}</ButtonLink>
          <ButtonLink to={paths.contact(locale)}>{t.nav.contact}</ButtonLink>
        </div>
      </Container>
    </>
  );
}
