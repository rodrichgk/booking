import 'dotenv/config';
import { Client } from 'pg';

async function initDatabase() {
  const connectionString = process.env.POSTGRES_URL;
  
  if (!connectionString) {
    throw new Error('POSTGRES_URL environment variable is not set');
  }
  
  const client = new Client({ connectionString });
  
  try {
    await client.connect();
    console.log('🔄 Initializing database...');
    
    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) NOT NULL UNIQUE,
        name VARCHAR(255) NOT NULL,
        password VARCHAR(255),
        phone VARCHAR(20),
        image TEXT,
        role VARCHAR(20) NOT NULL DEFAULT 'customer',
        "emailVerified" TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);
    
    // Create NextAuth tables
    await client.query(`
      CREATE TABLE IF NOT EXISTS accounts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        type VARCHAR(255) NOT NULL,
        provider VARCHAR(255) NOT NULL,
        "providerAccountId" VARCHAR(255) NOT NULL,
        refresh_token TEXT,
        access_token TEXT,
        expires_at INTEGER,
        token_type VARCHAR(255),
        scope VARCHAR(255),
        id_token TEXT,
        session_state VARCHAR(255),
        UNIQUE(provider, "providerAccountId")
      )
    `);
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "sessionToken" VARCHAR(255) NOT NULL UNIQUE,
        "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        expires TIMESTAMP NOT NULL
      )
    `);
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS verification_tokens (
        identifier VARCHAR(255) NOT NULL,
        token VARCHAR(255) NOT NULL UNIQUE,
        expires TIMESTAMP NOT NULL,
        PRIMARY KEY (identifier, token)
      )
    `);
    
    // Create barbershops table
    await client.query(`
      CREATE TABLE IF NOT EXISTS barbershops (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        address TEXT NOT NULL,
        city VARCHAR(100) NOT NULL,
        state VARCHAR(50),
        zip_code VARCHAR(10),
        phone VARCHAR(20),
        email VARCHAR(255),
        website VARCHAR(255),
        images JSONB DEFAULT '[]'::jsonb,
        rating DECIMAL(3, 2) DEFAULT 0,
        review_count INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        owner_id UUID REFERENCES users(id),
        opening_hours JSONB,
        specialties JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);
    
    // Create barbers table
    await client.query(`
      CREATE TABLE IF NOT EXISTS barbers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id),
        barbershop_id UUID NOT NULL REFERENCES barbershops(id),
        bio TEXT,
        experience INTEGER,
        specialties JSONB DEFAULT '[]'::jsonb,
        rating DECIMAL(3, 2) DEFAULT 0,
        review_count INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);
    
    // Create services table
    await client.query(`
      CREATE TABLE IF NOT EXISTS services (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        barbershop_id UUID NOT NULL REFERENCES barbershops(id),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        duration INTEGER NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        category VARCHAR(100),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);
    
    // Create bookings table
    await client.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id),
        barber_id UUID NOT NULL REFERENCES barbers(id),
        service_id UUID NOT NULL REFERENCES services(id),
        barbershop_id UUID NOT NULL REFERENCES barbershops(id),
        start_time TIMESTAMP NOT NULL,
        end_time TIMESTAMP NOT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        notes TEXT,
        total_price DECIMAL(10, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);
    
    // Create reviews table
    await client.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        booking_id UUID NOT NULL REFERENCES bookings(id),
        user_id UUID NOT NULL REFERENCES users(id),
        barbershop_id UUID REFERENCES barbershops(id),
        barber_id UUID REFERENCES barbers(id),
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);
    
    console.log('✅ Database initialized successfully!');
    console.log('📊 Tables created:');
    console.log('   - users');
    console.log('   - accounts (NextAuth)');
    console.log('   - sessions (NextAuth)');
    console.log('   - verification_tokens (NextAuth)');
    console.log('   - barbershops');
    console.log('   - barbers');
    console.log('   - services');
    console.log('   - bookings');
    console.log('   - reviews');
    
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  } finally {
    await client.end();
  }
}

initDatabase()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
