import type { ComponentProps, ElementType } from "react";
import styles from "./Container.module.css";

/** Begrenzt die Inhaltsbreite und setzt die seitlichen Ränder (--gutter). */
export function Container<T extends ElementType = "div">({
  as,
  size = "wide",
  className,
  ...props
}: { as?: T; size?: "wide" | "narrow" } & ComponentProps<T>) {
  const Component = as ?? "div";
  return (
    <Component
      className={[styles.container, className].filter(Boolean).join(" ")}
      data-size={size}
      {...props}
    />
  );
}
