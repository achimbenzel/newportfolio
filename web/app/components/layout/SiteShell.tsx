import type { ReactNode } from "react";
import { CookieBanner } from "~/features/consent";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { SkipLink } from "./SkipLink";
import styles from "./SiteShell.module.css";

/** Gemeinsamer Rahmen aller Seiten: Skip-Link, Consent-Banner, Header, Inhalt, Footer. */
export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <>
      <SkipLink />
      <CookieBanner />
      <Header />
      <main id="main" tabIndex={-1} className={styles.main}>
        {children}
      </main>
      <Footer />
    </>
  );
}
