-- Migration: Add 'configurado' field to empresa table
-- This field tracks whether the user has completed the initial setup wizard

-- Add configurado column to empresa table
ALTER TABLE empresa 
ADD COLUMN IF NOT EXISTS configurado BOOLEAN DEFAULT false;

-- Add comment explaining the field
COMMENT ON COLUMN empresa.configurado IS 'Indicates if the company has completed the initial setup wizard';

-- Update existing empresas to mark them as configured if they have complete data
UPDATE empresa 
SET configurado = true 
WHERE nombre IS NOT NULL 
  AND nombre != '' 
  AND email IS NOT NULL 
  AND email != '';

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_empresa_configurado ON empresa(configurado);
