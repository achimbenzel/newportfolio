import { Hero } from "~/components/sections/Hero";
import { localeOr } from "~/lib/route";
import { pageMeta, personJsonLd, websiteJsonLd } from "~/lib/seo";
import type { Route } from "./+types/home";

export function meta({ params }: Route.MetaArgs) {
  const locale = localeOr(params.lang);
  return pageMeta({ locale, path: "/", jsonLd: [personJsonLd(locale), websiteJsonLd(locale)] });
}

/** Startseite – vorerst bewusst nur das „Frag Achim“-Chatfenster (Header & Footer kommen vom Layout). */
export default function Home() {
  return <Hero />;
}
