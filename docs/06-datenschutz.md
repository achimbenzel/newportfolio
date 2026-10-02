# 06 – Datenschutz (DSGVO / TDDDG)

> Kein Rechtsrat. Diese Seite beschreibt, **wie die Technik gebaut ist**, damit die Website
> datensparsam ist. Impressum und Datenschutzerklärung müssen vor dem Livegang fachkundig erstellt
> bzw. geprüft werden (z. B. Generator eines Anwalts/Verbands oder Anwalt).

## Leitlinie

**Der Browser des Besuchers verbindet sich nur mit unserem eigenen Server.**

| Thema             | Umsetzung                                                                                                      |
| ----------------- | -------------------------------------------------------------------------------------------------------------- |
| Schriften         | DM Sans & JetBrains Mono liegen lokal in `web/public/fonts` – keine Google-Fonts-Anfrage                       |
| Bilder aus Sanity | beim Build heruntergeladen, ausgeliefert unter `/media/…` – keine Anfrage an `cdn.sanity.io`                   |
| Inhalte (CMS)     | werden beim Build geholt – Besucher sprechen nie mit Sanity                                                    |
| Skripte/CSS       | nur eigene, gebündelte Dateien – kein CDN                                                                      |
| Tracking          | keins                                                                                                          |
| Ask-Widget        | antwortet lokal im Browser, speichert nichts (nur Arbeitsspeicher, weg nach Neuladen)                          |
| Videos            | nur nach Einwilligung bzw. Klick (`ConsentGate`), YouTube über `youtube-nocookie.com`, Vimeo mit `dnt=1`       |
| Hosting           | statische Dateien auf eigenem Server in Deutschland                                                            |
| Social & WhatsApp | reine Links (Footer, Chat) – erst der Klick verbindet mit LinkedIn, Instagram, Behance, Pinterest, X, WhatsApp |

## Cookie-/Consent-Banner

Eigene Umsetzung ohne Fremdanbieter (`web/app/features/consent/`).

- **Erste Ebene:** „Nur notwendige“ und „Alle akzeptieren“ – **gleich groß, gleich gestaltet**,
  dazu „Einstellungen“. Keine vorausgewählten Häkchen.
- **Einstellungen:** pro Kategorie ein Schalter; „Notwendig“ ist immer aktiv.
- **Widerruf:** jederzeit über „Cookie-Einstellungen“ im Footer.
- **Speicherung der Auswahl:** `localStorage` (`ab-consent`, mit Version & Datum) – technisch
  notwendig, keine Cookies.
- **Versionierung:** `CONSENT_VERSION` in `config.ts` erhöhen → alle Besucher werden neu gefragt.
- Der Banner erscheint **nur, wenn es optionale Kategorien gibt**. Aktuell: „Externe Medien“
  (Vimeo/YouTube in Projekten).

### Externe Inhalte einbinden (Zwei-Klick-Lösung)

```tsx
<ConsentGate category="media" provider="Vimeo">
  <iframe src="https://player.vimeo.com/video/123?dnt=1" title="…" />
</ConsentGate>
```

Ohne Einwilligung erscheint ein Platzhalter mit „Inhalt laden“ (einmalig) oder „Externe Medien
immer erlauben“.

### Neuen Dienst hinzufügen (z. B. Statistik)

1. Prüfen, ob es eine datensparsame Alternative ohne Einwilligung gibt (z. B. serverseitige,
   cookielose Statistik auf eigenem Server).
2. Kategorie in `features/consent/config.ts` ergänzen (Texte DE/EN).
3. Dienst nur laden, wenn `useConsent().has("<kategorie>")` wahr ist.
4. `CONSENT_VERSION` erhöhen.
5. Datenschutzerklärung ergänzen.

## Sanity

Sanity verarbeitet nur Redaktionsdaten (Login, Inhalte) – keine Besucherdaten, da die Website zur
Build-Zeit abfragt. Für das Redaktionskonto den Auftragsverarbeitungsvertrag (DPA) von Sanity
abschließen und in der Datenschutzerklärung nennen, falls erforderlich.

## Kontakt über WhatsApp, Instagram- und X-DMs

Die Website verlinkt WhatsApp (`config/site.ts → whatsapp`) und die Social-Profile nur – es werden
keine Skripte oder Widgets dieser Dienste geladen. Schreibt jemand über WhatsApp oder per DM,
verarbeiten aber Meta bzw. X die Daten (auch in den USA).

Wichtig: „Wer über WhatsApp schreibt, ist automatisch einverstanden“ reicht nach DSGVO allein
nicht. Nötig ist ein **Abschnitt in der Datenschutzerklärung** (Kontakt per WhatsApp/Instagram/X:
Zweck, Rechtsgrundlage – meist Art. 6 Abs. 1 lit. b bzw. f DSGVO –, Übermittlung an Meta/X,
Drittlandtransfer, Speicherdauer, Link zu deren Datenschutzhinweisen). Der Chat weist bei der
Frage nach Datenschutz darauf hin (Thema `privacy`). Rechtliche Formulierung: Generator oder Anwalt.

## Checkliste vor dem Livegang

- [ ] **Impressum** (§ 5 DDG) unter `/de/imprint` und `/en/imprint`
- [ ] **Datenschutzerklärung** unter `/de/privacy` und `/en/privacy` (Hosting, Server-Logs,
      Kontaktformular, Consent, Vimeo/YouTube, **Kontakt per WhatsApp/Instagram/X**, Social-Links,
      ggf. Sanity, ggf. KI-Backend des Ask-Widgets)
- [ ] AV-Vertrag mit dem Hoster
- [ ] Server-Logs: Speicherdauer festlegen (IP-Adressen kürzen/kurz halten)
- [ ] `Content-Security-Policy` im nginx ergänzen (siehe unten)
- [ ] Kontaktformular: Versand über eigenen Server/deutschen Anbieter, Einwilligungs-Hinweis, kein Speichern ohne Grund
- [ ] Prüfen, dass im Netzwerk-Tab des Browsers **keine fremde Domain** auftaucht

### Content-Security-Policy (Vorschlag, vor Livegang testen)

React Router schreibt ein kleines Inline-Skript in jede Seite; daher (noch) `'unsafe-inline'` für Skripte:

```
default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';
img-src 'self' data:; font-src 'self'; connect-src 'self';
frame-src https://player.vimeo.com https://www.youtube-nocookie.com; frame-ancestors 'self';
base-uri 'self'; form-action 'self'
```
