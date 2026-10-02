import type { ProjectBlock } from "~/content/types";
import type { Img } from "~/content/types";
import { ConsentGate } from "~/features/consent";
import styles from "./ProjectBlocks.module.css";

/**
 * Rendert die Inhaltsblöcke eines Projekts (aus Sanity).
 * Neuer Blocktyp → Typ in content/types.ts, Mapping in content/projects.server.ts,
 * Schema im Studio und Darstellung hier ergänzen.
 */
export function ProjectBlocks({ blocks }: { blocks: ProjectBlock[] }) {
  if (blocks.length === 0) return null;
  return (
    <div className={styles.blocks}>
      {blocks.map((block) => {
        switch (block.type) {
          case "image":
            return (
              <figure key={block.key} className={styles.figure} data-reveal>
                <Picture image={block.image} sizes="100vw" />
                {block.caption && (
                  <figcaption className={styles.caption}>{block.caption}</figcaption>
                )}
              </figure>
            );
          case "imageGrid":
            return (
              <div key={block.key} className={styles.grid} data-reveal>
                {block.images.map((image) => (
                  <Picture key={image.src} image={image} sizes="(max-width: 760px) 100vw, 50vw" />
                ))}
              </div>
            );
          case "text":
            return (
              <div key={block.key} className={styles.text} data-align={block.align} data-reveal>
                {block.heading && <h2 className={styles.heading}>{block.heading}</h2>}
                <div className={styles.body}>
                  {block.body.split(/\n{2,}/).map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              </div>
            );
          case "video":
            return (
              <div key={block.key} className={styles.video} data-reveal>
                <ConsentGate
                  category="media"
                  provider={block.provider === "youtube" ? "YouTube" : "Vimeo"}
                >
                  <iframe
                    src={
                      block.provider === "youtube"
                        ? `https://www.youtube-nocookie.com/embed/${block.videoId}`
                        : `https://player.vimeo.com/video/${block.videoId}?dnt=1`
                    }
                    title={block.title}
                    allow="autoplay; fullscreen; picture-in-picture"
                    loading="lazy"
                  />
                </ConsentGate>
              </div>
            );
        }
      })}
    </div>
  );
}

function Picture({ image, sizes }: { image: Img; sizes: string }) {
  return (
    <img
      className={styles.image}
      src={image.src}
      srcSet={image.srcSet}
      sizes={sizes}
      alt={image.alt}
      width={image.width}
      height={image.height}
      loading="lazy"
      decoding="async"
    />
  );
}
