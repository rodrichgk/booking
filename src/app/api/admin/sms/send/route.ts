import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { sendMarketingCampaign, simulateSMS } from '@/lib/sms-factor';
import { isNotNull } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Only allow admin/dev users
    const userRole = (session?.user as any)?.role;
    if (!session?.user || !['dev', 'admin'].includes(userRole)) {
      return NextResponse.json(
        { error: 'Non autorisé - Admin/Dev requis' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { message, phoneNumbers, sender, simulate } = body;

    if (!message || message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Le message est requis' },
        { status: 400 }
      );
    }

    if (!phoneNumbers || phoneNumbers.length === 0) {
      return NextResponse.json(
        { error: 'Au moins un numéro de téléphone est requis' },
        { status: 400 }
      );
    }

    // If simulate mode, use simulation endpoint
    if (simulate) {
      const result = await simulateSMS({
        message,
        recipients: phoneNumbers,
        sender,
      });

      return NextResponse.json({
        success: true,
        simulated: true,
        result,
      });
    }

    // Send actual campaign
    const result = await sendMarketingCampaign(message, phoneNumbers, sender);

    return NextResponse.json({
      success: result.success,
      sent: result.sent,
      failed: result.failed,
      cost: result.cost,
      ticket: result.ticket,
      error: result.error,
    });
  } catch (error: any) {
    console.error('SMS sending error:', error);
    return NextResponse.json(
      { error: error.message || 'Une erreur est survenue' },
      { status: 500 }
    );
  }
}

// GET endpoint to fetch all users with phone numbers for campaign targeting
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Only allow admin/dev users
    const userRole = (session?.user as any)?.role;
    if (!session?.user || !['dev', 'admin'].includes(userRole)) {
      return NextResponse.json(
        { error: 'Non autorisé - Admin/Dev requis' },
        { status: 401 }
      );
    }

    // Get all users with phone numbers
    const usersWithPhones = await db
      .select({
        id: users.id,
        name: users.name,
        phone: users.phone,
        role: users.role,
      })
      .from(users)
      .where(isNotNull(users.phone));

    return NextResponse.json({
      users: usersWithPhones,
      total: usersWithPhones.length,
    });
  } catch (error: any) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: error.message || 'Une erreur est survenue' },
      { status: 500 }
    );
  }
}
