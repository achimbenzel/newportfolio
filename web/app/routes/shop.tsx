import { ComingSoon } from "~/components/sections/ComingSoon";
import { PageHeader } from "~/components/sections/PageHeader";
import { getDictionary, useT } from "~/i18n";
import { localeOr } from "~/lib/route";
import { pageMeta } from "~/lib/seo";
import type { Route } from "./+types/shop";

export function meta({ params }: Route.MetaArgs) {
  const locale = localeOr(params.lang);
  return pageMeta({ locale, path: "/shop", title: getDictionary(locale).nav.shop });
}

export default function Shop() {
  const t = useT();
  return (
    <>
      <PageHeader title={t.nav.shop} />
      <ComingSoon />
    </>
  );
}
