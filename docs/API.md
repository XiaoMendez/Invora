# 🔌 Documentación de API

<p align="center">
  <img src="https://img.shields.io/badge/API-RESTful-blue?style=for-the-badge" alt="REST"/>
  <img src="https://img.shields.io/badge/Auth-JWT-orange?style=for-the-badge" alt="JWT"/>
  <img src="https://img.shields.io/badge/Format-JSON-green?style=for-the-badge" alt="JSON"/>
</p>

---

## 🔐 Autenticación

Todos los endpoints (excepto login/register) requieren autenticación mediante cookie de sesión de Supabase.

### Base URL
```
https://invorastock.vercel.app/api
```

---

## 📚 Endpoints

### 🔑 Autenticación

#### POST `/api/auth/register`
Registra un nuevo usuario y crea su empresa.

**Request Body:**
```json
{
  "email": "usuario@ejemplo.com",
  "password": "MiPassword123!",
  "nombre": "Mi Empresa S.A.",
  "confirmPassword": "MiPassword123!"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Registro exitoso. Revisa tu email para confirmar."
}
```

**Errores:**
| Código | Descripción |
|--------|-------------|
| 400 | Datos inválidos o email ya existe |
| 500 | Error del servidor |

---

#### POST `/api/auth/login`
Inicia sesión de usuario.

**Request Body:**
```json
{
  "email": "usuario@ejemplo.com",
  "password": "MiPassword123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "usuario@ejemplo.com"
  }
}
```

---

#### POST `/api/auth/logout`
Cierra la sesión actual.

**Response (200):**
```json
{
  "success": true
}
```

---

#### GET `/api/auth/session`
Obtiene la sesión actual del usuario.

**Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "email": "usuario@ejemplo.com"
  },
  "empresa": {
    "id": "uuid",
    "nombre": "Mi Empresa S.A."
  }
}
```

---

### 📦 Productos

#### GET `/api/productos`
Lista todos los productos de la empresa.

**Query Parameters:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `search` | string | Buscar por nombre o SKU |
| `categoria` | UUID | Filtrar por categoría |

**Response (200):**
```json
{
  "productos": [
    {
      "id": "uuid",
      "nombre": "Producto A",
      "sku": "SKU-001",
      "stock": 100,
      "stock_minimo": 10,
      "precio_costo": 5000,
      "precio_venta": 7500,
      "activo": true,
      "categoria": {
        "id": "uuid",
        "nombre": "Categoría 1"
      }
    }
  ]
}
```

---

#### POST `/api/productos`
Crea un nuevo producto.

**Request Body:**
```json
{
  "nombre": "Nuevo Producto",
  "sku": "SKU-002",
  "id_categoria": "uuid",
  "stock": 50,
  "stock_minimo": 5,
  "precio_costo": 3000,
  "precio_venta": 4500,
  "descripcion": "Descripción del producto"
}
```

**Response (200):**
```json
{
  "success": true,
  "producto": {
    "id": "uuid",
    "nombre": "Nuevo Producto",
    "...": "..."
  }
}
```

---

#### PUT `/api/productos`
Actualiza un producto existente.

**Request Body:**
```json
{
  "id": "uuid",
  "nombre": "Producto Actualizado",
  "precio_venta": 5000,
  "activo": true
}
```

**Response (200):**
```json
{
  "success": true,
  "producto": { "...": "..." }
}
```

---

#### DELETE `/api/productos?id={uuid}`
Elimina un producto.

**Response (200):**
```json
{
  "success": true
}
```

---

### 🔄 Movimientos de Inventario

#### GET `/api/movimientos`
Lista movimientos de inventario.

**Query Parameters:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `tipo` | string | `todos`, `entradas`, `salidas` |
| `periodo` | string | `1d`, `7d`, `30d` |
| `export` | string | `csv` para exportar |

**Response (200):**
```json
{
  "movimientos": [
    {
      "id": "uuid",
      "creado_en": "2024-01-15T10:30:00Z",
      "producto": "Producto A",
      "sku": "SKU-001",
      "tipo": "entrada",
      "cantidad": 50,
      "stock_antes": 100,
      "stock_despues": 150,
      "motivo": "Reabastecimiento"
    }
  ],
  "stats": {
    "entradas": 500,
    "salidas": 300,
    "neto": 200,
    "total": 50
  }
}
```

---

#### POST `/api/movimientos`
Registra un nuevo movimiento de inventario.

**Request Body:**
```json
{
  "id_producto": "uuid",
  "tipo": "entrada",
  "cantidad": 25,
  "motivo": "Compra a proveedor"
}
```

**Tipos válidos:**
- `entrada` - Ingreso de mercadería
- `salida` - Venta o consumo
- `ajuste_positivo` - Corrección de stock (+)
- `ajuste_negativo` - Corrección de stock (-)
- `devolucion_venta` - Devolución de cliente
- `devolucion_compra` - Devolución a proveedor

**Response (200):**
```json
{
  "success": true,
  "movimiento": { "id": "uuid" },
  "nuevoStock": 125
}
```

---

### 🏷️ Categorías

#### GET `/api/categorias`
Lista todas las categorías.

**Response (200):**
```json
{
  "categorias": [
    {
      "id": "uuid",
      "nombre": "Electrónicos",
      "descripcion": "Productos electrónicos"
    }
  ]
}
```

---

#### POST `/api/categorias`
Crea una nueva categoría.

**Request Body:**
```json
{
  "nombre": "Nueva Categoría",
  "descripcion": "Descripción opcional"
}
```

**Response (200):**
```json
{
  "success": true,
  "categoria": { "...": "..." }
}
```

---

### 📊 Dashboard

#### GET `/api/dashboard`
Obtiene estadísticas del dashboard.

**Response (200):**
```json
{
  "stats": {
    "totalProductos": 150,
    "productosActivos": 142,
    "valorInventario": 5000000,
    "stockBajo": 8,
    "sinStock": 2
  },
  "movimientosRecientes": [],
  "productosBajoStock": [],
  "distribucionCategorias": []
}
```

---

### 🔔 Alertas

#### GET `/api/alertas`
Obtiene alertas de stock bajo.

**Response (200):**
```json
{
  "alertas": [
    {
      "id": "uuid",
      "producto": "Producto X",
      "sku": "SKU-X",
      "stock": 3,
      "stock_minimo": 10,
      "tipo": "stock_bajo"
    }
  ],
  "total": 5
}
```

---

### 📈 Reportes

#### GET `/api/reportes`
Genera reportes de inventario.

**Query Parameters:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `periodo` | string | `30d`, `3m`, `7m`, `1y` |

**Response (200):**
```json
{
  "valorTotal": 5000000,
  "rotacionPromedio": 2.5,
  "skusActivos": 150,
  "movimientosMensuales": [
    { "mes": "Ene", "entradas": 500, "salidas": 300 }
  ],
  "distribucionCategorias": [
    { "nombre": "Electrónicos", "porcentaje": 35, "cantidad": 52 }
  ]
}
```

---

### 🏢 Empresa

#### GET `/api/empresa`
Obtiene datos de la empresa.

**Response (200):**
```json
{
  "empresa": {
    "id": "uuid",
    "nombre": "Mi Empresa S.A.",
    "email": "contacto@miempresa.com",
    "telefono": "+506 8888-8888",
    "direccion": "San José, Costa Rica"
  }
}
```

---

#### PUT `/api/empresa`
Actualiza datos de la empresa.

**Request Body:**
```json
{
  "nombre": "Nuevo Nombre",
  "telefono": "+506 9999-9999"
}
```

---

## ⚠️ Códigos de Error

| Código | Significado |
|--------|-------------|
| 200 | Éxito |
| 201 | Creado exitosamente |
| 400 | Solicitud inválida |
| 401 | No autenticado |
| 403 | Sin permisos |
| 404 | Recurso no encontrado |
| 500 | Error del servidor |

---

## 📝 Notas

- Todas las respuestas son en formato JSON
- Las fechas usan formato ISO 8601
- Los IDs son UUID v4
- Los montos están en la moneda configurada (CRC por defecto)
