import { NotFound } from "~/components/sections/NotFound";
import { getDictionary } from "~/i18n";
import { localeOr } from "~/lib/route";
import type { Route } from "./+types/not-found";

export function meta({ params }: Route.MetaArgs) {
  const t = getDictionary(localeOr(params.lang));
  return [{ title: `${t.notFound.title} – Achim Benzel` }, { name: "robots", content: "noindex" }];
}

export default function NotFoundRoute() {
  return <NotFound />;
}
