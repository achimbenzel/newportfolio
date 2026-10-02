/**
 * Begrüßung über dem Chatfenster („Guten Abend“ …) – abhängig von der Tageszeit des Besuchers,
 * zufällig gewählt (nach einem Reload steht ggf. etwas anderes da).
 *
 * Die Uhrzeit gibt es erst im Browser: Im vorgerenderten HTML ist die Zeile leer und wird nach
 * dem Laden eingeblendet. Die Auswahl wird einmal pro Seitenaufruf getroffen und bleibt dann stehen.
 */
import { useSyncExternalStore } from "react";
import type { Locale } from "~/i18n/config";
import { greetingPrompts, timeGreetings } from "./knowledge";

export type DayPeriod = keyof (typeof timeGreetings)["de"];

/** Tageszeit aus der Stunde (0–23) */
export function dayPeriod(hour: number): DayPeriod {
  if (hour >= 5 && hour < 11) return "morning";
  if (hour >= 11 && hour < 14) return "midday";
  if (hour >= 14 && hour < 18) return "afternoon";
  if (hour >= 18 && hour < 23) return "evening";
  return "night";
}

type Choice = { period: DayPeriod; title: number; prompt: number };

let choice: Choice | null = null;

/** Einmal pro Seitenaufruf auswürfeln – stabil für useSyncExternalStore */
function getChoice(): Choice {
  choice ??= {
    period: dayPeriod(new Date().getHours()),
    title: Math.random(),
    prompt: Math.random(),
  };
  return choice;
}

const at = <T>(items: T[], random: number) => items[Math.floor(random * items.length)] ?? items[0]!;

export function greetingFor(locale: Locale, { period, title, prompt }: Choice) {
  return {
    title: at(timeGreetings[locale][period], title),
    prompt: at(greetingPrompts[locale], prompt),
  };
}

const subscribe = () => () => {};

/** null beim Vorrendern/Hydrieren, danach die Begrüßung */
export function useTimeGreeting(locale: Locale) {
  const current = useSyncExternalStore(subscribe, getChoice, () => null);
  return current && greetingFor(locale, current);
}
