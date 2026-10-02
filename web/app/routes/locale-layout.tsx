import { Outlet, useParams } from "react-router";
import { SiteShell } from "~/components/layout/SiteShell";
import { NotFound } from "~/components/sections/NotFound";
import { PageHeader } from "~/components/sections/PageHeader";
import { defaultLocale, getDictionary, isLocale, LocaleProvider } from "~/i18n";
import { isNotFoundError } from "~/lib/route";
import type { Route } from "./+types/locale-layout";

/** Layout für alle Seiten unter /:lang – stellt die Sprache bereit und rendert Header/Footer. */
export default function LocaleLayout({ params }: Route.ComponentProps) {
  if (!isLocale(params.lang)) {
    return (
      <LocaleProvider locale={defaultLocale}>
        <SiteShell>
          <NotFound />
        </SiteShell>
      </LocaleProvider>
    );
  }
  return (
    <LocaleProvider locale={params.lang}>
      <SiteShell>
        <Outlet />
      </SiteShell>
    </LocaleProvider>
  );
}

/** Fehler in Unterseiten (z. B. unbekanntes Projekt) – mit Header & Footer. */
export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const params = useParams();
  const locale = isLocale(params.lang) ? params.lang : defaultLocale;
  const t = getDictionary(locale);
  const notFound = !isLocale(params.lang) || isNotFoundError(error);

  if (import.meta.env.DEV && !notFound) console.error(error);

  return (
    <LocaleProvider locale={locale}>
      <SiteShell>
        {notFound ? <NotFound /> : <PageHeader title={t.error.title} intro={t.error.text} />}
      </SiteShell>
    </LocaleProvider>
  );
}
