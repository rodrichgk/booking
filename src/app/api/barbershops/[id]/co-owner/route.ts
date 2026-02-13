import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { barbershops, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { id } = await params;
    const { email } = await request.json();

    if (!email || !email.trim()) {
      return NextResponse.json({ error: 'Email requis' }, { status: 400 });
    }

    // Fetch the barbershop
    const [shop] = await db
      .select()
      .from(barbershops)
      .where(eq(barbershops.id, id))
      .limit(1);

    if (!shop) {
      return NextResponse.json({ error: 'Salon non trouvé' }, { status: 404 });
    }

    // Check authorization: only owner or admin/dev
    const userId = (session.user as any).id;
    const userRole = (session.user as any).role;
    const isOwner = shop.ownerId === userId;
    const isAdmin = ['dev', 'admin'].includes(userRole);

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'Seul le propriétaire peut ajouter un co-propriétaire' }, { status: 403 });
    }

    // Find the user by email
    const [targetUser] = await db
      .select({ id: users.id, name: users.name, email: users.email })
      .from(users)
      .where(eq(users.email, email.trim()))
      .limit(1);

    if (!targetUser) {
      return NextResponse.json({ error: 'Aucun utilisateur trouvé avec cet email. La personne doit d\'abord créer un compte.' }, { status: 404 });
    }

    // Don't allow setting owner as co-owner
    if (targetUser.id === shop.ownerId) {
      return NextResponse.json({ error: 'Cette personne est déjà le propriétaire principal' }, { status: 400 });
    }

    // Set co-owner
    await db
      .update(barbershops)
      .set({ coOwnerId: targetUser.id, updatedAt: new Date() })
      .where(eq(barbershops.id, id));

    return NextResponse.json({
      success: true,
      message: `${targetUser.name || targetUser.email} a été ajouté comme co-propriétaire`,
      coOwner: { id: targetUser.id, name: targetUser.name, email: targetUser.email },
    });
  } catch (error: any) {
    console.error('Add co-owner error:', error);
    return NextResponse.json({ error: 'Une erreur est survenue' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { id } = await params;

    // Fetch the barbershop
    const [shop] = await db
      .select()
      .from(barbershops)
      .where(eq(barbershops.id, id))
      .limit(1);

    if (!shop) {
      return NextResponse.json({ error: 'Salon non trouvé' }, { status: 404 });
    }

    // Check authorization: only owner or admin/dev
    const userId = (session.user as any).id;
    const userRole = (session.user as any).role;
    const isOwner = shop.ownerId === userId;
    const isAdmin = ['dev', 'admin'].includes(userRole);

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'Seul le propriétaire peut retirer un co-propriétaire' }, { status: 403 });
    }

    // Remove co-owner
    await db
      .update(barbershops)
      .set({ coOwnerId: null, updatedAt: new Date() })
      .where(eq(barbershops.id, id));

    return NextResponse.json({
      success: true,
      message: 'Co-propriétaire retiré',
    });
  } catch (error: any) {
    console.error('Remove co-owner error:', error);
    return NextResponse.json({ error: 'Une erreur est survenue' }, { status: 500 });
  }
}
