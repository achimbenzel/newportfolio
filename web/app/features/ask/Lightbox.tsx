import { useEffect, useRef, type PointerEvent } from "react";
import { Icon } from "~/components/ui/Icon";
import { useT } from "~/i18n";
import type { Locale } from "~/i18n/config";
import type { GalleryImage } from "./galleries";
import styles from "./Lightbox.module.css";

/**
 * Vergrößerte Bildansicht als natives <dialog> (Fokus bleibt im Dialog, Esc schließt).
 * Bedienung: Pfeiltasten, Buttons, Wischen auf dem Handy, Klick neben das Bild schließt.
 */
export function Lightbox({
  images,
  index,
  lang,
  onIndex,
  onClose,
}: {
  images: GalleryImage[];
  index: number;
  lang: Locale;
  onIndex: (index: number) => void;
  onClose: () => void;
}) {
  const t = useT();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const swipeStart = useRef<number | null>(null);
  const image = images[index];
  const count = images.length;
  const go = (step: number) => onIndex((index + step + count) % count);

  // Öffnen beim Einblenden. Kein close() beim Aufräumen: React führt Effekte im Dev-Modus
  // doppelt aus – ein close() dort würde die Ansicht sofort wieder schließen. Wird die
  // Komponente entfernt, verschwindet das <dialog> ohnehin mit.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  if (!image) return null;

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowRight") go(1);
    if (event.key === "ArrowLeft") go(-1);
  };
  const onPointerDown = (event: PointerEvent) => {
    swipeStart.current = event.pointerType === "mouse" ? null : event.clientX;
  };
  const onPointerUp = (event: PointerEvent) => {
    if (swipeStart.current === null) return;
    const delta = event.clientX - swipeStart.current;
    swipeStart.current = null;
    if (Math.abs(delta) > 50) go(delta < 0 ? 1 : -1);
  };

  return (
    // Klick auf den Hintergrund (= das <dialog> selbst) schließt
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- Esc/Buttons sind die Tastatur-Alternative
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-label={t.ask.imageDialog}
      // nur reagieren, wenn der Dialog wirklich zu ist (nicht bei einem Close/Open-Paar)
      onClose={() => !dialogRef.current?.open && onClose()}
      onKeyDown={onKeyDown}
      onClick={(event) => event.target === event.currentTarget && dialogRef.current?.close()}
    >
      <figure className={styles.figure} onPointerDown={onPointerDown} onPointerUp={onPointerUp}>
        <img
          key={image.full}
          src={image.full}
          alt={image.alt[lang]}
          width={image.width}
          height={image.height}
          className={styles.image}
        />
        <figcaption className={styles.caption}>
          {image.alt[lang]}
          <span className={styles.counter}>
            {t.ask.imageCounter.replace("{n}", String(index + 1)).replace("{total}", String(count))}
          </span>
        </figcaption>
      </figure>

      <button
        type="button"
        className={`${styles.button} ${styles.close}`}
        onClick={() => dialogRef.current?.close()}
        aria-label={t.ask.closeImage}
      >
        <Icon name="close" size={20} />
      </button>
      {count > 1 && (
        <>
          <button
            type="button"
            className={`${styles.button} ${styles.prev}`}
            onClick={() => go(-1)}
            aria-label={t.ask.prevImage}
          >
            <Icon name="arrowLeft" size={20} />
          </button>
          <button
            type="button"
            className={`${styles.button} ${styles.next}`}
            onClick={() => go(1)}
            aria-label={t.ask.nextImage}
          >
            <Icon name="arrowRight" size={20} />
          </button>
        </>
      )}
    </dialog>
  );
}
