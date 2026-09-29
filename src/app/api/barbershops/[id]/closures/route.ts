import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { barbershopClosures } from '@/lib/db/schema';
import { and, eq } from 'drizzle-orm';
import { canManageShop } from '@/lib/shop-access';
import { getUpcomingClosures, isDateKey, shopDateKey } from '@/lib/closures';

type Params = { params: Promise<{ id: string }> };

// Public: booking pages use this to grey out closed days.
export async function GET(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  return NextResponse.json({ closures: await getUpcomingClosures(id) });
}

async function authorize(id: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  const allowed = await canManageShop(session, id);
  if (allowed === null) return NextResponse.json({ error: 'Salon introuvable' }, { status: 404 });
  if (!allowed) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  return null;
}

export async function POST(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const denied = await authorize(id);
  if (denied) return denied;

  const { date, reason } = await request.json().catch(() => ({}));
  if (!isDateKey(date)) {
    return NextResponse.json({ error: 'Date invalide' }, { status: 400 });
  }
  if (date < shopDateKey(new Date())) {
    return NextResponse.json({ error: 'La date est déjà passée' }, { status: 400 });
  }

  try {
    const [existing] = await db
      .select({ id: barbershopClosures.id })
      .from(barbershopClosures)
      .where(and(eq(barbershopClosures.barbershopId, id), eq(barbershopClosures.date, date)))
      .limit(1);
    if (!existing) {
      await db.insert(barbershopClosures).values({
        barbershopId: id,
        date,
        reason: typeof reason === 'string' && reason.trim() ? reason.trim().slice(0, 255) : null,
      });
    }
    return NextResponse.json({ closures: await getUpcomingClosures(id) });
  } catch (error) {
    console.error('Error adding closure:', error);
    return NextResponse.json(
      { error: 'Impossible d’enregistrer la fermeture. La migration de la base a-t-elle été exécutée ?' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const denied = await authorize(id);
  if (denied) return denied;

  const date = new URL(request.url).searchParams.get('date');
  if (!isDateKey(date)) {
    return NextResponse.json({ error: 'Date invalide' }, { status: 400 });
  }

  try {
    await db
      .delete(barbershopClosures)
      .where(and(eq(barbershopClosures.barbershopId, id), eq(barbershopClosures.date, date)));
    return NextResponse.json({ closures: await getUpcomingClosures(id) });
  } catch (error) {
    console.error('Error removing closure:', error);
    return NextResponse.json({ error: 'Impossible de supprimer la fermeture' }, { status: 500 });
  }
}
