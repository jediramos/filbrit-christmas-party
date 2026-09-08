import { CountdownTimer } from "@/components/CountdownTimer";
import { EmailSignup } from "@/components/EmailSignup";
import { StagesTimeline } from "@/components/StagesTimeline";
import {
  eventConfig,
  formatEventDate,
  formatEventTime,
  getActiveStage,
} from "@/config/event";

export default function Home() {
  const active = getActiveStage(eventConfig.stages);

  return (
    <div className="page-shell">
      {/* Hero — brand + headline + countdown + CTA */}
      <header className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden section-pad py-16">
        <div
          className="hero-glow pointer-events-none absolute left-1/2 top-[18%] h-64 w-64 -translate-x-1/2 rounded-full bg-[var(--crimson)]/20 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-col items-center text-center">
          <p className="hero-brand font-display text-4xl tracking-[0.08em] text-[var(--gold)] sm:text-6xl md:text-7xl">
            {eventConfig.orgName}
          </p>

          <div className="hero-rule mt-5 h-px w-24 bg-[var(--gold)]/70 sm:w-32" />

          <h1 className="hero-title mt-6 font-display text-3xl font-semibold text-[var(--ivory)] sm:text-5xl md:text-6xl">
            {eventConfig.eventName}
          </h1>

          <p className="hero-tagline mt-4 max-w-xl text-base leading-relaxed text-[var(--ivory-soft)] sm:text-lg">
            {eventConfig.tagline}
          </p>

          <div className="hero-countdown mt-10 w-full">
            <p className="mb-4 text-[0.7rem] uppercase tracking-[0.22em] text-[var(--mist)]">
              Countdown to the night
            </p>
            <CountdownTimer targetIso={eventConfig.eventStart} />
          </div>

          <div className="hero-cta mt-10 flex flex-col items-center gap-3">
            <a
              href={eventConfig.ticketUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-12 items-center justify-center bg-[var(--gold)] px-8 text-sm font-semibold uppercase tracking-[0.16em] text-[var(--evergreen-deep)] transition hover:bg-[var(--ivory)]"
            >
              {active
                ? `Get ${active.name} tickets — ${active.price}`
                : "Get tickets"}
            </a>
            {active && (
              <p className="text-sm text-[var(--mist)]">
                {active.name} is live now
              </p>
            )}
          </div>
        </div>
      </header>

      {/* When / where */}
      <section
        id="details"
        className="section-pad border-t border-[var(--pine-line)]/60 py-20 sm:py-24"
        aria-labelledby="details-heading"
      >
        <div className="mx-auto max-w-3xl text-center">
          <h2
            id="details-heading"
            className="font-display text-3xl text-[var(--ivory)] sm:text-4xl"
          >
            When & where
          </h2>
          <p className="mt-3 text-[var(--mist)]">
            Mark the date — doors open before the main evening begins.
          </p>

          <dl className="mt-10 grid gap-8 text-left sm:grid-cols-2">
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
                {formatEventTime(eventConfig.eventStart)}
              </dd>
              <dd className="mt-1 text-sm text-[var(--mist)]">
                Doors {eventConfig.doorsOpen}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-[0.7rem] uppercase tracking-[0.2em] text-[var(--gold)]">
                Venue
              </dt>
              <dd className="mt-2 font-display text-2xl text-[var(--ivory)]">
                {eventConfig.venue}
              </dd>
              <dd className="mt-1 text-base text-[var(--ivory-soft)]">
                {eventConfig.address}
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
        <div className="mx-auto max-w-3xl text-center">
          <h2
            id="tickets-heading"
            className="font-display text-3xl text-[var(--ivory)] sm:text-4xl"
          >
            Ticket releases
          </h2>
          <p className="mt-3 text-[var(--mist)]">
            Earlier stages unlock better prices and exclusive perks.
          </p>
        </div>

        <div className="mt-12">
          <StagesTimeline stages={eventConfig.stages} />
        </div>

        <div className="mt-12 text-center">
          <a
            href={eventConfig.ticketUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-12 items-center justify-center border border-[var(--gold)] px-8 text-sm font-medium uppercase tracking-[0.16em] text-[var(--gold)] transition hover:bg-[var(--gold)] hover:text-[var(--evergreen-deep)]"
          >
            Buy tickets
          </a>
        </div>
      </section>

      {/* Email signup */}
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
            Stay in the loop
          </h2>
        </div>
        <div className="mt-8">
          <EmailSignup blurb={eventConfig.signupBlurb} />
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
