import Stripe from "stripe";
import {
  sendCustomerConfirmationEmail,
  sendOrderEmail,
  type PaidOrder,
} from "@/lib/order-email";
import { orderReference } from "@/lib/order-reference";
import { getStripe, getWebhookSecrets, isStripeConfigured } from "@/lib/stripe";

function verifyEvent(payload: string, signature: string, secrets: string[]): Stripe.Event | null {
  for (const secret of secrets) {
    try {
      return Stripe.webhooks.constructEvent(payload, signature, secret);
    } catch {
      // Signed with the other mode's secret (or invalid); try the next one.
    }
  }
  return null;
}

async function getStripeFee(
  stripe: Stripe,
  paymentIntentId: string,
): Promise<number | null> {
  try {
    const intent = await stripe.paymentIntents.retrieve(paymentIntentId, {
      expand: ["latest_charge.balance_transaction"],
    });
    const charge = intent.latest_charge;
    if (!charge || typeof charge === "string") return null;
    const balance = charge.balance_transaction;
    if (!balance || typeof balance === "string") return null;
    return balance.fee / 100;
  } catch (err) {
    console.warn("[stripe-webhook] could not load Stripe fee:", err);
    return null;
  }
}

async function handlePaidSession(stripe: Stripe, session: Stripe.Checkout.Session) {
  const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
    limit: 100,
  });
  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : (session.payment_intent?.id ?? null);

  const metadata = session.metadata ?? {};
  const order: PaidOrder = {
    reference: orderReference(session.id),
    paidAt: new Date(session.created * 1000),
    livemode: session.livemode,
    buyer: {
      firstName: metadata.firstName ?? session.customer_details?.name ?? "",
      lastName: metadata.lastName ?? "",
      email: session.customer_details?.email ?? metadata.email ?? "",
      phone: metadata.phone ?? session.customer_details?.phone ?? "",
    },
    lines: lineItems.data.map((item) => {
      const quantity = item.quantity ?? 1;
      return {
        name: item.description ?? "Ticket",
        quantity,
        unitAmount: (item.price?.unit_amount ?? item.amount_total / quantity) / 100,
        total: item.amount_total / 100,
      };
    }),
    totalPaid: (session.amount_total ?? 0) / 100,
    stripeFee: paymentIntentId ? await getStripeFee(stripe, paymentIntentId) : null,
    dashboardUrl: paymentIntentId
      ? `https://dashboard.stripe.com/${session.livemode ? "" : "test/"}payments/${paymentIntentId}`
      : null,
  };

  const results = await Promise.allSettled([
    sendOrderEmail(order),
    sendCustomerConfirmationEmail(order),
  ]);
  const failures = results.filter((r) => r.status === "rejected");
  if (failures.length > 0) {
    throw new AggregateError(
      failures.map((f) => f.reason),
      "One or more order emails failed to send.",
    );
  }
}

export async function POST(request: Request) {
  const secrets = getWebhookSecrets();
  const signature = request.headers.get("stripe-signature");
  if (secrets.length === 0 || !signature) {
    return new Response("Webhook not configured.", { status: 400 });
  }

  const event = verifyEvent(await request.text(), signature, secrets);
  if (!event) {
    console.error("[stripe-webhook] signature verification failed.");
    return new Response("Invalid signature.", { status: 400 });
  }

  const mode = event.livemode ? "live" : "test";
  if (!isStripeConfigured(mode)) {
    console.error(`[stripe-webhook] received a ${mode} event but no ${mode} secret key is set.`);
    return new Response("Stripe key for this mode is not configured.", { status: 500 });
  }
  const stripe = getStripe(mode);

  const paidSession =
    (event.type === "checkout.session.completed" &&
      event.data.object.payment_status === "paid") ||
    event.type === "checkout.session.async_payment_succeeded"
      ? event.data.object
      : null;

  if (paidSession) {
    try {
      await handlePaidSession(stripe, paidSession);
    } catch (err) {
      // A non-2xx response makes Stripe retry delivery, so a failed email isn't lost.
      console.error("[stripe-webhook] failed to process order:", err);
      return new Response("Failed to process order.", { status: 500 });
    }
  }

  return new Response("OK", { status: 200 });
}
