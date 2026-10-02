import type { ComponentProps, ReactNode } from "react";
import { Link } from "react-router";
import { Icon, type IconName } from "./Icon";
import styles from "./Button.module.css";

type Variant = "primary" | "secondary" | "ghost";

type CommonProps = {
  variant?: Variant;
  icon?: IconName | null;
  iconPosition?: "start" | "end";
  children: ReactNode;
  className?: string;
};

function Inner({
  icon,
  iconPosition,
  children,
}: Pick<CommonProps, "icon" | "iconPosition" | "children">) {
  return (
    <>
      {icon && iconPosition === "start" && <Icon name={icon} className={styles.icon} />}
      <span>{children}</span>
      {icon && iconPosition === "end" && <Icon name={icon} className={styles.icon} />}
    </>
  );
}

/** Interner Link im Button-Look. Für externe Links/mailto: <ButtonAnchor>. */
export function ButtonLink({
  variant = "secondary",
  icon = "arrowRight",
  iconPosition = "end",
  className,
  children,
  ...props
}: CommonProps & Omit<ComponentProps<typeof Link>, "children" | "className">) {
  return (
    <Link
      className={[styles.button, className].filter(Boolean).join(" ")}
      data-variant={variant}
      {...props}
    >
      <Inner icon={icon} iconPosition={iconPosition}>
        {children}
      </Inner>
    </Link>
  );
}

export function ButtonAnchor({
  variant = "secondary",
  icon = "arrowUpRight",
  iconPosition = "end",
  className,
  children,
  ...props
}: CommonProps & Omit<ComponentProps<"a">, "children" | "className">) {
  return (
    <a
      className={[styles.button, className].filter(Boolean).join(" ")}
      data-variant={variant}
      {...props}
    >
      <Inner icon={icon} iconPosition={iconPosition}>
        {children}
      </Inner>
    </a>
  );
}

export function Button({
  variant = "secondary",
  icon = null,
  iconPosition = "end",
  className,
  children,
  type = "button",
  ...props
}: CommonProps & Omit<ComponentProps<"button">, "children" | "className">) {
  return (
    <button
      type={type}
      className={[styles.button, className].filter(Boolean).join(" ")}
      data-variant={variant}
      {...props}
    >
      <Inner icon={icon} iconPosition={iconPosition}>
        {children}
      </Inner>
    </button>
  );
}
