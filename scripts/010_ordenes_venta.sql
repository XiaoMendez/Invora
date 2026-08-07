-- Migration: Crear Órdenes de Venta
-- Fecha: 2026
-- Descripción:
--   Reemplaza los módulos "Compras" y "Ventas" (tablas compra/venta con
--   triggers PL/pgSQL que referenciaban objetos sin calificar el esquema
--   y generaban registros "fantasma" al romperse con search_path='').
--
--   "Órdenes de Compra" ya existía como tabla simple sin triggers. Esta
--   migración crea su equivalente para ventas: "ordenes_venta". Ninguna
--   de las dos depende de funciones/triggers en la base de datos — el
--   descuento/incremento de stock y la creación del movimiento de
--   inventario correspondiente se hacen desde la aplicación (Next.js),
--   igual que /api/ajuste-inventario, evitando por completo el patrón
--   que causaba los errores.
--
--   Este script es idempotente - puede ejecutarse varias veces sin problema.

-- ============================================================
-- TABLA: ordenes_venta
-- ============================================================
CREATE TABLE IF NOT EXISTS public.ordenes_venta (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_empresa              UUID NOT NULL REFERENCES public.empresa(id) ON DELETE CASCADE,
    numero_ov               TEXT NOT NULL,
    id_cliente              UUID NOT NULL REFERENCES public.cliente(id) ON DELETE RESTRICT,
    fecha_orden             TIMESTAMPTZ NOT NULL DEFAULT now(),
    fecha_entrega_esperada  DATE,
    estado                  TEXT NOT NULL DEFAULT 'borrador'
                                CHECK (estado IN ('borrador', 'confirmada', 'entregada', 'cancelada')),
    total                   NUMERIC(12, 2) NOT NULL DEFAULT 0,
    notas                   TEXT,
    stock_aplicado          BOOLEAN NOT NULL DEFAULT false,
    creado_en               TIMESTAMPTZ NOT NULL DEFAULT now(),
    actualizado_en          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ordenes_venta_empresa ON public.ordenes_venta(id_empresa);
CREATE INDEX IF NOT EXISTS idx_ordenes_venta_cliente ON public.ordenes_venta(id_cliente);

-- ============================================================
-- TABLA: ordenes_venta_items
-- ============================================================
CREATE TABLE IF NOT EXISTS public.ordenes_venta_items (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_orden_venta      UUID NOT NULL REFERENCES public.ordenes_venta(id) ON DELETE CASCADE,
    id_producto         UUID REFERENCES public.producto(id) ON DELETE SET NULL,
    descripcion         TEXT,
    cantidad            INTEGER NOT NULL DEFAULT 1 CHECK (cantidad > 0),
    precio_unitario     NUMERIC(12, 2) NOT NULL DEFAULT 0,
    subtotal            NUMERIC(12, 2) NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_ordenes_venta_items_orden ON public.ordenes_venta_items(id_orden_venta);
CREATE INDEX IF NOT EXISTS idx_ordenes_venta_items_producto ON public.ordenes_venta_items(id_producto);

-- ============================================================
-- RLS — mismo patrón que el resto de tablas de la app
-- ============================================================
ALTER TABLE public.ordenes_venta ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ordenes_venta_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS pol_ordenes_venta_select ON public.ordenes_venta;
CREATE POLICY pol_ordenes_venta_select ON public.ordenes_venta
    FOR SELECT TO authenticated
    USING (
        id_empresa IN (SELECT ue.id_empresa FROM public.usuario_empresa ue WHERE ue.id_usuario = auth.uid())
    );

DROP POLICY IF EXISTS pol_ordenes_venta_insert ON public.ordenes_venta;
CREATE POLICY pol_ordenes_venta_insert ON public.ordenes_venta
    FOR INSERT TO authenticated
    WITH CHECK (
        id_empresa IN (SELECT ue.id_empresa FROM public.usuario_empresa ue WHERE ue.id_usuario = auth.uid())
    );

DROP POLICY IF EXISTS pol_ordenes_venta_update ON public.ordenes_venta;
CREATE POLICY pol_ordenes_venta_update ON public.ordenes_venta
    FOR UPDATE TO authenticated
    USING (
        id_empresa IN (SELECT ue.id_empresa FROM public.usuario_empresa ue WHERE ue.id_usuario = auth.uid())
    )
    WITH CHECK (
        id_empresa IN (SELECT ue.id_empresa FROM public.usuario_empresa ue WHERE ue.id_usuario = auth.uid())
    );

DROP POLICY IF EXISTS pol_ordenes_venta_delete ON public.ordenes_venta;
CREATE POLICY pol_ordenes_venta_delete ON public.ordenes_venta
    FOR DELETE TO authenticated
    USING (
        id_empresa IN (SELECT ue.id_empresa FROM public.usuario_empresa ue WHERE ue.id_usuario = auth.uid())
    );

DROP POLICY IF EXISTS pol_ordenes_venta_items_select ON public.ordenes_venta_items;
CREATE POLICY pol_ordenes_venta_items_select ON public.ordenes_venta_items
    FOR SELECT TO authenticated
    USING (
        id_orden_venta IN (
            SELECT ov.id FROM public.ordenes_venta ov
            WHERE ov.id_empresa IN (SELECT ue.id_empresa FROM public.usuario_empresa ue WHERE ue.id_usuario = auth.uid())
        )
    );

DROP POLICY IF EXISTS pol_ordenes_venta_items_insert ON public.ordenes_venta_items;
CREATE POLICY pol_ordenes_venta_items_insert ON public.ordenes_venta_items
    FOR INSERT TO authenticated
    WITH CHECK (
        id_orden_venta IN (
            SELECT ov.id FROM public.ordenes_venta ov
            WHERE ov.id_empresa IN (SELECT ue.id_empresa FROM public.usuario_empresa ue WHERE ue.id_usuario = auth.uid())
        )
    );

DROP POLICY IF EXISTS pol_ordenes_venta_items_update ON public.ordenes_venta_items;
CREATE POLICY pol_ordenes_venta_items_update ON public.ordenes_venta_items
    FOR UPDATE TO authenticated
    USING (
        id_orden_venta IN (
            SELECT ov.id FROM public.ordenes_venta ov
            WHERE ov.id_empresa IN (SELECT ue.id_empresa FROM public.usuario_empresa ue WHERE ue.id_usuario = auth.uid())
        )
    );

DROP POLICY IF EXISTS pol_ordenes_venta_items_delete ON public.ordenes_venta_items;
CREATE POLICY pol_ordenes_venta_items_delete ON public.ordenes_venta_items
    FOR DELETE TO authenticated
    USING (
        id_orden_venta IN (
            SELECT ov.id FROM public.ordenes_venta ov
            WHERE ov.id_empresa IN (SELECT ue.id_empresa FROM public.usuario_empresa ue WHERE ue.id_usuario = auth.uid())
        )
    );

-- ============================================================
-- stock_aplicado en ordenes_compra
-- ============================================================
-- Igual que ordenes_venta, usamos una bandera para saber si ya se generó
-- el movimiento de inventario de esta orden, y así evitar duplicar el
-- stock si el usuario guarda la orden varias veces en estado "entregada".
ALTER TABLE public.ordenes_compra
    ADD COLUMN IF NOT EXISTS stock_aplicado BOOLEAN NOT NULL DEFAULT false;

-- ============================================================
-- OPCIONAL — LIMPIEZA DE LOS MÓDULOS COMPRAS/VENTAS ANTIGUOS
-- ============================================================
-- Los módulos "Compras" y "Ventas" fueron eliminados de la aplicación
-- (reemplazados por Órdenes de Compra / Órdenes de Venta + Movimientos).
-- Las tablas "compra", "compra_detalle", "venta", "venta_detalle" y sus
-- funciones/triggers asociados YA NO SE USAN, pero este script NO las
-- borra automáticamente para no perder datos históricos. Si quieres
-- eliminarlas por completo más adelante, revisa primero que no las
-- necesites y luego ejecuta manualmente algo como:
--
--   DROP TABLE IF EXISTS public.venta_detalle CASCADE;
--   DROP TABLE IF EXISTS public.venta CASCADE;
--   DROP TABLE IF EXISTS public.compra_detalle CASCADE;
--   DROP TABLE IF EXISTS public.compra CASCADE;
--
-- (CASCADE también eliminará los triggers que dependen de esas tablas)

-- ============================================================
-- FIN DE LA MIGRACIÓN
-- ============================================================
