import { describe, it, expect, vi } from 'vitest';

// The helpers under test are pure; the DB is mocked so importing the modules
// doesn't require a Postgres connection. A failing DB read must never block.
vi.mock('@/lib/db', () => ({
  db: {
    select: vi.fn(() => {
      throw new Error('no database in tests');
    }),
    insert: vi.fn(() => {
      throw new Error('no database in tests');
    }),
  },
}));

import { getClientIp, isIpBlocked } from '@/lib/security';
import { shopDateKey, isDateKey, isShopClosedOn, getUpcomingClosures } from '@/lib/closures';

describe('getClientIp', () => {
  it('takes the first hop of x-forwarded-for', () => {
    const headers = new Headers({ 'x-forwarded-for': '203.0.113.9, 10.0.0.1' });
    expect(getClientIp(headers)).toBe('203.0.113.9');
  });

  it('falls back to x-real-ip', () => {
    expect(getClientIp(new Headers({ 'x-real-ip': '198.51.100.4' }))).toBe('198.51.100.4');
  });

  it('reads NextAuth-style plain header objects', () => {
    expect(getClientIp({ 'x-forwarded-for': '192.0.2.7' })).toBe('192.0.2.7');
  });

  it('returns null when nothing is available', () => {
    expect(getClientIp(new Headers())).toBeNull();
    expect(getClientIp(undefined)).toBeNull();
  });
});

describe('isIpBlocked', () => {
  it('fails open when the block list cannot be read', async () => {
    await expect(isIpBlocked('203.0.113.9')).resolves.toBe(false);
  });

  it('never blocks an unknown IP', async () => {
    await expect(isIpBlocked(null)).resolves.toBe(false);
  });
});

describe('shopDateKey', () => {
  it('uses the Paris calendar date, not UTC', () => {
    // 23:30 UTC on 30 Sept is already 1 Oct in Paris (UTC+2 in summer)
    expect(shopDateKey(new Date('2026-09-30T23:30:00Z'))).toBe('2026-10-01');
    // 21:00 UTC is still the same day in Paris
    expect(shopDateKey(new Date('2026-09-30T21:00:00Z'))).toBe('2026-09-30');
  });
});

describe('isDateKey', () => {
  it('accepts YYYY-MM-DD only', () => {
    expect(isDateKey('2026-12-24')).toBe(true);
    expect(isDateKey('24/12/2026')).toBe(false);
    expect(isDateKey('2026-12-24T00:00')).toBe(false);
    expect(isDateKey(null)).toBe(false);
  });
});

describe('closures without the table', () => {
  it('treats the shop as open instead of failing the booking', async () => {
    await expect(isShopClosedOn('shop-1', new Date())).resolves.toBe(false);
    await expect(getUpcomingClosures('shop-1')).resolves.toEqual([]);
  });
});
