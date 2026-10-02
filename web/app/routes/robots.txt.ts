import { absoluteUrl } from "~/lib/seo";

/**
 * /robots.txt – Suchmaschinen und KI-Crawler sind ausdrücklich erlaubt
 * (Ziel: gute Auffindbarkeit in Google & KI-Antworten).
 * KI-Training ausschließen? → siehe docs/05-seo-ki.md
 */
export function loader() {
  const body = `User-agent: *
Allow: /

Sitemap: ${absoluteUrl("/sitemap.xml")}
`;
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
