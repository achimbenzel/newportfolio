import { ComingSoon } from "~/components/sections/ComingSoon";
import { PageHeader } from "~/components/sections/PageHeader";
import { getDictionary, useT } from "~/i18n";
import { localeOr } from "~/lib/route";
import { pageMeta, personJsonLd } from "~/lib/seo";
import type { Route } from "./+types/about";

export function meta({ params }: Route.MetaArgs) {
  const locale = localeOr(params.lang);
  return pageMeta({
    locale,
    path: "/about",
    title: getDictionary(locale).nav.about,
    type: "profile",
    jsonLd: [personJsonLd(locale)],
  });
}

export default function About() {
  const t = useT();
  return (
    <>
      <PageHeader title={t.nav.about} />
      <ComingSoon />
    </>
  );
}
