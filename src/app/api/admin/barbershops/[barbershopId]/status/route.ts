import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { barbershops } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ barbershopId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentUserRole = (session.user as any).role;
    
    // Only dev and admin users can manage barbershops
    if (!['dev', 'admin'].includes(currentUserRole)) {
      return NextResponse.json({ error: 'Forbidden: Insufficient permissions' }, { status: 403 });
    }

    const { barbershopId } = await params;
    const { isActive } = await request.json();

    await db
      .update(barbershops)
      .set({ 
        isActive,
        updatedAt: new Date()
      })
      .where(eq(barbershops.id, barbershopId));

    return NextResponse.json({ success: true, isActive });
  } catch (error) {
    console.error('Error updating barbershop status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
