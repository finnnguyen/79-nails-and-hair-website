"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { SERVICE_CATEGORIES, type Service } from "@/lib/services-data";
import {
  checkInWalkIn,
  assignWalkIn,
  cancelWalkIn,
  completeWalkIn,
  setStaffPresence,
  moveStaffUp,
  moveStaffDown,
  updateTurnPrice,
  deleteTurn,
  addManualTurn,
  type RotationEntry,
  type WaitingWalkIn,
  type CompletedTurn,
} from "@/lib/actions/rotation";

/** Formats a Date as the local "YYYY-MM-DDTHH:mm" a <input type="datetime-local"> expects. */
function toDatetimeLocalValue(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`;
}

function formatClock(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function AvailabilityBadge({ availability }: { availability: RotationEntry["availability"] }) {
  if (availability.status === "free") {
    return (
      <span className="rounded-full bg-brand-tint px-2 py-0.5 text-xs text-brand-dark">
        Free
      </span>
    );
  }
  if (availability.status === "appointment-soon") {
    return (
      <span className="rounded-full border border-border px-2 py-0.5 text-xs text-muted">
        Appt soon
      </span>
    );
  }
  return (
    <span className="rounded-full border border-border px-2 py-0.5 text-xs text-muted">
      Busy &middot; free {formatClock(availability.freeAt)}
    </span>
  );
}

export default function TurnBoard({
  services,
  initialRotation,
  initialQueue,
  initialTurns,
}: {
  services: Service[];
  initialRotation: RotationEntry[];
  initialQueue: WaitingWalkIn[];
  initialTurns: CompletedTurn[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  // Local, optimistically-updated copies — mutated instantly on click, then
  // reconciled with the server's version once it responds. This is what
  // makes the UI feel instant instead of waiting ~1-2s for a full re-fetch
  // (rotation + queue + availability + services) on every click.
  //
  // Synced from props during render (not an effect) — this is React's
  // documented pattern for "reset/adjust state when a prop changes":
  // https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
  const [prevInitialRotation, setPrevInitialRotation] = useState(initialRotation);
  const [rotation, setRotation] = useState(initialRotation);
  if (initialRotation !== prevInitialRotation) {
    setPrevInitialRotation(initialRotation);
    setRotation(initialRotation);
  }

  const [prevInitialQueue, setPrevInitialQueue] = useState(initialQueue);
  const [queue, setQueue] = useState(initialQueue);
  if (initialQueue !== prevInitialQueue) {
    setPrevInitialQueue(initialQueue);
    setQueue(initialQueue);
  }

  const [prevInitialTurns, setPrevInitialTurns] = useState(initialTurns);
  const [turns, setTurns] = useState(initialTurns);
  if (initialTurns !== prevInitialTurns) {
    setPrevInitialTurns(initialTurns);
    setTurns(initialTurns);
  }
  const [confirmDeleteTurnId, setConfirmDeleteTurnId] = useState<string | null>(null);

  // Add-turn form — for logging a turn that was completed without ever going
  // through check-in (e.g. missed at the time). completedAt lets it slot into
  // the right chronological spot in the log rather than always landing at top.
  const [showAddTurn, setShowAddTurn] = useState(false);
  const [addStaffId, setAddStaffId] = useState("");
  const [addCustomerName, setAddCustomerName] = useState("");
  const [addServiceName, setAddServiceName] = useState("");
  const [addPrice, setAddPrice] = useState(0);
  const [addCompletedAt, setAddCompletedAt] = useState("");

  const earningsByStaff = useMemo(() => {
    const byStaff = new Map<string, { staffId: string; name: string; turnCount: number; totalEarned: number }>();
    let total = 0;
    for (const t of turns) {
      if (!t.staffId || !t.staffName) continue;
      total += t.totalPrice;
      const existing = byStaff.get(t.staffId);
      if (existing) {
        existing.turnCount += 1;
        existing.totalEarned += t.totalPrice;
      } else {
        byStaff.set(t.staffId, {
          staffId: t.staffId,
          name: t.staffName,
          turnCount: 1,
          totalEarned: t.totalPrice,
        });
      }
    }
    const staff = Array.from(byStaff.values()).sort((a, b) => b.totalEarned - a.totalEarned);
    return { staff, total };
  }, [turns]);

  // Guards move-up/down specifically: each one reads the current DB order to
  // find a neighbor to swap with, so rapid re-clicks before the first swap
  // lands could race. Nothing else here touches shared ordering state, so
  // everything else stays unguarded/instant.
  const [movingIds, setMovingIds] = useState<Set<string>>(new Set());
  const tempIdCounter = useRef(0);

  const [customerName, setCustomerName] = useState("");
  const [serviceIds, setServiceIds] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState(SERVICE_CATEGORIES[0]);
  const [isRequest, setIsRequest] = useState(false);
  const [requestedStaffId, setRequestedStaffId] = useState<string>("");
  // Per-service price override — lets front desk key in the actual charge for
  // "starting at" services (nail art, color, etc.) instead of the list price.
  const [priceOverrides, setPriceOverrides] = useState<Record<string, number>>({});

  const selectedServices = useMemo(
    () => services.filter((s) => serviceIds.includes(s.id)),
    [services, serviceIds]
  );
  const selectedCategories = Array.from(new Set(selectedServices.map((s) => s.category)));
  const priceFor = (s: Service) => priceOverrides[s.id] ?? s.price;
  const totalPrice = selectedServices.reduce((sum, s) => sum + priceFor(s), 0);

  const eligibleStaff = (categories: string[]) =>
    rotation.filter((r) =>
      categories.every((c) => r.categories.includes(c as (typeof r.categories)[number]))
    );

  const toggleService = (id: string) => {
    setServiceIds((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));
  };

  // Silent background reconciliation — doesn't block or reset what's
  // already on screen, just picks up whatever changed server-side.
  const sync = () => startTransition(() => router.refresh());

  const swapRotation = (staffId: string, direction: "up" | "down") => {
    setRotation((prev) => {
      const index = prev.findIndex((r) => r.staffId === staffId);
      const neighborIndex = direction === "up" ? index - 1 : index + 1;
      if (index === -1 || neighborIndex < 0 || neighborIndex >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[neighborIndex]] = [next[neighborIndex], next[index]];
      return next;
    });
  };

  const handleCheckIn = async () => {
    if (selectedServices.length === 0) return;
    const durationMinutes = selectedServices.reduce((sum, s) => sum + s.durationMinutes, 0);
    const requestedStaff = rotation.find((r) => r.staffId === requestedStaffId);

    // Optimistic placeholder — swapped for the real row on next sync.
    const optimisticId = `pending-${tempIdCounter.current++}`;
    setQueue((prev) => [
      ...prev,
      {
        id: optimisticId,
        customerName: customerName || null,
        status: "waiting",
        requestedAt: new Date().toISOString(),
        startedAt: null,
        staffId: isRequest ? requestedStaffId || null : null,
        staffName: isRequest ? (requestedStaff?.name ?? null) : null,
        isRequest,
        totalPrice,
        durationMinutes,
        services: selectedServices.map((s) => s.name),
        categories: selectedCategories,
      },
    ]);
    setCustomerName("");
    setServiceIds([]);
    setIsRequest(false);
    setRequestedStaffId("");
    setPriceOverrides({});

    await checkInWalkIn({
      customerName,
      isRequest,
      requestedStaffId: isRequest && requestedStaffId ? requestedStaffId : null,
      services: selectedServices.map((s) => ({
        id: s.id,
        name: s.name,
        price: priceFor(s),
        durationMinutes: s.durationMinutes,
      })),
    });
    sync();
  };

  const handleAddTurn = async () => {
    const staff = rotation.find((r) => r.staffId === addStaffId);
    if (!staff || !addCompletedAt) return;
    const completedAtIso = new Date(addCompletedAt).toISOString();

    const optimisticTurn: CompletedTurn = {
      id: `pending-${tempIdCounter.current++}`,
      staffId: staff.staffId,
      staffName: staff.name,
      customerName: addCustomerName || null,
      services: [addServiceName || "Manual entry"],
      totalPrice: addPrice,
      isRequest: false,
      completedAt: completedAtIso,
    };
    setTurns((prev) =>
      [...prev, optimisticTurn].sort(
        (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
      )
    );
    setShowAddTurn(false);
    setAddStaffId("");
    setAddCustomerName("");
    setAddServiceName("");
    setAddPrice(0);

    await addManualTurn({
      staffId: staff.staffId,
      customerName: addCustomerName,
      serviceName: addServiceName,
      price: addPrice,
      completedAt: completedAtIso,
    });
    sync();
  };

  const categoryServices = services.filter((s) => s.category === activeCategory);
  const coreServices = categoryServices.filter((s) => !s.addon);
  const addonServices = categoryServices.filter((s) => s.addon);

  const renderServiceButton = (s: Service) => {
    const checked = serviceIds.includes(s.id);
    return (
      <li key={s.id}>
        <button
          type="button"
          onClick={() => toggleService(s.id)}
          className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-sm ${
            checked
              ? "border-brand bg-brand-tint"
              : "border-border bg-background hover:border-brand/40"
          }`}
        >
          <span className="text-foreground">{s.name}</span>
          <span className="text-xs text-muted">
            ${s.price}
            {s.startingAt && "+"} &middot; {s.durationMinutes}m
          </span>
        </button>
      </li>
    );
  };

  return (
    <div className="mt-8 flex flex-col gap-10">
      {/* Rotation board */}
      <section>
        <h2 className="font-display text-lg text-foreground">Staff Rotation</h2>
        <p className="mt-1 text-xs text-muted">Ordered next-up first.</p>
        <ul className="mt-4 flex flex-col gap-2">
          {rotation.map((r, i) => (
            <li
              key={r.staffId}
              className={`flex items-center justify-between rounded-xl border p-3 ${
                r.present ? "border-border bg-surface" : "border-border/50 bg-surface/50 opacity-60"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="flex flex-col">
                  <button
                    type="button"
                    disabled={i === 0 || movingIds.has(r.staffId)}
                    aria-label={`Move ${r.name} up`}
                    onClick={() => {
                      swapRotation(r.staffId, "up");
                      setMovingIds((prev) => new Set(prev).add(r.staffId));
                      startTransition(async () => {
                        await moveStaffUp(r.staffId);
                        setMovingIds((prev) => {
                          const next = new Set(prev);
                          next.delete(r.staffId);
                          return next;
                        });
                        sync();
                      });
                    }}
                    className="flex h-4 w-5 items-center justify-center text-muted hover:text-brand disabled:opacity-20"
                  >
                    &#9650;
                  </button>
                  <button
                    type="button"
                    disabled={i === rotation.length - 1 || movingIds.has(r.staffId)}
                    aria-label={`Move ${r.name} down`}
                    onClick={() => {
                      swapRotation(r.staffId, "down");
                      setMovingIds((prev) => new Set(prev).add(r.staffId));
                      startTransition(async () => {
                        await moveStaffDown(r.staffId);
                        setMovingIds((prev) => {
                          const next = new Set(prev);
                          next.delete(r.staffId);
                          return next;
                        });
                        sync();
                      });
                    }}
                    className="flex h-4 w-5 items-center justify-center text-muted hover:text-brand disabled:opacity-20"
                  >
                    &#9660;
                  </button>
                </div>
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-tint font-display text-sm text-brand">
                  {r.name.charAt(0)}
                </span>
                <div>
                  <p className="text-sm font-medium text-foreground">{r.name}</p>
                  <p className="text-xs text-muted">
                    {r.turnCredit.toFixed(2)} / 1.0 turn &middot; {r.categories.join(", ")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <AvailabilityBadge availability={r.availability} />
                <button
                  type="button"
                  onClick={() => {
                    const next = !r.present;
                    setRotation((prev) =>
                      prev.map((row) => (row.staffId === r.staffId ? { ...row, present: next } : row))
                    );
                    startTransition(async () => {
                      await setStaffPresence(r.staffId, next);
                      sync();
                    });
                  }}
                  className="rounded-full border border-border px-3 py-1 text-xs text-foreground hover:border-brand/40 disabled:opacity-50"
                >
                  {r.present ? "Mark Away" : "Mark Present"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Check-in */}
      <section className="rounded-2xl border border-border bg-surface p-5">
        <h2 className="font-display text-lg text-foreground">Check In Walk-In</h2>

        <input
          type="text"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          placeholder="Customer name (optional)"
          className="mt-4 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-brand"
        />

        <div className="mt-4 flex flex-wrap gap-2">
          {SERVICE_CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setActiveCategory(c)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                activeCategory === c
                  ? "bg-brand text-white"
                  : "border border-border text-foreground hover:border-brand/40"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <ul className="mt-3 grid gap-2 sm:grid-cols-2">{coreServices.map(renderServiceButton)}</ul>

        {addonServices.length > 0 && (
          <>
            <p className="mb-2 mt-4 text-xs font-medium uppercase tracking-wide text-muted">
              Add-ons
            </p>
            <ul className="grid gap-2 sm:grid-cols-2">{addonServices.map(renderServiceButton)}</ul>
          </>
        )}

        {selectedServices.length > 0 && (
          <ul className="mt-4 flex flex-col gap-2 rounded-lg border border-border bg-background p-3">
            {selectedServices.map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-3 text-sm">
                <span className="text-foreground">{s.name}</span>
                <label className="flex items-center gap-1 text-muted">
                  $
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={priceFor(s)}
                    onChange={(e) => {
                      const value = e.target.value === "" ? 0 : Number(e.target.value);
                      setPriceOverrides((prev) => ({ ...prev, [s.id]: value }));
                    }}
                    className="w-20 rounded-md border border-border bg-surface px-2 py-1 text-right text-foreground outline-none focus:border-brand"
                  />
                </label>
              </li>
            ))}
            <li className="flex items-center justify-between border-t border-border/70 pt-2 text-sm font-medium text-foreground">
              <span>Total</span>
              <span>${totalPrice}</span>
            </li>
          </ul>
        )}

        <div className="mt-4 flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              checked={isRequest}
              onChange={(e) => setIsRequest(e.target.checked)}
            />
            By request (specific stylist)
          </label>
          {isRequest && (
            <select
              value={requestedStaffId}
              onChange={(e) => setRequestedStaffId(e.target.value)}
              className="rounded-lg border border-border bg-background px-2 py-1.5 text-sm text-foreground"
            >
              <option value="">Choose stylist&hellip;</option>
              {(selectedCategories.length > 0
                ? eligibleStaff(selectedCategories)
                : rotation
              ).map((r) => (
                <option key={r.staffId} value={r.staffId}>
                  {r.name}
                </option>
              ))}
            </select>
          )}
        </div>

        <button
          type="button"
          disabled={selectedServices.length === 0 || (isRequest && !requestedStaffId)}
          onClick={() => startTransition(handleCheckIn)}
          className="mt-4 rounded-full bg-brand px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-40"
        >
          Check In
        </button>
      </section>

      {/* Waiting queue */}
      <section>
        <h2 className="font-display text-lg text-foreground">Queue</h2>
        {queue.length === 0 ? (
          <p className="mt-3 text-sm text-muted">No one waiting.</p>
        ) : (
          <ul className="mt-4 flex flex-col gap-3">
            {queue.map((w) => {
              const candidates = eligibleStaff(w.categories).filter((r) => r.present);
              return (
                <li key={w.id} className="rounded-xl border border-border bg-surface p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {w.customerName || "Walk-in"}{" "}
                        {w.isRequest && (
                          <span className="ml-1 rounded-full bg-gold-tint px-2 py-0.5 text-xs text-brand-dark">
                            By request
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-muted">
                        {w.services.join(", ")} &middot; ${w.totalPrice} &middot;{" "}
                        {w.durationMinutes} min
                      </p>
                      <p className="mt-1 text-xs text-muted">
                        Arrived {formatClock(w.requestedAt)}
                        {w.status === "in_progress" &&
                          w.staffName &&
                          ` · with ${w.staffName} since ${w.startedAt ? formatClock(w.startedAt) : ""}`}
                      </p>
                    </div>

                    <div className="flex shrink-0 flex-col items-end gap-2">
                      {w.status === "waiting" ? (
                        <button
                          type="button"
                          onClick={() => {
                            setQueue((prev) => prev.filter((row) => row.id !== w.id));
                            startTransition(async () => {
                              await cancelWalkIn(w.id);
                              sync();
                            });
                          }}
                          className="text-xs text-red-600 hover:underline"
                        >
                          Cancel
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setQueue((prev) => prev.filter((row) => row.id !== w.id));
                            startTransition(async () => {
                              await completeWalkIn(w.id);
                              sync();
                            });
                          }}
                          className="rounded-full bg-brand px-4 py-1.5 text-xs font-medium text-white hover:bg-brand-dark disabled:opacity-50"
                        >
                          Complete
                        </button>
                      )}
                    </div>
                  </div>

                  {w.status === "waiting" && !w.isRequest && (
                    <div className="mt-3 flex flex-wrap gap-2 border-t border-border/70 pt-3">
                      {candidates.length === 0 ? (
                        <p className="text-xs text-muted">
                          No present staff qualified for this service.
                        </p>
                      ) : (
                        candidates.map((r) => (
                          <button
                            key={r.staffId}
                            type="button"
                            onClick={() => {
                              setQueue((prev) =>
                                prev.map((row) =>
                                  row.id === w.id
                                    ? {
                                        ...row,
                                        status: "in_progress",
                                        staffId: r.staffId,
                                        staffName: r.name,
                                        startedAt: new Date().toISOString(),
                                      }
                                    : row
                                )
                              );
                              startTransition(async () => {
                                await assignWalkIn(w.id, r.staffId);
                                sync();
                              });
                            }}
                            className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs text-foreground hover:border-brand/40 disabled:opacity-50"
                          >
                            {r.name}
                            <span className="text-muted">
                              {r.availability.status === "free" ? "free" : "busy"}
                            </span>
                          </button>
                        ))
                      )}
                    </div>
                  )}

                  {w.status === "waiting" && w.isRequest && w.staffId && (
                    <div className="mt-3 border-t border-border/70 pt-3">
                      <button
                        type="button"
                        onClick={() => {
                          const staffId = w.staffId!;
                          const staffName = w.staffName;
                          setQueue((prev) =>
                            prev.map((row) =>
                              row.id === w.id
                                ? {
                                    ...row,
                                    status: "in_progress",
                                    staffId,
                                    staffName,
                                    startedAt: new Date().toISOString(),
                                  }
                                : row
                            )
                          );
                          startTransition(async () => {
                            await assignWalkIn(w.id, staffId);
                            sync();
                          });
                        }}
                        className="rounded-full bg-brand px-4 py-1.5 text-xs font-medium text-white hover:bg-brand-dark disabled:opacity-50"
                      >
                        Start with {w.staffName}
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Daily earnings */}
      <section>
        <h2 className="font-display text-lg text-foreground">Today&apos;s Earnings</h2>
        <p className="mt-1 text-xs text-muted">Completed walk-ins, updated as turns finish.</p>
        {earningsByStaff.staff.length === 0 ? (
          <p className="mt-3 text-sm text-muted">No completed turns yet today.</p>
        ) : (
          <ul className="mt-4 flex flex-col gap-2 rounded-xl border border-border bg-surface p-4">
            {earningsByStaff.staff.map((e) => (
              <li key={e.staffId} className="flex items-center justify-between text-sm">
                <span className="text-foreground">
                  {e.name}{" "}
                  <span className="text-xs text-muted">
                    &middot; {e.turnCount} {e.turnCount === 1 ? "turn" : "turns"}
                  </span>
                </span>
                <span className="font-medium text-foreground">${e.totalEarned}</span>
              </li>
            ))}
            <li className="flex items-center justify-between border-t border-border/70 pt-2 text-sm font-medium text-foreground">
              <span>Total</span>
              <span>${earningsByStaff.total}</span>
            </li>
          </ul>
        )}
      </section>

      {/* Per-turn audit log */}
      <section>
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-lg text-foreground">Today&apos;s Turns</h2>
            <p className="mt-1 text-xs text-muted">
              Every completed walk-in, most recent first — fix a total here, delete an entry that
              was logged wrong, or add one that was missed. This doesn&apos;t touch turn credit or
              queue order — use Move Up/Down for that.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setAddCompletedAt(toDatetimeLocalValue(new Date()));
              setShowAddTurn((prev) => !prev);
            }}
            className="shrink-0 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:border-brand/40"
          >
            {showAddTurn ? "Cancel" : "+ Add Turn"}
          </button>
        </div>

        {showAddTurn && (
          <div className="mt-4 flex flex-col gap-3 rounded-xl border border-border bg-surface p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-1 text-xs text-muted">
                Staff
                <select
                  value={addStaffId}
                  onChange={(e) => setAddStaffId(e.target.value)}
                  className="rounded-lg border border-border bg-background px-2 py-1.5 text-sm text-foreground"
                >
                  <option value="">Choose stylist&hellip;</option>
                  {rotation.map((r) => (
                    <option key={r.staffId} value={r.staffId}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1 text-xs text-muted">
                Completed at
                <input
                  type="datetime-local"
                  value={addCompletedAt}
                  onChange={(e) => setAddCompletedAt(e.target.value)}
                  className="rounded-lg border border-border bg-background px-2 py-1.5 text-sm text-foreground"
                />
              </label>
              <label className="flex flex-col gap-1 text-xs text-muted">
                Customer name (optional)
                <input
                  type="text"
                  value={addCustomerName}
                  onChange={(e) => setAddCustomerName(e.target.value)}
                  className="rounded-lg border border-border bg-background px-2 py-1.5 text-sm text-foreground outline-none focus:border-brand"
                />
              </label>
              <label className="flex flex-col gap-1 text-xs text-muted">
                Service
                <input
                  type="text"
                  value={addServiceName}
                  onChange={(e) => setAddServiceName(e.target.value)}
                  placeholder="e.g. Manicure"
                  className="rounded-lg border border-border bg-background px-2 py-1.5 text-sm text-foreground outline-none focus:border-brand"
                />
              </label>
              <label className="flex flex-col gap-1 text-xs text-muted">
                Price
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={addPrice}
                  onChange={(e) =>
                    setAddPrice(e.target.value === "" ? 0 : Number(e.target.value))
                  }
                  className="rounded-lg border border-border bg-background px-2 py-1.5 text-sm text-foreground outline-none focus:border-brand"
                />
              </label>
            </div>
            <button
              type="button"
              disabled={!addStaffId || !addServiceName || addPrice <= 0}
              onClick={() => startTransition(handleAddTurn)}
              className="self-start rounded-full bg-brand px-5 py-1.5 text-sm font-medium text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-40"
            >
              Add Turn
            </button>
          </div>
        )}

        {turns.length === 0 ? (
          <p className="mt-3 text-sm text-muted">No completed turns yet today.</p>
        ) : (
          <ul className="mt-4 flex flex-col gap-2">
            {turns.map((t) => (
              <li
                key={t.id}
                className="flex items-center justify-between gap-4 rounded-lg border border-border bg-surface px-4 py-2.5 text-sm"
              >
                <div className="min-w-0">
                  <p className="text-foreground">
                    {formatClock(t.completedAt)} &middot;{" "}
                    <span className="font-medium">{t.staffName ?? "Unassigned"}</span>
                    {t.isRequest && (
                      <span className="ml-1 rounded-full bg-gold-tint px-2 py-0.5 text-xs text-brand-dark">
                        By request
                      </span>
                    )}
                  </p>
                  <p className="truncate text-xs text-muted">
                    {t.customerName || "Walk-in"} &middot; {t.services.join(", ")}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-3">
                  <label className="flex items-center gap-1 text-muted">
                    $
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      value={t.totalPrice}
                      onChange={(e) => {
                        const value = e.target.value === "" ? 0 : Number(e.target.value);
                        setTurns((prev) =>
                          prev.map((row) => (row.id === t.id ? { ...row, totalPrice: value } : row))
                        );
                      }}
                      onBlur={(e) => {
                        const value = e.target.value === "" ? 0 : Number(e.target.value);
                        startTransition(async () => {
                          await updateTurnPrice(t.id, value);
                          sync();
                        });
                      }}
                      className="w-20 rounded-md border border-border bg-background px-2 py-1 text-right text-foreground outline-none focus:border-brand"
                    />
                  </label>

                  {confirmDeleteTurnId === t.id ? (
                    <span className="flex items-center gap-2 text-xs">
                      <span className="text-muted">Delete?</span>
                      <button
                        type="button"
                        onClick={() => {
                          setTurns((prev) => prev.filter((row) => row.id !== t.id));
                          setConfirmDeleteTurnId(null);
                          startTransition(async () => {
                            await deleteTurn(t.id);
                            sync();
                          });
                        }}
                        className="font-medium text-red-600 hover:underline"
                      >
                        Confirm
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteTurnId(null)}
                        className="text-muted hover:underline"
                      >
                        Cancel
                      </button>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteTurnId(t.id)}
                      className="text-xs text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {pending && (
        <div className="fixed bottom-4 left-4 rounded-full bg-foreground/80 px-3 py-1 text-xs text-background">
          Syncing&hellip;
        </div>
      )}
    </div>
  );
}
