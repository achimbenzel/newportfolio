import { useRef, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";
import { LOGO_MARK_PATH } from "~/components/brand/Logo";
import { Container } from "~/components/ui/Container";
import { Eyebrow } from "~/components/ui/Eyebrow";
import { Icon } from "~/components/ui/Icon";
import { AskWidget } from "~/features/ask";
import { useT } from "~/i18n";
import styles from "./Hero.module.css";

/**
 * Startseiten-Hero: Headline + „Frag Achim“-Widget, rechts die Bildmarke
 * als pseudo-3D-Objekt (reines SVG + CSS, reagiert auf die Maus).
 * Platzhalter für ein späteres echtes 3D-Modell (siehe docs/08-roadmap.md).
 */
export function Hero({ scrollTarget }: { scrollTarget: string }) {
  const t = useT();
  const visualRef = useRef<HTMLDivElement>(null);
  const words = t.hero.title.split(" ");

  // Neigung direkt per CSS-Variable – kein React-Render pro Mausbewegung
  const tilt = (event: ReactPointerEvent<HTMLElement>) => {
    const el = visualRef.current;
    if (!el || event.pointerType !== "mouse") return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    el.style.setProperty("--rx", `${(-y * 16).toFixed(2)}deg`);
    el.style.setProperty("--ry", `${(x * 22).toFixed(2)}deg`);
  };
  const resetTilt = () => {
    visualRef.current?.style.setProperty("--rx", "0deg");
    visualRef.current?.style.setProperty("--ry", "0deg");
  };

  return (
    <section
      className={styles.hero}
      aria-labelledby="hero-title"
      onPointerMove={tilt}
      onPointerLeave={resetTilt}
    >
      <div className={styles.backdrop} aria-hidden="true" />

      <Container className={styles.inner}>
        <div className={styles.content}>
          <div className={styles.fadeIn} style={{ "--d": "0.2s" } as CSSProperties}>
            <Eyebrow>{t.hero.eyebrow}</Eyebrow>
          </div>
          <h1 id="hero-title" className={styles.title}>
            {words.map((word, index) => (
              <span key={index}>
                <span className={styles.word} style={{ "--i": index } as CSSProperties}>
                  {word}
                </span>{" "}
              </span>
            ))}
          </h1>
          <p
            className={`${styles.lead} ${styles.fadeIn}`}
            style={{ "--d": "0.75s" } as CSSProperties}
          >
            {t.hero.lead}
          </p>
          <div
            className={`${styles.ask} ${styles.fadeIn}`}
            style={{ "--d": "0.95s" } as CSSProperties}
          >
            <AskWidget />
          </div>
        </div>

        <div ref={visualRef} className={styles.visual} aria-hidden="true">
          <div className={styles.float}>
            <HeroMark />
          </div>
        </div>
      </Container>

      <a href={scrollTarget} className={styles.scrollHint}>
        <span>{t.hero.scroll}</span>
        <span className={styles.scrollIcon}>
          <Icon name="arrowDown" size={14} />
        </span>
      </a>
    </section>
  );
}

const DEPTH = 16;

function HeroMark() {
  return (
    <svg viewBox="-80 -80 1240 1240" className={styles.mark}>
      <defs>
        <path id="hero-mark-shape" d={LOGO_MARK_PATH} />
        <linearGradient id="hero-mark-face" x1="0.1" y1="0" x2="0.9" y2="1">
          <stop offset="0" stopColor="#9be0ff" />
          <stop offset="0.3" stopColor="#2fb4c9" />
          <stop offset="0.7" stopColor="#007588" />
          <stop offset="1" stopColor="#003f4a" />
        </linearGradient>
        <linearGradient id="hero-mark-side" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#0b3f4b" />
          <stop offset="1" stopColor="#021317" />
        </linearGradient>
        <linearGradient id="hero-mark-shine" x1="0" y1="0" x2="0.8" y2="0.8">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.7" />
          <stop offset="0.45" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="hero-mark-glow">
          <stop offset="0" stopColor="#1fa3b8" stopOpacity="0.45" />
          <stop offset="1" stopColor="#1fa3b8" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="540" cy="560" r="600" fill="url(#hero-mark-glow)" />
      {/* Extrusion: gestapelte, versetzte Kopien ergeben die „Tiefe“ */}
      {Array.from({ length: DEPTH }, (_, i) => {
        const step = DEPTH - i;
        return (
          <use
            key={i}
            href="#hero-mark-shape"
            fill="url(#hero-mark-side)"
            transform={`translate(${step * 1.5} ${step * 2.1})`}
          />
        );
      })}
      <use href="#hero-mark-shape" fill="url(#hero-mark-face)" />
      <use href="#hero-mark-shape" fill="url(#hero-mark-shine)" opacity="0.35" />
      <use
        href="#hero-mark-shape"
        fill="none"
        stroke="#ffffff"
        strokeOpacity="0.35"
        strokeWidth="2.5"
      />
    </svg>
  );
}
