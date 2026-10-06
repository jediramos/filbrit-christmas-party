import { NextResponse } from "next/server";
import { eventConfig, formatEventDate } from "@/config/event";
import {
  buildOrderLines,
  orderTicketCount,
  validateBuyerDetails,
  type BuyerDetails,
  type TicketQuantities,
} from "@/lib/order";
import { getStripe, isStripeConfigured } from "@/lib/stripe";

type Body = {
  quantities?: unknown;
  details?: unknown;
};

const DETAIL_KEYS: (keyof BuyerDetails)[] = [
  "firstName",
  "lastName",
  "email",
  "confirmEmail",
  "phone",
];

// Stripe metadata values are capped at 500 characters.
const clip = (value: string) => value.trim().slice(0, 200);

function parseDetails(raw: unknown): BuyerDetails | null {
  if (!raw || typeof raw !== "object") return null;
  const source = raw as Record<string, unknown>;
  const details = {} as BuyerDetails;
  for (const key of DETAIL_KEYS) {
    if (typeof source[key] !== "string") return null;
    details[key] = source[key];
  }
  return details;
}

function parseQuantities(raw: unknown): TicketQuantities | null {
  if (!raw || typeof raw !== "object") return null;
  const quantities: TicketQuantities = {};
  for (const [id, value] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof value === "number") quantities[id] = value;
  }
  return quantities;
}

function siteOrigin(request: Request): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    new URL(request.url).origin
  );
}

export async function POST(request: Request) {
  if (!isStripeConfigured()) {
    return NextResponse.json(
      { error: "Online payment isn't available yet. Please email us to book." },
      { status: 503 },
    );
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const details = parseDetails(body.details);
  const quantities = parseQuantities(body.quantities);
  if (!details || !quantities) {
    return NextResponse.json({ error: "Invalid order." }, { status: 400 });
  }

  const errors = validateBuyerDetails(details);
  if (Object.keys(errors).length > 0) {
    return NextResponse.json(
      { error: "Please check your details and try again.", fields: errors },
      { status: 400 },
    );
  }

  const lines = buildOrderLines(quantities);
  if (lines.length === 0) {
    return NextResponse.json(
      { error: "The tickets you selected are no longer on sale. Please choose again." },
      { status: 409 },
    );
  }

  const buyer = {
    firstName: clip(details.firstName),
    lastName: clip(details.lastName),
    email: details.email.trim().toLowerCase(),
    phone: clip(details.phone),
  };
  const eventLabel = `${eventConfig.orgName} ${eventConfig.eventName}`;
  const origin = siteOrigin(request);

  try {
    const session = await getStripe().checkout.sessions.create({
      mode: "payment",
      line_items: lines.map(({ stage, quantity }) => ({
        quantity,
        price_data: {
          currency: "gbp",
          unit_amount: Math.round(stage.price * 100),
          product_data: {
            name: `${stage.name} ticket`,
            description: `${eventLabel} · ${formatEventDate(eventConfig.eventStart)}`,
          },
        },
      })),
      customer_email: buyer.email,
      metadata: buyer,
      payment_intent_data: {
        description: `${eventLabel} – ${orderTicketCount(lines)} ticket(s)`,
        receipt_email: buyer.email,
        metadata: buyer,
      },
      // Stripe's default is 24h; 30 min (its minimum) stops a session being paid at a stage's price long after that stage closes.
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
      success_url: `${origin}/order/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/#tickets`,
    });

    if (!session.url) throw new Error("Stripe did not return a checkout URL.");
    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[checkout] failed to create Stripe session:", err);
    return NextResponse.json(
      { error: "We couldn't start the payment. Please try again in a moment." },
      { status: 502 },
    );
  }
}
