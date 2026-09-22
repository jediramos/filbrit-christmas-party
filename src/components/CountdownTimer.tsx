"use client";

import { useEffect, useRef, useState } from "react";
import { getCountdownParts, type CountdownParts } from "@/lib/countdown";

type Props = {
  targetIso: string;
};

function Unit({ value, label }: { value: number; label: string }) {
  const display = String(Math.max(0, value)).padStart(2, "0");

  return (
    <div className="countdown-unit flex min-w-[4.25rem] flex-col items-center sm:min-w-[5rem]">
      <span
        key={display}
        className="countdown-digit-reel font-display text-3xl font-semibold tabular-nums tracking-tight text-[var(--gold)] sm:text-5xl"
      >
        {display}
      </span>
      <span className="mt-1 text-[0.65rem] uppercase tracking-[0.2em] text-[var(--mist)] sm:text-xs">
        {label}
      </span>
    </div>
  );
}

function Separator() {
  return (
    <span
      className="countdown-separator self-start pt-1 font-display text-3xl text-[var(--gold-dim)] sm:pt-2 sm:text-5xl"
      aria-hidden="true"
    >
      :
    </span>
  );
}

export function CountdownTimer({ targetIso }: Props) {
  const [parts, setParts] = useState<CountdownParts>(() =>
    getCountdownParts(targetIso),
  );
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const clear = () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };

    const tick = () => {
      setParts(getCountdownParts(targetIso));
      // Align to the next whole second so the timer does not drift.
      const msToNextSecond = 1000 - (Date.now() % 1000);
      timeoutRef.current = window.setTimeout(tick, Math.max(16, msToNextSecond));
    };

    tick();
    return clear;
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
      <Separator />
      <Unit value={parts.hours} label="Hours" />
      <Separator />
      <Unit value={parts.minutes} label="Mins" />
      <Separator />
      <Unit value={parts.seconds} label="Secs" />
    </div>
  );
}
