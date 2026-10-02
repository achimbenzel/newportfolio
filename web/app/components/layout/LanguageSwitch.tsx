import { Link, useLocation } from "react-router";
import { localeMeta, locales, useLocale, useT } from "~/i18n";
import { switchLocale } from "~/lib/paths";
import styles from "./LanguageSwitch.module.css";

/** DE | EN – wechselt auf dieselbe Seite in der anderen Sprache. */
export function LanguageSwitch({ onNavigate }: { onNavigate?: () => void }) {
  const locale = useLocale();
  const t = useT();
  const { pathname } = useLocation();

  return (
    <div
      className={styles.switch}
      role="group"
      aria-label={t.a11y.languageSwitch}
      data-active={locale}
    >
      <span className={styles.indicator} aria-hidden="true" />
      {locales.map((l) => (
        <Link
          key={l}
          to={switchLocale(pathname, l)}
          lang={l}
          hrefLang={l}
          aria-label={localeMeta[l].name}
          aria-current={l === locale ? "true" : undefined}
          className={styles.option}
          onClick={onNavigate}
        >
          {localeMeta[l].label}
        </Link>
      ))}
    </div>
  );
}
