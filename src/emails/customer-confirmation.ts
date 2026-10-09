import path from "node:path";
import {
  eventConfig,
  formatEventDate,
  formatPrice,
} from "@/config/event";
import type { PaidOrder } from "@/lib/order-email";

/*
 * ─── EDIT THE EMAIL WORDING HERE ──────────────────────────────────────────
 * This is the email buyers receive after paying. Change any text below and
 * redeploy. `{firstName}` is replaced with the buyer's first name.
 * The order summary is added automatically after the intro, and the event
 * date/time come from `src/config/event.ts`.
 *
 * Keep this consistent with the T&Cs (public/terms-and-conditions.pdf) and the
 * information pack (src/emails/attachments/information-pack.pdf), which are
 * both attached to the email.
 */
const content = {
  subject: "Your tickets for the Stevenage FilBrit Christmas Party 2026",
  greeting: "Hi {firstName},",
  intro: [
    "Thank you for purchasing tickets to the Stevenage FilBrit Christmas Party! Maligayang Pasko! We're so happy you're celebrating with us.",
    "Here's a summary of your order. Please keep this email – you may be asked to show your email confirmation at the door.",
  ],
  mealForm: {
    heading: "Meal choice form",
    url: "https://forms.gle/KKLqwQPxmQhh27B97",
    before:
      "Please fill out your Meal Choice form as soon as possible. The deadline for submission is Friday 6th of November.",
    after: [
      "Let us know if there are any allergies or dietary requirements we need to be aware of so we can feed this back to the catering staff.",
      "If you or any of your group have any accessibility requirements, please let us know too, either via email or within the form.",
    ],
  },
  eventHeading: "Event details",
  dressCode:
    "Formal attire – suits / cocktail dresses. We highly encourage any and all traditional / cultural wear!",
  venueLines: ["Cromwell Hotel", "Old Town, Stevenage", "SG1 3AZ"],
  afterDetails: [
    "Parking is free for all guests, but car parking is limited so it is first come, first served. Please remember to register your car at Reception. The car park is located at the back of the hotel – a map is included in the attached information pack.",
    "This car park is not supervised. Stevenage FilBrit and Cromwell Hotel are not responsible for any losses of property or damage to vehicles whilst on the premises.",
    "The venue holds a bar where guests are able to purchase drinks throughout the night. Alcoholic drinks can only be purchased, served and consumed by over 18s. Please remember to bring valid ID. No outside alcohol is allowed onto the premises.",
    "On the day, please show this confirmation email for organisers to be able to quickly confirm your attendance.",
    "Please find attached the Terms & Conditions for the event and a printable information pack.",
  ],
  socialsIntro:
    "Follow us on our socials to get the latest news on the Christmas Party as we announce any updates or special announcements.",
  signOff: [
    "Thank you for joining us for our FilBrit Christmas Party! We can't wait to celebrate with you!",
    "Maraming Salamat po,",
    "Stevenage FilBrit",
  ],
};

const attachments = [
  {
    filename: "Stevenage FilBrit Christmas Party 2026 - Terms and Conditions.pdf",
    path: path.join(process.cwd(), "public", "terms-and-conditions.pdf"),
  },
  {
    filename: "Stevenage FilBrit Christmas Party 2026 - Information Pack.pdf",
    path: path.join(process.cwd(), "src", "emails", "attachments", "information-pack.pdf"),
  },
];
/* ───────────────────────────────────────────────────────────────────────── */

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function buildCustomerConfirmationEmail(order: PaidOrder) {
  const fill = (s: string) => s.replaceAll("{firstName}", order.buyer.firstName || "there");
  const { mealForm } = content;
  const eventDetails: [string, string[]][] = [
    ["Event", [`${eventConfig.orgName} ${eventConfig.eventName}`]],
    ["Date", [formatEventDate(eventConfig.eventStart)]],
    ["Time", [eventConfig.eventTime, ...eventConfig.timingNotes]],
    ["Venue", content.venueLines],
    ["Dress code", [content.dressCode]],
  ];

  const text = [
    fill(content.greeting),
    "",
    ...content.intro.flatMap((p) => [fill(p), ""]),
    `Order reference: ${order.reference}`,
    ...order.lines.map((l) => `${l.quantity} × ${l.name} – ${formatPrice(l.total)}`),
    `Total paid: ${formatPrice(order.totalPaid)}`,
    "",
    mealForm.heading.toUpperCase(),
    mealForm.before,
    mealForm.url,
    "",
    ...mealForm.after.flatMap((p) => [p, ""]),
    content.eventHeading.toUpperCase(),
    ...eventDetails.map(([label, lines]) => `${label}: ${lines.join("\n  ")}`),
    "",
    ...content.afterDetails.flatMap((p) => [p, ""]),
    `Any queries or questions, please contact us via email at ${eventConfig.contactEmail}.`,
    "",
    content.socialsIntro,
    ...eventConfig.socials.map((s) => `${s.label}: ${s.href}`),
    "",
    ...content.signOff,
  ].join("\n");

  const p = (s: string) => `<p style="margin:0 0 14px">${escapeHtml(fill(s))}</p>`;
  const h = (s: string) => `<h3 style="margin:24px 0 8px;font-size:16px">${escapeHtml(s)}</h3>`;
  const link = (href: string, label: string) =>
    `<a href="${escapeHtml(href)}" style="color:#0c2e24">${escapeHtml(label)}</a>`;
  const row = (label: string, lines: string[]) =>
    `<tr><td style="padding:4px 16px 4px 0;color:#555;white-space:nowrap;vertical-align:top">${escapeHtml(label)}</td><td style="padding:4px 0">${lines.map(escapeHtml).join("<br>")}</td></tr>`;

  const html = `
<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.5;color:#1a1a1a;max-width:560px">
  ${p(content.greeting)}
  ${content.intro.map(p).join("")}
  <div style="border:1px solid #e2d6b0;border-radius:6px;padding:16px 18px;margin:18px 0;background:#fbf8ef">
    <p style="margin:0;color:#555;font-size:13px;text-transform:uppercase;letter-spacing:1px">Order reference</p>
    <p style="margin:2px 0 12px;font-size:22px;font-weight:bold;color:#0c2e24">${escapeHtml(order.reference)}</p>
    <table style="border-collapse:collapse;width:100%">
      ${order.lines
        .map((l) => row(`${l.quantity} × ${l.name}`, [formatPrice(l.total)]))
        .join("")}
      ${row("Total paid", [formatPrice(order.totalPaid)])}
    </table>
  </div>
  ${h(mealForm.heading)}
  ${p(mealForm.before)}
  <p style="margin:0 0 14px"><a href="${escapeHtml(mealForm.url)}" style="display:inline-block;background:#0c2e24;color:#ffffff;text-decoration:none;padding:10px 18px;border-radius:999px;font-weight:bold">Fill in the Meal Choice form</a></p>
  ${mealForm.after.map(p).join("")}
  ${h(content.eventHeading)}
  <table style="border-collapse:collapse;margin:0 0 18px">
    ${eventDetails.map(([label, lines]) => row(label, lines)).join("")}
  </table>
  ${content.afterDetails.map(p).join("")}
  <p style="margin:0 0 14px">Any queries or questions, please contact us via email at ${link(`mailto:${eventConfig.contactEmail}`, eventConfig.contactEmail)}.</p>
  <p style="margin:0 0 6px">${escapeHtml(content.socialsIntro)}</p>
  <p style="margin:0 0 18px">${eventConfig.socials.map((s) => link(s.href, s.label)).join(" · ")}</p>
  <p style="margin:0">${content.signOff.map(escapeHtml).join("<br>")}</p>
</div>`;

  return { subject: content.subject, text, html, attachments };
}
