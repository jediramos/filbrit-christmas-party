import Stripe from "stripe";

export type StripeMode = "test" | "live";

const ENV_NAMES: Record<StripeMode, { secretKey: string; webhookSecret: string }> = {
  test: {
    secretKey: "STRIPE_TEST_SECRET_KEY",
    webhookSecret: "STRIPE_TEST_WEBHOOK_SECRET",
  },
  live: {
    secretKey: "STRIPE_LIVE_SECRET_KEY",
    webhookSecret: "STRIPE_LIVE_WEBHOOK_SECRET",
  },
};

const clients: Partial<Record<StripeMode, Stripe>> = {};

/** The mode new checkouts use. Anything other than `STRIPE_MODE=live` means test. */
export function getStripeMode(): StripeMode {
  return process.env.STRIPE_MODE?.trim().toLowerCase() === "live" ? "live" : "test";
}

function secretKeyFor(mode: StripeMode): string | undefined {
  return process.env[ENV_NAMES[mode].secretKey]?.trim() || undefined;
}

export function isStripeConfigured(mode: StripeMode = getStripeMode()): boolean {
  return Boolean(secretKeyFor(mode));
}

export function getStripe(mode: StripeMode = getStripeMode()): Stripe {
  const key = secretKeyFor(mode);
  if (!key) {
    throw new Error(`${ENV_NAMES[mode].secretKey} is not set.`);
  }
  clients[mode] ??= new Stripe(key);
  return clients[mode];
}

/** Both modes' secrets, so events still verify for a while after the mode is switched. */
export function getWebhookSecrets(): string[] {
  return (["test", "live"] as const)
    .map((mode) => process.env[ENV_NAMES[mode].webhookSecret]?.trim())
    .filter((secret): secret is string => Boolean(secret));
}

export function modeForSessionId(sessionId: string): StripeMode {
  return sessionId.startsWith("cs_live_") ? "live" : "test";
}
