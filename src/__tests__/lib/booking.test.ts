import { describe, it, expect } from 'vitest';
import { slotsOverlap, hasBookingConflict } from '@/lib/booking';

const t = (h: number, m = 0) => Date.UTC(2026, 0, 15, h, m);

describe('slotsOverlap', () => {
  it('detects a straightforward overlap', () => {
    expect(slotsOverlap({ start: t(10), end: t(11) }, { start: t(10, 30), end: t(11, 30) })).toBe(true);
  });

  it('treats back-to-back slots as NOT overlapping', () => {
    expect(slotsOverlap({ start: t(10), end: t(11) }, { start: t(11), end: t(12) })).toBe(false);
  });

  it('detects full containment', () => {
    expect(slotsOverlap({ start: t(9), end: t(12) }, { start: t(10), end: t(11) })).toBe(true);
  });

  it('returns false for clearly separate slots', () => {
    expect(slotsOverlap({ start: t(9), end: t(10) }, { start: t(14), end: t(15) })).toBe(false);
  });
});

describe('hasBookingConflict', () => {
  const existing = [
    { start: t(9), end: t(10) },
    { start: t(13), end: t(14) },
  ];

  it('flags a booking that collides with an existing one', () => {
    expect(hasBookingConflict({ start: t(9, 30), end: t(10, 30) }, existing)).toBe(true);
  });

  it('allows a booking in a free gap', () => {
    expect(hasBookingConflict({ start: t(11), end: t(12) }, existing)).toBe(false);
  });

  it('allows a booking exactly abutting an existing one', () => {
    expect(hasBookingConflict({ start: t(10), end: t(11) }, existing)).toBe(false);
  });
});
