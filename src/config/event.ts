export type TicketStage = {
  id: string;
  name: string;
  startsAt: string; // ISO 8601
  endsAt: string;
  price: string;
  dateLabel: string;
  description: string;
  prizes: string[];
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
  stages: TicketStage[];
};

/**
 * Static event content. Edit dates/prices/prizes here and redeploy.
 * Stage highlighting and the countdown are derived at runtime from these dates.
 */
export const eventConfig: EventConfig = {
  orgName: "FilBrit",
  eventName: "Christmas Party 2026",
  tagline:
    "Bringing back our popular Christmas party event — an evening of music and fun, a three-course meal, festive cultural dances and performances, raffle draws, and more.",
  venue: "Location will be provided once tickets have been confirmed",
  address: "",
  eventStart: "2026-12-06T18:30:00+00:00",
  eventTime: "18:30 – 23:00",
  doorsOpen: "18:30",
  ticketUrl: "https://www.eventbrite.com/",
  contactEmail: "stevenagefilbritc@gmail.com",
  socials: [
    { label: "Instagram", href: "https://instagram.com/" },
    { label: "Facebook", href: "https://facebook.com/" },
  ],
  signupBlurb:
    "If you're interested in purchasing tickets, please email stevenagefilbritc@gmail.com.",
  stages: [
    {
      id: "early-bird",
      name: "Early Bird",
      startsAt: "2026-09-15T00:00:00+00:00",
      endsAt: "2026-10-31T23:59:59+00:00",
      price: "PLACEHOLDER PRICE",
      dateLabel: "PLACEHOLDER DATE",
      description: "PLACEHOLDER DESCRIPTION",
      prizes: ["PLACEHOLDER DESCRIPTION"],
    },
    {
      id: "general",
      name: "General Release",
      startsAt: "2026-11-01T00:00:00+00:00",
      endsAt: "2026-11-30T23:59:59+00:00",
      price: "PLACEHOLDER PRICE",
      dateLabel: "PLACEHOLDER DATE",
      description: "PLACEHOLDER DESCRIPTION",
      prizes: ["PLACEHOLDER DESCRIPTION"],
    },
    {
      id: "final",
      name: "Final Release",
      startsAt: "2026-12-01T00:00:00+00:00",
      endsAt: "2026-12-18T23:59:59+00:00",
      price: "PLACEHOLDER PRICE",
      dateLabel: "PLACEHOLDER DATE",
      description: "PLACEHOLDER DESCRIPTION",
      prizes: ["PLACEHOLDER DESCRIPTION"],
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
  });
}

export function formatEventTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  });
}
