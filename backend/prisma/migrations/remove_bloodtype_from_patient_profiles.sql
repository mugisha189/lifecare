-- Migration: Remove bloodType from patient_profiles table
-- Created: 2026-01-24
-- Description: Removes the bloodType column from patient_profiles table as it's no longer needed

-- Remove bloodType column from patient_profiles
ALTER TABLE "patient_profiles" DROP COLUMN IF EXISTS "bloodType";

-- Add comment for documentation
COMMENT ON TABLE "patient_profiles" IS 'Patient profiles without blood type field (removed in 2026-01-24 migration)';
