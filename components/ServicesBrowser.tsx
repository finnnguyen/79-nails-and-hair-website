"use client";

import { useState, useTransition, type FormEvent } from "react";
import ServiceRow from "@/components/ServiceRow";
import { searchServicesByQuery } from "@/lib/actions/service-search";
import type { ServiceMatch } from "@/lib/actions/service-search-matching";
import {
  CATEGORY_LABELS,
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
      <form onSubmit={handleSearch} className="mb-10 border border-border bg-surface p-5">
        <label htmlFor="service-search" className="text-sm font-medium text-foreground">
          Not sure what to book?
        </label>
        <p className="mt-1 text-sm text-muted">
          Describe what you&apos;re after and we&apos;ll suggest services.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
        <input
          id="service-search"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder='e.g. "something relaxing under $40"'
          maxLength={200}
          className="min-w-[200px] flex-1 rounded-sm border border-border bg-background px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-muted/60 focus:border-foreground"
        />
        <button
          type="submit"
          disabled={isPending || !query.trim()}
          className="whitespace-nowrap rounded-sm bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-colors hover:bg-brand disabled:opacity-40"
        >
          {isPending ? "Searching…" : "Search"}
        </button>
        {matches !== null && (
          <button
            type="button"
            onClick={clearSearch}
            className="whitespace-nowrap rounded-sm border border-border px-4 py-2.5 text-sm text-muted hover:text-foreground"
          >
            Clear
          </button>
        )}
        </div>
      </form>

      {matches !== null && matches.length > 0 && (
        <div className="mb-12">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted">
            Suggested for you
          </p>
          <ul className="mt-2 divide-y divide-border">
            {matches.map(({ service, reason }) => (
              <ServiceRow key={service.id} service={service} subtitle={reason} />
            ))}
          </ul>
        </div>
      )}

      {searchNote && <p className="-mt-6 mb-10 text-sm text-muted">{searchNote}</p>}

      <div role="tablist" className="flex gap-8 overflow-x-auto border-b border-border">
        {SERVICE_CATEGORIES.map((category) => (
          <button
            key={category}
            type="button"
            role="tab"
            aria-selected={active === category}
            onClick={() => setActive(category)}
            className={`-mb-px whitespace-nowrap border-b-2 pb-3 text-sm font-medium transition-colors ${
              active === category
                ? "border-foreground text-foreground"
                : "border-transparent text-muted hover:text-foreground"
            }`}
          >
            {CATEGORY_LABELS[category]}
          </button>
        ))}
      </div>

      <ul className="mt-2 divide-y divide-border">
        {coreItems.map((service) => (
          <ServiceRow key={service.id} service={service} />
        ))}
      </ul>

      {addonItems.length > 0 && (
        <>
          <p className="mt-10 text-xs font-medium uppercase tracking-[0.16em] text-muted">
            Add-ons
          </p>
          <ul className="mt-2 divide-y divide-border">
            {addonItems.map((service) => (
              <ServiceRow key={service.id} service={service} />
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
