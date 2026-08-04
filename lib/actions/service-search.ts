"use server";

import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { getServices } from "@/lib/services-data";
import { checkRateLimit } from "@/lib/rate-limit";
import {
  resolveMatches,
  stripCodeFence,
  type ServiceMatch,
} from "@/lib/actions/service-search-matching";

const queryInputSchema = z.object({
  query: z.string().trim().min(3, "Tell us a bit more").max(200),
});

const modelResponseSchema = z.object({
  matches: z
    .array(
      z.object({
        id: z.string(),
        reason: z.string().max(200),
      })
    )
    .max(5),
});

export type ServiceSearchResult =
  | { success: true; matches: ServiceMatch[] }
  | { success: false; error: string };

const UNAVAILABLE_ERROR = "Search is temporarily unavailable — browse services below.";

export async function searchServicesByQuery(rawQuery: string): Promise<ServiceSearchResult> {
  const parsed = queryInputSchema.safeParse({ query: rawQuery });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid search" };
  }

  const allowed = await checkRateLimit("service-search", { maxCount: 10, windowMinutes: 10 });
  if (!allowed) {
    return { success: false, error: "Too many searches — please try again in a bit." };
  }

  const catalog = await getServices();
  const catalogForModel = catalog.map((s) => ({
    id: s.id,
    name: s.name,
    category: s.category,
    price: s.price,
    note: s.note ?? null,
    durationMinutes: s.durationMinutes,
  }));

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  let raw: string;
  try {
    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      system:
        "You match a salon customer's request to real services from the provided catalog. " +
        "You MUST only return ids that appear in the catalog below — never invent a service or id. " +
        "Return at most the 5 BEST matches, ranked by relevance — not every loosely related service. " +
        "If nothing genuinely matches, return an empty matches array. " +
        'Respond with ONLY valid JSON, no markdown code fence: {"matches": [{"id": string, "reason": string}]}. ' +
        "reason is a short (under 15 words) plain-English explanation of why this service fits the request.",
      messages: [
        {
          role: "user",
          content: `Catalog:\n${JSON.stringify(catalogForModel)}\n\nCustomer request: "${parsed.data.query}"`,
        },
      ],
    });
    const block = response.content.find((b) => b.type === "text");
    raw = block && block.type === "text" ? block.text : "";
  } catch (error) {
    console.error("Service search model call failed:", error);
    return { success: false, error: UNAVAILABLE_ERROR };
  }

  let modelJson: unknown;
  try {
    modelJson = JSON.parse(stripCodeFence(raw));
  } catch {
    console.error("Service search model returned non-JSON output:", raw);
    return { success: false, error: UNAVAILABLE_ERROR };
  }

  const parsedModel = modelResponseSchema.safeParse(modelJson);
  if (!parsedModel.success) {
    console.error("Service search model output failed schema validation:", parsedModel.error);
    return { success: false, error: UNAVAILABLE_ERROR };
  }

  return { success: true, matches: resolveMatches(parsedModel.data.matches, catalog) };
}
