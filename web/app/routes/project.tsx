import { data } from "react-router";
import { ProjectBlocks } from "~/components/project/ProjectBlocks";
import { ProjectCard } from "~/components/project/ProjectCard";
import { ProjectFacts } from "~/components/project/ProjectFacts";
import { PageHeader } from "~/components/sections/PageHeader";
import { Container } from "~/components/ui/Container";
import { MediaPlaceholder } from "~/components/ui/MediaPlaceholder";
import { getProject, getProjects } from "~/content/projects.server";
import { getDictionary, useLocale, useT } from "~/i18n";
import { paths } from "~/lib/paths";
import { excerpt, localeOr, requireLocale } from "~/lib/route";
import { breadcrumbJsonLd, creativeWorkJsonLd, localizedUrl, pageMeta } from "~/lib/seo";
import type { Route } from "./+types/project";
import styles from "./project.module.css";

export async function loader({ params }: Route.LoaderArgs) {
  const locale = requireLocale(params.lang);
  const project = await getProject(locale, params.slug);
  if (!project) throw data(null, { status: 404 });

  const all = await getProjects(locale);
  const index = all.findIndex((p) => p.slug === project.slug);
  const next = all.length > 1 ? all[(index + 1) % all.length] : undefined;
  return { project, next: next ?? null };
}

export function meta({ params, loaderData }: Route.MetaArgs) {
  const locale = localeOr(params.lang);
  if (!loaderData) return [];
  const { project } = loaderData;
  const t = getDictionary(locale);
  const path = `/work/${project.slug}`;
  const description = project.seo?.description ?? excerpt(project.description);
  return pageMeta({
    locale,
    path,
    title: project.seo?.title ?? project.title,
    description,
    image: project.cover?.src,
    type: "article",
    jsonLd: [
      creativeWorkJsonLd({
        locale,
        path,
        name: project.title,
        description,
        year: project.year,
        image: project.cover?.src,
      }),
      breadcrumbJsonLd([
        { name: "Achim Benzel", url: localizedUrl(locale, "/") },
        { name: t.work.title, url: localizedUrl(locale, "/work") },
        { name: project.title, url: localizedUrl(locale, path) },
      ]),
    ],
  });
}

export default function ProjectPage({ loaderData }: Route.ComponentProps) {
  const { project, next } = loaderData;
  const t = useT();
  const locale = useLocale();

  return (
    <article>
      <PageHeader
        title={project.title}
        eyebrow={project.category}
        back={{ to: paths.work(locale), label: t.project.back }}
      >
        <ProjectFacts project={project} />
        <p className={styles.description}>{project.description}</p>
      </PageHeader>

      <Container>
        <div className={styles.cover}>
          {project.cover ? (
            <img
              src={project.cover.src}
              srcSet={project.cover.srcSet}
              sizes="100vw"
              alt={project.cover.alt}
              width={project.cover.width}
              height={project.cover.height}
              fetchPriority="high"
            />
          ) : (
            <MediaPlaceholder color={project.color} label={project.title} />
          )}
        </div>
        <ProjectBlocks blocks={project.content} />

        {next && (
          <aside className={styles.next} aria-labelledby="next-project">
            <p id="next-project" className={styles.nextLabel}>
              {t.project.next}
            </p>
            <div className={styles.nextCard}>
              <ProjectCard project={next} />
            </div>
          </aside>
        )}
      </Container>
    </article>
  );
}
