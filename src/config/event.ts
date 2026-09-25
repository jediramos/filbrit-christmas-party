export type TicketStage = {
  id: string;
  name: string;
  startsAt: string; // ISO 8601
  endsAt: string;
  price: string;
  dateLabel: string;
  description: string;
  prizes: string[];
  /** When true, price/dates/copy stay hidden until startsAt. */
  hideDetailsUntilStart?: boolean;
};

export type EventConfig = {
  orgName: string;
  eventName: string;
  tagline: string;
  venue: string;
  address: string;
  eventStart: string;
  eventTime: string;
  doorsOpen: string;
  ticketUrl: string;
  contactEmail: string;
  socials: { label: string; href: string }[];
  signupBlurb: string;
  detailsBlurb: string;
  ticketsBlurb: string;
  stages: TicketStage[];
};

/**
 * Static event content. Edit dates/prices/prizes here and redeploy.
 * Stage highlighting and the countdown are derived at runtime from these dates.
 *
 * Set to `true` before launch to hide General/Final details until each stage opens.
 * Leave `false` while debugging so all stage details stay visible.
 */
export const enforceUpcomingStageLocks = true;

export const eventConfig: EventConfig = {
  orgName: "Stevenage FilBrit",
  eventName: "Christmas Party 2026",
  tagline:
    "Bringing back our popular Christmas party event — an evening of music and fun, a three-course meal, festive cultural dances and performances, raffle draws, and more.",
  venue: "Stevenage",
  address: "Full location will be provided once your tickets have been confirmed.",
  // Sunday 6 December 2026, 18:30 Europe/London (GMT / UTC+0 in December)
  eventStart: "2026-12-06T18:30:00+00:00",
  eventTime: "TBC",
  doorsOpen: "18:30",
  ticketUrl: "https://www.eventbrite.com/",
  contactEmail: "stevenagefilbritc@gmail.com",
  socials: [
    { label: "Instagram", href: "https://www.instagram.com/stevenagefilbrit/" },
    { label: "Facebook", href: "https://www.facebook.com/stevenagefilbritcommunity" },
  ],
  signupBlurb:
    "If you're interested in joining us, please email stevenagefilbritc@gmail.com.",
  detailsBlurb:
    "Save the date  — the event timings are to be confirmed.",
  ticketsBlurb:
    "Tickets are released in stages. Earlier releases offer the best value — email us to reserve yours now!",
  stages: [
    {
      id: "early-bird",
      name: "Early Bird",
      startsAt: "2026-09-25T00:00:00+01:00",
      endsAt: "2026-10-11T23:59:59+01:00",
      price: "£28",
      dateLabel: "September 25th – October 11th",
      description:
        "Best value tickets for the Christmas party — limited early release.",
      prizes: [],
    },
    {
      id: "general",
      name: "General Release",
      startsAt: "2026-10-12T00:00:00+01:00",
      endsAt: "2026-10-26T23:59:59+00:00",
      price: "£32",
      dateLabel: "October 12th – October 26th",
      description:
        "Standard party tickets with full evening access.",
      prizes: [],
      hideDetailsUntilStart: true,
    },
    {
      id: "final",
      name: "Final Release",
      startsAt: "2026-11-11T00:00:00+00:00",
      endsAt: "2026-11-20T23:59:59+00:00",
      price: "£40",
      dateLabel: "November 11th – November 20th",
      description:
        "Last chance tickets before the night — grab them while they last.",
      prizes: [],
      hideDetailsUntilStart: true,
    },
  ],
};

export function getActiveStage(
  stages: TicketStage[],
  now: Date = new Date(),
): TicketStage | null {
  const t = now.getTime();
  return (
    stages.find((s) => {
      const start = new Date(s.startsAt).getTime();
      const end = new Date(s.endsAt).getTime();
      return t >= start && t <= end;
    }) ?? null
  );
}

export function getStageStatus(
  stage: TicketStage,
  now: Date = new Date(),
): "past" | "current" | "upcoming" {
  const t = now.getTime();
  const start = new Date(stage.startsAt).getTime();
  const end = new Date(stage.endsAt).getTime();
  if (t > end) return "past";
  if (t < start) return "upcoming";
  return "current";
}

export function formatStageRange(startsAt: string, endsAt: string): string {
  const opts: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
    year: "numeric",
  };
  const start = new Date(startsAt).toLocaleDateString("en-GB", opts);
  const end = new Date(endsAt).toLocaleDateString("en-GB", opts);
  return `${start} – ${end}`;
}

export function formatEventDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/London",
  });
}

export function formatEventTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/London",
    timeZoneName: "short",
  });
}
