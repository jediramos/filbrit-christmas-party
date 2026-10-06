import { eventConfig, getStageStatus, type TicketStage } from "@/config/event";

export type BuyerDetails = {
  firstName: string;
  lastName: string;
  email: string;
  confirmEmail: string;
  phone: string;
};

export type BuyerDetailsErrors = Partial<Record<keyof BuyerDetails, string>>;

export type TicketQuantities = Record<string, number>;

export type OrderLine = { stage: TicketStage; quantity: number };

/** sessionStorage key for an in-progress order, so leaving Stripe Checkout doesn't lose it. */
export const CHECKOUT_DRAFT_KEY = "filbrit-checkout-draft";

export const EMPTY_BUYER_DETAILS: BuyerDetails = {
  firstName: "",
  lastName: "",
  email: "",
  confirmEmail: "",
  phone: "",
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^\+?\d{10,15}$/;

export function validateBuyerDetails(details: BuyerDetails): BuyerDetailsErrors {
  const errors: BuyerDetailsErrors = {};
  if (!details.firstName.trim()) errors.firstName = "Enter your first name.";
  if (!details.lastName.trim()) errors.lastName = "Enter your last name.";
  if (!EMAIL_PATTERN.test(details.email.trim())) {
    errors.email = "Enter a valid email address.";
  }
  if (!details.confirmEmail.trim()) {
    errors.confirmEmail = "Repeat your email address.";
  } else if (
    details.confirmEmail.trim().toLowerCase() !==
    details.email.trim().toLowerCase()
  ) {
    errors.confirmEmail = "Email addresses do not match.";
  }
  if (!PHONE_PATTERN.test(details.phone.replace(/[\s()-]/g, ""))) {
    errors.phone = "Enter a valid phone number, e.g. 07123 456789.";
  }
  return errors;
}

/** Only stages on sale at `now` are included; quantities are capped at the per-order limit. */
export function buildOrderLines(
  quantities: TicketQuantities,
  now: Date = new Date(),
): OrderLine[] {
  let remaining = eventConfig.maxTicketsPerOrder;
  const lines: OrderLine[] = [];
  for (const stage of eventConfig.stages) {
    if (getStageStatus(stage, now) !== "current") continue;
    const requested = Math.floor(Number(quantities[stage.id]) || 0);
    const quantity = Math.min(Math.max(requested, 0), remaining);
    if (quantity > 0) {
      lines.push({ stage, quantity });
      remaining -= quantity;
    }
  }
  return lines;
}

export function orderTotal(lines: OrderLine[]): number {
  return lines.reduce((sum, l) => sum + l.stage.price * l.quantity, 0);
}

export function orderTicketCount(lines: OrderLine[]): number {
  return lines.reduce((n, l) => n + l.quantity, 0);
}
