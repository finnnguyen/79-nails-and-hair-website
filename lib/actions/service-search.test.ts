import { describe, expect, it } from "vitest";
import { resolveMatches, stripCodeFence } from "./service-search-matching";
import type { Service } from "@/lib/services-data";

const catalog: Service[] = [
  { id: "svc_1", name: "Classic Manicure", category: "Nail Services", price: 25, durationMinutes: 30 },
  { id: "svc_2", name: "Deep Tissue Massage", category: "Facial Services", price: 60, durationMinutes: 45 },
];

describe("resolveMatches", () => {
  it("keeps a match whose id exists in the real catalog", () => {
    const result = resolveMatches([{ id: "svc_1", reason: "Affordable classic option" }], catalog);
    expect(result).toEqual([{ service: catalog[0], reason: "Affordable classic option" }]);
  });

  it("drops any id the model invented that isn't in the real catalog", () => {
    const result = resolveMatches(
      [
        { id: "svc_1", reason: "real" },
        { id: "svc_does_not_exist", reason: "hallucinated" },
      ],
      catalog
    );
    expect(result).toEqual([{ service: catalog[0], reason: "real" }]);
  });

  it("returns an empty array when nothing matches", () => {
    expect(resolveMatches([], catalog)).toEqual([]);
  });

  it("returns an empty array when every claimed id is fake", () => {
    const result = resolveMatches([{ id: "not_real", reason: "hallucinated" }], catalog);
    expect(result).toEqual([]);
  });
});

describe("stripCodeFence", () => {
  it("strips a ```json ... ``` fence the model wrapped its response in", () => {
    const wrapped = '```json\n{"matches": []}\n```';
    expect(stripCodeFence(wrapped)).toBe('{"matches": []}');
  });

  it("strips a plain ``` fence with no language tag", () => {
    const wrapped = '```\n{"matches": []}\n```';
    expect(stripCodeFence(wrapped)).toBe('{"matches": []}');
  });

  it("leaves unfenced JSON unchanged", () => {
    expect(stripCodeFence('{"matches": []}')).toBe('{"matches": []}');
  });
});
