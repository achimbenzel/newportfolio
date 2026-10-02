import { getSitePages, withLocale } from "~/content/pages.server";
import { defaultLocale, locales } from "~/i18n/config";
import { absoluteUrl } from "~/lib/seo";

/** /sitemap.xml – wird beim Build als Datei erzeugt. Enthält hreflang-Alternativen. */
export async function loader() {
  const pages = (await getSitePages()).filter((page) => page.indexable);

  const urls = pages.flatMap((page) =>
    locales.map((locale) => {
      const alternates = [
        ...locales.map(
          (alt) =>
            `    <xhtml:link rel="alternate" hreflang="${alt}" href="${absoluteUrl(withLocale(alt, page.path))}"/>`,
        ),
        `    <xhtml:link rel="alternate" hreflang="x-default" href="${absoluteUrl(withLocale(defaultLocale, page.path))}"/>`,
      ].join("\n");
      return `  <url>\n    <loc>${absoluteUrl(withLocale(locale, page.path))}</loc>\n${alternates}\n  </url>`;
    }),
  );

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join("\n")}
</urlset>
`;
  return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
}
