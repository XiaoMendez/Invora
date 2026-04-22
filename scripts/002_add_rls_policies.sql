-- Migration: Add RLS INSERT/UPDATE/DELETE policies
-- Date: 2024
-- Description: Adds missing RLS policies to allow user registration and CRUD operations

-- Allow authenticated users to insert a new empresa (for registration)
CREATE POLICY pol_empresa_insert ON empresa
  FOR INSERT
  TO public
  WITH CHECK (auth.uid() IS NOT NULL);

-- Allow authenticated users to insert their own usuario_empresa relation
CREATE POLICY pol_usuario_empresa_insert ON usuario_empresa
  FOR INSERT
  TO public
  WITH CHECK (id_usuario = auth.uid());

-- Allow users to insert categories for their empresa
CREATE POLICY pol_categoria_insert ON categoria
  FOR INSERT
  TO public
  WITH CHECK (
    id_empresa IN (
      SELECT id_empresa FROM usuario_empresa WHERE id_usuario = auth.uid()
    )
  );

-- Allow users to update categories for their empresa
CREATE POLICY pol_categoria_update ON categoria
  FOR UPDATE
  TO public
  USING (
    id_empresa IN (
      SELECT id_empresa FROM usuario_empresa WHERE id_usuario = auth.uid()
    )
  )
  WITH CHECK (
    id_empresa IN (
      SELECT id_empresa FROM usuario_empresa WHERE id_usuario = auth.uid()
    )
  );

-- Allow users to delete categories for their empresa
CREATE POLICY pol_categoria_delete ON categoria
  FOR DELETE
  TO public
  USING (
    id_empresa IN (
      SELECT id_empresa FROM usuario_empresa WHERE id_usuario = auth.uid()
    )
  );

-- Allow users to insert products for their empresa
CREATE POLICY pol_producto_insert ON producto
  FOR INSERT
  TO public
  WITH CHECK (
    id_empresa IN (
      SELECT id_empresa FROM usuario_empresa WHERE id_usuario = auth.uid()
    )
  );

-- Allow users to update products for their empresa
CREATE POLICY pol_producto_update ON producto
  FOR UPDATE
  TO public
  USING (
    id_empresa IN (
      SELECT id_empresa FROM usuario_empresa WHERE id_usuario = auth.uid()
    )
  )
  WITH CHECK (
    id_empresa IN (
      SELECT id_empresa FROM usuario_empresa WHERE id_usuario = auth.uid()
    )
  );

-- Allow users to delete products for their empresa
CREATE POLICY pol_producto_delete ON producto
  FOR DELETE
  TO public
  USING (
    id_empresa IN (
      SELECT id_empresa FROM usuario_empresa WHERE id_usuario = auth.uid()
    )
  );

-- Allow users to insert inventory movements for their empresa
CREATE POLICY pol_movimiento_insert ON movimiento_inventario
  FOR INSERT
  TO public
  WITH CHECK (
    id_empresa IN (
      SELECT id_empresa FROM usuario_empresa WHERE id_usuario = auth.uid()
    )
  );
