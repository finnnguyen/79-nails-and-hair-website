"use client";

import { useState, useTransition, type FormEvent } from "react";
import ServiceRow from "@/components/ServiceRow";
import { searchServicesByQuery } from "@/lib/actions/service-search";
import type { ServiceMatch } from "@/lib/actions/service-search-matching";
import {
  SERVICE_CATEGORIES,
  type Service,
  type ServiceCategory,
} from "@/lib/services-data";

export default function ServicesBrowser({
  services,
}: {
  services: Service[];
}) {
  const [active, setActive] = useState<ServiceCategory>(
    SERVICE_CATEGORIES[0]
  );
  const [query, setQuery] = useState("");
  const [matches, setMatches] = useState<ServiceMatch[] | null>(null);
  const [searchNote, setSearchNote] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const items = services.filter((s) => s.category === active);
  const coreItems = items.filter((s) => !s.addon);
  const addonItems = items.filter((s) => s.addon);

  function handleSearch(e: FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setSearchNote(null);
    startTransition(async () => {
      const result = await searchServicesByQuery(query);
      if (result.success) {
        setMatches(result.matches);
        setSearchNote(result.matches.length === 0 ? "No close matches — try browsing below." : null);
      } else {
        setMatches(null);
        setSearchNote(result.error);
      }
    });
  }

  function clearSearch() {
    setQuery("");
    setMatches(null);
    setSearchNote(null);
  }

  return (
    <div>
      <form onSubmit={handleSearch} className="mb-6 flex flex-wrap gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder='Describe what you&apos;re looking for — e.g. "something relaxing under $40"'
          maxLength={200}
          className="min-w-[240px] flex-1 rounded-full border border-border bg-surface px-4 py-2 text-sm focus:border-brand focus:outline-none"
        />
        <button
          type="submit"
          disabled={isPending || !query.trim()}
          className="whitespace-nowrap rounded-full bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand/90 disabled:opacity-50"
        >
          {isPending ? "Searching…" : "Search"}
        </button>
        {matches !== null && (
          <button
            type="button"
            onClick={clearSearch}
            className="whitespace-nowrap rounded-full border border-border px-4 py-2 text-sm text-muted hover:text-foreground"
          >
            Clear
          </button>
        )}
      </form>

      {matches !== null && matches.length > 0 && (
        <div className="mb-8">
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted">
            Matched for you
          </p>
          <ul className="divide-y divide-border/70">
            {matches.map(({ service, reason }) => (
              <ServiceRow key={service.id} service={service} subtitle={reason} />
            ))}
          </ul>
        </div>
      )}

      {searchNote && <p className="mb-6 text-sm text-muted">{searchNote}</p>}

      <div className="flex flex-wrap gap-2">
        {SERVICE_CATEGORIES.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => setActive(category)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              active === category
                ? "bg-brand text-white"
                : "border border-border bg-surface text-foreground hover:border-brand/40 hover:text-brand"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      <ul className="mt-8 divide-y divide-border/70">
        {coreItems.map((service) => (
          <ServiceRow key={service.id} service={service} />
        ))}
      </ul>

      {addonItems.length > 0 && (
        <>
          <p className="mb-1 mt-8 text-xs font-medium uppercase tracking-wide text-muted">
            Add-ons
          </p>
          <ul className="divide-y divide-border/70">
            {addonItems.map((service) => (
              <ServiceRow key={service.id} service={service} />
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
