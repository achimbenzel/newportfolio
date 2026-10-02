import type { CSSProperties } from "react";
import type { ProjectSummary } from "~/content/types";
import { ProjectCard } from "./ProjectCard";
import styles from "./ProjectGrid.module.css";

export function ProjectGrid({
  projects,
  priorityCount = 0,
}: {
  projects: ProjectSummary[];
  priorityCount?: number;
}) {
  return (
    <ul className={styles.grid} role="list">
      {projects.map((project, index) => (
        <li key={project.slug} data-reveal style={{ "--i": index } as CSSProperties}>
          <ProjectCard project={project} priority={index < priorityCount} />
        </li>
      ))}
    </ul>
  );
}
