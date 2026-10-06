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
 * The order summary, event date/time and order reference are added
 * automatically between the intro and the terms.
 */
const content = {
  subject: "Your tickets for the Stevenage FilBrit Christmas Party 2026",
  greeting: "Hi {firstName},",
  intro: [
    "Thank you for buying tickets to our Christmas Party! We're so happy you'll be celebrating with us.",
    "Here's a summary of your order. Please keep this email — you may be asked for your order reference on the night.",
  ],
  afterSummary: [
    "We'll email you the full venue address and any other details closer to the date.",
  ],
  termsHeading: "Terms & conditions",
  terms: [
    "Tickets are non-refundable unless the event is cancelled or postponed.",
    "If the event is postponed, your tickets will be valid for the new date.",
    "Please bring this email or your order reference with you on the night.",
    "Tickets may not be resold.",
    "By attending, you agree that photos and videos taken at the event may be shared on our social media.",
  ],
  signOff: ["See you there!", "Stevenage FilBrit"],
};
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
  const eventDate = formatEventDate(eventConfig.eventStart);
  const eventDetails = [
    ["Event", `${eventConfig.orgName} ${eventConfig.eventName}`],
    ["Date", eventDate],
    ["Time", eventConfig.eventTime],
    ...eventConfig.timingNotes.map((note) => ["", note]),
    ["Venue", eventConfig.venue],
  ];

  const text = [
    fill(content.greeting),
    "",
    ...content.intro.flatMap((p) => [fill(p), ""]),
    `Order reference: ${order.reference}`,
    ...order.lines.map((l) => `${l.quantity} × ${l.name} – ${formatPrice(l.total)}`),
    `Total paid: ${formatPrice(order.totalPaid)}`,
    "",
    ...eventDetails.map(([label, value]) => (label ? `${label}: ${value}` : value)),
    "",
    ...content.afterSummary.flatMap((p) => [fill(p), ""]),
    content.termsHeading.toUpperCase(),
    ...content.terms.map((t) => `- ${fill(t)}`),
    "",
    ...content.signOff,
    "",
    `Questions? Reply to this email or contact ${eventConfig.contactEmail}.`,
  ].join("\n");

  const p = (s: string) => `<p style="margin:0 0 14px">${escapeHtml(fill(s))}</p>`;
  const row = (label: string, value: string) =>
    `<tr><td style="padding:4px 16px 4px 0;color:#555;white-space:nowrap;vertical-align:top">${escapeHtml(label)}</td><td style="padding:4px 0">${escapeHtml(value)}</td></tr>`;

  const html = `
<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.5;color:#1a1a1a;max-width:560px">
  ${p(content.greeting)}
  ${content.intro.map(p).join("")}
  <div style="border:1px solid #e2d6b0;border-radius:6px;padding:16px 18px;margin:18px 0;background:#fbf8ef">
    <p style="margin:0;color:#555;font-size:13px;text-transform:uppercase;letter-spacing:1px">Order reference</p>
    <p style="margin:2px 0 12px;font-size:22px;font-weight:bold;color:#0c2e24">${escapeHtml(order.reference)}</p>
    <table style="border-collapse:collapse;width:100%">
      ${order.lines
        .map((l) => row(`${l.quantity} × ${l.name}`, formatPrice(l.total)))
        .join("")}
      ${row("Total paid", formatPrice(order.totalPaid))}
    </table>
  </div>
  <table style="border-collapse:collapse;margin:0 0 18px">
    ${eventDetails.map(([label, value]) => row(label, value)).join("")}
  </table>
  ${content.afterSummary.map(p).join("")}
  <h3 style="margin:24px 0 8px;font-size:16px">${escapeHtml(content.termsHeading)}</h3>
  <ul style="margin:0 0 18px;padding-left:20px">
    ${content.terms.map((t) => `<li style="margin:0 0 6px">${escapeHtml(fill(t))}</li>`).join("")}
  </ul>
  <p style="margin:0 0 4px">${content.signOff.map(escapeHtml).join("<br>")}</p>
  <p style="margin:24px 0 0;color:#777;font-size:13px">Questions? Reply to this email or contact ${escapeHtml(eventConfig.contactEmail)}.</p>
</div>`;

  return { subject: content.subject, text, html };
}
