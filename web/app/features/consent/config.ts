/**
 * Consent-Konfiguration (TDDDG § 25 / DSGVO).
 *
 * REGEL: Eine Kategorie wird nur eingetragen, wenn ein entsprechender Dienst
 * tatsächlich eingebunden ist. Gibt es keine optionale Kategorie, erscheint
 * auch kein Banner (dann ist keiner nötig).
 *
 * Neue Kategorie/Dienst → hier ergänzen, CONSENT_VERSION erhöhen (alle Besucher
 * werden dann neu gefragt) und Datenschutzerklärung anpassen.
 */
import type { L10n } from "~/lib/l10n";

export const CONSENT_VERSION = 1;
export const CONSENT_STORAGE_KEY = "ab-consent";

export type ConsentCategory = {
  id: string;
  required: boolean;
  label: L10n;
  description: L10n;
};

export const consentCategories = [
  {
    id: "necessary",
    required: true,
    label: { de: "Notwendig", en: "Necessary" },
    description: {
      de: "Speichert ausschließlich deine Datenschutz-Auswahl. Keine Cookies, kein Tracking.",
      en: "Only stores your privacy choice. No cookies, no tracking.",
    },
  },
  {
    id: "media",
    required: false,
    label: { de: "Externe Medien", en: "External media" },
    description: {
      de: "Videos von Vimeo und YouTube in Projekten. Beim Laden werden Daten (u. a. deine IP-Adresse) an den jeweiligen Anbieter übertragen.",
      en: "Videos from Vimeo and YouTube in projects. When loaded, data (including your IP address) is transferred to the provider.",
    },
  },
] as const satisfies readonly ConsentCategory[];

/** IDs der optionalen (zustimmungspflichtigen) Kategorien */
export type OptionalConsentId = Extract<
  (typeof consentCategories)[number],
  { required: false }
>["id"];

export const optionalCategoryIds = consentCategories
  .filter((c): c is Extract<(typeof consentCategories)[number], { required: false }> => !c.required)
  .map((c) => c.id);

export type ConsentChoices = Record<OptionalConsentId, boolean>;
