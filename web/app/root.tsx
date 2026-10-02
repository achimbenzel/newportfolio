// Globale Styles ZUERST importieren (Reihenfolge = Kaskade: Tokens → Basis → Komponenten)
import "./styles/index.css";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLocation,
  type LinksFunction,
} from "react-router";
import { useEffect, type ReactNode } from "react";
import { ConsentProvider } from "~/features/consent";
import { getDictionary, localeFromPath, locales } from "~/i18n";
import { isNotFoundError } from "~/lib/route";
import type { Route } from "./+types/root";
import errorStyles from "./root.module.css";

export const links: LinksFunction = () => [
  // Wichtigste Schrift vorladen (lokal, kein Google-Server)
  {
    rel: "preload",
    href: "/fonts/dm-sans/dm-sans-latin-wght-normal.woff2",
    as: "font",
    type: "font/woff2",
    crossOrigin: "anonymous",
  },
  { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
];

/** HTML-Grundgerüst – `lang` folgt der Sprache in der URL. */
export function Layout({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const locale = localeFromPath(pathname);
  // Hält <html lang> auch nach Client-Navigation & SPA-Fallback aktuell
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);
  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#111114" />
        <meta name="color-scheme" content="dark" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <ConsentProvider>
      <Outlet />
    </ConsentProvider>
  );
}

/** Wird nur in der SPA-Fallback-Datei angezeigt, bis JavaScript geladen ist. */
export function HydrateFallback() {
  return <div className={errorStyles.fallback} aria-busy="true" />;
}

/** Letzte Rettung (z. B. ungültige Sprache in der URL) – ohne Header/Footer. */
export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const { pathname } = useLocation();
  const t = getDictionary(localeFromPath(pathname));
  const notFound = isNotFoundError(error);

  if (import.meta.env.DEV && !notFound) console.error(error);

  return (
    <main className={errorStyles.page}>
      <p className={errorStyles.code}>{notFound ? "404" : "Error"}</p>
      <h1 className={errorStyles.title}>{notFound ? t.notFound.title : t.error.title}</h1>
      <p className={errorStyles.text}>{notFound ? t.notFound.text : t.error.text}</p>
      <nav className={errorStyles.links}>
        {locales.map((l) => (
          <a key={l} href={`/${l}/`} hrefLang={l}>
            {getDictionary(l).notFound.home} ({l.toUpperCase()})
          </a>
        ))}
      </nav>
    </main>
  );
}
