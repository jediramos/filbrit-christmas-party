import { eventConfig, formatPrice } from "@/config/event";
import { buildCustomerConfirmationEmail } from "@/emails/customer-confirmation";
import { createGmailTransport } from "@/lib/mailer";

export type PaidOrder = {
  reference: string;
  paidAt: Date;
  livemode: boolean;
  buyer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  lines: { name: string; quantity: number; unitAmount: number; total: number }[];
  totalPaid: number;
  stripeFee: number | null;
  dashboardUrl: string | null;
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatPaidAt(date: Date): string {
  return date.toLocaleString("en-GB", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "Europe/London",
  });
}

export function buildOrderEmail(order: PaidOrder) {
  const { buyer } = order;
  const fullName = `${buyer.firstName} ${buyer.lastName}`.trim();
  const ticketCount = order.lines.reduce((n, l) => n + l.quantity, 0);
  const ticketSummary = order.lines
    .map((l) => `${l.quantity} × ${l.name}`)
    .join(", ");
  const testTag = order.livemode ? "" : "[TEST] ";
  const subject = `${testTag}New ticket order: ${fullName} – ${ticketSummary} (${formatPrice(order.totalPaid)})`;

  const money = [
    ["Total paid", formatPrice(order.totalPaid)],
    ...(order.stripeFee !== null
      ? [
          ["Stripe fee", formatPrice(order.stripeFee)],
          ["You receive", formatPrice(order.totalPaid - order.stripeFee)],
        ]
      : []),
  ];

  const text = [
    `${testTag}New ticket order for ${eventConfig.orgName} ${eventConfig.eventName}`,
    "",
    `Order reference: ${order.reference}`,
    `Paid: ${formatPaidAt(order.paidAt)}`,
    "",
    "BUYER",
    `Name: ${fullName}`,
    `Email: ${buyer.email}`,
    `Phone: ${buyer.phone}`,
    "",
    `TICKETS (${ticketCount})`,
    ...order.lines.map(
      (l) =>
        `${l.quantity} × ${l.name} @ ${formatPrice(l.unitAmount)} = ${formatPrice(l.total)}`,
    ),
    "",
    ...money.map(([label, value]) => `${label}: ${value}`),
    ...(order.dashboardUrl ? ["", `View in Stripe: ${order.dashboardUrl}`] : []),
    "",
    "Reply to this email to contact the buyer directly.",
  ].join("\n");

  const row = (label: string, value: string) =>
    `<tr><td style="padding:4px 16px 4px 0;color:#555;white-space:nowrap">${escapeHtml(label)}</td><td style="padding:4px 0">${escapeHtml(value)}</td></tr>`;

  const html = `
<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#1a1a1a;max-width:560px">
  ${order.livemode ? "" : '<p style="background:#fff3cd;padding:8px 12px;border-radius:4px"><strong>Test mode</strong> – no real money was taken.</p>'}
  <h2 style="margin:0 0 4px">New ticket order</h2>
  <p style="margin:0 0 16px;color:#555">${escapeHtml(`${eventConfig.orgName} ${eventConfig.eventName}`)}</p>
  <table style="border-collapse:collapse">
    ${row("Order reference", order.reference)}
    ${row("Paid", formatPaidAt(order.paidAt))}
  </table>
  <h3 style="margin:20px 0 6px">Buyer</h3>
  <table style="border-collapse:collapse">
    ${row("Name", fullName)}
    ${row("Email", buyer.email)}
    ${row("Phone", buyer.phone)}
  </table>
  <h3 style="margin:20px 0 6px">Tickets (${ticketCount})</h3>
  <table style="border-collapse:collapse">
    ${order.lines
      .map((l) =>
        row(`${l.quantity} × ${l.name}`, `${formatPrice(l.unitAmount)} each · ${formatPrice(l.total)}`),
      )
      .join("")}
  </table>
  <h3 style="margin:20px 0 6px">Payment</h3>
  <table style="border-collapse:collapse">
    ${money.map(([label, value]) => row(label, value)).join("")}
  </table>
  ${order.dashboardUrl ? `<p style="margin-top:20px"><a href="${escapeHtml(order.dashboardUrl)}">View this payment in Stripe</a></p>` : ""}
  <p style="margin-top:20px;color:#555">Reply to this email to contact the buyer directly.</p>
</div>`;

  return { subject, text, html };
}

export async function sendOrderEmail(order: PaidOrder): Promise<void> {
  const { transporter, user } = createGmailTransport();
  const { subject, text, html } = buildOrderEmail(order);
  await transporter.sendMail({
    from: { name: `${eventConfig.orgName} Tickets`, address: user },
    to: process.env.ORDER_NOTIFICATION_EMAIL || eventConfig.contactEmail,
    replyTo: {
      name: `${order.buyer.firstName} ${order.buyer.lastName}`.trim(),
      address: order.buyer.email,
    },
    subject,
    text,
    html,
  });
}

export async function sendCustomerConfirmationEmail(order: PaidOrder): Promise<void> {
  const { transporter, user } = createGmailTransport();
  const { subject, text, html, attachments } = buildCustomerConfirmationEmail(order);
  await transporter.sendMail({
    from: { name: eventConfig.orgName, address: user },
    to: {
      name: `${order.buyer.firstName} ${order.buyer.lastName}`.trim(),
      address: order.buyer.email,
    },
    replyTo: process.env.ORDER_NOTIFICATION_EMAIL || eventConfig.contactEmail,
    subject: `${order.livemode ? "" : "[TEST] "}${subject}`,
    text,
    html,
    attachments,
  });
}
