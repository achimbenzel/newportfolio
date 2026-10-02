import { ProjectGrid } from "~/components/project/ProjectGrid";
import { ComingSoon } from "~/components/sections/ComingSoon";
import { PageHeader } from "~/components/sections/PageHeader";
import { Container } from "~/components/ui/Container";
import { getProjects } from "~/content/projects.server";
import { getDictionary, useT } from "~/i18n";
import { localeOr, requireLocale } from "~/lib/route";
import { pageMeta } from "~/lib/seo";
import type { Route } from "./+types/work";

export async function loader({ params }: Route.LoaderArgs) {
  const locale = requireLocale(params.lang);
  return { projects: await getProjects(locale) };
}

export function meta({ params }: Route.MetaArgs) {
  const locale = localeOr(params.lang);
  const t = getDictionary(locale);
  return pageMeta({ locale, path: "/work", title: t.work.title, description: t.work.intro });
}

export default function Work({ loaderData }: Route.ComponentProps) {
  const t = useT();
  return (
    <>
      <PageHeader title={t.work.title} intro={t.work.intro} />
      {loaderData.projects.length > 0 ? (
        <Container>
          <ProjectGrid projects={loaderData.projects} priorityCount={3} />
        </Container>
      ) : (
        <ComingSoon text={t.work.empty} />
      )}
    </>
  );
}
