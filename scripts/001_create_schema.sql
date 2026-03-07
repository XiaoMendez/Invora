-- ============================================================
-- INVORA - Schema completo para Supabase (PostgreSQL)
-- Incluye: tablas, constraints, índices, funciones,
--          triggers de stock, RLS policies y utilidades
-- ============================================================

-- ============================================================
-- EXTENSIONES
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- ============================================================
-- ENUMS
-- ============================================================
CREATE TYPE tipo_movimiento AS ENUM (
    'entrada',
    'salida',
    'ajuste_positivo',
    'ajuste_negativo',
    'devolucion_venta',
    'devolucion_compra'
);
CREATE TYPE estado_venta     AS ENUM ('pendiente', 'completada', 'cancelada', 'anulada');
CREATE TYPE estado_compra    AS ENUM ('pendiente', 'recibida', 'parcial', 'cancelada');
CREATE TYPE metodo_pago_tipo AS ENUM ('efectivo', 'tarjeta', 'transferencia', 'credito', 'otro');
CREATE TYPE rol_usuario      AS ENUM ('admin', 'operador', 'viewer');


-- ============================================================
-- 1. EMPRESA
-- ============================================================
CREATE TABLE empresa (
    id             UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre         TEXT        NOT NULL,
    email          TEXT        UNIQUE NOT NULL,
    password_hash  TEXT,
    telefono       TEXT,
    direccion      TEXT,
    id_fiscal      TEXT,
    logo_url       TEXT,
    activo         BOOLEAN     NOT NULL DEFAULT TRUE,
    creado_en      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 2. USUARIO_EMPRESA (auth.uid() de Supabase <-> empresa)
-- ============================================================
CREATE TABLE usuario_empresa (
    id_usuario UUID         NOT NULL,
    id_empresa UUID         NOT NULL REFERENCES empresa(id) ON DELETE CASCADE,
    rol        rol_usuario  NOT NULL DEFAULT 'operador',
    creado_en  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    PRIMARY KEY (id_usuario, id_empresa)
);

-- Helper: empresa del usuario autenticado
CREATE OR REPLACE FUNCTION fn_empresa_del_usuario()
RETURNS UUID AS $$
    SELECT id_empresa FROM usuario_empresa WHERE id_usuario = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Helper: rol del usuario autenticado
CREATE OR REPLACE FUNCTION fn_rol_del_usuario()
RETURNS TEXT AS $$
    SELECT rol::TEXT FROM usuario_empresa WHERE id_usuario = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;


-- ============================================================
-- 3. CLIENTE
-- ============================================================
CREATE TABLE cliente (
    id             UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_empresa     UUID        NOT NULL REFERENCES empresa(id) ON DELETE CASCADE,
    nombre         TEXT        NOT NULL,
    apellido       TEXT,
    correo         TEXT,
    telefono       TEXT,
    direccion      TEXT,
    activo         BOOLEAN     NOT NULL DEFAULT TRUE,
    creado_en      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 4. CATEGORIA
-- ============================================================
CREATE TABLE categoria (
    id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_empresa  UUID        NOT NULL REFERENCES empresa(id) ON DELETE CASCADE,
    nombre      TEXT        NOT NULL,
    descripcion TEXT,
    creado_en   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (id_empresa, nombre)
);

-- ============================================================
-- 5. PROVEEDOR
-- ============================================================
CREATE TABLE proveedor (
    id             UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_empresa     UUID        NOT NULL REFERENCES empresa(id) ON DELETE CASCADE,
    nombre         TEXT        NOT NULL,
    telefono       TEXT,
    correo         TEXT,
    direccion      TEXT,
    activo         BOOLEAN     NOT NULL DEFAULT TRUE,
    creado_en      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 6. PRODUCTO
-- ============================================================
CREATE TABLE producto (
    id             UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_empresa     UUID          NOT NULL REFERENCES empresa(id) ON DELETE CASCADE,
    id_categoria   UUID          REFERENCES categoria(id) ON DELETE SET NULL,
    nombre         TEXT          NOT NULL,
    descripcion    TEXT,
    sku            TEXT,
    precio_costo   NUMERIC(12,2) NOT NULL DEFAULT 0,
    precio_venta   NUMERIC(12,2) NOT NULL DEFAULT 0,
    stock          INTEGER       NOT NULL DEFAULT 0,
    stock_minimo   INTEGER       NOT NULL DEFAULT 0,
    activo         BOOLEAN       NOT NULL DEFAULT TRUE,
    creado_en      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    actualizado_en TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    UNIQUE (id_empresa, sku),
    CONSTRAINT chk_precio_costo  CHECK (precio_costo >= 0),
    CONSTRAINT chk_precio_venta  CHECK (precio_venta >= 0),
    CONSTRAINT chk_stock         CHECK (stock >= 0),
    CONSTRAINT chk_stock_minimo  CHECK (stock_minimo >= 0)
);

-- ============================================================
-- 7. PRODUCTO_PROVEEDOR
-- ============================================================
CREATE TABLE producto_proveedor (
    id_producto      UUID          NOT NULL REFERENCES producto(id) ON DELETE CASCADE,
    id_proveedor     UUID          NOT NULL REFERENCES proveedor(id) ON DELETE CASCADE,
    precio_compra    NUMERIC(12,2) NOT NULL DEFAULT 0,
    codigo_proveedor TEXT,
    es_principal     BOOLEAN       NOT NULL DEFAULT FALSE,
    creado_en        TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    PRIMARY KEY (id_producto, id_proveedor)
);

-- ============================================================
-- 8. VENTA
-- ============================================================
CREATE TABLE venta (
    id             UUID             PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_empresa     UUID             NOT NULL REFERENCES empresa(id) ON DELETE CASCADE,
    id_cliente     UUID             REFERENCES cliente(id) ON DELETE SET NULL,
    numero         INTEGER          NOT NULL DEFAULT 0,
    estado         estado_venta     NOT NULL DEFAULT 'pendiente',
    subtotal       NUMERIC(12,2)    NOT NULL DEFAULT 0,
    descuento      NUMERIC(12,2)    NOT NULL DEFAULT 0,
    impuesto       NUMERIC(12,2)    NOT NULL DEFAULT 0,
    monto_total    NUMERIC(12,2)    NOT NULL DEFAULT 0,
    metodo_pago    metodo_pago_tipo NOT NULL DEFAULT 'efectivo',
    notas          TEXT,
    creado_en      TIMESTAMPTZ      NOT NULL DEFAULT NOW(),
    actualizado_en TIMESTAMPTZ      NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 9. VENTA_DETALLE
-- ============================================================
CREATE TABLE venta_detalle (
    id              UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_venta        UUID          NOT NULL REFERENCES venta(id) ON DELETE CASCADE,
    id_producto     UUID          NOT NULL REFERENCES producto(id) ON DELETE RESTRICT,
    cantidad        INTEGER       NOT NULL,
    precio_unitario NUMERIC(12,2) NOT NULL,
    descuento       NUMERIC(12,2) NOT NULL DEFAULT 0,
    subtotal        NUMERIC(12,2) GENERATED ALWAYS AS ((cantidad * precio_unitario) - descuento) STORED,
    CONSTRAINT chk_vd_cantidad CHECK (cantidad > 0),
    CONSTRAINT chk_vd_precio   CHECK (precio_unitario >= 0)
);

-- ============================================================
-- 10. COMPRA
-- ============================================================
CREATE TABLE compra (
    id             UUID             PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_empresa     UUID             NOT NULL REFERENCES empresa(id) ON DELETE CASCADE,
    id_proveedor   UUID             REFERENCES proveedor(id) ON DELETE SET NULL,
    numero         INTEGER          NOT NULL DEFAULT 0,
    estado         estado_compra    NOT NULL DEFAULT 'pendiente',
    subtotal       NUMERIC(12,2)    NOT NULL DEFAULT 0,
    impuesto       NUMERIC(12,2)    NOT NULL DEFAULT 0,
    monto_total    NUMERIC(12,2)    NOT NULL DEFAULT 0,
    metodo_pago    metodo_pago_tipo NOT NULL DEFAULT 'efectivo',
    notas          TEXT,
    creado_en      TIMESTAMPTZ      NOT NULL DEFAULT NOW(),
    actualizado_en TIMESTAMPTZ      NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 11. COMPRA_DETALLE
-- ============================================================
CREATE TABLE compra_detalle (
    id              UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_compra       UUID          NOT NULL REFERENCES compra(id) ON DELETE CASCADE,
    id_producto     UUID          NOT NULL REFERENCES producto(id) ON DELETE RESTRICT,
    cantidad        INTEGER       NOT NULL,
    precio_unitario NUMERIC(12,2) NOT NULL,
    subtotal        NUMERIC(12,2) GENERATED ALWAYS AS (cantidad * precio_unitario) STORED,
    CONSTRAINT chk_cd_cantidad CHECK (cantidad > 0),
    CONSTRAINT chk_cd_precio   CHECK (precio_unitario >= 0)
);

-- ============================================================
-- 12. MOVIMIENTO_INVENTARIO
-- ============================================================
CREATE TABLE movimiento_inventario (
    id            UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_empresa    UUID            NOT NULL REFERENCES empresa(id) ON DELETE CASCADE,
    id_producto   UUID            NOT NULL REFERENCES producto(id) ON DELETE CASCADE,
    id_venta      UUID            REFERENCES venta(id) ON DELETE SET NULL,
    id_compra     UUID            REFERENCES compra(id) ON DELETE SET NULL,
    tipo          tipo_movimiento NOT NULL,
    cantidad      INTEGER         NOT NULL,
    stock_antes   INTEGER         NOT NULL,
    stock_despues INTEGER         NOT NULL,
    motivo        TEXT,
    creado_en     TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_cantidad_no_cero CHECK (cantidad != 0)
);


-- ============================================================
-- ÍNDICES
-- ============================================================
CREATE INDEX idx_cliente_empresa        ON cliente(id_empresa);
CREATE INDEX idx_producto_empresa       ON producto(id_empresa);
CREATE INDEX idx_producto_categoria     ON producto(id_categoria);
CREATE INDEX idx_producto_sku           ON producto(id_empresa, sku);
CREATE INDEX idx_venta_empresa          ON venta(id_empresa);
CREATE INDEX idx_venta_cliente          ON venta(id_cliente);
CREATE INDEX idx_venta_estado           ON venta(estado);
CREATE INDEX idx_compra_empresa         ON compra(id_empresa);
CREATE INDEX idx_compra_proveedor       ON compra(id_proveedor);
CREATE INDEX idx_mov_producto           ON movimiento_inventario(id_producto);
CREATE INDEX idx_mov_empresa_fecha      ON movimiento_inventario(id_empresa, creado_en DESC);
CREATE INDEX idx_vd_venta               ON venta_detalle(id_venta);
CREATE INDEX idx_cd_compra              ON compra_detalle(id_compra);


-- ============================================================
-- FUNCIÓN GENÉRICA: set actualizado_en
-- ============================================================
CREATE OR REPLACE FUNCTION fn_set_actualizado_en()
RETURNS TRIGGER AS $$
BEGIN
    NEW.actualizado_en = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_empresa_upd    BEFORE UPDATE ON empresa    FOR EACH ROW EXECUTE FUNCTION fn_set_actualizado_en();
CREATE TRIGGER trg_cliente_upd    BEFORE UPDATE ON cliente    FOR EACH ROW EXECUTE FUNCTION fn_set_actualizado_en();
CREATE TRIGGER trg_proveedor_upd  BEFORE UPDATE ON proveedor  FOR EACH ROW EXECUTE FUNCTION fn_set_actualizado_en();
CREATE TRIGGER trg_producto_upd   BEFORE UPDATE ON producto   FOR EACH ROW EXECUTE FUNCTION fn_set_actualizado_en();
CREATE TRIGGER trg_venta_upd      BEFORE UPDATE ON venta      FOR EACH ROW EXECUTE FUNCTION fn_set_actualizado_en();
CREATE TRIGGER trg_compra_upd     BEFORE UPDATE ON compra     FOR EACH ROW EXECUTE FUNCTION fn_set_actualizado_en();


-- ============================================================
-- FUNCIÓN CORE: registrar movimiento + actualizar stock
-- Usada internamente por todos los triggers y ajustes manuales
-- ============================================================
CREATE OR REPLACE FUNCTION fn_registrar_movimiento(
    p_id_empresa  UUID,
    p_id_producto UUID,
    p_id_venta    UUID,
    p_id_compra   UUID,
    p_tipo        tipo_movimiento,
    p_cantidad    INTEGER,
    p_motivo      TEXT DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
    v_stock_actual INTEGER;
    v_nuevo_stock  INTEGER;
BEGIN
    SELECT stock INTO v_stock_actual
    FROM producto WHERE id = p_id_producto FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Producto % no encontrado', p_id_producto;
    END IF;

    IF p_tipo IN ('entrada', 'ajuste_positivo', 'devolucion_venta') THEN
        v_nuevo_stock := v_stock_actual + ABS(p_cantidad);
    ELSE
        -- salida, ajuste_negativo, devolucion_compra
        v_nuevo_stock := v_stock_actual - ABS(p_cantidad);
        IF v_nuevo_stock < 0 THEN
            RAISE EXCEPTION
                'Stock insuficiente para el producto %. Stock actual: %, cantidad solicitada: %',
                p_id_producto, v_stock_actual, ABS(p_cantidad);
        END IF;
    END IF;

    UPDATE producto SET stock = v_nuevo_stock WHERE id = p_id_producto;

    INSERT INTO movimiento_inventario
        (id_empresa, id_producto, id_venta, id_compra, tipo, cantidad, stock_antes, stock_despues, motivo)
    VALUES
        (p_id_empresa, p_id_producto, p_id_venta, p_id_compra,
         p_tipo, ABS(p_cantidad), v_stock_actual, v_nuevo_stock, p_motivo);
END;
$$ LANGUAGE plpgsql;


-- ============================================================
-- TRIGGERS DE STOCK: VENTA
-- ============================================================

-- Al cambiar estado de venta
CREATE OR REPLACE FUNCTION fn_trigger_venta_estado()
RETURNS TRIGGER AS $$
DECLARE
    det RECORD;
BEGIN
    -- pendiente/otro → completada: descontar
    IF NEW.estado = 'completada' AND OLD.estado != 'completada' THEN
        FOR det IN SELECT * FROM venta_detalle WHERE id_venta = NEW.id LOOP
            PERFORM fn_registrar_movimiento(
                NEW.id_empresa, det.id_producto, NEW.id, NULL,
                'salida', det.cantidad, 'Venta marcada completada'
            );
        END LOOP;

    -- completada → cancelada/anulada: devolver
    ELSIF OLD.estado = 'completada' AND NEW.estado IN ('cancelada', 'anulada') THEN
        FOR det IN SELECT * FROM venta_detalle WHERE id_venta = NEW.id LOOP
            PERFORM fn_registrar_movimiento(
                NEW.id_empresa, det.id_producto, NEW.id, NULL,
                'devolucion_venta', det.cantidad, 'Venta ' || NEW.estado::TEXT
            );
        END LOOP;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_venta_estado
    AFTER UPDATE OF estado ON venta
    FOR EACH ROW EXECUTE FUNCTION fn_trigger_venta_estado();

-- Al insertar detalle en venta ya completada
CREATE OR REPLACE FUNCTION fn_trigger_venta_detalle_insert()
RETURNS TRIGGER AS $$
DECLARE
    v_emp  UUID;
    v_est  estado_venta;
BEGIN
    SELECT id_empresa, estado INTO v_emp, v_est FROM venta WHERE id = NEW.id_venta;
    IF v_est = 'completada' THEN
        PERFORM fn_registrar_movimiento(
            v_emp, NEW.id_producto, NEW.id_venta, NULL,
            'salida', NEW.cantidad, 'Detalle añadido a venta completada'
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_venta_detalle_insert
    AFTER INSERT ON venta_detalle
    FOR EACH ROW EXECUTE FUNCTION fn_trigger_venta_detalle_insert();

-- Al eliminar detalle de venta completada
CREATE OR REPLACE FUNCTION fn_trigger_venta_detalle_delete()
RETURNS TRIGGER AS $$
DECLARE
    v_emp UUID;
    v_est estado_venta;
BEGIN
    SELECT id_empresa, estado INTO v_emp, v_est FROM venta WHERE id = OLD.id_venta;
    IF v_est = 'completada' THEN
        PERFORM fn_registrar_movimiento(
            v_emp, OLD.id_producto, OLD.id_venta, NULL,
            'devolucion_venta', OLD.cantidad, 'Detalle eliminado de venta completada'
        );
    END IF;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_venta_detalle_delete
    AFTER DELETE ON venta_detalle
    FOR EACH ROW EXECUTE FUNCTION fn_trigger_venta_detalle_delete();


-- ============================================================
-- TRIGGERS DE STOCK: COMPRA
-- ============================================================

-- Al cambiar estado de compra
CREATE OR REPLACE FUNCTION fn_trigger_compra_estado()
RETURNS TRIGGER AS $$
DECLARE
    det RECORD;
BEGIN
    -- pendiente/parcial → recibida: sumar stock
    IF NEW.estado = 'recibida' AND OLD.estado != 'recibida' THEN
        FOR det IN SELECT * FROM compra_detalle WHERE id_compra = NEW.id LOOP
            PERFORM fn_registrar_movimiento(
                NEW.id_empresa, det.id_producto, NULL, NEW.id,
                'entrada', det.cantidad, 'Compra recibida'
            );
        END LOOP;

    -- recibida → cancelada: descontar lo recibido
    ELSIF OLD.estado = 'recibida' AND NEW.estado = 'cancelada' THEN
        FOR det IN SELECT * FROM compra_detalle WHERE id_compra = NEW.id LOOP
            PERFORM fn_registrar_movimiento(
                NEW.id_empresa, det.id_producto, NULL, NEW.id,
                'devolucion_compra', det.cantidad, 'Compra recibida cancelada'
            );
        END LOOP;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_compra_estado
    AFTER UPDATE OF estado ON compra
    FOR EACH ROW EXECUTE FUNCTION fn_trigger_compra_estado();

-- Al insertar detalle en compra ya recibida
CREATE OR REPLACE FUNCTION fn_trigger_compra_detalle_insert()
RETURNS TRIGGER AS $$
DECLARE
    v_emp UUID;
    v_est estado_compra;
BEGIN
    SELECT id_empresa, estado INTO v_emp, v_est FROM compra WHERE id = NEW.id_compra;
    IF v_est = 'recibida' THEN
        PERFORM fn_registrar_movimiento(
            v_emp, NEW.id_producto, NULL, NEW.id_compra,
            'entrada', NEW.cantidad, 'Detalle añadido a compra recibida'
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_compra_detalle_insert
    AFTER INSERT ON compra_detalle
    FOR EACH ROW EXECUTE FUNCTION fn_trigger_compra_detalle_insert();


-- ============================================================
-- TRIGGER: Totales automáticos de VENTA
-- ============================================================
CREATE OR REPLACE FUNCTION fn_recalcular_venta(p_id_venta UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE venta
    SET subtotal    = (SELECT COALESCE(SUM(subtotal),0) FROM venta_detalle WHERE id_venta = p_id_venta),
        monto_total = subtotal - descuento + impuesto
    WHERE id = p_id_venta;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION fn_trigger_totales_venta()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM fn_recalcular_venta(COALESCE(NEW.id_venta, OLD.id_venta));
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_totales_venta
    AFTER INSERT OR UPDATE OR DELETE ON venta_detalle
    FOR EACH ROW EXECUTE FUNCTION fn_trigger_totales_venta();


-- ============================================================
-- TRIGGER: Totales automáticos de COMPRA
-- ============================================================
CREATE OR REPLACE FUNCTION fn_recalcular_compra(p_id_compra UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE compra
    SET subtotal    = (SELECT COALESCE(SUM(subtotal),0) FROM compra_detalle WHERE id_compra = p_id_compra),
        monto_total = subtotal + impuesto
    WHERE id = p_id_compra;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION fn_trigger_totales_compra()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM fn_recalcular_compra(COALESCE(NEW.id_compra, OLD.id_compra));
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_totales_compra
    AFTER INSERT OR UPDATE OR DELETE ON compra_detalle
    FOR EACH ROW EXECUTE FUNCTION fn_trigger_totales_compra();


-- ============================================================
-- FUNCIÓN MANUAL: Ajuste de stock (positivo o negativo)
-- Uso: SELECT * FROM fn_ajuste_manual_stock('<uuid>', 10, 'Inventario físico');
--      SELECT * FROM fn_ajuste_manual_stock('<uuid>', -5, 'Merma');
-- ============================================================
CREATE OR REPLACE FUNCTION fn_ajuste_manual_stock(
    p_id_producto UUID,
    p_cantidad    INTEGER,
    p_motivo      TEXT DEFAULT 'Ajuste manual'
)
RETURNS TABLE (
    producto      TEXT,
    stock_antes   INTEGER,
    stock_despues INTEGER,
    diferencia    INTEGER
) AS $$
DECLARE
    v_id_empresa   UUID;
    v_nombre       TEXT;
    v_stock_actual INTEGER;
    v_nuevo_stock  INTEGER;
    v_tipo         tipo_movimiento;
BEGIN
    SELECT p.id_empresa, p.nombre, p.stock
    INTO v_id_empresa, v_nombre, v_stock_actual
    FROM producto p WHERE p.id = p_id_producto FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Producto % no encontrado', p_id_producto;
    END IF;

    v_nuevo_stock := v_stock_actual + p_cantidad;

    IF v_nuevo_stock < 0 THEN
        RAISE EXCEPTION
            'Ajuste inválido: stock resultante sería % (actual: %, ajuste: %)',
            v_nuevo_stock, v_stock_actual, p_cantidad;
    END IF;

    v_tipo := CASE WHEN p_cantidad >= 0 THEN 'ajuste_positivo'::tipo_movimiento
                   ELSE 'ajuste_negativo'::tipo_movimiento END;

    UPDATE producto SET stock = v_nuevo_stock WHERE id = p_id_producto;

    INSERT INTO movimiento_inventario
        (id_empresa, id_producto, id_venta, id_compra, tipo, cantidad, stock_antes, stock_despues, motivo)
    VALUES
        (v_id_empresa, p_id_producto, NULL, NULL, v_tipo,
         ABS(p_cantidad), v_stock_actual, v_nuevo_stock, p_motivo);

    RETURN QUERY SELECT v_nombre, v_stock_actual, v_nuevo_stock, p_cantidad;
END;
$$ LANGUAGE plpgsql;


-- ============================================================
-- FUNCIÓN: Obtener kardex de un producto
-- Uso: SELECT * FROM fn_kardex_producto('<uuid_producto>');
-- ============================================================
CREATE OR REPLACE FUNCTION fn_kardex_producto(p_id_producto UUID)
RETURNS TABLE (
    fecha         TIMESTAMPTZ,
    tipo          tipo_movimiento,
    cantidad      INTEGER,
    stock_antes   INTEGER,
    stock_despues INTEGER,
    motivo        TEXT,
    referencia    TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        m.creado_en,
        m.tipo,
        m.cantidad,
        m.stock_antes,
        m.stock_despues,
        m.motivo,
        CASE
            WHEN m.id_venta  IS NOT NULL THEN 'Venta #'  || m.id_venta::TEXT
            WHEN m.id_compra IS NOT NULL THEN 'Compra #' || m.id_compra::TEXT
            ELSE 'Manual'
        END AS referencia
    FROM movimiento_inventario m
    WHERE m.id_producto = p_id_producto
    ORDER BY m.creado_en ASC;
END;
$$ LANGUAGE plpgsql;


-- ============================================================
-- FUNCIÓN: Resumen de stock por empresa
-- Uso: SELECT * FROM fn_resumen_stock('<uuid_empresa>');
-- ============================================================
CREATE OR REPLACE FUNCTION fn_resumen_stock(p_id_empresa UUID)
RETURNS TABLE (
    id            UUID,
    sku           TEXT,
    nombre        TEXT,
    categoria     TEXT,
    stock         INTEGER,
    stock_minimo  INTEGER,
    precio_venta  NUMERIC,
    valor_total   NUMERIC,
    bajo_minimo   BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.id,
        p.sku,
        p.nombre,
        c.nombre AS categoria,
        p.stock,
        p.stock_minimo,
        p.precio_venta,
        (p.stock * p.precio_costo) AS valor_total,
        (p.stock <= p.stock_minimo) AS bajo_minimo
    FROM producto p
    LEFT JOIN categoria c ON c.id = p.id_categoria
    WHERE p.id_empresa = p_id_empresa
      AND p.activo = TRUE
    ORDER BY bajo_minimo DESC, p.nombre;
END;
$$ LANGUAGE plpgsql;


-- ============================================================
-- VISTAS
-- ============================================================

-- Productos bajo stock mínimo
CREATE OR REPLACE VIEW v_productos_bajo_stock AS
SELECT
    p.id,
    p.id_empresa,
    e.nombre                    AS empresa,
    p.nombre                    AS producto,
    p.sku,
    c.nombre                    AS categoria,
    p.stock,
    p.stock_minimo,
    (p.stock_minimo - p.stock)  AS faltante
FROM producto p
JOIN empresa e       ON e.id = p.id_empresa
LEFT JOIN categoria c ON c.id = p.id_categoria
WHERE p.stock <= p.stock_minimo
  AND p.activo = TRUE
ORDER BY faltante DESC;

-- Historial de inventario con contexto
CREATE OR REPLACE VIEW v_historial_inventario AS
SELECT
    m.id,
    m.creado_en,
    m.id_empresa,
    p.nombre    AS producto,
    p.sku,
    m.tipo,
    m.cantidad,
    m.stock_antes,
    m.stock_despues,
    m.motivo,
    m.id_venta,
    m.id_compra
FROM movimiento_inventario m
JOIN producto p ON p.id = m.id_producto
ORDER BY m.creado_en DESC;

-- Resumen de ventas por mes
CREATE OR REPLACE VIEW v_resumen_ventas_mensual AS
SELECT
    v.id_empresa,
    e.nombre                           AS empresa,
    DATE_TRUNC('month', v.creado_en)   AS mes,
    COUNT(*)                            AS total_ventas,
    SUM(v.monto_total)                  AS ingresos,
    AVG(v.monto_total)                  AS ticket_promedio
FROM venta v
JOIN empresa e ON e.id = v.id_empresa
WHERE v.estado = 'completada'
GROUP BY v.id_empresa, e.nombre, DATE_TRUNC('month', v.creado_en)
ORDER BY mes DESC;

-- Productos más vendidos
CREATE OR REPLACE VIEW v_productos_mas_vendidos AS
SELECT
    vd.id_producto,
    p.nombre          AS producto,
    p.sku,
    p.id_empresa,
    SUM(vd.cantidad)  AS unidades_vendidas,
    SUM(vd.subtotal)  AS ingresos_totales
FROM venta_detalle vd
JOIN venta v   ON v.id = vd.id_venta
JOIN producto p ON p.id = vd.id_producto
WHERE v.estado = 'completada'
GROUP BY vd.id_producto, p.nombre, p.sku, p.id_empresa
ORDER BY unidades_vendidas DESC;


-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE empresa              ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuario_empresa      ENABLE ROW LEVEL SECURITY;
ALTER TABLE cliente              ENABLE ROW LEVEL SECURITY;
ALTER TABLE categoria            ENABLE ROW LEVEL SECURITY;
ALTER TABLE proveedor            ENABLE ROW LEVEL SECURITY;
ALTER TABLE producto             ENABLE ROW LEVEL SECURITY;
ALTER TABLE producto_proveedor   ENABLE ROW LEVEL SECURITY;
ALTER TABLE venta                ENABLE ROW LEVEL SECURITY;
ALTER TABLE venta_detalle        ENABLE ROW LEVEL SECURITY;
ALTER TABLE compra               ENABLE ROW LEVEL SECURITY;
ALTER TABLE compra_detalle       ENABLE ROW LEVEL SECURITY;
ALTER TABLE movimiento_inventario ENABLE ROW LEVEL SECURITY;

-- Empresa: solo ver la propia
CREATE POLICY pol_empresa_select ON empresa
    FOR SELECT USING (id = fn_empresa_del_usuario());

CREATE POLICY pol_empresa_update ON empresa
    FOR UPDATE USING (id = fn_empresa_del_usuario() AND fn_rol_del_usuario() = 'admin');

-- usuario_empresa: ver solo los propios
CREATE POLICY pol_usuario_empresa_select ON usuario_empresa
    FOR SELECT USING (id_usuario = auth.uid());

-- Tablas con id_empresa: acceso total al miembro de la empresa
CREATE POLICY pol_cliente       ON cliente        FOR ALL USING (id_empresa = fn_empresa_del_usuario());
CREATE POLICY pol_categoria     ON categoria      FOR ALL USING (id_empresa = fn_empresa_del_usuario());
CREATE POLICY pol_proveedor     ON proveedor      FOR ALL USING (id_empresa = fn_empresa_del_usuario());
CREATE POLICY pol_producto      ON producto       FOR ALL USING (id_empresa = fn_empresa_del_usuario());
CREATE POLICY pol_venta         ON venta          FOR ALL USING (id_empresa = fn_empresa_del_usuario());
CREATE POLICY pol_compra        ON compra         FOR ALL USING (id_empresa = fn_empresa_del_usuario());
CREATE POLICY pol_movimiento    ON movimiento_inventario FOR ALL USING (id_empresa = fn_empresa_del_usuario());

-- Tablas sin id_empresa directa: validar por join
CREATE POLICY pol_venta_detalle ON venta_detalle FOR ALL USING (
    EXISTS (SELECT 1 FROM venta WHERE id = venta_detalle.id_venta AND id_empresa = fn_empresa_del_usuario())
);

CREATE POLICY pol_compra_detalle ON compra_detalle FOR ALL USING (
    EXISTS (SELECT 1 FROM compra WHERE id = compra_detalle.id_compra AND id_empresa = fn_empresa_del_usuario())
);

CREATE POLICY pol_prod_prov ON producto_proveedor FOR ALL USING (
    EXISTS (SELECT 1 FROM producto WHERE id = producto_proveedor.id_producto AND id_empresa = fn_empresa_del_usuario())
);


-- ============================================================
-- FIN DEL SCRIPT
-- ============================================================
-- EJEMPLOS DE USO:
--
-- Ajuste manual de stock:
--   SELECT * FROM fn_ajuste_manual_stock('<id_producto>', 20, 'Recuento físico enero');
--   SELECT * FROM fn_ajuste_manual_stock('<id_producto>', -3, 'Merma por daño');
--
-- Ver kardex de un producto:
--   SELECT * FROM fn_kardex_producto('<id_producto>');
--
-- Ver resumen de stock de empresa:
--   SELECT * FROM fn_resumen_stock('<id_empresa>');
--
-- Ver productos bajo stock mínimo:
--   SELECT * FROM v_productos_bajo_stock WHERE id_empresa = '<id_empresa>';
--
-- Completar una venta (dispara descuento de stock automáticamente):
--   UPDATE venta SET estado = 'completada' WHERE id = '<id_venta>';
--
-- Recibir una compra (dispara suma de stock automáticamente):
--   UPDATE compra SET estado = 'recibida' WHERE id = '<id_compra>';
-- ============================================================