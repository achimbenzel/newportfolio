import { ProjectGrid } from "~/components/project/ProjectGrid";
import { Hero } from "~/components/sections/Hero";
import { ServicesOverview } from "~/components/sections/ServicesOverview";
import { ButtonLink } from "~/components/ui/Button";
import { Section } from "~/components/ui/Section";
import { getFeaturedProjects } from "~/content/projects.server";
import { useLocale, useT } from "~/i18n";
import { paths } from "~/lib/paths";
import { localeOr, requireLocale } from "~/lib/route";
import { pageMeta, personJsonLd, websiteJsonLd } from "~/lib/seo";
import type { Route } from "./+types/home";

export async function loader({ params }: Route.LoaderArgs) {
  const locale = requireLocale(params.lang);
  return { projects: await getFeaturedProjects(locale, 3) };
}

export function meta({ params }: Route.MetaArgs) {
  const locale = localeOr(params.lang);
  return pageMeta({ locale, path: "/", jsonLd: [personJsonLd(locale), websiteJsonLd(locale)] });
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const t = useT();
  const locale = useLocale();
  return (
    <>
      <Hero scrollTarget="#work" />
      <Section
        id="work"
        eyebrow={t.home.workEyebrow}
        title={t.home.workTitle}
        footer={<ButtonLink to={paths.work(locale)}>{t.home.workAll}</ButtonLink>}
      >
        <ProjectGrid projects={loaderData.projects} />
      </Section>
      <ServicesOverview />
    </>
  );
}
