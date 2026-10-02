import { ComingSoon } from "~/components/sections/ComingSoon";
import { PageHeader } from "~/components/sections/PageHeader";
import { getDictionary, useT, type Dictionary } from "~/i18n";
import { localeOr } from "~/lib/route";
import { pageMeta } from "~/lib/seo";
import type { Route } from "./+types/legal";

/**
 * Impressum & Datenschutzerklärung (eine Datei, zwei Routen: id "imprint" / "privacy").
 * ⚠️ Vor dem Livegang MÜSSEN hier die rechtsverbindlichen Texte stehen.
 */
type LegalPage = "imprint" | "privacy";

const pageFromId = (id: string): LegalPage => (id === "privacy" ? "privacy" : "imprint");
const titleOf = (t: Dictionary, page: LegalPage) =>
  page === "privacy" ? t.legal.privacyTitle : t.legal.imprintTitle;

export function meta({ params, location }: Route.MetaArgs) {
  const locale = localeOr(params.lang);
  const page: LegalPage = location.pathname.includes("/privacy") ? "privacy" : "imprint";
  return pageMeta({
    locale,
    path: `/${page}`,
    title: titleOf(getDictionary(locale), page),
    noindex: true,
  });
}

export default function Legal({ matches }: Route.ComponentProps) {
  const t = useT();
  const page = pageFromId(matches[matches.length - 1]?.id ?? "");
  return (
    <>
      <PageHeader title={titleOf(t, page)} />
      <ComingSoon text={t.legal.placeholder} />
    </>
  );
}
