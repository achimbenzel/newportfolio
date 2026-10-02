import { ComingSoon } from "~/components/sections/ComingSoon";
import { PageHeader } from "~/components/sections/PageHeader";
import { ButtonAnchor } from "~/components/ui/Button";
import { site } from "~/config/site";
import { getDictionary, useT } from "~/i18n";
import { localeOr } from "~/lib/route";
import { pageMeta } from "~/lib/seo";
import type { Route } from "./+types/contact";

export function meta({ params }: Route.MetaArgs) {
  const locale = localeOr(params.lang);
  const t = getDictionary(locale);
  return pageMeta({
    locale,
    path: "/contact",
    title: t.contact.title,
    description: t.contact.intro,
  });
}

export default function Contact() {
  const t = useT();
  return (
    <>
      <PageHeader title={t.contact.title} intro={t.contact.intro}>
        <ButtonAnchor
          href={`mailto:${site.email}`}
          variant="primary"
          icon="mail"
          iconPosition="start"
        >
          {site.email}
        </ButtonAnchor>
      </PageHeader>
      <ComingSoon text={t.contact.formComing} />
    </>
  );
}
