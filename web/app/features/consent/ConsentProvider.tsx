import { createContext, use, useMemo, useState, useSyncExternalStore, type ReactNode } from "react";
import { optionalCategoryIds, type ConsentChoices, type OptionalConsentId } from "./config";
import { consentStore } from "./store";

type ConsentContextValue = {
  /** true, sobald im Browser geprüft wurde, ob schon eine Entscheidung existiert */
  ready: boolean;
  decided: boolean;
  choices: ConsentChoices;
  /** Banner sichtbar? (keine Entscheidung vorhanden ODER Einstellungen geöffnet) */
  bannerOpen: boolean;
  /** Wurde der Banner aktiv über „Cookie-Einstellungen“ geöffnet? */
  settingsRequested: boolean;
  has: (category: OptionalConsentId) => boolean;
  acceptAll: () => void;
  rejectAll: () => void;
  save: (choices: ConsentChoices) => void;
  openSettings: () => void;
};

const allChoices = (value: boolean) =>
  Object.fromEntries(optionalCategoryIds.map((id) => [id, value])) as ConsentChoices;

const ConsentContext = createContext<ConsentContextValue | null>(null);

/**
 * Hält die Einwilligungen des Besuchers. Im vorgerenderten HTML gilt immer
 * „nicht zugestimmt“ (sicherer Standard) – erst im Browser wird gelesen.
 */
export function ConsentProvider({ children }: { children: ReactNode }) {
  const stored = useSyncExternalStore(
    consentStore.subscribe,
    consentStore.getSnapshot,
    consentStore.getServerSnapshot,
  );
  const [settingsRequested, setSettingsRequested] = useState(false);

  const value = useMemo<ConsentContextValue>(() => {
    const ready = stored !== undefined;
    const decided = Boolean(stored);
    const choices = { ...allChoices(false), ...stored?.choices };
    const save = (next: ConsentChoices) => {
      consentStore.write(next);
      setSettingsRequested(false);
    };
    return {
      ready,
      decided,
      choices,
      settingsRequested,
      bannerOpen: ready && optionalCategoryIds.length > 0 && (!decided || settingsRequested),
      has: (category) => choices[category] === true,
      acceptAll: () => save(allChoices(true)),
      rejectAll: () => save(allChoices(false)),
      save,
      openSettings: () => setSettingsRequested(true),
    };
  }, [stored, settingsRequested]);

  return <ConsentContext value={value}>{children}</ConsentContext>;
}

export function useConsent(): ConsentContextValue {
  const context = use(ConsentContext);
  if (!context)
    throw new Error("useConsent muss innerhalb von <ConsentProvider> verwendet werden.");
  return context;
}
