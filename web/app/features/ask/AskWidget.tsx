import {
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { Link } from "react-router";
import { LogoMark3D } from "~/components/brand/LogoMark3D";
import type { AskContent } from "~/content/types";
import { Icon } from "~/components/ui/Icon";
import { useLocale, useT } from "~/i18n";
import { askConfig } from "./config";
import { getTopic, type RichToken } from "./engine";
import { defaultChips } from "./knowledge";
import { chatStore, type ChatMessage } from "./store";
import { TimeGreeting } from "./TimeGreeting";
import styles from "./AskWidget.module.css";

/**
 * „Frag Achim“ – Chatfenster im Hero (Look: großes Eingabefeld mit Neon-Glow).
 * Darüber eine Begrüßung je nach Tageszeit, der Verlauf erscheint im selben Fenster ÜBER dem
 * Eingabefeld, Vorschläge darunter. Antwortet auf Deutsch und Englisch (Sprache der Frage),
 * komplett lokal. `content`: Wissen aus dem Content-Layer (Projekte, Leistungen).
 */
export function AskWidget({ content }: { content?: AskContent }) {
  const t = useT();
  const locale = useLocale();
  const chat = useSyncExternalStore(
    chatStore.subscribe,
    chatStore.getSnapshot,
    chatStore.getServerSnapshot,
  );
  const [question, setQuestion] = useState("");
  const inputId = useId();
  const logId = useId();
  const logRef = useRef<HTMLDivElement>(null);
  const chipsRef = useRef<HTMLDivElement>(null);
  const focusChipsNext = useRef(false);

  const hasHistory = chat.messages.length > 0;
  const chipLang = chat.chips?.lang ?? locale;
  const chipIds = (chat.chips?.ids ?? defaultChips).filter(
    (id) => getTopic(id, content)?.[chipLang].label,
  );
  const canSend = !chat.busy && question.trim().length > 0;

  // Neue Inhalte → Verlauf nach unten scrollen (nur DOM, kein State)
  useEffect(() => {
    const log = logRef.current;
    if (log) log.scrollTop = log.scrollHeight;
  }, [chat.messages, chat.open]);

  // Nach Klick auf einen Vorschlag den Fokus auf den ersten neuen Vorschlag setzen (Tastatur)
  useEffect(() => {
    if (!focusChipsNext.current || chat.busy) return;
    focusChipsNext.current = false;
    chipsRef.current?.querySelector("button")?.focus({ preventScroll: true });
  }, [chat.busy, chat.chips]);

  const send = () => {
    if (!canSend) return;
    void chatStore.ask(question, { pageLocale: locale, content });
    setQuestion("");
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    send();
  };

  // Enter sendet, Shift+Enter = neue Zeile
  const onInputKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      send();
    }
  };

  const askTopic = (id: string) => {
    const topic = getTopic(id, content);
    if (!topic || chat.busy) return;
    focusChipsNext.current = true;
    void chatStore.ask(topic[chipLang].q ?? topic[chipLang].label ?? id, {
      pageLocale: locale,
      topicId: id,
      lang: chipLang,
      content,
    });
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape" && chat.open) {
      event.stopPropagation();
      chatStore.setOpen(false);
    }
  };

  return (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions -- Escape-Taste schließt den Verlauf
    <div className={styles.widget} data-open={chat.open || undefined} onKeyDown={onKeyDown}>
      <TimeGreeting hidden={hasHistory} />

      {/* Aktionen über dem Fenster – nur sichtbar, wenn es einen Verlauf gibt */}
      <div className={styles.toolbar} data-visible={hasHistory || undefined} inert={!hasHistory}>
        <button
          type="button"
          className={styles.toolButton}
          onClick={chatStore.reset}
          disabled={chat.busy}
        >
          {t.ask.reset}
        </button>
        <button
          type="button"
          className={styles.toolButton}
          onClick={() => chatStore.setOpen(!chat.open)}
          aria-expanded={chat.open}
          aria-controls={logId}
        >
          {chat.open ? t.ask.close : t.ask.show}
          <Icon name="chevronDown" size={14} className={styles.toolChevron} />
        </button>
      </div>

      <form className={styles.card} onSubmit={onSubmit} aria-label={t.ask.title}>
        {/* Verlauf – klappt weich auf */}
        <div className={styles.panel} inert={!chat.open}>
          <div className={styles.panelInner}>
            {/* tabIndex: Verlauf ist ohne sichtbaren Scrollbalken auch per Tastatur scrollbar */}
            <div
              id={logId}
              ref={logRef}
              className={styles.log}
              role="log"
              aria-live="polite"
              aria-relevant="additions"
              aria-label={t.ask.title}
              tabIndex={0}
            >
              {chat.messages.map((m) => (
                <Message key={m.id} message={m} />
              ))}
            </div>
          </div>
        </div>

        <label htmlFor={inputId} className="sr-only">
          {t.ask.label}
        </label>
        <textarea
          id={inputId}
          className={styles.input}
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          onKeyDown={onInputKeyDown}
          onFocus={() => hasHistory && chatStore.setOpen(true)}
          placeholder={t.ask.placeholder}
          maxLength={askConfig.maxQuestionLength}
          rows={3}
          autoComplete="off"
          enterKeyHint="send"
          aria-controls={logId}
        />

        <div className={styles.footer}>
          <span className={styles.identity}>
            <LogoMark3D depth={6} className={styles.identityMark} />
            <span className={styles.identityName}>{t.ask.bot}</span>
            <span className={styles.identityRole}>{t.ask.assistant}</span>
          </span>
          <button
            type="submit"
            className={styles.send}
            disabled={!canSend}
            aria-label={t.ask.submit}
          >
            <Icon name="arrowUp" size={18} strokeWidth={2.25} />
          </button>
        </div>
      </form>

      <div ref={chipsRef} className={styles.chips} role="group" aria-label={t.ask.suggestions}>
        {chipIds.map((id) => (
          <button
            key={`${chipLang}-${id}`}
            type="button"
            className={styles.chip}
            onClick={() => askTopic(id)}
            disabled={chat.busy}
          >
            {getTopic(id, content)?.[chipLang].label}
          </button>
        ))}
      </div>
    </div>
  );
}

function Message({ message }: { message: ChatMessage }) {
  const t = useT();
  const isBot = message.from === "bot";
  const typing = message.visible < message.tokens.length;
  return (
    <div className={styles.message} data-from={message.from}>
      {isBot && <LogoMark3D depth={6} className={styles.avatarLogo} />}
      <div className={styles.bubble}>
        <span className="sr-only">{isBot ? t.ask.bot : t.ask.you}: </span>
        {message.pending ? (
          <p className={styles.thinking}>
            <span className="sr-only">{t.ask.thinking}</span>
            <span className={styles.dots} aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
          </p>
        ) : (
          <p className={styles.text} data-typing={typing || undefined}>
            {message.tokens.slice(0, message.visible).map((token, index) => (
              <RichPart key={index} token={token} />
            ))}
          </p>
        )}
      </div>
    </div>
  );
}

function RichPart({ token }: { token: RichToken }) {
  if (token.type === "text") return token.value;
  if (token.href.startsWith("/")) {
    return (
      <Link to={token.href} className={styles.link}>
        {token.label}
      </Link>
    );
  }
  const external = token.href.startsWith("http");
  return (
    <a
      href={token.href}
      className={styles.link}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
    >
      {token.label}
    </a>
  );
}
