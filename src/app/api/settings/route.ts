import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { siteSettings } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// GET - Fetch site settings
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    if (key) {
      const [setting] = await db
        .select()
        .from(siteSettings)
        .where(eq(siteSettings.key, key))
        .limit(1);
      
      return NextResponse.json({ setting });
    }

    const settings = await db.select().from(siteSettings);
    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

// POST - Create or update a setting (admin/dev only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const userRole = (session.user as any).role;
    if (userRole !== 'admin' && userRole !== 'dev') {
      return NextResponse.json(
        { error: 'Accès réservé aux administrateurs' },
        { status: 403 }
      );
    }

    const userId = (session.user as any).id;
    const body = await request.json();
    const { key, value, description } = body;

    if (!key || value === undefined) {
      return NextResponse.json(
        { error: 'Clé et valeur requises' },
        { status: 400 }
      );
    }

    // Check if setting exists
    const [existing] = await db
      .select()
      .from(siteSettings)
      .where(eq(siteSettings.key, key))
      .limit(1);

    let result;
    if (existing) {
      // Update existing setting
      [result] = await db
        .update(siteSettings)
        .set({
          value,
          description: description || existing.description,
          updatedBy: userId,
          updatedAt: new Date(),
        })
        .where(eq(siteSettings.key, key))
        .returning();
    } else {
      // Create new setting
      [result] = await db
        .insert(siteSettings)
        .values({
          key,
          value,
          description,
          updatedBy: userId,
        })
        .returning();
    }

    return NextResponse.json({
      success: true,
      message: 'Paramètre enregistré',
      setting: result,
    });
  } catch (error) {
    console.error('Error saving setting:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    );
  }
}
