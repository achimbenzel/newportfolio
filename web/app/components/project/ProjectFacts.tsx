import type { Project } from "~/content/types";
import { useT } from "~/i18n";
import styles from "./ProjectFacts.module.css";

/** Eckdaten eines Projekts (Kunde, Jahr, Umfang, Branche) + Software. */
export function ProjectFacts({ project }: { project: Project }) {
  const t = useT();
  const facts = [
    { label: t.project.client, value: project.client },
    { label: t.project.year, value: String(project.year) },
    { label: t.project.scope, value: project.scope },
    { label: t.project.industry, value: project.industry },
  ].filter((fact) => Boolean(fact.value));

  return (
    <div className={styles.wrap}>
      <dl className={styles.facts}>
        {facts.map((fact) => (
          <div key={fact.label}>
            <dt>{fact.label}</dt>
            <dd>{fact.value}</dd>
          </div>
        ))}
      </dl>
      {project.software.length > 0 && (
        <div className={styles.software}>
          <p className={styles.label}>{t.project.software}</p>
          <ul role="list" className={styles.chips}>
            {project.software.map((name) => (
              <li key={name} className={styles.chip}>
                {name}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
