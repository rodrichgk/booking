-- Migration: Make booking foreign keys nullable for guest bookings
-- This allows bookings without authenticated users, specific barbers, or specific services

-- Make user_id nullable (for guest bookings)
ALTER TABLE bookings ALTER COLUMN user_id DROP NOT NULL;

-- Make barber_id nullable (when no specific barber is selected)
ALTER TABLE bookings ALTER COLUMN barber_id DROP NOT NULL;

-- Make service_id nullable (when no specific service is selected)
ALTER TABLE bookings ALTER COLUMN service_id DROP NOT NULL;
