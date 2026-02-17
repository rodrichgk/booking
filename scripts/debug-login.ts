import 'dotenv/config';
import { db } from '../src/lib/db';
import { users } from '../src/lib/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

async function debugLogin() {
  try {
    // Get the email from command line or use a default
    const email = process.argv[2] || 'test@example.com';
    const password = process.argv[3] || 'password123';

    console.log('🔍 Debugging login for:', email);
    console.log('🔍 Password provided:', password);

    // Try to find user by email
    const userByEmail = await db
      .select({
        id: users.id,
        email: users.email,
        username: users.username,
        name: users.name,
        password: users.password,
        role: users.role,
      })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    console.log('\n📊 Query result:', userByEmail);

    if (userByEmail.length === 0) {
      console.log('❌ User not found with email:', email);
      
      // List all users
      const allUsers = await db
        .select({
          email: users.email,
          username: users.username,
          name: users.name,
          hasPassword: users.password,
        })
        .from(users)
        .limit(10);
      
      console.log('\n📋 All users in database:');
      console.log(allUsers);
    } else {
      const user = userByEmail[0];
      console.log('✅ User found!');
      console.log('   ID:', user.id);
      console.log('   Email:', user.email);
      console.log('   Username:', user.username);
      console.log('   Name:', user.name);
      console.log('   Role:', user.role);
      console.log('   Has password:', !!user.password);
      console.log('   Password hash (first 20 chars):', user.password?.substring(0, 20));

      if (user.password) {
        const isValid = await bcrypt.compare(password, user.password);
        console.log('\n🔐 Password validation:', isValid ? '✅ VALID' : '❌ INVALID');
        
        if (!isValid) {
          console.log('   Trying to hash the provided password to compare:');
          const testHash = await bcrypt.hash(password, 10);
          console.log('   New hash would be:', testHash.substring(0, 20));
        }
      } else {
        console.log('\n⚠️  User has no password set!');
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

debugLogin();
