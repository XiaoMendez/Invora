-- Migration: Add producto_archivo table
-- Date: 2026
-- Description: The API route app/api/productos/archivos/route.ts reads and writes
-- to a table called "producto_archivo" that was never created in the schema.
-- This is the root cause of every 500 error on /api/productos/archivos
-- (GET, POST and DELETE all fail because the table does not exist).

CREATE TABLE producto_archivo (
    id          UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_producto UUID          NOT NULL REFERENCES producto(id) ON DELETE CASCADE,
    id_empresa  UUID          NOT NULL REFERENCES empresa(id) ON DELETE CASCADE,
    nombre      TEXT          NOT NULL,
    url         TEXT          NOT NULL,
    tipo        TEXT          NOT NULL,
    tamano      INTEGER       NOT NULL DEFAULT 0,
    creado_en   TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_producto_archivo_producto ON producto_archivo(id_producto);
CREATE INDEX idx_producto_archivo_empresa  ON producto_archivo(id_empresa);

ALTER TABLE producto_archivo ENABLE ROW LEVEL SECURITY;

-- Same access pattern as every other id_empresa-scoped table (see 001_create_schema.sql)
CREATE POLICY pol_producto_archivo ON producto_archivo
    FOR ALL USING (id_empresa = fn_empresa_del_usuario());
