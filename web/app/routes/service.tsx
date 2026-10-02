import type { CSSProperties } from "react";
import { data } from "react-router";
import { PageHeader } from "~/components/sections/PageHeader";
import { ButtonLink } from "~/components/ui/Button";
import { Section } from "~/components/ui/Section";
import { isServiceSlug } from "~/config/services";
import { getService } from "~/content/services.server";
import { getDictionary, useLocale, useT } from "~/i18n";
import { paths } from "~/lib/paths";
import { excerpt, lastSegment, localeOr, requireLocale } from "~/lib/route";
import { pageMeta } from "~/lib/seo";
import type { Route } from "./+types/service";
import styles from "./service.module.css";

/** Eine Datei für alle Leistungsseiten (/branding, /motion-design, /music-visuals). */
export async function loader({ params, request }: Route.LoaderArgs) {
  const locale = requireLocale(params.lang);
  const slug = lastSegment(request.url);
  if (!isServiceSlug(slug)) throw data(null, { status: 404 });
  return { service: await getService(locale, slug) };
}

export function meta({ params, loaderData }: Route.MetaArgs) {
  const locale = localeOr(params.lang);
  if (!loaderData) return [];
  const { service } = loaderData;
  return pageMeta({
    locale,
    path: `/${service.slug}`,
    title: service.title,
    description: excerpt(service.intro),
  });
}

export default function ServicePage({ loaderData }: Route.ComponentProps) {
  const { service } = loaderData;
  const t = useT();
  const locale = useLocale();
  const nav = getDictionary(locale).nav;

  return (
    <>
      <PageHeader eyebrow={nav.services} title={service.title} intro={service.intro} />
      <Section
        id="process"
        eyebrow={t.service.process}
        footer={
          <ButtonLink to={paths.contact(locale)} variant="primary">
            {t.service.cta}
          </ButtonLink>
        }
      >
        <ol className={styles.steps}>
          {service.process.map((step, index) => (
            <li
              key={step.title}
              className={styles.step}
              data-reveal
              style={{ "--i": index } as CSSProperties}
            >
              <span className={styles.index}>0{index + 1}</span>
              <h2 className={styles.title}>{step.title}</h2>
              <p className={styles.text}>{step.text}</p>
            </li>
          ))}
        </ol>
      </Section>
    </>
  );
}
