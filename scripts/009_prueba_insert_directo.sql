-- Toma automáticamente la compra "pendiente" más reciente y el primer
-- producto que exista, e intenta insertar un detalle real de prueba.
-- Si no tienes ninguna compra en estado "pendiente", créala primero desde
-- la app (la cabecera sí se crea bien, ya lo confirmamos) y vuelve a correr esto.

WITH compra_prueba AS (
    SELECT id FROM compra WHERE estado = 'pendiente' ORDER BY creado_en DESC LIMIT 1
),
producto_prueba AS (
    SELECT id FROM producto LIMIT 1
)
INSERT INTO compra_detalle (id_compra, id_producto, cantidad, precio_unitario)
SELECT compra_prueba.id, producto_prueba.id, 1, 10.00
FROM compra_prueba, producto_prueba
RETURNING *;
