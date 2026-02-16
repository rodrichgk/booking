import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

// TEMPORARY - Test the exact same logic as auth.ts
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!password) {
      return NextResponse.json({ error: 'No password provided' });
    }

    // Allow login with email, phone, or username
    const identifier = email;
    if (!identifier) {
      return NextResponse.json({ error: 'No identifier provided' });
    }

    const safeSelect = {
      id: users.id,
      email: users.email,
      password: users.password,
      name: users.name,
      role: users.role,
      image: users.image,
    };

    const user = await db
      .select(safeSelect)
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user || !user.length) {
      return NextResponse.json({ 
        error: 'User not found',
        identifier,
        userCount: user?.length || 0
      });
    }

    const userData = user[0];

    // Check password
    let isPasswordValid = false;
    if (userData.password) {
      isPasswordValid = await bcrypt.compare(password, userData.password);
    }

    if (!isPasswordValid) {
      return NextResponse.json({
        error: 'Invalid password',
        hasPassword: !!userData.password,
        passwordHash: userData.password ? userData.password.substring(0, 30) + '...' : null,
        isPasswordValid
      });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        image: userData.image || undefined,
      }
    });
  } catch (error: any) {
    return NextResponse.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
}
