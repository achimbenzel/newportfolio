import { existsSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Server-/Build-seitige Umgebungsvariablen. Nur in *.server.ts importieren!
 * Liest `web/.env` (falls vorhanden) – bereits gesetzte Variablen (z. B. aus
 * der CI/Deploy-Umgebung) haben Vorrang.
 */
const envFile = resolve(process.cwd(), ".env");
if (existsSync(envFile)) process.loadEnvFile(envFile);

export const env = {
  sanity: {
    projectId: process.env.SANITY_PROJECT_ID?.trim() ?? "",
    dataset: process.env.SANITY_DATASET?.trim() || "production",
    apiVersion: process.env.SANITY_API_VERSION?.trim() || "2026-10-01",
    token: process.env.SANITY_READ_TOKEN?.trim() || undefined,
  },
} as const;

export const isSanityConfigured = env.sanity.projectId.length > 0;
