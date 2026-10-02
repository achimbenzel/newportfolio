import { Hero } from "~/components/sections/Hero";
import { getAskProjects } from "~/content/ask.server";
import { localeOr } from "~/lib/route";
import { pageMeta, personJsonLd, websiteJsonLd } from "~/lib/seo";
import type { Route } from "./+types/home";

/** Projektwissen für den Chat – beim Build aus Sanity/Platzhaltern erzeugt. */
export async function loader() {
  return { askProjects: await getAskProjects() };
}

export function meta({ params }: Route.MetaArgs) {
  const locale = localeOr(params.lang);
  return pageMeta({ locale, path: "/", jsonLd: [personJsonLd(locale), websiteJsonLd(locale)] });
}

/** Startseite – vorerst bewusst nur das „Frag Achim“-Chatfenster (Header & Footer kommen vom Layout). */
export default function Home({ loaderData }: Route.ComponentProps) {
  return <Hero projects={loaderData.askProjects} />;
}
