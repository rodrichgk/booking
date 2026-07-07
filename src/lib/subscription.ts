/**
 * Pure decision logic for a barbershop's subscription state, extracted from the
 * Stripe webhook so it can be unit-tested in isolation.
 *
 * The rule (see webhook handler): a shop is publicly visible (`isActive`) as long
 * as EITHER it has paid through a future date, OR Stripe reports a healthy/grace
 * status. It is only switched off when the subscription is terminal AND expired.
 *
 * Out-of-order protection: Stripe does not guarantee webhook ordering and may
 * redeliver events. A non-terminal event whose period end is older than what we
 * already stored is stale and must be ignored, so it can't rewind a shop that has
 * already renewed.
 */

export const HEALTHY_STATUSES = ['active', 'trialing', 'past_due'] as const;
export const TERMINAL_STATUSES = ['canceled', 'unpaid', 'incomplete_expired'] as const;

export interface SubscriptionStateInput {
  /** Raw Stripe subscription status. */
  status: string;
  /** `current_period_end` from the event, in milliseconds. */
  currentPeriodEndMs: number;
  /** Period end already stored for the shop, in milliseconds (or null if none). */
  storedPeriodEndMs: number | null;
  /** Overridable "now" for testing. */
  nowMs?: number;
}

export interface SubscriptionStateDecision {
  /** When true, the event is stale/out-of-order and must not be applied. */
  ignore: boolean;
  /** The status to persist (mapped to our vocabulary). */
  subscriptionStatus: string;
  /** Whether the shop should be publicly active/visible. */
  isActive: boolean;
}

export function decideSubscriptionState(input: SubscriptionStateInput): SubscriptionStateDecision {
  const { status, currentPeriodEndMs, storedPeriodEndMs, nowMs = Date.now() } = input;

  const isTerminal = (TERMINAL_STATUSES as readonly string[]).includes(status);

  // Ignore stale, non-terminal events that would rewind the paid-through date.
  if (!isTerminal && storedPeriodEndMs != null && currentPeriodEndMs < storedPeriodEndMs) {
    return { ignore: true, subscriptionStatus: '', isActive: false };
  }

  const paidThroughFuture = currentPeriodEndMs > nowMs;
  const isHealthy = (HEALTHY_STATUSES as readonly string[]).includes(status);
  const isActive = paidThroughFuture || isHealthy;

  let subscriptionStatus: string;
  switch (status) {
    case 'active':
    case 'trialing':
      subscriptionStatus = status;
      break;
    case 'past_due':
      subscriptionStatus = 'past_due';
      break;
    case 'canceled':
    case 'incomplete_expired':
      subscriptionStatus = 'canceled';
      break;
    default:
      subscriptionStatus = status; // unpaid, incomplete, paused, ...
  }

  return { ignore: false, subscriptionStatus, isActive };
}
