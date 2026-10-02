import {
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { Link, NavLink, useLocation } from "react-router";
import { Logo } from "~/components/brand/Logo";
import { Icon } from "~/components/ui/Icon";
import { site } from "~/config/site";
import { serviceSlugs } from "~/config/services";
import { useLocale, useT } from "~/i18n";
import { paths } from "~/lib/paths";
import { LanguageSwitch } from "./LanguageSwitch";
import styles from "./Header.module.css";

type Panel = "services" | "menu";

/* Scroll-Zustand als External Store – kein setState im Effect nötig */
function subscribeScroll(callback: () => void) {
  window.addEventListener("scroll", callback, { passive: true });
  return () => window.removeEventListener("scroll", callback);
}
const useScrolled = () =>
  useSyncExternalStore(
    subscribeScroll,
    () => window.scrollY > 16,
    () => false,
  );

/**
 * Schwebende Header-„Insel“.
 * - Desktop: Links in einer Zeile, „Leistungen“ klappt die Insel weich nach unten auf.
 * - Mobil:   Menü-Button, die Insel wächst zum Vollmenü mit gestaffelten Links.
 * Die Animation ist reines CSS (grid-template-rows 0fr → 1fr), siehe Header.module.css.
 */
export function Header() {
  const t = useT();
  const locale = useLocale();
  const { pathname } = useLocation();
  const scrolled = useScrolled();
  const servicesId = useId();
  const menuId = useId();
  const islandRef = useRef<HTMLDivElement>(null);
  const hoverTimer = useRef<number | undefined>(undefined);

  // Panel merkt sich, auf welcher Seite es geöffnet wurde → schließt automatisch bei Navigation.
  const [state, setState] = useState<{ panel: Panel | null; path: string }>({
    panel: null,
    path: pathname,
  });
  const panel = state.path === pathname ? state.panel : null;

  const open = (next: Panel) => setState({ panel: next, path: pathname });
  const close = () => setState((s) => ({ ...s, panel: null }));
  const toggle = (next: Panel) => (panel === next ? close() : open(next));

  // Hover-Intent (nur Maus): kurz verzögert öffnen/schließen, damit nichts flackert
  const hoverOpen = (event: ReactPointerEvent) => {
    if (event.pointerType !== "mouse") return;
    window.clearTimeout(hoverTimer.current);
    hoverTimer.current = window.setTimeout(() => open("services"), 80);
  };
  const hoverClose = (event: ReactPointerEvent) => {
    if (event.pointerType !== "mouse" || panel !== "services") return;
    window.clearTimeout(hoverTimer.current);
    hoverTimer.current = window.setTimeout(close, 220);
  };
  const cancelHoverClose = () => window.clearTimeout(hoverTimer.current);

  // Escape & Klick außerhalb schließen das Panel
  useEffect(() => {
    if (!panel) return;
    const onKey = (event: KeyboardEvent) =>
      event.key === "Escape" && setState((s) => ({ ...s, panel: null }));
    const onPointer = (event: PointerEvent) => {
      if (!islandRef.current?.contains(event.target as Node))
        setState((s) => ({ ...s, panel: null }));
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [panel]);

  useEffect(() => () => window.clearTimeout(hoverTimer.current), []);

  const pageLinks = [
    { to: paths.work(locale), label: t.nav.work },
    { to: paths.shop(locale), label: t.nav.shop },
    { to: paths.about(locale), label: t.nav.about },
    { to: paths.contact(locale), label: t.nav.contact },
  ];

  const navClass = ({ isActive }: { isActive: boolean }) =>
    [styles.navItem, isActive && styles.active].filter(Boolean).join(" ");

  return (
    <header className={styles.header}>
      <div
        ref={islandRef}
        className={styles.island}
        data-open={panel ?? undefined}
        data-scrolled={scrolled || undefined}
        onPointerLeave={hoverClose}
        onPointerEnter={cancelHoverClose}
      >
        <div className={styles.bar}>
          <Link to={paths.home(locale)} className={styles.logo} aria-label={t.a11y.homeLink}>
            <Logo className={styles.logoSvg} title="" />
          </Link>

          <nav aria-label={t.a11y.mainNav} className={styles.nav}>
            <ul className={styles.navList} role="list">
              <li>
                <button
                  type="button"
                  className={styles.navItem}
                  aria-expanded={panel === "services"}
                  aria-controls={servicesId}
                  onClick={() => toggle("services")}
                  onPointerEnter={hoverOpen}
                >
                  {t.nav.services}
                  <Icon name="chevronDown" size={14} className={styles.chevron} />
                </button>
              </li>
              {pageLinks.map((link) => (
                <li key={link.to}>
                  <NavLink to={link.to} className={navClass}>
                    {link.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className={styles.tools}>
            <LanguageSwitch />
            <button
              type="button"
              className={styles.menuButton}
              aria-expanded={panel === "menu"}
              aria-controls={menuId}
              aria-label={panel === "menu" ? t.a11y.closeMenu : t.a11y.openMenu}
              onClick={() => toggle("menu")}
            >
              <span className={styles.menuIcon} aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Aufklappbereich – Höhe animiert per CSS */}
        <div className={styles.expand} inert={!panel}>
          <div className={styles.expandInner}>
            {/* Desktop: Leistungen */}
            <ul id={servicesId} className={styles.services} role="list">
              {serviceSlugs.map((slug, index) => (
                <li key={slug} className={styles.stagger} style={{ "--i": index } as CSSProperties}>
                  <Link to={paths.service(locale, slug)} className={styles.serviceCard}>
                    <span className={styles.serviceIndex}>0{index + 1}</span>
                    <span className={styles.serviceTitle}>{t.services[slug].title}</span>
                    <span className={styles.serviceTeaser}>{t.services[slug].teaser}</span>
                    <Icon name="arrowUpRight" size={16} className={styles.serviceArrow} />
                  </Link>
                </li>
              ))}
            </ul>

            {/* Mobil: komplettes Menü */}
            <nav id={menuId} className={styles.menu} aria-label={t.a11y.mainNav}>
              <p
                className={`${styles.menuLabel} ${styles.stagger}`}
                style={{ "--i": 0 } as CSSProperties}
              >
                {t.nav.services}
              </p>
              <ul className={styles.menuServices} role="list">
                {serviceSlugs.map((slug, index) => (
                  <li
                    key={slug}
                    className={styles.stagger}
                    style={{ "--i": index + 1 } as CSSProperties}
                  >
                    <Link to={paths.service(locale, slug)} className={styles.menuServiceLink}>
                      {t.services[slug].title}
                      <Icon name="arrowUpRight" size={16} />
                    </Link>
                  </li>
                ))}
              </ul>
              <ul className={styles.menuPages} role="list">
                {pageLinks.map((link, index) => (
                  <li
                    key={link.to}
                    className={styles.stagger}
                    style={{ "--i": index + 4 } as CSSProperties}
                  >
                    <NavLink to={link.to} className={styles.menuLink}>
                      {link.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
              <a
                href={`mailto:${site.email}`}
                className={`${styles.menuMail} ${styles.stagger}`}
                style={{ "--i": 8 } as CSSProperties}
              >
                <Icon name="mail" size={16} />
                {site.email}
              </a>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}
