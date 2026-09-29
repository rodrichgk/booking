import { db } from '@/lib/db';
import { blockedIps, securityLogs } from '@/lib/db/schema';
import { and, eq, gt, or, sql } from 'drizzle-orm';

type HeaderSource = Headers | Record<string, string | string[] | undefined> | undefined | null;

function readHeader(headers: HeaderSource, name: string): string | undefined {
  if (!headers) return undefined;
  if (typeof (headers as Headers).get === 'function') return (headers as Headers).get(name) ?? undefined;
  const value = (headers as Record<string, string | string[] | undefined>)[name];
  return Array.isArray(value) ? value[0] : value;
}

/** Client IP as seen behind Vercel's proxy (first x-forwarded-for hop). */
export function getClientIp(headers: HeaderSource): string | null {
  const forwarded = readHeader(headers, 'x-forwarded-for');
  const ip = forwarded?.split(',')[0]?.trim() || readHeader(headers, 'x-real-ip')?.trim();
  return ip || null;
}

// The block list is small and read on every login/signup/booking, so it is
// cached per server instance. Blocking or unblocking clears the cache here;
// other instances pick the change up within the TTL.
const CACHE_TTL_MS = 30_000;
let cache: { ips: Set<string>; at: number } | null = null;

export function clearBlockedIpCache() {
  cache = null;
}

async function loadBlockedIps(): Promise<Set<string>> {
  if (cache && Date.now() - cache.at < CACHE_TTL_MS) return cache.ips;
  try {
    const rows = await db
      .select({ ip: blockedIps.ip })
      .from(blockedIps)
      .where(or(sql`${blockedIps.expiresAt} IS NULL`, gt(blockedIps.expiresAt, new Date())));
    cache = { ips: new Set(rows.map((r) => r.ip)), at: Date.now() };
  } catch (error) {
    // Never lock everyone out because the table is missing or the DB hiccups.
    console.error('Could not load blocked IPs:', error);
    cache = { ips: new Set(), at: Date.now() };
  }
  return cache.ips;
}

export async function isIpBlocked(ip: string | null): Promise<boolean> {
  if (!ip) return false;
  return (await loadBlockedIps()).has(ip);
}

export async function logSecurityEvent(event: {
  type: 'login' | 'failed_login' | 'blocked_request' | 'signup' | 'data_export';
  email?: string | null;
  userId?: string | null;
  ip?: string | null;
  userAgent?: string | null;
  details?: string | null;
  status?: 'success' | 'failed';
}) {
  try {
    await db.insert(securityLogs).values({
      type: event.type,
      email: event.email || null,
      userId: event.userId || null,
      ip: event.ip || null,
      userAgent: event.userAgent?.slice(0, 500) || null,
      details: event.details || null,
      status: event.status || 'success',
    });
  } catch (error) {
    // Logging must never break the login itself.
    console.error('Could not write security log:', error);
  }
}

/** Failed logins for this identifier or IP in the last `minutes` minutes. */
export async function countRecentFailedLogins(identifier: string, ip: string | null, minutes = 15): Promise<number> {
  try {
    const since = new Date(Date.now() - minutes * 60_000);
    const [row] = await db
      .select({ count: sql<number>`count(*)` })
      .from(securityLogs)
      .where(
        and(
          eq(securityLogs.type, 'failed_login'),
          gt(securityLogs.createdAt, since),
          ip ? or(eq(securityLogs.email, identifier), eq(securityLogs.ip, ip)) : eq(securityLogs.email, identifier)
        )
      );
    return Number(row?.count) || 0;
  } catch (error) {
    console.error('Could not count failed logins:', error);
    return 0;
  }
}
