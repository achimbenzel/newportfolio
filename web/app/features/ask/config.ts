/**
 * Einstellungen des „Frag Achim“-Widgets.
 *
 * endpoint: Später optional ein EIGENES Backend (z. B. /api/ask), das eine KI
 * befragt. Erwartet POST { lang, messages: [{ role, content }] } → { reply }.
 * Bis dahin (null) antwortet das Widget komplett lokal im Browser aus
 * knowledge.ts – es werden KEINE Daten an Dritte gesendet.
 * ⚠️ Bevor ein KI-Dienst angebunden wird: Datenschutzerklärung + ggf. Consent!
 */
export const askConfig = {
  endpoint: null as string | null,
  maxQuestionLength: 300,
  /** künstliche „Denkpause“, damit Antworten nicht unnatürlich sofort erscheinen */
  thinkingDelay: { min: 380, max: 720 },
  /** Tipp-Animation: Millisekunden pro Wort */
  wordInterval: 22,
  /** Tipp-Animation dauert höchstens so lange (lange Antworten tippen schneller) */
  maxTypingDuration: 2400,
} as const;
