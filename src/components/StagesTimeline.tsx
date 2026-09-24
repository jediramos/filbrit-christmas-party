"use client";

import { useEffect, useState } from "react";
import {
  enforceUpcomingStageLocks,
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
    <ol className="stages-list w-full min-w-0 max-w-full space-y-0 text-left">
      {stages.map((stage) => {
        const status = getStageStatus(stage, now);
        const detailsLocked =
          enforceUpcomingStageLocks &&
          Boolean(stage.hideDetailsUntilStart) &&
          status === "upcoming";

        return (
          <li
            key={stage.id}
            className={`stage-item relative min-w-0 border-l-2 pl-6 pb-10 last:pb-0 ${
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

            <div className="flex min-w-0 flex-wrap items-baseline gap-x-3 gap-y-1">
              <h3
                className={`break-words font-display text-2xl sm:text-3xl ${
                  status === "past"
                    ? "text-[var(--mist)]"
                    : "text-[var(--ivory)]"
                }`}
              >
                {stage.name}
              </h3>
              {!detailsLocked && (
                <span className="break-words font-display text-xl text-[var(--gold)]">
                  {stage.price}
                </span>
              )}
              {status === "current" && (
                <span className="stage-badge shrink-0 text-[0.65rem] uppercase tracking-[0.18em] text-[var(--evergreen-deep)]">
                  On sale now
                </span>
              )}
              {status === "past" && (
                <span className="shrink-0 text-[0.65rem] uppercase tracking-[0.18em] text-[var(--mist)]">
                  Closed
                </span>
              )}
              {status === "upcoming" && (
                <span className="shrink-0 text-[0.65rem] uppercase tracking-[0.18em] text-[var(--crimson-soft)]">
                  Coming up
                </span>
              )}
            </div>

            {detailsLocked ? (
              <div className="relative mt-4 max-w-xl overflow-hidden rounded-sm">
                <div
                  className="select-none blur-sm"
                  aria-hidden="true"
                >
                  <p className="text-sm text-[var(--mist)]">•••••••• – ••••••••</p>
                  <p className="mt-3 text-base leading-relaxed text-[var(--ivory-soft)]">
                    Details for this release are not available yet.
                  </p>
                </div>
                <p className="absolute inset-0 flex items-center justify-center bg-[var(--evergreen-deep)]/55 px-4 text-center text-sm leading-relaxed text-[var(--ivory-soft)] backdrop-blur-[2px]">
                  Details will be released when this stage opens.
                </p>
              </div>
            ) : (
              <>
                <p className="mt-1 break-words text-sm text-[var(--mist)]">
                  {stage.dateLabel}
                </p>
                <p
                  className={`mt-3 max-w-full break-words text-base leading-relaxed sm:max-w-xl ${
                    status === "past"
                      ? "text-[var(--mist)]"
                      : "text-[var(--ivory-soft)]"
                  }`}
                >
                  {stage.description}
                </p>
                {stage.prizes.length > 0 && (
                  <ul className="mt-4 min-w-0 space-y-1.5">
                    {stage.prizes.map((prize) => (
                      <li
                        key={prize}
                        className="flex min-w-0 items-start gap-2 text-sm text-[var(--ivory-soft)]"
                      >
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[var(--gold)]" />
                        <span className="min-w-0 break-words">{prize}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </li>
        );
      })}
    </ol>
  );
}
