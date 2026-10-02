import { Link, useLocation } from "react-router";
import { localeMeta, locales, useLocale, useT } from "~/i18n";
import { switchLocale } from "~/lib/paths";
import styles from "./LanguageSwitch.module.css";

/**
 * Sprachwechsel wie auf der alten Seite: ein kleiner Button mit der ANDEREN Sprache
 * („EN“ auf deutschen Seiten) – wechselt auf dieselbe Seite in der anderen Sprache.
 */
export function LanguageSwitch({
  onNavigate,
  className,
}: {
  onNavigate?: () => void;
  className?: string;
}) {
  const locale = useLocale();
  const t = useT();
  const { pathname } = useLocation();
  const other = locales.find((l) => l !== locale) ?? locale;

  return (
    <Link
      to={switchLocale(pathname, other)}
      lang={other}
      hrefLang={other}
      aria-label={`${t.a11y.languageSwitch}: ${localeMeta[other].name}`}
      title={localeMeta[other].name}
      className={[styles.switch, className].filter(Boolean).join(" ")}
      onClick={onNavigate}
    >
      {localeMeta[other].label}
    </Link>
  );
}
