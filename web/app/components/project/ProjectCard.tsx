import { Link } from "react-router";
import { MediaPlaceholder } from "~/components/ui/MediaPlaceholder";
import type { ProjectSummary } from "~/content/types";
import { useLocale } from "~/i18n";
import { paths } from "~/lib/paths";
import styles from "./ProjectCard.module.css";

export function ProjectCard({
  project,
  priority = false,
}: {
  project: ProjectSummary;
  priority?: boolean;
}) {
  const locale = useLocale();
  return (
    <article className={styles.card}>
      <Link to={paths.project(locale, project.slug)} className={styles.link}>
        <div className={styles.media}>
          {project.cover ? (
            <img
              src={project.cover.src}
              srcSet={project.cover.srcSet}
              sizes="(max-width: 760px) 100vw, (max-width: 1120px) 50vw, 33vw"
              alt={project.cover.alt}
              width={project.cover.width}
              height={project.cover.height}
              loading={priority ? "eager" : "lazy"}
              decoding="async"
            />
          ) : (
            <MediaPlaceholder color={project.color} label={project.title} />
          )}
        </div>
        <div className={styles.meta}>
          <h3 className={styles.title}>{project.title}</h3>
          <span className={styles.year}>{project.year}</span>
          <p className={styles.category}>{project.category}</p>
        </div>
      </Link>
    </article>
  );
}
