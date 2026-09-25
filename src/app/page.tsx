import { CountdownTimer } from "@/components/CountdownTimer";
import { PageAtmosphere } from "@/components/PageAtmosphere";
import { StagesTimeline } from "@/components/StagesTimeline";
import {
  eventConfig,
  formatEventDate,
} from "@/config/event";

export default function Home() {
  const ticketEmailMailto = `mailto:${eventConfig.contactEmail}`;

  return (
    <div className="page-shell">
      <PageAtmosphere />

      {/* Hero — brand + headline + countdown + description + contact */}
      <header className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden section-pad py-16">
        <div
          className="hero-glow pointer-events-none absolute left-1/2 top-[18%] h-64 w-64 -translate-x-1/2 rounded-full bg-[var(--crimson)]/18 blur-3xl"
          aria-hidden="true"
        />
        <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-col items-center text-center">
          <img
            src="/filbrit-logo.png"
            alt="Stevenage FilBrit Community"
            width={112}
            height={112}
            className="hero-logo h-20 w-20 object-contain sm:h-24 sm:w-24 md:h-28 md:w-28"
          />

          <p className="hero-brand mt-5 font-display text-3xl tracking-[0.06em] text-[var(--gold)] sm:mt-6 sm:text-5xl md:text-6xl">
            {eventConfig.orgName}
          </p>

          <div className="hero-rule mt-5 w-24 sm:w-32" aria-hidden="true" />

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
            If you&apos;re interested in joining us, please email{" "}
            <a
              href={ticketEmailMailto}
              className="text-[var(--gold)] underline decoration-[var(--gold)]/50 underline-offset-4 transition hover:decoration-[var(--gold)]"
            >
              {eventConfig.contactEmail}
            </a>
            .
          </p>

          <p className="hero-socials mt-6 max-w-md text-sm leading-relaxed text-[var(--mist)]">
            Follow our socials to keep up with event updates and anything else we
            host!
          </p>

          <nav
            className="hero-socials mt-3 flex items-center justify-center gap-6"
            aria-label="Social links"
          >
            {eventConfig.socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm tracking-[0.08em] text-[var(--mist)] transition hover:text-[var(--gold)]"
              >
                {s.label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      {/* When / Where */}
      <section
        id="details"
        className="section-pad section-rule py-20 sm:py-24"
        aria-labelledby="details-heading"
      >
        <div className="mx-auto flex w-full max-w-4xl flex-col items-center text-center">
          <h2
            id="details-heading"
            className="font-display text-4xl text-[var(--ivory)] sm:text-5xl"
          >
            When & Where
          </h2>
          <p className="mt-3 max-w-xl text-[var(--mist)]">
            {eventConfig.detailsBlurb}
          </p>

          <dl className="mt-10 flex w-max min-w-0 max-w-full flex-col gap-8 self-center text-left">
            <div className="flex min-w-0 flex-col gap-8 sm:flex-row sm:gap-16">
              <div className="min-w-0">
                <dt className="text-[0.7rem] uppercase tracking-[0.2em] text-[var(--gold)]">
                  Date
                </dt>
                <dd className="mt-2 break-words font-display text-2xl text-[var(--ivory)]">
                  {formatEventDate(eventConfig.eventStart)}
                </dd>
              </div>
              <div className="min-w-0">
                <dt className="text-[0.7rem] uppercase tracking-[0.2em] text-[var(--gold)]">
                  Time
                </dt>
                <dd className="mt-2 break-words font-display text-2xl text-[var(--ivory)]">
                  {eventConfig.eventTime}
                </dd>
              </div>
            </div>
            <div className="min-w-0">
              <dt className="text-[0.7rem] uppercase tracking-[0.2em] text-[var(--gold)]">
                Venue
              </dt>
              <dd className="mt-2 max-w-xl break-words font-display text-2xl text-[var(--ivory)]">
                {eventConfig.venue}
              </dd>
              <dd className="mt-1 max-w-xl break-words text-base text-[var(--ivory-soft)]">
                {eventConfig.address}
              </dd>
            </div>
          </dl>
        </div>
      </section>

      {/* Release stages */}
      <section
        id="tickets"
        className="section-pad section-rule py-20 sm:py-24"
        aria-labelledby="tickets-heading"
      >
        <div className="mx-auto flex w-full max-w-4xl flex-col items-center text-center">
          <h2
            id="tickets-heading"
            className="font-display text-4xl text-[var(--ivory)] sm:text-5xl"
          >
            Ticket Releases
          </h2>
          <p className="mt-3 max-w-xl text-[var(--mist)]">
            {eventConfig.ticketsBlurb}
          </p>

          <div className="mt-12 w-max min-w-0 max-w-full self-center text-left">
            <StagesTimeline stages={eventConfig.stages} />
          </div>
        </div>
      </section>

      {/* Ticket interest */}
      <section
        id="updates"
        className="section-pad section-rule py-20 sm:py-24"
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
            or have any questions, please email{" "}
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

      <footer className="section-pad section-rule py-10">
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
