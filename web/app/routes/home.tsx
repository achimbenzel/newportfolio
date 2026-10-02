import { Hero } from "~/components/sections/Hero";
import { getAskContent } from "~/content/ask.server";
import { localeOr } from "~/lib/route";
import { pageMeta, personJsonLd, websiteJsonLd } from "~/lib/seo";
import type { Route } from "./+types/home";

/** Wissen für den Chat (Projekte, Leistungen) – beim Build aus Sanity/Platzhaltern erzeugt. */
export async function loader() {
  return { askContent: await getAskContent() };
}

/** Hintergrundfoto früh laden (größtes Element beim ersten Aufruf) */
export const links: Route.LinksFunction = () => [
  {
    rel: "preload",
    as: "image",
    href: "/images/hero/japan-2560.webp",
    type: "image/webp",
    media: "(min-width: 901px) and (max-width: 1999px)",
  },
  {
    rel: "preload",
    as: "image",
    href: "/images/hero/japan-3840.webp",
    type: "image/webp",
    media: "(min-width: 2000px)",
  },
  {
    rel: "preload",
    as: "image",
    href: "/images/hero/japan-1280.webp",
    type: "image/webp",
    media: "(max-width: 900px)",
  },
];

export function meta({ params }: Route.MetaArgs) {
  const locale = localeOr(params.lang);
  return pageMeta({ locale, path: "/", jsonLd: [personJsonLd(locale), websiteJsonLd(locale)] });
}

/** Startseite – vorerst bewusst nur das „Frag Achim“-Chatfenster (Header & Footer kommen vom Layout). */
export default function Home({ loaderData }: Route.ComponentProps) {
  return <Hero askContent={loaderData.askContent} />;
}
