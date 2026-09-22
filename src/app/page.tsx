import { CountdownTimer } from "@/components/CountdownTimer";
import {
  eventConfig,
  formatEventDate,
} from "@/config/event";
import { StagesTimeline } from "@/components/StagesTimeline";

export default function Home() {
  const ticketEmailMailto = `mailto:${eventConfig.contactEmail}`;

  return (
    <div className="page-shell">
      {/* Hero — brand + headline + countdown + description + contact */}
      <header className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden section-pad py-16">
        <div
          className="hero-glow pointer-events-none absolute left-1/2 top-[18%] h-64 w-64 -translate-x-1/2 rounded-full bg-[var(--crimson)]/20 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-col items-center text-center">
          <p className="hero-brand font-display text-3xl tracking-[0.06em] text-[var(--gold)] sm:text-5xl md:text-6xl">
            {eventConfig.orgName}
          </p>

          <div className="hero-rule mt-5 h-px w-24 bg-[var(--gold)]/70 sm:w-32" />

          <h1 className="hero-title mt-6 font-display text-3xl font-semibold text-[var(--ivory)] sm:text-5xl md:text-6xl">
            {eventConfig.eventName}
          </h1>

          <div className="hero-countdown mt-10 w-full">
            <p className="mb-4 text-[0.7rem] uppercase tracking-[0.22em] text-[var(--mist)]">
              Countdown to the night
            </p>
            <CountdownTimer targetIso={eventConfig.eventStart} />
          </div>

          <p className="hero-tagline mt-10 max-w-xl text-base leading-relaxed text-[var(--ivory-soft)] sm:text-lg">
            {eventConfig.tagline}
          </p>

          <p className="hero-cta mt-8 max-w-lg text-base leading-relaxed text-[var(--ivory)] sm:text-lg">
            If you&apos;re interested in purchasing tickets, please email{" "}
            <a
              href={ticketEmailMailto}
              className="text-[var(--gold)] underline decoration-[var(--gold)]/50 underline-offset-4 transition hover:decoration-[var(--gold)]"
            >
              {eventConfig.contactEmail}
            </a>
            .
          </p>
        </div>
      </header>

      {/* When / Where */}
      <section
        id="details"
        className="section-pad border-t border-[var(--pine-line)]/60 py-20 sm:py-24"
        aria-labelledby="details-heading"
      >
        <div className="mx-auto flex w-full max-w-4xl flex-col items-center text-center">
          <h2
            id="details-heading"
            className="font-display text-3xl text-[var(--ivory)] sm:text-4xl"
          >
            When & Where
          </h2>
          <p className="mt-3 text-[var(--mist)]">PLACEHOLDER DESCRIPTION</p>

          <dl className="mt-10 flex w-max max-w-full flex-col gap-8 self-center text-left">
            <div className="flex flex-col gap-8 sm:flex-row sm:gap-16">
              <div>
                <dt className="text-[0.7rem] uppercase tracking-[0.2em] text-[var(--gold)]">
                  Date
                </dt>
                <dd className="mt-2 font-display text-2xl text-[var(--ivory)]">
                  {formatEventDate(eventConfig.eventStart)}
                </dd>
              </div>
              <div>
                <dt className="text-[0.7rem] uppercase tracking-[0.2em] text-[var(--gold)]">
                  Time
                </dt>
                <dd className="mt-2 font-display text-2xl text-[var(--ivory)]">
                  {eventConfig.eventTime}
                </dd>
              </div>
            </div>
            <div>
              <dt className="text-[0.7rem] uppercase tracking-[0.2em] text-[var(--gold)]">
                Venue
              </dt>
              <dd className="mt-2 max-w-xl font-display text-2xl text-[var(--ivory)]">
                {eventConfig.venue}
              </dd>
            </div>
          </dl>
        </div>
      </section>

      {/* Release stages */}
      <section
        id="tickets"
        className="section-pad border-t border-[var(--pine-line)]/60 py-20 sm:py-24"
        aria-labelledby="tickets-heading"
      >
        <div className="mx-auto flex w-full max-w-4xl flex-col items-center text-center">
          <h2
            id="tickets-heading"
            className="font-display text-3xl text-[var(--ivory)] sm:text-4xl"
          >
            Ticket Releases
          </h2>
          <p className="mt-3 text-[var(--mist)]">PLACEHOLDER DESCRIPTION</p>

          <div className="mt-12 w-max max-w-3xl self-center text-left">
            <StagesTimeline stages={eventConfig.stages} />
          </div>
        </div>
      </section>

      {/* Ticket interest */}
      <section
        id="updates"
        className="section-pad border-t border-[var(--pine-line)]/60 py-20 sm:py-24"
        aria-labelledby="updates-heading"
      >
        <div className="mx-auto max-w-3xl text-center">
          <h2
            id="updates-heading"
            className="font-display text-3xl text-[var(--ivory)] sm:text-4xl"
          >
            Stay in the Loop
          </h2>
          <p className="mt-6 text-base leading-relaxed text-[var(--ivory-soft)] sm:text-lg">
            Ticket sales are handled by email. If you&apos;re interested
            in purchasing tickets, please email{" "}
            <a
              href={ticketEmailMailto}
              className="text-[var(--gold)] underline decoration-[var(--gold)]/50 underline-offset-4 transition hover:decoration-[var(--gold)]"
            >
              {eventConfig.contactEmail}
            </a>{" "}
            and we&apos;ll get back to you with details.
          </p>
        </div>
      </section>

      <footer className="section-pad border-t border-[var(--pine-line)]/60 py-10">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 text-center sm:flex-row sm:justify-between sm:text-left">
          <p className="font-display text-xl text-[var(--gold)]">
            {eventConfig.orgName}
          </p>
          <nav className="flex gap-5" aria-label="Social links">
            {eventConfig.socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-[var(--mist)] transition hover:text-[var(--ivory)]"
              >
                {s.label}
              </a>
            ))}
          </nav>
        </div>
        <p className="mt-6 text-center text-xs text-[var(--mist)]">
          © {new Date().getFullYear()} {eventConfig.orgName}. All rights
          reserved.
        </p>
      </footer>
    </div>
  );
}
