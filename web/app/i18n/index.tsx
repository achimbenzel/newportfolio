import { createContext, use, type ReactNode } from "react";
import { de, type Dictionary } from "./de";
import { en } from "./en";
import { defaultLocale, type Locale } from "./config";

export * from "./config";
export type { Dictionary };

const dictionaries: Record<Locale, Dictionary> = { de, en };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}

const LocaleContext = createContext<Locale>(defaultLocale);

export function LocaleProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  return <LocaleContext value={locale}>{children}</LocaleContext>;
}

/** Aktuelle Sprache (aus der URL, bereitgestellt vom Sprach-Layout). */
export function useLocale(): Locale {
  return use(LocaleContext);
}

/** UI-Texte der aktuellen Sprache: `const t = useT(); t.nav.work` */
export function useT(): Dictionary {
  return getDictionary(useLocale());
}
