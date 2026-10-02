import type { CSSProperties } from "react";
import { useT } from "~/i18n";
import type { Locale } from "~/i18n/config";
import type { GalleryImage } from "./galleries";
import styles from "./ChatGallery.module.css";

/** Vorschaubilder unter einer Chat-Antwort – Klick öffnet die Vergrößerung (Lightbox). */
export function ChatGallery({
  images,
  lang,
  onOpen,
}: {
  images: GalleryImage[];
  lang: Locale;
  onOpen: (index: number) => void;
}) {
  const t = useT();
  return (
    <ul className={styles.grid} role="list" aria-label={t.ask.photos}>
      {images.map((image, index) => (
        <li key={image.thumb} style={{ "--i": index } as CSSProperties}>
          <button
            type="button"
            className={styles.thumb}
            onClick={() => onOpen(index)}
            aria-label={`${t.ask.enlarge}: ${image.alt[lang]}`}
          >
            <img
              src={image.thumb}
              alt=""
              width={image.width}
              height={image.height}
              loading="lazy"
              decoding="async"
            />
          </button>
        </li>
      ))}
    </ul>
  );
}
