/**
 * Zustand des Chats – bewusst NUR im Arbeitsspeicher (kein localStorage/Cookie).
 * Bleibt bei Navigation innerhalb der Seite erhalten, ist nach Reload weg.
 * → keine Speicherung auf dem Gerät, kein Consent nötig.
 */
import type { AskContent } from "~/content/types";
import type { Locale } from "~/i18n/config";
import { askConfig } from "./config";
import {
  detectLanguage,
  getAnswer,
  tokenize,
  type AskContext,
  type HistoryEntry,
  type RichToken,
} from "./engine";
import { askTexts } from "./knowledge";

export type ChatMessage = {
  id: number;
  from: "user" | "bot";
  tokens: RichToken[];
  /** Anzahl sichtbarer Tokens (Tipp-Animation) */
  visible: number;
  pending: boolean;
};

export type ChatState = {
  open: boolean;
  busy: boolean;
  messages: ChatMessage[];
  /** null = Standard-Vorschläge in Seitensprache */
  chips: { ids: string[]; lang: Locale } | null;
  /** Gesprächsgedächtnis (zuletzt besprochenes Fachgebiet/Aspekt) */
  context: AskContext;
};

const initialState: ChatState = {
  open: false,
  busy: false,
  messages: [],
  chips: null,
  context: {},
};

let state = initialState;
let nextId = 1;
let typingTimer: ReturnType<typeof setInterval> | undefined;
const listeners = new Set<() => void>();

function setState(patch: Partial<ChatState>) {
  state = { ...state, ...patch };
  listeners.forEach((listener) => listener());
}

function message(from: ChatMessage["from"], text: string, pending = false): ChatMessage {
  const tokens = tokenize(text);
  return { id: nextId++, from, tokens, visible: tokens.length, pending };
}

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function textOf(m: ChatMessage): string {
  return m.tokens.map((t) => (t.type === "text" ? t.value : `[${t.label}](${t.href})`)).join("");
}

function startTyping(id: number, total: number) {
  clearInterval(typingTimer);
  const step = Math.max(
    1,
    Math.ceil((total * askConfig.wordInterval) / askConfig.maxTypingDuration),
  );
  typingTimer = setInterval(() => {
    const target = state.messages.find((m) => m.id === id);
    if (!target || target.visible >= target.tokens.length) {
      clearInterval(typingTimer);
      setState({ busy: false });
      return;
    }
    setState({
      messages: state.messages.map((m) =>
        m.id === id ? { ...m, visible: Math.min(m.tokens.length, m.visible + step) } : m,
      ),
    });
  }, askConfig.wordInterval);
}

export const chatStore = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getSnapshot: () => state,
  getServerSnapshot: () => initialState,

  setOpen(open: boolean) {
    if (state.open !== open) setState({ open });
  },

  /** Neuer Chat: Verlauf, Vorschläge und Gedächtnis leeren, Verlauf zuklappen */
  reset() {
    if (state.busy) return;
    setState({ open: false, messages: [], chips: null, context: {} });
  },

  async ask(
    question: string,
    options: { pageLocale: Locale; topicId?: string; lang?: Locale; content?: AskContent },
  ) {
    const q = question.trim().slice(0, askConfig.maxQuestionLength);
    if (!q || state.busy) return;

    const messages = [...state.messages];
    if (messages.length === 0) {
      const greeting = askTexts[options.pageLocale].greeting;
      const variants = Array.isArray(greeting) ? greeting : [greeting];
      messages.push(message("bot", variants[Math.floor(Math.random() * variants.length)] ?? ""));
    }
    messages.push(message("user", q));
    const placeholder = message("bot", "", true);
    messages.push(placeholder);
    setState({ open: true, busy: true, messages });

    const history: HistoryEntry[] = messages
      .filter((m) => !m.pending)
      .map((m) => ({ role: m.from === "user" ? "user" : "assistant", content: textOf(m) }));

    const lang = options.lang ?? detectLanguage(q, options.pageLocale);
    const answer = await getAnswer(history, q, {
      lang,
      topicId: options.topicId,
      content: options.content,
      context: state.context,
    });
    const tokens = tokenize(answer.text);
    const animate = !prefersReducedMotion();

    setState({
      messages: state.messages.map((m) =>
        m.id === placeholder.id
          ? { ...m, tokens, visible: animate ? 0 : tokens.length, pending: false }
          : m,
      ),
      chips: { ids: answer.followUps, lang: answer.lang },
      context: answer.context,
      busy: animate,
    });
    if (animate) startTyping(placeholder.id, tokens.length);
  },
};
