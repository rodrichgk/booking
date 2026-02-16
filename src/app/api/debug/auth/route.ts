import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

// TEMPORARY debug endpoint - DELETE AFTER USE
export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get('email');
  const password = request.nextUrl.searchParams.get('password');

  if (!email || !password) {
    return NextResponse.json({ error: 'Provide email and password as query params' }, { status: 400 });
  }

  try {
    // Find user
    const user = await db
      .select({
        id: users.id,
        email: users.email,
        password: users.password,
        name: users.name,
        role: users.role,
        username: users.username,
        phone: users.phone,
      })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user.length) {
      return NextResponse.json({ error: 'User not found', email });
    }

    const userData = user[0];

    // Check password
    let isPasswordValid = false;
    if (userData.password) {
      isPasswordValid = await bcrypt.compare(password, userData.password);
    }

    return NextResponse.json({
      email,
      userExists: true,
      hasPassword: !!userData.password,
      passwordHash: userData.password ? userData.password.substring(0, 30) + '...' : null,
      isPasswordValid,
      userData: {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        username: userData.username,
        phone: userData.phone,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
