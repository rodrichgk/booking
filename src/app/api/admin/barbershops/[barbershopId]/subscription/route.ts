import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { barbershops } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(
    request: Request,
    { params }: { params: Promise<{ barbershopId: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userRole = (session.user as any).role;
        if (userRole !== 'admin' && userRole !== 'dev') {
            return NextResponse.json({ error: 'Forbidden - Admin/Dev only' }, { status: 403 });
        }

        const { barbershopId: shopId } = await params;
        const { action } = await request.json();

        if (!shopId) {
            return NextResponse.json({ error: 'Shop ID is required' }, { status: 400 });
        }

        // Get current shop data
        const [shop] = await db
            .select({
                subscriptionStatus: barbershops.subscriptionStatus,
                currentPeriodEnd: barbershops.currentPeriodEnd,
                isActive: barbershops.isActive,
            })
            .from(barbershops)
            .where(eq(barbershops.id, shopId));

        if (!shop) {
            return NextResponse.json({ error: 'Shop not found' }, { status: 404 });
        }

        let newStatus: string;
        let newPeriodEnd: Date | null;
        let newIsActive: boolean;

        if (action === 'activate') {
            // Activate for 30 days (simulate subscription)
            newStatus = 'active';
            newPeriodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
            newIsActive = true;
        } else if (action === 'deactivate') {
            // Deactivate subscription (for testing checkout flow)
            newStatus = 'inactive';
            newPeriodEnd = null;
            newIsActive = false;
        } else if (action === 'expire') {
            // Set as expired (past period end)
            newStatus = 'expired';
            newPeriodEnd = new Date(Date.now() - 24 * 60 * 60 * 1000); // Yesterday
            newIsActive = false;
        } else {
            return NextResponse.json({ error: 'Invalid action. Use: activate, deactivate, or expire' }, { status: 400 });
        }

        await db
            .update(barbershops)
            .set({
                subscriptionStatus: newStatus,
                currentPeriodEnd: newPeriodEnd,
                isActive: newIsActive,
                updatedAt: new Date(),
            })
            .where(eq(barbershops.id, shopId));

        return NextResponse.json({
            success: true,
            message: `Subscription ${action}d successfully`,
            newStatus,
            newPeriodEnd: newPeriodEnd?.toISOString() || null,
            newIsActive,
        });

    } catch (error: any) {
        console.error('Subscription toggle error:', error);
        return NextResponse.json(
            { error: 'Failed to update subscription', details: error.message },
            { status: 500 }
        );
    }
}
