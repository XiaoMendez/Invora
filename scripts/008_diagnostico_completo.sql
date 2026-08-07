-- 1) TODAS las funciones relevantes (las 16 de la migración) y su search_path.
--    Si alguna sale con search_path NULL/vacío, o aparece MÁS DE UNA VEZ
--    (overload duplicado), ahí está el problema.
SELECT
    p.proname AS funcion,
    pg_get_function_identity_arguments(p.oid) AS argumentos,
    p.oid AS oid,
    (
        SELECT substring(cfg FROM 'search_path=(.*)')
        FROM unnest(p.proconfig) AS cfg
        WHERE cfg LIKE 'search_path=%'
    ) AS search_path
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.proname IN (
      'fn_empresa_del_usuario', 'fn_rol_del_usuario', 'fn_set_actualizado_en',
      'fn_registrar_movimiento', 'fn_trigger_venta_estado',
      'fn_trigger_venta_detalle_insert', 'fn_trigger_venta_detalle_delete',
      'fn_trigger_compra_estado', 'fn_trigger_compra_detalle_insert',
      'fn_recalcular_venta', 'fn_trigger_totales_venta',
      'fn_recalcular_compra', 'fn_trigger_totales_compra',
      'fn_ajuste_manual_stock', 'fn_kardex_producto', 'fn_resumen_stock'
  )
ORDER BY p.proname, p.oid;

-- 2) Triggers que REALMENTE están activos sobre compra_detalle ahora mismo,
--    y qué función ejecuta cada uno.
SELECT
    tgname AS trigger,
    tgrelid::regclass AS tabla,
    tgenabled AS habilitado,
    tgfoid::regprocedure AS funcion_ejecutada
FROM pg_trigger
WHERE tgrelid = 'public.compra_detalle'::regclass
  AND NOT tgisinternal;

-- 3) Confirmar que el tipo estado_compra existe y en qué esquema vive.
SELECT
    t.typname AS tipo,
    n.nspname AS esquema,
    t.oid
FROM pg_type t
JOIN pg_namespace n ON n.oid = t.typnamespace
WHERE t.typname = 'estado_compra';
