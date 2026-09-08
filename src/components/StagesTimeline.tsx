"use client";

import { useEffect, useState } from "react";
import {
  formatStageRange,
  getStageStatus,
  type TicketStage,
} from "@/config/event";

type Props = {
  stages: TicketStage[];
};

export function StagesTimeline({ stages }: Props) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <ol className="stages-list mx-auto max-w-3xl space-y-0">
      {stages.map((stage) => {
        const status = getStageStatus(stage, now);

        return (
          <li
            key={stage.id}
            className={`stage-item relative border-l-2 pl-6 pb-10 last:pb-0 ${
              status === "current"
                ? "border-[var(--gold)]"
                : "border-[var(--pine-line)]"
            }`}
          >
            <span
              className={`absolute -left-[7px] top-1 h-3 w-3 rounded-full ${
                status === "current"
                  ? "bg-[var(--gold)] shadow-[0_0_12px_rgba(201,162,39,0.55)]"
                  : status === "past"
                    ? "bg-[var(--pine-line)]"
                    : "bg-[var(--crimson)]"
              }`}
              aria-hidden="true"
            />

            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h3
                className={`font-display text-2xl sm:text-3xl ${
                  status === "past"
                    ? "text-[var(--mist)]"
                    : "text-[var(--ivory)]"
                }`}
              >
                {stage.name}
              </h3>
              <span className="font-display text-xl text-[var(--gold)]">
                {stage.price}
              </span>
              {status === "current" && (
                <span className="stage-badge text-[0.65rem] uppercase tracking-[0.18em] text-[var(--evergreen-deep)]">
                  On sale now
                </span>
              )}
              {status === "past" && (
                <span className="text-[0.65rem] uppercase tracking-[0.18em] text-[var(--mist)]">
                  Closed
                </span>
              )}
              {status === "upcoming" && (
                <span className="text-[0.65rem] uppercase tracking-[0.18em] text-[var(--crimson-soft)]">
                  Coming up
                </span>
              )}
            </div>

            <p className="mt-1 text-sm text-[var(--mist)]">
              {formatStageRange(stage.startsAt, stage.endsAt)}
            </p>
            <p
              className={`mt-3 max-w-xl text-base leading-relaxed ${
                status === "past" ? "text-[var(--mist)]" : "text-[var(--ivory-soft)]"
              }`}
            >
              {stage.description}
            </p>
            <ul className="mt-4 space-y-1.5">
              {stage.prizes.map((prize) => (
                <li
                  key={prize}
                  className="flex items-start gap-2 text-sm text-[var(--ivory-soft)]"
                >
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[var(--gold)]" />
                  {prize}
                </li>
              ))}
            </ul>
          </li>
        );
      })}
    </ol>
  );
}
