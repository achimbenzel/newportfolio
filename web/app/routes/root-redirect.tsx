import { useEffect } from "react";
import { useNavigate } from "react-router";
import { defaultLocale } from "~/i18n/config";
import { absoluteUrl } from "~/lib/seo";

/**
 * "/" → "/de/".
 * - Produktion: nginx leitet "/" per 301 weiter (siehe deploy/nginx.conf) – diese Seite wird dort nie ausgeliefert.
 * - Statische Datei als Fallback: <meta http-equiv="refresh"> + Link.
 * - Client-Navigation: useNavigate.
 * (Kein Loader-Redirect: "/" wird auch für die SPA-Fallback-Datei gerendert.)
 */
const target = `/${defaultLocale}/`;

export function meta() {
  return [
    { title: "Achim Benzel" },
    { httpEquiv: "refresh", content: `0; url=${target}` },
    { name: "robots", content: "noindex, follow" },
    { tagName: "link", rel: "canonical", href: absoluteUrl(target) },
  ];
}

export default function RootRedirect() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate(target, { replace: true });
  }, [navigate]);
  return (
    <p style={{ padding: "2rem" }}>
      <a href={target}>achimbenzel.com/{defaultLocale}/</a>
    </p>
  );
}
