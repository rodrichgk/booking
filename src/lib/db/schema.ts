import { pgTable, text, timestamp, integer, boolean, decimal, uuid, varchar, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users table
export const users = pgTable('user', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  password: varchar('password', { length: 255 }), // For credentials login
  phone: varchar('phone', { length: 20 }),
  image: text('image'),
  role: varchar('role', { length: 20 }).notNull().default('customer'), // customer, barber, admin, dev
  emailVerified: timestamp('emailVerified'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// NextAuth adapter tables
export const accounts = pgTable('account', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: varchar('type', { length: 255 }).notNull(),
  provider: varchar('provider', { length: 255 }).notNull(),
  providerAccountId: varchar('providerAccountId', { length: 255 }).notNull(),
  refresh_token: text('refresh_token'),
  access_token: text('access_token'),
  expires_at: integer('expires_at'),
  token_type: varchar('token_type', { length: 255 }),
  scope: varchar('scope', { length: 255 }),
  id_token: text('id_token'),
  session_state: varchar('session_state', { length: 255 }),
});

export const sessions = pgTable('session', {
  id: uuid('id').defaultRandom().primaryKey(),
  sessionToken: varchar('sessionToken', { length: 255 }).notNull().unique(),
  userId: uuid('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires').notNull(),
});

export const verificationTokens = pgTable('verificationToken', {
  identifier: varchar('identifier', { length: 255 }).notNull(),
  token: varchar('token', { length: 255 }).notNull().unique(),
  expires: timestamp('expires').notNull(),
});

// Barbershops table
export const barbershops = pgTable('barbershops', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  address: text('address').notNull(),
  city: varchar('city', { length: 100 }).notNull(),
  state: varchar('state', { length: 50 }),
  zipCode: varchar('zip_code', { length: 10 }),
  phone: varchar('phone', { length: 20 }),
  email: varchar('email', { length: 255 }),
  website: varchar('website', { length: 255 }),
  images: jsonb('images').$type<string[]>().default([]),
  rating: decimal('rating', { precision: 3, scale: 2 }).default('0'),
  reviewCount: integer('review_count').default(0),
  isActive: boolean('is_active').default(true),
  ownerId: uuid('owner_id').references(() => users.id),
  openingHours: jsonb('opening_hours').$type<{
    [key: string]: { open: string; close: string; closed: boolean };
  }>(),
  specialties: jsonb('specialties').$type<string[]>().default([]),
  // Stripe subscription fields
  stripeCustomerId: varchar('stripe_customer_id', { length: 255 }),
  stripeSubscriptionId: varchar('stripe_subscription_id', { length: 255 }),
  subscriptionStatus: varchar('subscription_status', { length: 50 }).default('inactive'), // active, canceled, past_due, trialing, inactive
  currentPeriodEnd: timestamp('current_period_end'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Barbers table
export const barbers = pgTable('barbers', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  barbershopId: uuid('barbershop_id').references(() => barbershops.id).notNull(),
  profileImage: text('profile_image'),
  galleryImages: jsonb('gallery_images').$type<string[]>().default([]),
  youtubeLinks: jsonb('youtube_links').$type<string[]>().default([]),
  bio: text('bio'),
  specialties: jsonb('specialties').$type<string[]>(),
  experience: integer('experience'),
  rating: decimal('rating', { precision: 3, scale: 2 }),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Services table
export const services = pgTable('services', {
  id: uuid('id').defaultRandom().primaryKey(),
  barbershopId: uuid('barbershop_id').references(() => barbershops.id).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  image: text('image'),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  duration: integer('duration').notNull(), // in minutes
  category: varchar('category', { length: 255 }),
  isActive: boolean('is_active'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Bookings table
export const bookings = pgTable('bookings', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id), // Nullable for guest bookings
  barbershopId: uuid('barbershop_id').references(() => barbershops.id).notNull(),
  barberId: uuid('barber_id').references(() => barbers.id), // Nullable if no specific barber
  serviceId: uuid('service_id').references(() => services.id), // Nullable if no specific service
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time').notNull(),
  status: varchar('status', { length: 255 }),
  notes: text('notes'),
  totalPrice: decimal('total_price', { precision: 10, scale: 2 }).notNull(),
  // Customer contact info (for guests without accounts)
  customerName: varchar('customer_name', { length: 255 }),
  customerEmail: varchar('customer_email', { length: 255 }),
  customerPhone: varchar('customer_phone', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Reviews table
export const reviews = pgTable('reviews', {
  id: uuid('id').defaultRandom().primaryKey(),
  customerId: uuid('customer_id').references(() => users.id).notNull(),
  barbershopId: uuid('barbershop_id').references(() => barbershops.id),
  barberId: uuid('barber_id').references(() => barbers.id),
  bookingId: uuid('booking_id').references(() => bookings.id),
  rating: integer('rating').notNull(), // 1-5
  comment: text('comment'),
  images: jsonb('images').$type<string[]>().default([]),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  bookings: many(bookings),
  reviews: many(reviews),
  ownedBarbershops: many(barbershops),
  barberProfile: many(barbers),
}));

export const barbershopsRelations = relations(barbershops, ({ one, many }) => ({
  owner: one(users, {
    fields: [barbershops.ownerId],
    references: [users.id],
  }),
  barbers: many(barbers),
  services: many(services),
  bookings: many(bookings),
  reviews: many(reviews),
}));

export const barbersRelations = relations(barbers, ({ one, many }) => ({
  user: one(users, {
    fields: [barbers.userId],
    references: [users.id],
  }),
  barbershop: one(barbershops, {
    fields: [barbers.barbershopId],
    references: [barbershops.id],
  }),
  bookings: many(bookings),
  reviews: many(reviews),
}));

export const servicesRelations = relations(services, ({ one, many }) => ({
  barbershop: one(barbershops, {
    fields: [services.barbershopId],
    references: [barbershops.id],
  }),
  bookings: many(bookings),
}));

export const bookingsRelations = relations(bookings, ({ one }) => ({
  user: one(users, {
    fields: [bookings.userId],
    references: [users.id],
  }),
  barbershop: one(barbershops, {
    fields: [bookings.barbershopId],
    references: [barbershops.id],
  }),
  barber: one(barbers, {
    fields: [bookings.barberId],
    references: [barbers.id],
  }),
  service: one(services, {
    fields: [bookings.serviceId],
    references: [services.id],
  }),
  review: one(reviews),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  customer: one(users, {
    fields: [reviews.customerId],
    references: [users.id],
  }),
  barbershop: one(barbershops, {
    fields: [reviews.barbershopId],
    references: [barbershops.id],
  }),
  barber: one(barbers, {
    fields: [reviews.barberId],
    references: [barbers.id],
  }),
  booking: one(bookings, {
    fields: [reviews.bookingId],
    references: [bookings.id],
  }),
}));

// Site Settings table (for admin/dev configuration)
export const siteSettings = pgTable('site_settings', {
  id: uuid('id').defaultRandom().primaryKey(),
  key: varchar('key', { length: 255 }).notNull().unique(),
  value: jsonb('value').notNull(),
  description: text('description'),
  updatedBy: uuid('updated_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Security Logs table (for tracking login attempts and security events)
export const securityLogs = pgTable('security_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id),
  type: varchar('type', { length: 50 }).notNull(), // login, failed_login, logout, role_change, password_change
  email: varchar('email', { length: 255 }),
  ip: varchar('ip', { length: 45 }),
  userAgent: text('user_agent'),
  location: varchar('location', { length: 255 }),
  details: text('details'),
  status: varchar('status', { length: 20 }).notNull().default('success'), // success, failed
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Blocked IPs table
export const blockedIps = pgTable('blocked_ips', {
  id: uuid('id').defaultRandom().primaryKey(),
  ip: varchar('ip', { length: 45 }).notNull().unique(),
  reason: text('reason'),
  blockedBy: uuid('blocked_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  expiresAt: timestamp('expires_at'),
});
