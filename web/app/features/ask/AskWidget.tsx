import {
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
  type FormEvent,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { Link } from "react-router";
import { LogoMark3D } from "~/components/brand/LogoMark3D";
import type { AskContent } from "~/content/types";
import { Icon } from "~/components/ui/Icon";
import { useLocale, useT } from "~/i18n";
import type { Locale } from "~/i18n/config";
import { askConfig } from "./config";
import { getTopic, type RichToken } from "./engine";
import { defaultChips } from "./knowledge";
import { ChatGallery } from "./ChatGallery";
import { getGallery, type GalleryImage } from "./galleries";
import { Lightbox } from "./Lightbox";
import { chatStore, type ChatMessage, type MessageOptions } from "./store";
import { TimeGreeting } from "./TimeGreeting";
import styles from "./AskWidget.module.css";

/**
 * „Frag Achim“ – Chatfenster im Hero (Look: großes Eingabefeld mit Neon-Glow).
 * Darüber eine Begrüßung je nach Tageszeit, der Verlauf erscheint im selben Fenster ÜBER dem
 * Eingabefeld. Vorschläge stehen IM Fenster: vor dem ersten Gespräch unter dem Eingabefeld,
 * danach unter der letzten Antwort (bei Rückfragen als Auswahlliste).
 * Antwortet auf Deutsch und Englisch (Sprache der Frage), komplett lokal.
 * `content`: Wissen aus dem Content-Layer (Projekte, Leistungen).
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
  const focusOptionsNext = useRef(false);
  const [lightbox, setLightbox] = useState<{
    images: GalleryImage[];
    index: number;
    lang: Locale;
  } | null>(null);

  const hasHistory = chat.messages.length > 0;
  const lastMessage = chat.messages.at(-1);
  const canSend = !chat.busy && question.trim().length > 0;
  /** Nur Themen mit Beschriftung in der jeweiligen Sprache taugen als Vorschlag */
  const labelled = (ids: string[], lang: Locale) =>
    ids.filter((id) => getTopic(id, content)?.[lang].label);

  // Neue Inhalte → Verlauf nach unten scrollen (nur DOM, kein State)
  useEffect(() => {
    const log = logRef.current;
    if (log) log.scrollTop = log.scrollHeight;
  }, [chat.messages, chat.open, chat.busy]);

  // Nach Klick auf einen Vorschlag den Fokus auf den ersten neuen Vorschlag setzen (Tastatur)
  useEffect(() => {
    if (!focusOptionsNext.current || chat.busy) return;
    focusOptionsNext.current = false;
    logRef.current
      ?.querySelector<HTMLButtonElement>("[data-options] button")
      ?.focus({ preventScroll: true });
  }, [chat.busy, chat.messages]);

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

  const askTopic = (id: string, lang: Locale) => {
    const topic = getTopic(id, content);
    if (!topic || chat.busy) return;
    focusOptionsNext.current = true;
    void chatStore.ask(topic[lang].q ?? topic[lang].label ?? id, {
      pageLocale: locale,
      topicId: id,
      lang,
      content,
    });
  };

  /** Antwort als Text verschicken (z. B. Auswahl in der geführten Anfrage) */
  const sendReply = (text: string, lang: Locale) => {
    if (chat.busy) return;
    focusOptionsNext.current = true;
    void chatStore.ask(text, { pageLocale: locale, lang, content });
  };

  const renderOptions = (options: MessageOptions) => {
    const ids = labelled(options.ids, options.lang);
    const replies = options.replies ?? [];
    if (ids.length === 0 && replies.length === 0) return null;
    return (
      <div
        className={styles.options}
        data-style={options.style}
        data-options
        role="group"
        aria-label={t.ask.suggestions}
      >
        {ids.map((id) => (
          <button
            key={id}
            type="button"
            className={styles.option}
            onClick={() => askTopic(id, options.lang)}
          >
            {getTopic(id, content)?.[options.lang].label}
            {options.style === "list" && (
              <Icon name="arrowRight" size={14} className={styles.optionIcon} />
            )}
          </button>
        ))}
        {replies.map((reply) => (
          <button
            key={reply}
            type="button"
            className={styles.option}
            onClick={() => sendReply(reply, options.lang)}
          >
            {reply}
            <Icon name="arrowRight" size={14} className={styles.optionIcon} />
          </button>
        ))}
      </div>
    );
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
                <Message
                  key={m.id}
                  message={m}
                  // Vorschläge nur unter der letzten Antwort, sobald sie fertig getippt ist
                  options={
                    m === lastMessage && !chat.busy && m.options ? renderOptions(m.options) : null
                  }
                  onOpenImage={(images, index, lang) => setLightbox({ images, index, lang })}
                />
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

        {/* Startvorschläge – im Fenster, solange noch nichts gefragt wurde */}
        {!hasHistory && (
          <div className={styles.starters}>
            {renderOptions({ ids: defaultChips, lang: locale, style: "chips" })}
          </div>
        )}

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

      {lightbox && (
        <Lightbox
          images={lightbox.images}
          index={lightbox.index}
          lang={lightbox.lang}
          onIndex={(index) => setLightbox({ ...lightbox, index })}
          onClose={() => setLightbox(null)}
        />
      )}
    </div>
  );
}

function Message({
  message,
  options,
  onOpenImage,
}: {
  message: ChatMessage;
  options: ReactNode;
  onOpenImage: (images: GalleryImage[], index: number, lang: Locale) => void;
}) {
  const t = useT();
  const isBot = message.from === "bot";
  const typing = message.visible < message.tokens.length;
  return (
    <div className={styles.message} data-from={message.from}>
      <div className={styles.row}>
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
      {message.gallery && !message.pending && !typing && (
        <MessageGallery gallery={message.gallery} onOpenImage={onOpenImage} />
      )}
      {options}
    </div>
  );
}

function MessageGallery({
  gallery,
  onOpenImage,
}: {
  gallery: NonNullable<ChatMessage["gallery"]>;
  onOpenImage: (images: GalleryImage[], index: number, lang: Locale) => void;
}) {
  const images = getGallery(gallery.id);
  return (
    <ChatGallery
      images={images}
      lang={gallery.lang}
      onOpen={(index) => onOpenImage(images, index, gallery.lang)}
    />
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
