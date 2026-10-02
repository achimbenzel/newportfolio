/**
 * Speichert die Einwilligung im localStorage (zulässig: technisch notwendig).
 * Als kleiner „External Store“ umgesetzt → useSyncExternalStore, damit
 * Prerendering (Server: „noch unbekannt“) und Browser sauber zusammenpassen.
 */
import { CONSENT_STORAGE_KEY, CONSENT_VERSION, type ConsentChoices } from "./config";

export type StoredConsent = { version: number; date: string; choices: ConsentChoices };

const listeners = new Set<() => void>();
let snapshot: StoredConsent | null | undefined;

function read(): StoredConsent | null {
  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredConsent;
    return parsed.version === CONSENT_VERSION ? parsed : null;
  } catch {
    return null;
  }
}

export const consentStore = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  /** Browser: gespeicherte Einwilligung oder null (= noch nicht entschieden) */
  getSnapshot(): StoredConsent | null {
    if (snapshot === undefined) snapshot = read();
    return snapshot;
  },
  /** Prerendering: undefined (= noch nicht geprüft) */
  getServerSnapshot(): StoredConsent | null | undefined {
    return undefined;
  },
  write(choices: ConsentChoices) {
    snapshot = { version: CONSENT_VERSION, date: new Date().toISOString(), choices };
    try {
      window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(snapshot));
    } catch {
      // Speicher blockiert (z. B. privater Modus) → Auswahl gilt nur für diesen Besuch.
    }
    listeners.forEach((listener) => listener());
  },
};
