-- Migration: Add site_settings table for admin/dev configuration
-- This table stores configurable settings like homepage appearance, featured barbershops, etc.

CREATE TABLE IF NOT EXISTS site_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key VARCHAR(255) NOT NULL UNIQUE,
  value JSONB NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES "user"(id),
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create index on key for faster lookups
CREATE INDEX IF NOT EXISTS idx_site_settings_key ON site_settings(key);
