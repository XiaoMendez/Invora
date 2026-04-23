# 🗄️ Documentación de Base de Datos

<p align="center">
  <img src="https://img.shields.io/badge/Base%20de%20Datos-PostgreSQL%2015-336791?style=for-the-badge&logo=postgresql" alt="PostgreSQL"/>
  <img src="https://img.shields.io/badge/Seguridad-RLS-brightgreen?style=for-the-badge" alt="RLS"/>
</p>

---

## 📊 Esquema de Base de Datos

```
┌─────────────────────────────────────────────────────────────────┐
│                       CORE ENTITIES                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────┐              ┌─────────────────┐               │
│  │  empresa    │◄─────────────│ usuario_empresa │               │
│  ├─────────────┤   1:N        ├─────────────────┤               │
│  │ id (PK)     │              │ id_usuario (FK) │               │
│  │ nombre      │              │ id_empresa (FK) │               │
│  │ email       │              │ rol             │               │
│  │ creado_en   │              │ creado_en       │               │
│  └──────┬──────┘              └─────────────────┘               │
│         │                                                         │
│         │ 1:N                                                     │
│         └──────────────┬───────────────┬──────────┐              │
│                        │               │          │              │
│  ┌───────────────┐  ┌──▼─────────┐ ┌──▼────┐ ┌──▼─────────┐   │
│  │   categoria   │  │  producto   │ │ alerta│ │  movimien* │   │
│  ├───────────────┤  ├─────────────┤ ├───────┤ ├────────────┤   │
│  │ id (PK)       │  │ id (PK)     │ │ id    │ │ id (PK)    │   │
│  │ id_empresa    │  │ id_empresa  │ │ id_em │ │ id_empresa │   │
│  │ nombre        │  │ id_categoria│ │ id_pr │ │ id_producto│   │
│  │ descripcion   │  │ nombre      │ │ tipo  │ │ tipo (E/S) │   │
│  │ activo        │  │ sku         │ │ estado│ │ cantidad   │   │
│  │ creado_en     │  │ precio_costo│ │ leido │ │ motivo     │   │
│  └───────────────┘  │ precio_venta│ │ creado│ │ creado_en  │   │
│                     │ stock       │ └───────┘ └────────────┘   │
│                     │ stock_minimo│                              │
│                     │ activo      │                              │
│                     │ creado_en   │                              │
│                     └─────────────┘                              │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📋 Tablas Principales

### 1. **empresa**
Información de las empresas que utilizan el sistema.

| Columna | Tipo | Restricciones | Descripción |
|---------|------|---------------|-------------|
| id | UUID | PK | Identificador único |
| nombre | VARCHAR(255) | NOT NULL | Nombre de la empresa |
| email | VARCHAR(255) | NOT NULL, UNIQUE | Email de contacto |
| descripcion | TEXT | | Descripción de la empresa |
| activo | BOOLEAN | DEFAULT true | Estado de la empresa |
| creado_en | TIMESTAMP | DEFAULT NOW() | Fecha de creación |
| actualizado_en | TIMESTAMP | DEFAULT NOW() | Última actualización |

**Índices:**
```sql
CREATE INDEX idx_empresa_email ON empresa(email);
CREATE INDEX idx_empresa_activo ON empresa(activo);
```

---

### 2. **usuario_empresa**
Relación entre usuarios de Supabase Auth y empresas (multi-tenant).

| Columna | Tipo | Restricciones | Descripción |
|---------|------|---------------|-------------|
| id_usuario | UUID | FK (auth.users.id) | Usuario autenticado |
| id_empresa | UUID | FK (empresa.id) | Empresa asignada |
| rol | ENUM | DEFAULT 'viewer' | admin, editor, viewer |
| creado_en | TIMESTAMP | DEFAULT NOW() | Fecha de asignación |

**Tipos Enumerados:**
```sql
CREATE TYPE usuario_rol AS ENUM ('admin', 'editor', 'viewer');
```

**Política RLS:**
- Usuarios solo ven sus propias asignaciones de empresa

---

### 3. **categoria**
Categorías para clasificar productos.

| Columna | Tipo | Restricciones | Descripción |
|---------|------|---------------|-------------|
| id | UUID | PK | Identificador único |
| id_empresa | UUID | FK (empresa.id) | Empresa propietaria |
| nombre | VARCHAR(100) | NOT NULL | Nombre de categoría |
| descripcion | TEXT | | Descripción opcional |
| activo | BOOLEAN | DEFAULT true | Estado |
| creado_en | TIMESTAMP | DEFAULT NOW() | Fecha de creación |
| actualizado_en | TIMESTAMP | DEFAULT NOW() | Última actualización |

---

### 4. **producto**
Catálogo de productos del inventario.

| Columna | Tipo | Restricciones | Descripción |
|---------|------|---------------|-------------|
| id | UUID | PK | Identificador único |
| id_empresa | UUID | FK (empresa.id) | Empresa propietaria |
| id_categoria | UUID | FK (categoria.id) | Categoría |
| nombre | VARCHAR(255) | NOT NULL | Nombre del producto |
| descripcion | TEXT | | Descripción completa |
| sku | VARCHAR(50) | UNIQUE per empresa | Código SKU |
| stock | INTEGER | DEFAULT 0 | Cantidad actual |
| stock_minimo | INTEGER | DEFAULT 0 | Stock de alerta |
| precio_costo | DECIMAL(12,2) | DEFAULT 0 | Precio de costo |
| precio_venta | DECIMAL(12,2) | DEFAULT 0 | Precio de venta |
| activo | BOOLEAN | DEFAULT true | Producto activo |
| creado_en | TIMESTAMP | DEFAULT NOW() | Fecha de creación |
| actualizado_en | TIMESTAMP | DEFAULT NOW() | Última actualización |

**Índices:**
```sql
CREATE INDEX idx_producto_empresa ON producto(id_empresa);
CREATE INDEX idx_producto_categoria ON producto(id_categoria);
CREATE INDEX idx_producto_sku ON producto(sku);
```

---

### 5. **movimiento_inventario**
Historial de todas las transacciones de inventario.

| Columna | Tipo | Restricciones | Descripción |
|---------|------|---------------|-------------|
| id | UUID | PK | Identificador único |
| id_empresa | UUID | FK (empresa.id) | Empresa |
| id_producto | UUID | FK (producto.id) | Producto afectado |
| tipo | ENUM | NOT NULL | entrada, salida, ajuste |
| cantidad | INTEGER | NOT NULL | Cantidad movida |
| stock_antes | INTEGER | NOT NULL | Stock previo |
| stock_despues | INTEGER | NOT NULL | Stock posterior |
| motivo | VARCHAR(255) | | Razón del movimiento |
| creado_en | TIMESTAMP | DEFAULT NOW() | Fecha del movimiento |

**Tipos Enumerados:**
```sql
CREATE TYPE tipo_movimiento AS ENUM ('entrada', 'salida', 'ajuste');
```

**Índices:**
```sql
CREATE INDEX idx_movimiento_empresa_fecha ON movimiento_inventario(id_empresa, creado_en DESC);
CREATE INDEX idx_movimiento_producto ON movimiento_inventario(id_producto);
```

---

### 6. **alerta**
Sistema de alertas para stock bajo y eventos críticos.

| Columna | Tipo | Restricciones | Descripción |
|---------|------|---------------|-------------|
| id | UUID | PK | Identificador único |
| id_empresa | UUID | FK (empresa.id) | Empresa |
| id_producto | UUID | FK (producto.id) | Producto relacionado |
| tipo_alerta | ENUM | NOT NULL | stock_bajo, caducado |
| descripcion | TEXT | | Detalles de alerta |
| estado | ENUM | DEFAULT 'activa' | activa, resuelta, ignorada |
| leido_en | TIMESTAMP | | Marca de lectura |
| creado_en | TIMESTAMP | DEFAULT NOW() | Fecha de creación |

---

## 🔒 Row Level Security (RLS)

Todas las tablas están protegidas con políticas RLS para garantizar el aislamiento de datos:

```sql
-- Función auxiliar para obtener empresa del usuario actual
CREATE FUNCTION fn_empresa_del_usuario()
RETURNS UUID LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id_empresa FROM usuario_empresa 
  WHERE id_usuario = auth.uid() LIMIT 1;
$$;

-- Políticas de lectura
CREATE POLICY pol_producto_select ON producto
  FOR SELECT TO public
  USING (id_empresa = fn_empresa_del_usuario());

-- Políticas de inserción
CREATE POLICY pol_producto_insert ON producto
  FOR INSERT TO public
  WITH CHECK (
    id_empresa IN (
      SELECT id_empresa FROM usuario_empresa WHERE id_usuario = auth.uid()
    )
  );

-- Políticas de actualización
CREATE POLICY pol_producto_update ON producto
  FOR UPDATE TO public
  USING (id_empresa = fn_empresa_del_usuario())
  WITH CHECK (id_empresa = fn_empresa_del_usuario());

-- Políticas de eliminación
CREATE POLICY pol_producto_delete ON producto
  FOR DELETE TO public
  USING (id_empresa = fn_empresa_del_usuario());
```

---

## 📊 Vistas

### v_historial_inventario
Vista para análisis de movimientos con información enriquecida del producto.

```sql
CREATE VIEW v_historial_inventario AS
SELECT 
  m.id,
  m.id_empresa,
  m.id_producto,
  p.nombre AS producto_nombre,
  p.sku,
  c.nombre AS categoria_nombre,
  m.tipo,
  m.cantidad,
  m.stock_antes,
  m.stock_despues,
  m.motivo,
  m.creado_en
FROM movimiento_inventario m
JOIN producto p ON m.id_producto = p.id
JOIN categoria c ON p.id_categoria = c.id
ORDER BY m.creado_en DESC;
```

---

## 🔧 Funciones y Triggers

### Función: fn_rol_del_usuario
Obtiene el rol del usuario autenticado en su empresa.

```sql
CREATE FUNCTION fn_rol_del_usuario()
RETURNS TEXT LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT rol::TEXT FROM usuario_empresa 
  WHERE id_usuario = auth.uid() LIMIT 1;
$$;
```

### Trigger: Actualizar timestamp
Actualiza automáticamente `actualizado_en` en cada modificación.

```sql
CREATE FUNCTION fn_update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.actualizado_en = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_producto
  BEFORE UPDATE ON producto
  FOR EACH ROW
  EXECUTE FUNCTION fn_update_timestamp();
```

---

## 📈 Performance

### Recomendaciones
- Usar índices en foreign keys y campos de búsqueda frecuente
- Materializar vistas complejas para reportes pesados
- Archivar movimientos con antigüedad > 2 años
- Configurar backups automáticos en Supabase Pro

### Monitoreo
```sql
-- Ver tamaño de tablas
SELECT 
  schemaname, tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

---

## 🔄 Migración de Datos

Los scripts SQL están en `/scripts/`:
- `001_create_schema.sql` - Esquema completo
- `002_add_rls_policies.sql` - Políticas de seguridad

Para ejecutar:
```bash
psql -f scripts/001_create_schema.sql
psql -f scripts/002_add_rls_policies.sql
```

---

## 📊 Estadísticas

| Métrica | Valor |
|---------|-------|
| Tablas principales | 6 |
| Vistas | 1 |
| Funciones | 3+ |
| Triggers | 3+ |
| Políticas RLS | 20+ |
| Índices | 8+ |

