/**
 * Auswertung der unbeantworteten Chat-Fragen:  npm run ask:report -- <pfad/zu/ask-log.jsonl>
 *
 * Zeigt, welche Fragen der Chat nicht (sicher) beantworten konnte – gruppiert und nach
 * Häufigkeit sortiert. Damit dann Beispielfragen/Themen in knowledge.ts ergänzen
 * (am einfachsten mit Claude und dem Skill „frag-achim-wissen“).
 */
import { readFile } from "node:fs/promises";

const file = process.argv[2] ?? "ask-log.jsonl";
const lines = (await readFile(file, "utf8")).split("\n").filter(Boolean);
const groups = new Map();
for (const line of lines) {
  try {
    const { date, lang, kind, q } = JSON.parse(line);
    const key = q
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s]/gu, "")
      .replace(/\s+/g, " ")
      .trim();
    const group = groups.get(key) ?? { q, lang, kinds: new Set(), count: 0, last: date };
    group.count++;
    group.kinds.add(kind);
    group.last = date > group.last ? date : group.last;
    groups.set(key, group);
  } catch {
    // kaputte Zeile überspringen
  }
}
const sorted = [...groups.values()].sort((a, b) => b.count - a.count);
console.log(`${lines.length} Einträge, ${sorted.length} verschiedene Fragen\n`);
for (const g of sorted) {
  console.log(
    `${String(g.count).padStart(4)}×  [${g.lang}] ${g.q}   (${[...g.kinds].join(", ")}, zuletzt ${g.last})`,
  );
}
