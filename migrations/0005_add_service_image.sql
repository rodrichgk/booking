-- Migration: Add image field to services table
-- This allows services to have associated images

ALTER TABLE services ADD COLUMN IF NOT EXISTS image TEXT;
