import type { Session } from 'next-auth';
import { db } from '@/lib/db';
import { barbershops } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

/**
 * Whether the signed-in user may manage a barbershop: its owner, its
 * co-owner, or a platform admin/dev. Returns null if the shop doesn't exist.
 */
export async function canManageShop(session: Session | null, barbershopId: string): Promise<boolean | null> {
  if (!session?.user) return false;
  const user = session.user as { id?: string; role?: string };

  const [shop] = await db
    .select({ ownerId: barbershops.ownerId, coOwnerId: barbershops.coOwnerId })
    .from(barbershops)
    .where(eq(barbershops.id, barbershopId))
    .limit(1);
  if (!shop) return null;

  if (user.role === 'admin' || user.role === 'dev') return true;
  return !!user.id && (shop.ownerId === user.id || shop.coOwnerId === user.id);
}
