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
import { Icon } from "~/components/ui/Icon";
import { useLocale, useT } from "~/i18n";
import { askConfig } from "./config";
import { getTopic, type RichToken } from "./engine";
import { defaultChips } from "./knowledge";
import { chatStore, type ChatMessage } from "./store";
import styles from "./AskWidget.module.css";

/**
 * „Frag Achim“ – Chat-Widget im Hero.
 * Eingabe oben, Antworten klappen darunter weich auf, Vorschläge (Chips) darunter.
 * Antwortet auf Deutsch und Englisch (Sprache der Frage), komplett lokal.
 */
export function AskWidget() {
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

  const chipLang = chat.chips?.lang ?? locale;
  const chipIds = (chat.chips?.ids ?? defaultChips).filter((id) => getTopic(id)?.[chipLang].label);

  // Neue Inhalte → Verlauf nach unten scrollen (nur DOM, kein State)
  useEffect(() => {
    const log = logRef.current;
    if (log) log.scrollTop = log.scrollHeight;
  }, [chat.messages]);

  // Nach Klick auf einen Chip den Fokus auf den ersten neuen Chip setzen (Tastaturbedienung)
  useEffect(() => {
    if (!focusChipsNext.current || chat.busy) return;
    focusChipsNext.current = false;
    chipsRef.current?.querySelector("button")?.focus({ preventScroll: true });
  }, [chat.busy, chat.chips]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (chat.busy || !question.trim()) return;
    void chatStore.ask(question, { pageLocale: locale });
    setQuestion("");
  };

  const askTopic = (id: string) => {
    const topic = getTopic(id);
    if (!topic || chat.busy) return;
    focusChipsNext.current = true;
    void chatStore.ask(topic[chipLang].q ?? topic[chipLang].label ?? id, {
      pageLocale: locale,
      topicId: id,
      lang: chipLang,
    });
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape" && chat.open) {
      event.stopPropagation();
      chatStore.setOpen(false);
    }
  };

  return (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions -- Escape-Taste schließt das Panel
    <div className={styles.widget} data-open={chat.open || undefined} onKeyDown={onKeyDown}>
      <form className={styles.bar} onSubmit={submit} role="search" aria-label={t.ask.title}>
        <label htmlFor={inputId} className="sr-only">
          {t.ask.label}
        </label>
        <Icon name="sparkle" size={18} className={styles.barIcon} />
        <input
          id={inputId}
          className={styles.input}
          type="text"
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          onFocus={() => chat.messages.length > 0 && chatStore.setOpen(true)}
          placeholder={t.ask.placeholder}
          maxLength={askConfig.maxQuestionLength}
          autoComplete="off"
          enterKeyHint="send"
          aria-controls={logId}
        />
        <button
          type="submit"
          className={styles.submit}
          disabled={chat.busy || !question.trim()}
          aria-label={t.ask.submit}
        >
          <span>{t.ask.submit}</span>
          <Icon name="arrowRight" size={15} />
        </button>
      </form>

      <div className={styles.panel} inert={!chat.open}>
        <div className={styles.panelInner}>
          <section className={styles.card} aria-label={t.ask.title}>
            <div className={styles.head}>
              <span className={styles.headTitle}>
                <span className={styles.liveDot} aria-hidden="true" />
                {t.ask.title}
              </span>
              <div className={styles.headActions}>
                <button
                  type="button"
                  className={styles.softButton}
                  onClick={chatStore.reset}
                  disabled={chat.busy}
                >
                  {t.ask.reset}
                </button>
                <button
                  type="button"
                  className={styles.softButton}
                  onClick={() => chatStore.setOpen(false)}
                  aria-label={t.ask.close}
                >
                  <Icon name="close" size={14} />
                </button>
              </div>
            </div>
            <div
              id={logId}
              ref={logRef}
              className={styles.log}
              role="log"
              aria-live="polite"
              aria-relevant="additions"
            >
              {chat.messages.map((m) => (
                <Message key={m.id} message={m} />
              ))}
            </div>
            <p className={styles.disclaimer}>{t.ask.disclaimer}</p>
          </section>
        </div>
      </div>

      <div ref={chipsRef} className={styles.chips} role="group" aria-label={t.ask.suggestions}>
        {chipIds.map((id) => (
          <button
            key={`${chipLang}-${id}`}
            type="button"
            className={styles.chip}
            onClick={() => askTopic(id)}
            disabled={chat.busy}
          >
            {getTopic(id)?.[chipLang].label}
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
      <span className={styles.avatar} aria-hidden="true">
        {isBot ? t.ask.botAvatar : t.ask.youAvatar}
      </span>
      <div>
        <p className={styles.who}>{isBot ? t.ask.bot : t.ask.you}</p>
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
