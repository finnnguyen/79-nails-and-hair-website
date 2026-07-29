"use client";

import { useEffect, useMemo, useState } from "react";
import {
  SERVICE_CATEGORIES,
  type Service,
  type ServiceCategory,
} from "@/lib/services-data";
import { type Staff } from "@/lib/staff-data";
import { getAvailability } from "@/lib/booking-availability";
import CalendarPicker from "@/components/CalendarPicker";
import { submitBooking } from "@/lib/actions/booking";
import { getBookedSlots, type BookedSlot } from "@/lib/actions/availability";

const STEPS = ["Service", "Staff", "Date & Time", "Your Info"] as const;

type Props = {
  services: Service[];
  staff: Staff[];
  initialServiceId?: string;
  initialStaffId?: string;
  initialCategory?: ServiceCategory;
};

export default function BookingWizard({
  services,
  staff,
  initialServiceId,
  initialStaffId,
  initialCategory,
}: Props) {
  const initialService = services.find((s) => s.id === initialServiceId);

  const [step, setStep] = useState(0);
  const [activeCategory, setActiveCategory] = useState<ServiceCategory>(
    initialService?.category ?? initialCategory ?? SERVICE_CATEGORIES[0]
  );
  const [serviceIds, setServiceIds] = useState<string[]>(
    initialService ? [initialService.id] : []
  );
  const [staffId, setStaffId] = useState<string | null>(
    initialStaffId ?? null
  );
  const [date, setDate] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [bookedSlots, setBookedSlots] = useState<BookedSlot[]>([]);

  const baseAvailability = useMemo(() => getAvailability(), []);

  // Refresh already-taken slots whenever the selected staff member changes.
  useEffect(() => {
    if (!staffId) return;
    let cancelled = false;
    getBookedSlots(staffId)
      .then((slots) => {
        if (!cancelled) setBookedSlots(slots);
      })
      .catch(() => {
        if (!cancelled) setBookedSlots([]);
      });
    return () => {
      cancelled = true;
    };
  }, [staffId]);

  const availability = useMemo(() => {
    const taken = new Set(bookedSlots.map((b) => `${b.date}|${b.time}`));
    return baseAvailability
      .map((day) => ({
        ...day,
        times: day.times.filter((t) => !taken.has(`${day.date}|${t}`)),
      }))
      .filter((day) => day.times.length > 0);
  }, [baseAvailability, bookedSlots]);

  const toggleService = (id: string) => {
    setServiceIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const selectedServices = services.filter((s) => serviceIds.includes(s.id));
  const selectedCategories = Array.from(
    new Set(selectedServices.map((s) => s.category))
  );
  const total = selectedServices.reduce((sum, s) => sum + s.price, 0);
  const hasStartingAt = selectedServices.some((s) => s.startingAt);

  const categoryServices = services.filter((s) => s.category === activeCategory);
  const coreServices = categoryServices.filter((s) => !s.addon);
  const addonServices = categoryServices.filter((s) => s.addon);

  const renderServiceOption = (s: Service) => {
    const checked = serviceIds.includes(s.id);
    return (
      <li key={s.id}>
        <button
          type="button"
          onClick={() => toggleService(s.id)}
          aria-pressed={checked}
          className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left transition-colors ${
            checked
              ? "border-brand bg-brand-tint"
              : "border-border bg-surface hover:border-brand/40"
          }`}
        >
          <span
            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
              checked ? "border-brand bg-brand text-white" : "border-border"
            }`}
          >
            {checked && (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={3}
                className="h-3 w-3"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </span>
          <span className="flex-1 text-foreground">{s.name}</span>
          <span className="whitespace-nowrap font-display text-brand">
            ${s.price}
            {s.startingAt && "+"}
          </span>
        </button>
      </li>
    );
  };

  const eligibleStaff =
    selectedCategories.length > 0
      ? staff.filter((member) =>
          selectedCategories.every((category) =>
            member.categories.includes(category)
          )
        )
      : [];
  const selectedStaff = eligibleStaff.find((s) => s.id === staffId) ?? null;
  const selectedDay = availability.find((d) => d.date === date) ?? null;

  const canContinue =
    (step === 0 && selectedServices.length > 0) ||
    (step === 1 && !!selectedStaff) ||
    (step === 2 && !!date && !!time) ||
    (step === 3 &&
      name.trim() !== "" &&
      (phone.trim() !== "" || email.trim() !== ""));

  const goNext = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const goBack = () => setStep((s) => Math.max(s - 1, 0));

  if (submitted) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-10 text-center">
        <h2 className="font-display text-2xl text-foreground">
          Request received!
        </h2>
        <p className="mt-3 text-muted">
          We&apos;ll reach you {phone && `at ${phone}`}
          {phone && email && " or "}
          {email && `at ${email}`} to confirm your appointment with{" "}
          {selectedStaff?.name} on {selectedDay?.label} at {time}:
        </p>
        <ul className="mx-auto mt-4 max-w-xs text-left text-sm text-foreground">
          {selectedServices.map((s) => (
            <li key={s.id} className="flex justify-between py-1">
              <span>{s.name}</span>
              <span className="text-brand">
                ${s.price}
                {s.startingAt && "+"}
              </span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-4xl text-foreground md:text-5xl">
        Book an Appointment
      </h1>
      <p className="mt-3 text-muted">
        Pick a service, choose your stylist, and grab a time.
      </p>

      <ol className="mb-10 mt-10 flex flex-wrap gap-2 text-sm">
        {STEPS.map((label, i) => (
          <li
            key={label}
            className={`flex items-center gap-2 rounded-full px-4 py-2 ${
              i === step
                ? "bg-brand text-white"
                : i < step
                  ? "bg-brand-tint text-brand-dark"
                  : "border border-border text-muted"
            }`}
          >
            <span className="font-medium">{i + 1}</span>
            {label}
          </li>
        ))}
      </ol>

      {step === 0 && (
        <div>
          <div className="flex flex-wrap gap-2">
            {SERVICE_CATEGORIES.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  activeCategory === category
                    ? "bg-brand text-white"
                    : "border border-border bg-surface text-foreground hover:border-brand/40 hover:text-brand"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {coreServices.map(renderServiceOption)}
          </ul>

          {addonServices.length > 0 && (
            <>
              <p className="mb-3 mt-8 text-xs font-medium uppercase tracking-wide text-muted">
                Add-ons
              </p>
              <ul className="grid gap-3 sm:grid-cols-2">
                {addonServices.map(renderServiceOption)}
              </ul>
            </>
          )}

          {selectedServices.length > 0 && (
            <div className="mt-8 rounded-xl border border-border bg-surface p-4">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-medium text-foreground">
                  {selectedServices.length} service
                  {selectedServices.length > 1 && "s"} selected
                </p>
                <p className="font-display text-lg text-brand">
                  {hasStartingAt && "from "}${total}
                </p>
              </div>
              <ul className="flex flex-wrap gap-1.5">
                {selectedServices.map((s) => (
                  <li key={s.id}>
                    <button
                      type="button"
                      onClick={() => toggleService(s.id)}
                      className="flex items-center gap-1.5 rounded-full bg-brand-tint px-3 py-1 text-xs text-brand-dark hover:bg-gold-tint"
                    >
                      {s.name}
                      <span aria-hidden>&times;</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {step === 1 && selectedServices.length > 0 && (
        <div>
          <p className="mb-6 text-sm text-muted">
            Staff available for {selectedServices.map((s) => s.name).join(", ")}
          </p>
          {eligibleStaff.length === 0 ? (
            <p className="rounded-xl border border-border bg-surface p-4 text-sm text-muted">
              No single staff member covers all selected services — try
              splitting this into separate visits, or remove a service.
            </p>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2">
              {eligibleStaff.map((member) => (
                <li key={member.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setStaffId(member.id);
                      setDate(null);
                      setTime(null);
                    }}
                    className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-colors ${
                      staffId === member.id
                        ? "border-brand bg-brand-tint"
                        : "border-border bg-surface hover:border-brand/40"
                    }`}
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-tint font-display text-lg text-brand">
                      {member.name.charAt(0)}
                    </span>
                    <span>
                      <span className="block text-foreground">
                        {member.name}
                      </span>
                      <span className="block text-sm text-muted">
                        {member.role}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {step === 2 && (
        <div className="grid gap-8 md:grid-cols-[auto_1fr] md:items-start">
          <CalendarPicker
            availability={availability}
            selectedDate={date}
            onSelect={(d) => {
              setDate(d);
              setTime(null);
            }}
          />

          <div>
            {selectedDay ? (
              <>
                <p className="mb-3 text-sm text-muted">
                  Available times &middot;{" "}
                  <span className="text-foreground">{selectedDay.label}</span>
                </p>
                <div className="flex max-h-80 flex-col gap-1.5 overflow-y-auto pr-1">
                  {selectedDay.times.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTime(t)}
                      className={`rounded-lg px-4 py-2.5 text-left text-sm transition-colors ${
                        time === t
                          ? "bg-brand text-white"
                          : "border border-border bg-surface text-foreground hover:border-brand/40"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted">
                Pick a date to see available times
              </p>
            )}
          </div>
        </div>
      )}

      {step === 3 && (
        <div>
          <div className="mb-8 rounded-xl border border-border bg-brand-tint/40 p-4 text-sm">
            <ul>
              {selectedServices.map((s) => (
                <li key={s.id} className="flex justify-between text-foreground">
                  <span>{s.name}</span>
                  <span className="text-brand">
                    ${s.price}
                    {s.startingAt && "+"}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-muted">
              with {selectedStaff?.name} &middot; {selectedDay?.label} at{" "}
              {time}
            </p>
            <p className="mt-2 flex justify-between border-t border-border/70 pt-2 font-medium text-foreground">
              <span>Total</span>
              <span>
                {hasStartingAt && "from "}${total}
              </span>
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5 text-sm sm:col-span-2">
              <span className="text-foreground">Name</span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-lg border border-border bg-surface px-3 py-2.5 text-foreground outline-none focus:border-brand"
                placeholder="Jane Doe"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="text-foreground">Phone</span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="rounded-lg border border-border bg-surface px-3 py-2.5 text-foreground outline-none focus:border-brand"
                placeholder="(714) 555-0179"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="text-foreground">Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-lg border border-border bg-surface px-3 py-2.5 text-foreground outline-none focus:border-brand"
                placeholder="jane@email.com"
              />
            </label>
            <p className="text-xs text-muted sm:col-span-2">
              Phone or email — at least one so we can confirm your booking.
            </p>
          </div>
        </div>
      )}

      <div className="mt-10 flex justify-between">
        <button
          type="button"
          onClick={goBack}
          disabled={step === 0}
          className="rounded-full px-6 py-2.5 text-sm font-medium text-foreground disabled:opacity-0"
        >
          Back
        </button>
        {step < STEPS.length - 1 ? (
          <button
            type="button"
            onClick={goNext}
            disabled={!canContinue}
            className="rounded-full bg-brand px-7 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-40"
          >
            Continue
          </button>
        ) : (
          <button
            type="button"
            onClick={async () => {
              if (!selectedStaff || !date || !time) return;
              setSubmitting(true);
              setSubmitError(null);
              const result = await submitBooking({
                name,
                email,
                phone,
                staffId: selectedStaff.id,
                staffName: selectedStaff.name,
                date,
                time,
                services: selectedServices.map((s) => ({
                  id: s.id,
                  name: s.name,
                  price: s.price,
                })),
              });
              setSubmitting(false);
              if (result.success) {
                setSubmitted(true);
              } else {
                setSubmitError(
                  result.slotTaken
                    ? result.error
                    : `Something went wrong: ${result.error}. Please try again.`
                );
                if (result.slotTaken && staffId) {
                  setTime(null);
                  setStep(2);
                  getBookedSlots(staffId)
                    .then(setBookedSlots)
                    .catch(() => setBookedSlots([]));
                }
              }
            }}
            disabled={!canContinue || submitting}
            className="rounded-full bg-brand px-7 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-40"
          >
            {submitting ? "Booking…" : "Confirm Booking"}
          </button>
        )}
      </div>

      {submitError && (
        <p className="mt-4 text-right text-sm text-red-600">{submitError}</p>
      )}
    </div>
  );
}
