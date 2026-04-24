-- Migration: Fix RLS INSERT policies for empresa and usuario_empresa
-- Date: 2026-04-24
-- Description: Adds INSERT policies to allow user onboarding (creating empresa and usuario_empresa)
-- This script is idempotent - can be run multiple times safely

-- ============================================================
-- STEP 1: Drop existing INSERT policies if they exist
-- ============================================================
DROP POLICY IF EXISTS pol_empresa_insert ON empresa;
DROP POLICY IF EXISTS pol_usuario_empresa_insert ON usuario_empresa;
DROP POLICY IF EXISTS pol_categoria_insert ON categoria;

-- ============================================================
-- STEP 2: Create INSERT policy for empresa table
-- Any authenticated user can create a new empresa (for onboarding)
-- ============================================================
CREATE POLICY pol_empresa_insert ON empresa
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================================
-- STEP 3: Create INSERT policy for usuario_empresa table
-- Authenticated users can create their own relationship
-- ============================================================
CREATE POLICY pol_usuario_empresa_insert ON usuario_empresa
    FOR INSERT
    TO authenticated
    WITH CHECK (id_usuario = auth.uid());

-- ============================================================
-- STEP 4: Create INSERT policy for categoria table
-- Users can insert categories for empresas they belong to
-- Special case: allow if this is the first usuario_empresa being created
-- (during onboarding, the usuario_empresa doesn't exist yet when creating categories)
-- ============================================================
CREATE POLICY pol_categoria_insert ON categoria
    FOR INSERT
    TO authenticated
    WITH CHECK (
        -- Either user already belongs to the empresa
        id_empresa IN (
            SELECT ue.id_empresa FROM usuario_empresa ue WHERE ue.id_usuario = auth.uid()
        )
        -- Or this is a new empresa being set up (no usuario_empresa yet)
        OR NOT EXISTS (
            SELECT 1 FROM usuario_empresa ue WHERE ue.id_usuario = auth.uid()
        )
    );

-- ============================================================
-- VERIFICATION: Check that policies were created
-- ============================================================
-- Run this to verify:
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
-- FROM pg_policies 
-- WHERE tablename IN ('empresa', 'usuario_empresa', 'categoria');
