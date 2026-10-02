import { Link } from "react-router";
import { Logo } from "~/components/brand/Logo";
import { ButtonLink } from "~/components/ui/Button";
import { Container } from "~/components/ui/Container";
import { serviceSlugs } from "~/config/services";
import { site } from "~/config/site";
import { useConsent } from "~/features/consent";
import { useLocale, useT } from "~/i18n";
import { paths } from "~/lib/paths";
import styles from "./Footer.module.css";

export function Footer() {
  const t = useT();
  const locale = useLocale();
  const consent = useConsent();

  return (
    <footer className={styles.footer}>
      <Container>
        <div className={styles.cta} data-reveal>
          <p className={styles.ctaTitle}>{t.footer.ctaTitle}</p>
          <div className={styles.ctaActions}>
            <ButtonLink to={paths.contact(locale)} variant="primary">
              {t.footer.ctaButton}
            </ButtonLink>
            <a href={`mailto:${site.email}`} className={styles.mail}>
              {site.email}
            </a>
          </div>
        </div>

        <div className={styles.grid}>
          <Link to={paths.home(locale)} className={styles.brand} aria-label={t.a11y.homeLink}>
            <Logo className={styles.logo} title="" />
          </Link>

          <nav aria-label={t.a11y.footerNav} className={styles.columns}>
            <div>
              <p className={styles.colTitle}>{t.nav.services}</p>
              <ul role="list" className={styles.list}>
                {serviceSlugs.map((slug) => (
                  <li key={slug}>
                    <Link to={paths.service(locale, slug)}>{t.services[slug].title}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className={styles.colTitle}>{t.footer.pages}</p>
              <ul role="list" className={styles.list}>
                <li>
                  <Link to={paths.work(locale)}>{t.nav.work}</Link>
                </li>
                <li>
                  <Link to={paths.shop(locale)}>{t.nav.shop}</Link>
                </li>
                <li>
                  <Link to={paths.about(locale)}>{t.nav.about}</Link>
                </li>
                <li>
                  <Link to={paths.contact(locale)}>{t.nav.contact}</Link>
                </li>
              </ul>
            </div>
            <div>
              <p className={styles.colTitle}>{t.footer.legal}</p>
              <ul role="list" className={styles.list}>
                <li>
                  <Link to={paths.imprint(locale)}>{t.footer.imprint}</Link>
                </li>
                <li>
                  <Link to={paths.privacy(locale)}>{t.footer.privacy}</Link>
                </li>
                <li>
                  <button
                    type="button"
                    className={styles.linkButton}
                    onClick={consent.openSettings}
                  >
                    {t.footer.cookieSettings}
                  </button>
                </li>
              </ul>
            </div>
          </nav>
        </div>

        <div className={styles.bottom}>
          <p>
            © <span suppressHydrationWarning>{new Date().getFullYear()}</span> {site.name}.{" "}
            {t.footer.rights}
          </p>
        </div>
      </Container>
    </footer>
  );
}
