import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { services, barbershops, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = (session.user as any).role;
    const userEmail = session.user.email;

    // Get service and its barbershop
    const [service] = await db
      .select({
        id: services.id,
        isActive: services.isActive,
        barbershopId: services.barbershopId,
        shopOwnerId: barbershops.ownerId,
      })
      .from(services)
      .innerJoin(barbershops, eq(services.barbershopId, barbershops.id))
      .where(eq(services.id, id))
      .limit(1);

    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    // Verify ownership or admin access
    if (userRole !== 'admin' && userRole !== 'dev') {
      if (!service.shopOwnerId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }

      const [owner] = await db
        .select({ email: users.email })
        .from(users)
        .where(eq(users.id, service.shopOwnerId))
        .limit(1);

      if (!owner || owner.email !== userEmail) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }
    }

    // Toggle isActive status
    const newStatus = !service.isActive;
    await db
      .update(services)
      .set({ isActive: newStatus })
      .where(eq(services.id, id));

    return NextResponse.json({ 
      success: true, 
      isActive: newStatus,
      message: newStatus ? 'Service activé' : 'Service désactivé'
    });
  } catch (error) {
    console.error('Error toggling service status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
