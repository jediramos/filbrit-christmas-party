"use client";

import { useEffect, useState } from "react";
import { getCountdownParts, type CountdownParts } from "@/lib/countdown";

type Props = {
  targetIso: string;
};

function Unit({ value, label }: { value: number; label: string }) {
  return (
    <div className="countdown-unit flex min-w-[4.25rem] flex-col items-center sm:min-w-[5rem]">
      <span className="font-display text-3xl font-semibold tabular-nums tracking-tight text-[var(--gold)] sm:text-5xl">
        {String(value).padStart(2, "0")}
      </span>
      <span className="mt-1 text-[0.65rem] uppercase tracking-[0.2em] text-[var(--mist)] sm:text-xs">
        {label}
      </span>
    </div>
  );
}

export function CountdownTimer({ targetIso }: Props) {
  const [parts, setParts] = useState<CountdownParts>(() =>
    getCountdownParts(targetIso),
  );

  useEffect(() => {
    const id = window.setInterval(
      () => setParts(getCountdownParts(targetIso)),
      1000,
    );
    return () => window.clearInterval(id);
  }, [targetIso]);

  if (parts.expired) {
    return (
      <p className="font-display text-2xl text-[var(--gold)] sm:text-3xl">
        The party has begun — see you on the dance floor.
      </p>
    );
  }

  return (
    <div
      className="flex justify-center gap-3 sm:gap-6"
      role="timer"
      aria-live="polite"
      aria-label={`${parts.days} days, ${parts.hours} hours, ${parts.minutes} minutes, ${parts.seconds} seconds until the event`}
    >
      <Unit value={parts.days} label="Days" />
      <span className="self-start pt-1 font-display text-3xl text-[var(--gold-dim)] sm:pt-2 sm:text-5xl">
        :
      </span>
      <Unit value={parts.hours} label="Hours" />
      <span className="self-start pt-1 font-display text-3xl text-[var(--gold-dim)] sm:pt-2 sm:text-5xl">
        :
      </span>
      <Unit value={parts.minutes} label="Mins" />
      <span className="self-start pt-1 font-display text-3xl text-[var(--gold-dim)] sm:pt-2 sm:text-5xl">
        :
      </span>
      <Unit value={parts.seconds} label="Secs" />
    </div>
  );
}
