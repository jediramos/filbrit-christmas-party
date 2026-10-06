/** Short, human-friendly reference derived from a Stripe Checkout Session id. */
export function orderReference(sessionId: string): string {
  return `FB-${sessionId.slice(-8).toUpperCase()}`;
}
