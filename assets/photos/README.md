# Fotos (Originale)

Hier liegen **Original-Fotos**, die auf der Website verwendet werden. Sie werden **nicht**
ausgeliefert – die Website nutzt nur die aufbereiteten Versionen aus `web/public/images/`.

```
assets/photos/
  <album>/                  z. B. japan-2024
    originals/              Originale, Dateiname = Reihenfolge + Motiv (01-kyoto-tempel.jpg)
```

Aufbereiten: `npm run photos` (verkleinert, WebP, richtig gedreht, **ohne Metadaten/GPS**).
Alternativtexte DE/EN: `web/app/features/ask/galleries.ts`. Anleitung: `docs/10-anleitungen.md`.

> Hinweis: Einige Handy-Originale enthalten GPS-Standortdaten. Die Web-Versionen sind davon
> bereinigt; die Originale hier bleiben unverändert (nur im Repository, nicht auf der Website).
