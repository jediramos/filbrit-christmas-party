export type TicketStage = {
  id: string;
  name: string;
  startsAt: string; // ISO 8601
  endsAt: string;
  price: string;
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
  doorsOpen: string;
  ticketUrl: string;
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
    "An evening of music, food, and festive cheer with the FilBrit community.",
  venue: "The Grand Hall",
  address: "42 King’s Cross Road, London WC1X 9XX",
  eventStart: "2026-12-19T19:00:00+00:00",
  doorsOpen: "18:30",
  ticketUrl: "https://www.eventbrite.com/",
  socials: [
    { label: "Instagram", href: "https://instagram.com/" },
    { label: "Facebook", href: "https://facebook.com/" },
  ],
  signupBlurb:
    "Get notified when a new release stage opens, what’s included with each ticket, and last-minute event updates.",
  stages: [
    {
      id: "early-bird",
      name: "Early Bird",
      startsAt: "2026-09-15T00:00:00+00:00",
      endsAt: "2026-10-31T23:59:59+00:00",
      price: "£18",
      description: "Best price — limited early release for FilBrit members and friends.",
      prizes: [
        "Priority entry wristband",
        "Free welcome drink",
        "Exclusive Early Bird raffle entry",
      ],
    },
    {
      id: "general",
      name: "General Release",
      startsAt: "2026-11-01T00:00:00+00:00",
      endsAt: "2026-11-30T23:59:59+00:00",
      price: "£25",
      description: "Standard party ticket with full evening access.",
      prizes: [
        "Full evening access",
        "Complimentary photo booth print",
        "General raffle entry",
      ],
    },
    {
      id: "final",
      name: "Final Release",
      startsAt: "2026-12-01T00:00:00+00:00",
      endsAt: "2026-12-18T23:59:59+00:00",
      price: "£30",
      description: "Last chance tickets before the night — grab them while they last.",
      prizes: ["Full evening access", "Late-bird lucky dip entry"],
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
