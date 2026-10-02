import { useId, useState } from "react";
import { Link } from "react-router";
import { pick } from "~/lib/l10n";
import { useLocale, useT } from "~/i18n";
import { paths } from "~/lib/paths";
import { consentCategories, type ConsentChoices } from "./config";
import { useConsent } from "./ConsentProvider";
import styles from "./CookieBanner.module.css";

/**
 * Cookie-/Consent-Banner nach DSK-Vorgaben:
 * - „Ablehnen“ und „Akzeptieren“ gleichwertig auf der ersten Ebene
 * - keine vorausgewählten Häkchen
 * - jederzeit über „Cookie-Einstellungen“ im Footer wieder erreichbar
 */
export function CookieBanner() {
  const consent = useConsent();
  if (!consent.bannerOpen) return null;
  // key: beim Öffnen über den Footer-Link frisch mit der Einstellungsansicht starten
  return (
    <BannerPanel
      key={String(consent.settingsRequested)}
      startInSettings={consent.settingsRequested}
    />
  );
}

function BannerPanel({ startInSettings }: { startInSettings: boolean }) {
  const t = useT();
  const locale = useLocale();
  const consent = useConsent();
  const [view, setView] = useState<"main" | "settings">(startInSettings ? "settings" : "main");
  const [draft, setDraft] = useState<ConsentChoices>(consent.choices);
  const titleId = useId();
  const textId = useId();

  return (
    <section
      className={styles.banner}
      role="dialog"
      aria-modal="false"
      aria-labelledby={titleId}
      aria-describedby={textId}
      data-view={view}
    >
      <h2
        id={titleId}
        className={styles.title}
        tabIndex={-1}
        ref={(node) => {
          if (node && startInSettings) node.focus();
        }}
      >
        {t.consent.title}
      </h2>

      {view === "main" ? (
        <>
          <p id={textId} className={styles.text}>
            {t.consent.text}{" "}
            <Link to={paths.privacy(locale)} className={styles.inlineLink}>
              {t.consent.privacyLink}
            </Link>
          </p>
          <div className={styles.actions}>
            <button type="button" className={styles.button} onClick={consent.rejectAll}>
              {t.consent.rejectAll}
            </button>
            <button type="button" className={styles.button} onClick={consent.acceptAll}>
              {t.consent.acceptAll}
            </button>
          </div>
          <button type="button" className={styles.textButton} onClick={() => setView("settings")}>
            {t.consent.settings}
          </button>
        </>
      ) : (
        <>
          <ul id={textId} className={styles.categories} role="list">
            {consentCategories.map((category) => {
              const labelId = `${titleId}-${category.id}`;
              return (
                <li key={category.id} className={styles.category}>
                  <div>
                    <p id={labelId} className={styles.categoryLabel}>
                      {pick(category.label, locale)}
                    </p>
                    <p className={styles.categoryText}>{pick(category.description, locale)}</p>
                  </div>
                  {category.required ? (
                    <span className={styles.alwaysOn}>{t.consent.alwaysOn}</span>
                  ) : (
                    <button
                      type="button"
                      role="switch"
                      aria-checked={draft[category.id]}
                      aria-labelledby={labelId}
                      className={styles.switch}
                      onClick={() => setDraft((d) => ({ ...d, [category.id]: !d[category.id] }))}
                    >
                      <span className={styles.switchThumb} />
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
          <div className={styles.actions}>
            <button type="button" className={styles.button} onClick={() => consent.save(draft)}>
              {t.consent.save}
            </button>
            <button type="button" className={styles.button} onClick={consent.acceptAll}>
              {t.consent.acceptAll}
            </button>
          </div>
          {!startInSettings && (
            <button type="button" className={styles.textButton} onClick={() => setView("main")}>
              {t.consent.back}
            </button>
          )}
        </>
      )}
    </section>
  );
}
