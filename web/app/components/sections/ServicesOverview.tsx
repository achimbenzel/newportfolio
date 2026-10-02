import type { CSSProperties } from "react";
import { Link } from "react-router";
import { Icon } from "~/components/ui/Icon";
import { Section } from "~/components/ui/Section";
import { serviceSlugs } from "~/config/services";
import { useLocale, useT } from "~/i18n";
import { paths } from "~/lib/paths";
import styles from "./ServicesOverview.module.css";

export function ServicesOverview() {
  const t = useT();
  const locale = useLocale();
  return (
    <Section id="services" eyebrow={t.home.servicesEyebrow} title={t.home.servicesTitle}>
      <ul className={styles.grid} role="list">
        {serviceSlugs.map((slug, index) => (
          <li key={slug} data-reveal style={{ "--i": index } as CSSProperties}>
            <Link to={paths.service(locale, slug)} className={styles.card}>
              <span className={styles.index}>0{index + 1}</span>
              <h3 className={styles.title}>{t.services[slug].title}</h3>
              <p className={styles.teaser}>{t.services[slug].teaser}</p>
              <Icon name="arrowUpRight" size={20} className={styles.arrow} />
            </Link>
          </li>
        ))}
      </ul>
    </Section>
  );
}
