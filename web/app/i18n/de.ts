/**
 * UI-Texte Deutsch (Navigation, Buttons, Labels, Banner …).
 * Redaktionelle Inhalte (Projekte, Leistungstexte) kommen aus Sanity – nicht hierher!
 * Struktur von `de` ist die Vorlage: `en.ts` muss exakt dieselben Schlüssel haben.
 */
export const de = {
  meta: {
    siteTitle: "Achim Benzel – Branding, Grafik, Motion & 3D",
    siteDescription:
      "Achim Benzel ist freiberuflicher Designer für Branding, Grafik, Motion Design und 3D. Ein Ansprechpartner – von der ersten Skizze bis zum finalen Design.",
  },
  a11y: {
    skipToContent: "Zum Inhalt springen",
    mainNav: "Hauptnavigation",
    footerNav: "Fußzeilennavigation",
    homeLink: "Achim Benzel – zur Startseite",
    openMenu: "Menü öffnen",
    closeMenu: "Menü schließen",
    languageSwitch: "Sprache wählen",
    newTab: "(öffnet in neuem Tab)",
  },
  nav: {
    services: "Leistungen",
    work: "Projekte",
    about: "Über mich",
    contact: "Kontakt",
  },
  services: {
    branding: {
      title: "Brand & Logo Design",
      teaser: "Logo, Typo, Farbe & Bildwelt als ein System.",
    },
    "motion-design": { title: "Motion Design", teaser: "Animation, die aus der Marke entsteht." },
    "music-visuals": { title: "Music & Visuals", teaser: "Cover, Visualizer & Künstleridentität." },
  },
  hero: {
    /** nur für Screenreader & Suchmaschinen (unsichtbare H1 der Startseite) */
    title: "Achim Benzel – freiberuflicher Designer für Branding, Grafik, Motion und 3D",
  },
  ask: {
    title: "Frag Achim",
    label: "Frag Achim etwas",
    placeholder: "Frag Achim etwas …",
    submit: "Fragen",
    reset: "Neuer Chat",
    close: "Schließen",
    show: "Verlauf anzeigen",
    assistant: "Assistent",
    you: "Du",
    bot: "Achim",
    suggestions: "Vorschläge",
    thinking: "Achim tippt …",
    enlarge: "Bild vergrößern",
    imageDialog: "Bildansicht",
    closeImage: "Bild schließen",
    prevImage: "Vorheriges Bild",
    nextImage: "Nächstes Bild",
    imageCounter: "Bild {n} von {total}",
    photos: "Fotos",
  },
  work: {
    title: "Projekte",
    intro: "Eine Auswahl aktueller Arbeiten aus Branding, Grafik, Motion und 3D.",
    empty: "Hier erscheinen bald Projekte.",
  },
  project: {
    back: "Zurück",
    client: "Kunde",
    year: "Jahr",
    scope: "Umfang",
    industry: "Branche",
    software: "Software",
    next: "Nächstes Projekt",
  },
  service: {
    process: "Ablauf",
    cta: "Projekt anfragen",
  },
  placeholder: {
    comingSoon: "Inhalt folgt",
    note: "Diese Seite ist Teil des Prototyps – Inhalte werden später über Sanity gepflegt.",
  },
  contact: {
    title: "Kontakt",
    intro: "Erzähl mir von deinem Projekt – ich melde mich zeitnah bei dir.",
    emailLabel: "E-Mail",
    formComing: "Das Kontaktformular folgt in einem späteren Schritt.",
  },
  footer: {
    ctaTitle: "Lass uns zusammen etwas gestalten.",
    ctaButton: "Kontakt aufnehmen",
    pages: "Seiten",
    legal: "Rechtliches",
    imprint: "Impressum",
    privacy: "Datenschutz",
    social: "Social Media",
    cookieSettings: "Cookie-Einstellungen",
    rights: "Alle Rechte vorbehalten.",
  },
  legal: {
    imprintTitle: "Impressum",
    privacyTitle: "Datenschutzerklärung",
    placeholder:
      "Platzhalter – der rechtsverbindliche Text wird vor dem Livegang ergänzt. Die Seite darf so nicht veröffentlicht werden.",
  },
  consent: {
    title: "Datenschutz-Einstellungen",
    text: "Diese Website verwendet nur technisch notwendige Speicherungen. Externe Inhalte (z. B. Videos von Vimeo oder YouTube) laden wir erst, wenn du zustimmst. Deine Wahl kannst du jederzeit unten auf der Seite unter „Cookie-Einstellungen“ ändern.",
    privacyLink: "Datenschutzerklärung",
    acceptAll: "Alle akzeptieren",
    rejectAll: "Nur notwendige",
    settings: "Einstellungen",
    save: "Auswahl speichern",
    back: "Zurück",
    alwaysOn: "Immer aktiv",
    gateText:
      "Hier wird ein externer Inhalt geladen. Dabei werden Daten an den Anbieter übertragen.",
    gateButton: "Inhalt laden",
    gateAlways: "Externe Medien immer erlauben",
  },
  notFound: {
    eyebrow: "Fehler 404",
    title: "Seite nicht gefunden",
    text: "Die Seite existiert nicht (mehr). Vielleicht hilft dir einer dieser Links weiter.",
    home: "Zur Startseite",
  },
  error: {
    title: "Etwas ist schiefgelaufen",
    text: "Bitte lade die Seite neu oder versuche es später noch einmal.",
  },
};

export type Dictionary = typeof de;
