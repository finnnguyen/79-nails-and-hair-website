"use client";

import { useEffect, useState } from "react";
import { getOpenStatus, salonClock, type OpenStatus as Status } from "@/lib/open-status";

/** Live "Open now / Closed" indicator. Computed on the client so the
 * statically-rendered page doesn't freeze the status at build time. */
export default function OpenStatus({ className = "" }: { className?: string }) {
  const [status, setStatus] = useState<Status | null>(null);

  useEffect(() => {
    const update = () => {
      const { day, minutes } = salonClock(new Date());
      setStatus(getOpenStatus(day, minutes));
    };
    update();
    const id = setInterval(update, 60_000);
    return () => clearInterval(id);
  }, []);

  if (!status) return <span className={`invisible ${className}`}>&nbsp;</span>;

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span className="relative flex h-2 w-2">
        {status.open && (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60 motion-reduce:hidden" />
        )}
        <span
          className={`relative inline-flex h-2 w-2 rounded-full ${
            status.open ? "bg-emerald-500" : "bg-current opacity-40"
          }`}
        />
      </span>
      {status.open
        ? `Open now · until ${status.closesAt}`
        : `Closed · opens ${status.opensDay} ${status.opensAt}`}
    </span>
  );
}
