import type { Metadata } from "next";
import Link from "next/link";
import type Stripe from "stripe";
import { ClearCheckoutDraft } from "@/components/ClearCheckoutDraft";
import { PageAtmosphere } from "@/components/PageAtmosphere";
import { eventConfig, formatEventDate, formatPrice } from "@/config/event";
import { orderReference } from "@/lib/order-reference";
import { getStripe, isStripeConfigured, modeForSessionId } from "@/lib/stripe";

export const metadata: Metadata = {
  title: `Order confirmed – ${eventConfig.orgName} ${eventConfig.eventName}`,
  robots: { index: false },
};

type PaidSession = {
  session: Stripe.Checkout.Session;
  lineItems: Stripe.LineItem[];
};

async function loadPaidSession(sessionId: string): Promise<PaidSession | null> {
  const mode = modeForSessionId(sessionId);
  if (!isStripeConfigured(mode) || !sessionId.startsWith("cs_")) return null;
  try {
    const stripe = getStripe(mode);
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== "paid") return null;
    const lineItems = await stripe.checkout.sessions.listLineItems(sessionId);
    return { session, lineItems: lineItems.data };
  } catch {
    return null;
  }
}

export default async function OrderSuccessPage(
  props: PageProps<"/order/success">,
) {
  const { session_id } = await props.searchParams;
  const paid =
    typeof session_id === "string" ? await loadPaidSession(session_id) : null;

  return (
    <div className="page-shell">
      <PageAtmosphere />
      <main className="section-pad flex min-h-[100svh] flex-col items-center justify-center py-16 text-center">
        <img
          src="/filbrit-logo.png"
          alt="Stevenage FilBrit Community"
          width={80}
          height={80}
          className="hero-logo h-16 w-16 object-contain sm:h-20 sm:w-20"
        />

        {paid ? (
          <>
            <ClearCheckoutDraft />
            <h1 className="mt-8 font-display text-4xl text-[var(--ivory)] sm:text-5xl">
              You&apos;re booked{paid.session.metadata?.firstName ? `, ${paid.session.metadata.firstName}` : ""}!
            </h1>
            <p className="mt-4 max-w-md text-[var(--ivory-soft)]">
              Thank you for your order. A receipt is on its way to{" "}
              <span className="text-[var(--gold)]">
                {paid.session.customer_details?.email}
              </span>
              .
            </p>

            <div className="mt-10 w-full max-w-md rounded-md border border-[var(--pine-line)] bg-[var(--evergreen-deep)]/70 p-5 text-left">
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--mist)]">
                Order reference
              </p>
              <p className="mt-1 font-display text-2xl text-[var(--gold)]">
                {orderReference(paid.session.id)}
              </p>
              <ul className="mt-4 space-y-2 border-t border-[var(--pine-line)] pt-4">
                {paid.lineItems.map((item) => (
                  <li key={item.id} className="flex justify-between gap-4 text-sm">
                    <span className="text-[var(--ivory-soft)]">
                      {item.quantity} × {item.description}
                    </span>
                    <span className="tabular-nums text-[var(--ivory)]">
                      {formatPrice(item.amount_total / 100)}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex justify-between border-t border-[var(--pine-line)] pt-3">
                <span className="font-display text-lg text-[var(--ivory)]">Total paid</span>
                <span className="font-display text-lg text-[var(--gold)]">
                  {formatPrice((paid.session.amount_total ?? 0) / 100)}
                </span>
              </div>
            </div>

            <p className="mt-8 max-w-md text-sm leading-relaxed text-[var(--mist)]">
              See you on {formatEventDate(eventConfig.eventStart)}. We&apos;ll
              be in touch with the full venue details before the night.
            </p>
            <p className="mt-4 text-sm text-[var(--mist)]">
              Questions? Email{" "}
              <a
                href={`mailto:${eventConfig.contactEmail}`}
                className="text-[var(--gold)] underline decoration-[var(--gold)]/50 underline-offset-4"
              >
                {eventConfig.contactEmail}
              </a>{" "}
              and quote your order reference.
            </p>
          </>
        ) : (
          <>
            <h1 className="mt-8 font-display text-4xl text-[var(--ivory)] sm:text-5xl">
              Thank you!
            </h1>
            <p className="mt-4 max-w-md text-[var(--ivory-soft)]">
              If your payment went through, a receipt will arrive by email
              shortly. If you have any questions about your order, email{" "}
              <a
                href={`mailto:${eventConfig.contactEmail}`}
                className="text-[var(--gold)] underline decoration-[var(--gold)]/50 underline-offset-4"
              >
                {eventConfig.contactEmail}
              </a>
              .
            </p>
          </>
        )}

        <Link
          href="/"
          className="mt-10 rounded-full border border-[var(--gold)]/60 px-8 py-3 text-sm text-[var(--gold)] transition hover:bg-[var(--gold)]/10"
        >
          Back to the event page
        </Link>
      </main>
    </div>
  );
}
