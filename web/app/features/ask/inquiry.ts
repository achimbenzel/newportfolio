/**
 * Geführte Anfrage: drei kurze Fragen (Art, Zeitraum, Budget) + optionale Beschreibung →
 * fertige Nachricht an Achim als E-Mail- und WhatsApp-Link (ein Klick, nichts wird gespeichert).
 *
 * Texte und Antwortmöglichkeiten: askTexts[lang].inquiry in knowledge.ts
 * Grenzen für Hinweise (ab 300 €, Call ab 750 €): profile in knowledge.ts
 */
import { site } from "~/config/site";
import type { Locale } from "~/i18n/config";
import { fill } from "./content";
import { askTexts, profile } from "./knowledge";

/** Stand der Anfrage im Gesprächsgedächtnis */
export type InquiryState = { step: number; answers: string[] };

export type InquiryReply = {
  text: string;
  /** Antwortmöglichkeiten zum Anklicken (werden wie getippte Antworten verschickt) */
  replies: string[];
  /** undefined = Anfrage beendet (fertig oder abgebrochen) */
  state?: InquiryState;
};

/** Eingaben der Besucher landen in Text UND Links → Klammern/Platzhalter entfernen, kürzen */
const clean = (text: string) =>
  text
    .replace(/[[\]{}()]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 300);

/** URL-Kodierung, die auch Klammern kodiert (sonst bricht der Link im Chat-Text) */
const encode = (text: string) =>
  encodeURIComponent(text).replace(
    /[()!'*]/g,
    (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`,
  );

function stepReply(step: number, answers: string[], lang: Locale, prefix = ""): InquiryReply {
  const texts = askTexts[lang].inquiry;
  const current = texts.steps[step]!;
  const isLast = step === texts.steps.length - 1;
  return {
    text: prefix + current.question,
    replies: [...current.options, ...(isLast ? [texts.skip] : []), texts.cancel],
    state: { step, answers },
  };
}

export function startInquiry(lang: Locale): InquiryReply {
  return stepReply(0, [], lang);
}

/** Aktuelle Frage noch einmal stellen (z. B. nach einer Zwischenfrage) */
export function repeatInquiry(state: InquiryState, lang: Locale): InquiryReply {
  return stepReply(state.step, state.answers, lang, askTexts[lang].inquiry.repeat);
}

export function cancelInquiry(lang: Locale): InquiryReply {
  return { text: askTexts[lang].inquiry.cancelled, replies: [] };
}

/** Antwort auf die aktuelle Frage verarbeiten; `skipped` = „Überspringen“ o. Ä. */
export function continueInquiry(
  state: InquiryState,
  message: string,
  lang: Locale,
  skipped: boolean,
): InquiryReply {
  const texts = askTexts[lang].inquiry;
  const answer = skipped ? "" : clean(message);
  const answers = [...state.answers, answer];
  const next = state.step + 1;
  if (next < texts.steps.length) return stepReply(next, answers, lang);
  return { text: summary(answers, lang), replies: [] };
}

/** Budget-Hinweis: unter dem Mindestbudget → Hinweis, ab Call-Grenze → Call anbieten */
function budgetNote(budget: string, lang: Locale): string {
  const texts = askTexts[lang].inquiry;
  const numbers = (budget.replace(/[.\s](?=\d{3})/g, "").match(/\d+/g) ?? []).map(Number);
  if (numbers.length === 0) return "";
  const below = /unter|under|weniger|less|</i.test(budget);
  const above = /über|uber|over|mehr|more|>/i.test(budget);
  const max = Math.max(...numbers);
  const min = Math.min(...numbers);
  if ((below && max <= profile.minBudget) || max < profile.minBudget) {
    return fill(texts.lowBudget, { min: profile.minBudget });
  }
  // Call erst bei „über 750 €“ bzw. wenn auch das untere Ende ab 750 € liegt („300–750 €“ nicht)
  if ((above && max >= profile.callFrom) || (!below && min >= profile.callFrom)) return texts.call;
  return "";
}

function summary(answers: string[], lang: Locale): string {
  const texts = askTexts[lang].inquiry;
  const lines = texts.lines.map(
    (label, index) => `– ${label}: ${answers[index] || texts.notSpecified}`,
  );
  const type = answers[0] || texts.notSpecified;
  const subject = fill(texts.subject, { type });
  const body = `${texts.mailIntro}\n${lines.join("\n")}\n${texts.mailOutro}`;
  const mailto = `mailto:${site.email}?subject=${encode(subject)}&body=${encode(body)}`;
  const whatsapp = `https://wa.me/${site.whatsapp.replace(/\D/g, "")}?text=${encode(
    `${subject}\n\n${lines.join("\n")}`,
  )}`;
  return fill(texts.summary, {
    lines: lines.join("\n"),
    note: budgetNote(answers[2] ?? "", lang),
    mailto,
    whatsapp,
  });
}
