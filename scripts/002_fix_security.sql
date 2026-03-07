-- ============================================================
-- INVORA - Migration: Fix Supabase Security Linter Issues
-- Fecha: 2026-03-06
-- Descripción:
--   1. Convierte las 4 vistas a SECURITY INVOKER  (ERRORs)
--   2. Fija search_path en las 16 funciones         (WARNs)
-- ============================================================


-- ============================================================
-- PARTE 1: VISTAS — Cambiar a SECURITY INVOKER
-- Supabase en PostgreSQL ≥15 permite ALTER VIEW ... SET (security_invoker = on)
-- Esto hace que la vista respete el RLS del usuario que consulta,
-- en lugar del usuario que creó la vista.
-- ============================================================

ALTER VIEW public.v_productos_bajo_stock    SET (security_invoker = on);
ALTER VIEW public.v_historial_inventario    SET (security_invoker = on);
ALTER VIEW public.v_resumen_ventas_mensual  SET (security_invoker = on);
ALTER VIEW public.v_productos_mas_vendidos  SET (security_invoker = on);


-- ============================================================
-- PARTE 2: FUNCIONES — Fijar search_path = ''
-- Usar search_path vacío es más seguro que 'public' porque
-- obliga a calificar objetos con su esquema explícitamente,
-- eliminando el riesgo de search_path injection.
-- ============================================================

-- Helpers de autenticación
ALTER FUNCTION public.fn_empresa_del_usuario()
    SET search_path = '';

ALTER FUNCTION public.fn_rol_del_usuario()
    SET search_path = '';

-- Trigger genérico de updated_at
ALTER FUNCTION public.fn_set_actualizado_en()
    SET search_path = '';

-- Función core de movimientos
ALTER FUNCTION public.fn_registrar_movimiento(
    UUID, UUID, UUID, UUID,
    public.tipo_movimiento,
    INTEGER, TEXT
)
    SET search_path = '';

-- Triggers de venta
ALTER FUNCTION public.fn_trigger_venta_estado()
    SET search_path = '';

ALTER FUNCTION public.fn_trigger_venta_detalle_insert()
    SET search_path = '';

ALTER FUNCTION public.fn_trigger_venta_detalle_delete()
    SET search_path = '';

-- Triggers de compra
ALTER FUNCTION public.fn_trigger_compra_estado()
    SET search_path = '';

ALTER FUNCTION public.fn_trigger_compra_detalle_insert()
    SET search_path = '';

-- Recálculo de totales
ALTER FUNCTION public.fn_recalcular_venta(UUID)
    SET search_path = '';

ALTER FUNCTION public.fn_trigger_totales_venta()
    SET search_path = '';

ALTER FUNCTION public.fn_recalcular_compra(UUID)
    SET search_path = '';

ALTER FUNCTION public.fn_trigger_totales_compra()
    SET search_path = '';

-- Utilidades públicas
ALTER FUNCTION public.fn_ajuste_manual_stock(UUID, INTEGER, TEXT)
    SET search_path = '';

ALTER FUNCTION public.fn_kardex_producto(UUID)
    SET search_path = '';

ALTER FUNCTION public.fn_resumen_stock(UUID)
    SET search_path = '';


-- ============================================================
-- VERIFICACIÓN (opcional, ejecutar después de la migración)
-- ============================================================

-- Verificar que las vistas ya no son security definer:
-- SELECT viewname, definition
-- FROM pg_views
-- WHERE schemaname = 'public'
--   AND viewname IN (
--       'v_productos_bajo_stock',
--       'v_historial_inventario',
--       'v_resumen_ventas_mensual',
--       'v_productos_mas_vendidos'
--   );

-- Verificar search_path de las funciones:
-- SELECT proname, proconfig
-- FROM pg_proc
-- JOIN pg_namespace ON pg_namespace.oid = pg_proc.pronamespace
-- WHERE nspname = 'public'
--   AND proname LIKE 'fn_%'
-- ORDER BY proname;


-- ============================================================
-- PARTE 3: LEAKED PASSWORD PROTECTION
-- Esta configuración NO se puede cambiar por SQL.
-- Debes activarla manualmente en:
--   Supabase Dashboard → Authentication → Providers → Email
--   → Enable "Leaked password protection" (HaveIBeenPwned)
-- ============================================================

-- ============================================================
-- FIN DE LA MIGRACIÓN
-- ============================================================