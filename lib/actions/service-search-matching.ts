import type { Service } from "@/lib/services-data";

export type ServiceMatch = { service: Service; reason: string };

/** Filters the model's claimed matches down to services that actually exist in
 * the real catalog — defense in depth against a hallucinated or malformed id,
 * since nothing the model returns should be trusted blindly. Kept in its own
 * side-effect-free module so this safety property is unit-testable without
 * pulling in the Supabase client or making a network call. */
export function resolveMatches(
  rawMatches: { id: string; reason: string }[],
  catalog: Service[]
): ServiceMatch[] {
  const byId = new Map(catalog.map((s) => [s.id, s]));
  const resolved: ServiceMatch[] = [];
  for (const m of rawMatches) {
    const service = byId.get(m.id);
    if (service) resolved.push({ service, reason: m.reason });
  }
  return resolved;
}

/** Models sometimes wrap JSON in a markdown code fence despite being told not
 * to — strip it before parsing rather than failing the whole search. */
export function stripCodeFence(text: string): string {
  const trimmed = text.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
  return fenced ? fenced[1] : trimmed;
}
