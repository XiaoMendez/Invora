-- Migration: Fix broken search_path on trigger functions
-- Date: 2026
-- Description:
--   002_fix_security.sql set search_path = '' on 16 functions to satisfy
--   Supabase's "Function Search Path Mutable" linter warning. That is the
--   *recommended* fix in general, but it silently breaks every one of these
--   functions here, because their bodies (in 001_create_schema.sql) reference
--   tables, ENUM types, and other functions WITHOUT schema-qualifying them
--   (e.g. "estado_compra" instead of "public.estado_compra",
--   "fn_recalcular_venta(...)" instead of "public.fn_recalcular_venta(...)").
--
--   With search_path = '', Postgres can no longer resolve any of those
--   unqualified names, so every INSERT into venta_detalle / compra_detalle
--   fires the trg_totales_venta / trg_totales_compra / trg_venta_detalle_insert /
--   trg_compra_detalle_insert triggers, which fail with errors like:
--     - "type estado_compra does not exist"
--     - "function fn_recalcular_venta(uuid) does not exist"
--   causing Postgres to roll back the detail INSERT. The venta/compra header
--   row was already committed in an earlier statement, so it's left behind
--   with no detail rows and $0 totals ("fantasma" purchases/sales).
--
--   This migration keeps the security fix (an explicit, immutable
--   search_path — still required by the linter) but points it at
--   'public, pg_temp' instead of an empty string, so every unqualified
--   reference inside these functions resolves correctly again.

ALTER FUNCTION public.fn_empresa_del_usuario()
    SET search_path = 'public, pg_temp';

ALTER FUNCTION public.fn_rol_del_usuario()
    SET search_path = 'public, pg_temp';

ALTER FUNCTION public.fn_set_actualizado_en()
    SET search_path = 'public, pg_temp';

ALTER FUNCTION public.fn_registrar_movimiento(
    UUID, UUID, UUID, UUID,
    public.tipo_movimiento,
    INTEGER, TEXT
)
    SET search_path = 'public, pg_temp';

ALTER FUNCTION public.fn_trigger_venta_estado()
    SET search_path = 'public, pg_temp';

ALTER FUNCTION public.fn_trigger_venta_detalle_insert()
    SET search_path = 'public, pg_temp';

ALTER FUNCTION public.fn_trigger_venta_detalle_delete()
    SET search_path = 'public, pg_temp';

ALTER FUNCTION public.fn_trigger_compra_estado()
    SET search_path = 'public, pg_temp';

ALTER FUNCTION public.fn_trigger_compra_detalle_insert()
    SET search_path = 'public, pg_temp';

ALTER FUNCTION public.fn_recalcular_venta(UUID)
    SET search_path = 'public, pg_temp';

ALTER FUNCTION public.fn_trigger_totales_venta()
    SET search_path = 'public, pg_temp';

ALTER FUNCTION public.fn_recalcular_compra(UUID)
    SET search_path = 'public, pg_temp';

ALTER FUNCTION public.fn_trigger_totales_compra()
    SET search_path = 'public, pg_temp';

ALTER FUNCTION public.fn_ajuste_manual_stock(UUID, INTEGER, TEXT)
    SET search_path = 'public, pg_temp';

ALTER FUNCTION public.fn_kardex_producto(UUID)
    SET search_path = 'public, pg_temp';

ALTER FUNCTION public.fn_resumen_stock(UUID)
    SET search_path = 'public, pg_temp';

-- ============================================================
-- LIMPIEZA DE LOS REGISTROS "FANTASMA" CREADOS MIENTRAS EL BUG ESTABA ACTIVO
-- ============================================================
-- Las compras/ventas de prueba que quedaron con $0 y sin productos (las que
-- mencionas: #1, #2, #3 de "Xiao") son basura dejada por el bug, no datos
-- reales — sí conviene borrar SOLO esas, ahora que ya sabemos que no son
-- el problema. No necesitas borrar nada más de tu base de datos.
--
-- Verifica primero cuáles son (ajusta el filtro a tu caso si hace falta):
--
--   SELECT c.id, c.numero, c.estado, c.monto_total, p.nombre AS proveedor
--   FROM compra c
--   LEFT JOIN compra_detalle cd ON cd.id_compra = c.id
--   LEFT JOIN proveedor p ON p.id = c.id_proveedor
--   WHERE cd.id IS NULL;
--
-- Y para borrarlas, descomenta y ejecuta:
--
--   DELETE FROM compra WHERE id IN (
--     SELECT c.id FROM compra c
--     LEFT JOIN compra_detalle cd ON cd.id_compra = c.id
--     WHERE cd.id IS NULL
--   );
