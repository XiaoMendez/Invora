-- Verifica el search_path actual de las funciones afectadas.
-- Si la columna "search_path" sale vacía (o la fila no aparece), la
-- migración 006_fix_search_path.sql NO se aplicó todavía.
-- Si sale "public, pg_temp", el fix sí está activo y el problema es otro.

SELECT
    p.proname AS funcion,
    pg_get_function_identity_arguments(p.oid) AS argumentos,
    (
        SELECT substring(cfg FROM 'search_path=(.*)')
        FROM unnest(p.proconfig) AS cfg
        WHERE cfg LIKE 'search_path=%'
    ) AS search_path
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.proname IN (
      'fn_trigger_compra_detalle_insert',
      'fn_recalcular_venta',
      'fn_trigger_totales_venta',
      'fn_trigger_compra_estado',
      'fn_recalcular_compra'
  )
ORDER BY p.proname;
