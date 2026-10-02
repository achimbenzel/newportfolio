import { createClient, type QueryParams } from "@sanity/client";
// ⚠️ Wird (indirekt) von react-router.config.ts geladen → nur RELATIVE Imports.
import { env, isSanityConfigured } from "../env.server";

/**
 * Sanity-Client – läuft NUR beim Build (Prerendering) bzw. im Dev-Server.
 * Besucher der Website sprechen nie mit Sanity (DSGVO, Performance).
 */
const client = isSanityConfigured
  ? createClient({
      projectId: env.sanity.projectId,
      dataset: env.sanity.dataset,
      apiVersion: env.sanity.apiVersion,
      token: env.sanity.token,
      useCdn: false,
      perspective: "published",
    })
  : null;

/** Führt eine GROQ-Abfrage aus. Gibt `null` zurück, wenn Sanity nicht konfiguriert ist. */
export async function sanityFetch<T>(query: string, params: QueryParams = {}): Promise<T | null> {
  if (!client) return null;
  return client.fetch<T>(query, params);
}

export { isSanityConfigured };
