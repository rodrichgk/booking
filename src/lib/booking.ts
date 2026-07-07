/**
 * Pure time-slot conflict helpers for booking, extracted so the overlap rule is
 * unit-testable and shared. Times are epoch milliseconds.
 */

export interface TimeSlot {
  start: number;
  end: number;
}

/**
 * Half-open interval overlap on [start, end). Back-to-back slots (one ends exactly
 * when the next begins) do NOT count as a conflict.
 */
export function slotsOverlap(a: TimeSlot, b: TimeSlot): boolean {
  return a.start < b.end && b.start < a.end;
}

/** True if `candidate` overlaps any of the `existing` slots. */
export function hasBookingConflict(candidate: TimeSlot, existing: TimeSlot[]): boolean {
  return existing.some((slot) => slotsOverlap(candidate, slot));
}
