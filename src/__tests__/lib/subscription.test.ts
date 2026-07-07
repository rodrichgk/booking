import { describe, it, expect } from 'vitest';
import { decideSubscriptionState } from '@/lib/subscription';

const NOW = Date.UTC(2026, 0, 15); // fixed "now" for deterministic tests
const DAY = 24 * 60 * 60 * 1000;
const future = NOW + 30 * DAY;
const past = NOW - 30 * DAY;

describe('decideSubscriptionState', () => {
  it('keeps the shop active on a normal renewal (active + future period)', () => {
    const d = decideSubscriptionState({
      status: 'active',
      currentPeriodEndMs: future,
      storedPeriodEndMs: NOW, // previous period ended today, now renewed forward
      nowMs: NOW,
    });
    expect(d.ignore).toBe(false);
    expect(d.isActive).toBe(true);
    expect(d.subscriptionStatus).toBe('active');
  });

  it('stays active during the past_due grace window', () => {
    const d = decideSubscriptionState({
      status: 'past_due',
      currentPeriodEndMs: past, // payment failed, period technically lapsed
      storedPeriodEndMs: past,
      nowMs: NOW,
    });
    expect(d.ignore).toBe(false);
    expect(d.isActive).toBe(true); // grace: healthy status keeps it visible
    expect(d.subscriptionStatus).toBe('past_due');
  });

  it('stays active while paid-through-future even if status is unpaid (out-of-order safety)', () => {
    const d = decideSubscriptionState({
      status: 'unpaid',
      currentPeriodEndMs: future,
      storedPeriodEndMs: future,
      nowMs: NOW,
    });
    expect(d.isActive).toBe(true); // has paid through a future date
  });

  it('disables the shop only when terminal AND expired', () => {
    const d = decideSubscriptionState({
      status: 'canceled',
      currentPeriodEndMs: past,
      storedPeriodEndMs: past,
      nowMs: NOW,
    });
    expect(d.ignore).toBe(false);
    expect(d.isActive).toBe(false);
    expect(d.subscriptionStatus).toBe('canceled');
  });

  it('ignores a stale/out-of-order event that would rewind the paid-through date', () => {
    const d = decideSubscriptionState({
      status: 'active',
      currentPeriodEndMs: NOW, // older event
      storedPeriodEndMs: future, // we already renewed further out
      nowMs: NOW,
    });
    expect(d.ignore).toBe(true); // must not clobber the fresher renewal
  });

  it('does NOT ignore terminal events even if their period is older (real cancellations apply)', () => {
    const d = decideSubscriptionState({
      status: 'canceled',
      currentPeriodEndMs: past,
      storedPeriodEndMs: future,
      nowMs: NOW,
    });
    expect(d.ignore).toBe(false);
    expect(d.isActive).toBe(false);
  });

  it('treats an incomplete first payment (no future period) as inactive', () => {
    const d = decideSubscriptionState({
      status: 'incomplete',
      currentPeriodEndMs: past,
      storedPeriodEndMs: null,
      nowMs: NOW,
    });
    expect(d.isActive).toBe(false);
    expect(d.subscriptionStatus).toBe('incomplete');
  });

  it('maps incomplete_expired to canceled and disables', () => {
    const d = decideSubscriptionState({
      status: 'incomplete_expired',
      currentPeriodEndMs: past,
      storedPeriodEndMs: past,
      nowMs: NOW,
    });
    expect(d.subscriptionStatus).toBe('canceled');
    expect(d.isActive).toBe(false);
  });
});
