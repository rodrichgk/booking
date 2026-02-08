import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getCreditsBalance } from '@/lib/sms-factor';

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

    const result = await getCreditsBalance();

    return NextResponse.json({
      credits: result.credits,
    });
  } catch (error: any) {
    console.error('Error fetching SMS credits:', error);
    return NextResponse.json(
      { error: error.message || 'Une erreur est survenue' },
      { status: 500 }
    );
  }
}
