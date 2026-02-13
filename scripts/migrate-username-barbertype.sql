-- Migration: Add username to users table and barber_type to barbers table
-- Run this against your PostgreSQL database

-- Add username column to user table (unique, nullable)
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "username" VARCHAR(50) UNIQUE;

-- Add barber_type column to barbers table
ALTER TABLE "barbers" ADD COLUMN IF NOT EXISTS "barber_type" VARCHAR(100);
