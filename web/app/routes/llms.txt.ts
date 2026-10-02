import { serviceSlugs } from "~/config/services";
import { site } from "~/config/site";
import { getProjects } from "~/content/projects.server";
import { getService } from "~/content/services.server";
import { getDictionary, locales } from "~/i18n";
import { localizedUrl } from "~/lib/seo";
import { excerpt } from "~/lib/route";

/**
 * /llms.txt – kompakte Markdown-Zusammenfassung der Website für KI-Assistenten
 * (Vorschlag llmstxt.org). Wird beim Build aus denselben Inhalten erzeugt wie die Seiten.
 */
export async function loader() {
  const sections: string[] = [];

  for (const locale of locales) {
    const t = getDictionary(locale);
    const [projects, services] = await Promise.all([
      getProjects(locale),
      Promise.all(serviceSlugs.map((slug) => getService(locale, slug))),
    ]);

    sections.push(
      [
        `## ${locale === "de" ? "Deutsch" : "English"}`,
        "",
        `### ${t.nav.services}`,
        ...services.map(
          (s) => `- [${s.title}](${localizedUrl(locale, `/${s.slug}`)}): ${excerpt(s.intro, 200)}`,
        ),
        "",
        `### ${t.nav.work}`,
        ...projects.map(
          (p) =>
            `- [${p.title}](${localizedUrl(locale, `/work/${p.slug}`)}): ${p.category}, ${p.year}`,
        ),
        "",
        `### ${t.footer.pages}`,
        `- [${t.nav.about}](${localizedUrl(locale, "/about")})`,
        `- [${t.nav.contact}](${localizedUrl(locale, "/contact")})`,
      ].join("\n"),
    );
  }

  const de = getDictionary("de");
  const en = getDictionary("en");
  const body = `# ${site.name}

> ${en.meta.siteDescription}
> ${de.meta.siteDescription}

- Website: ${site.url}
- E-Mail: ${site.email}
- Ort / Location: Mainz, Deutschland / Germany
- Sprachen / Languages: Deutsch (/de/), English (/en/)
${site.socials.map((s) => `- ${s.label}: ${s.url}`).join("\n")}

${sections.join("\n\n")}
`;
  return new Response(body, { headers: { "Content-Type": "text/markdown; charset=utf-8" } });
}
