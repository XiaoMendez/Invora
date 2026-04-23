# 🔌 Documentación de API

<p align="center">
  <img src="https://img.shields.io/badge/API-RESTful-blue?style=for-the-badge" alt="REST"/>
  <img src="https://img.shields.io/badge/Auth-JWT-orange?style=for-the-badge" alt="JWT"/>
  <img src="https://img.shields.io/badge/Format-JSON-green?style=for-the-badge" alt="JSON"/>
</p>

---

## 🔐 Autenticación

Todos los endpoints (excepto login/register) requieren autenticación mediante cookie de sesión de Supabase Auth.

### Base URL
```
https://invorastock.vercel.app/api
```

### Headers Requeridos
```
Content-Type: application/json
Cookie: sb-{project-id}-auth-token=...
```

---

## 📚 Endpoints

### 🔑 Autenticación

#### POST `/auth/register`
Registra un nuevo usuario y crea su empresa automáticamente.

**Request:**
```json
{
  "email": "usuario@ejemplo.com",
  "password": "MiPassword123!",
  "nombre": "Mi Empresa S.A."
}
```

**Response (201):**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "usuario@ejemplo.com"
  },
  "message": "Registro exitoso. Verifica tu correo para confirmar."
}
```

**Errores:**
- `400 Bad Request` - Email ya existe o datos inválidos
- `500 Server Error` - Error interno

---

#### POST `/auth/login`
Autentica un usuario y crea una sesión.

**Request:**
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
  },
  "empresa": {
    "id": "uuid",
    "nombre": "Mi Empresa S.A."
  }
}
```

---

#### POST `/auth/logout`
Cierra la sesión actual del usuario.

**Response (200):**
```json
{
  "success": true,
  "message": "Sesión cerrada"
}
```

---

#### GET `/auth/session`
Obtiene la información de la sesión actual.

**Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "email": "usuario@ejemplo.com"
  },
  "empresa": {
    "id": "uuid",
    "nombre": "Mi Empresa S.A.",
    "email": "contacto@empresa.com"
  }
}
```

---

### 📦 Productos

#### GET `/productos`
Lista todos los productos de la empresa.

**Query Parameters:**
```
?search=keyword          # Buscar por nombre o SKU
&categoria=uuid         # Filtrar por categoría
&activo=true           # Filtrar por estado
```

**Response (200):**
```json
{
  "productos": [
    {
      "id": "uuid",
      "nombre": "Laptop Dell XPS 13",
      "sku": "LAPTOP-001",
      "stock": 15,
      "stock_minimo": 5,
      "precio_costo": 500000,
      "precio_venta": 750000,
      "activo": true,
      "categoria": {
        "id": "uuid",
        "nombre": "Electrónica"
      },
      "creado_en": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

#### POST `/productos`
Crea un nuevo producto.

**Request:**
```json
{
  "nombre": "Nuevo Producto",
  "sku": "NEW-001",
  "id_categoria": "uuid",
  "stock": 50,
  "stock_minimo": 10,
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

#### PUT `/productos`
Actualiza un producto existente.

**Request:**
```json
{
  "id": "uuid",
  "nombre": "Producto Actualizado",
  "precio_venta": 5000,
  "stock_minimo": 15,
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

#### DELETE `/productos?id={id}`
Elimina un producto (soft delete).

**Response (200):**
```json
{
  "success": true,
  "message": "Producto eliminado"
}
```

---

### 🔄 Movimientos de Inventario

#### GET `/movimientos`
Lista todos los movimientos de inventario.

**Query Parameters:**
```
?tipo=todos            # todos, entradas, salidas
&periodo=30d          # 1d, 7d, 30d, 3m, 1y
&export=csv           # Opcional: exportar como CSV
```

**Response (200):**
```json
{
  "movimientos": [
    {
      "id": "uuid",
      "creado_en": "2024-01-15T10:30:00Z",
      "producto": "Laptop Dell XPS 13",
      "sku": "LAPTOP-001",
      "tipo": "entrada",
      "cantidad": 25,
      "stock_antes": 10,
      "stock_despues": 35,
      "motivo": "Reabastecimiento de proveedor"
    }
  ],
  "stats": {
    "entradas": 500,
    "salidas": 300,
    "neto": 200,
    "promedioDiario": 6.67
  }
}
```

---

#### POST `/movimientos`
Registra un nuevo movimiento de inventario.

**Request:**
```json
{
  "id_producto": "uuid",
  "tipo": "entrada",
  "cantidad": 25,
  "motivo": "Compra a proveedor ABC"
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
  "movimiento": {
    "id": "uuid",
    "creado_en": "2024-01-15T10:30:00Z"
  },
  "nuevoStock": 35
}
```

---

### 🏷️ Categorías

#### GET `/categorias`
Lista todas las categorías de la empresa.

**Response (200):**
```json
{
  "categorias": [
    {
      "id": "uuid",
      "nombre": "Electrónica",
      "descripcion": "Productos electrónicos",
      "activo": true,
      "creado_en": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

#### POST `/categorias`
Crea una nueva categoría.

**Request:**
```json
{
  "nombre": "Ropa",
  "descripcion": "Prendas de vestir"
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

#### GET `/dashboard`
Obtiene estadísticas y métricas del dashboard.

**Response (200):**
```json
{
  "stats": {
    "totalProductos": 150,
    "productosActivos": 142,
    "valorInventario": 5000000,
    "productosConStockBajo": 8,
    "productosSinStock": 2,
    "movimientosHoy": 12,
    "movimientosEstaSemana": 87
  },
  "movimientosRecientes": [
    {
      "id": "uuid",
      "producto": "Laptop",
      "tipo": "salida",
      "cantidad": 2,
      "creado_en": "2024-01-15T14:30:00Z"
    }
  ],
  "productosBajoStock": [
    {
      "id": "uuid",
      "nombre": "Mouse Logitech",
      "stock": 3,
      "stock_minimo": 10
    }
  ],
  "distribucionCategorias": [
    {
      "nombre": "Electrónica",
      "cantidad": 52,
      "porcentaje": 35
    }
  ]
}
```

---

### 🔔 Alertas

#### GET `/alertas`
Obtiene alertas de stock bajo y eventos críticos.

**Query Parameters:**
```
?estado=activas        # activas, resueltas, ignoradas
&tipo=stock_bajo      # stock_bajo, caducado
```

**Response (200):**
```json
{
  "alertas": [
    {
      "id": "uuid",
      "producto": "Mouse Inalámbrico",
      "sku": "MOUSE-001",
      "stock": 3,
      "stock_minimo": 10,
      "tipo": "stock_bajo",
      "estado": "activa",
      "creado_en": "2024-01-15T10:00:00Z"
    }
  ],
  "total": 5,
  "activas": 5,
  "resueltas": 2
}
```

---

#### PUT `/alertas/{id}`
Marca una alerta como resuelta.

**Request:**
```json
{
  "estado": "resuelta"
}
```

**Response (200):**
```json
{
  "success": true,
  "alerta": { "...": "..." }
}
```

---

### 📈 Reportes

#### GET `/reportes`
Genera reportes de inventario y movimientos.

**Query Parameters:**
```
?periodo=30d          # 1d, 7d, 30d, 3m, 7m, 1y
&tipo=general        # general, movimientos, categorias
```

**Response (200):**
```json
{
  "periodo": "últimos 30 días",
  "stats": {
    "valorTotal": 5000000,
    "rotacionPromedio": 2.5,
    "skusActivos": 150,
    "entradastotales": 1200,
    "salidastotales": 900,
    "cambioneto": 300
  },
  "movimientosMensuales": [
    {
      "mes": "Enero",
      "entradas": 500,
      "salidas": 300,
      "neto": 200
    }
  ],
  "distribucionCategorias": [
    {
      "nombre": "Electrónica",
      "cantidad": 52,
      "valor": 1750000,
      "porcentaje": 35
    }
  ]
}
```

---

### 🏢 Empresa

#### GET `/empresa`
Obtiene datos de la empresa actual.

**Response (200):**
```json
{
  "empresa": {
    "id": "uuid",
    "nombre": "Mi Empresa S.A.",
    "email": "contacto@miempresa.com",
    "telefono": "+506 8888-8888",
    "direccion": "San José, Costa Rica",
    "activo": true,
    "creado_en": "2024-01-01T00:00:00Z"
  }
}
```

---

#### PUT `/empresa`
Actualiza datos de la empresa.

**Request:**
```json
{
  "nombre": "Nuevo Nombre S.A.",
  "telefono": "+506 9999-9999",
  "direccion": "Nueva dirección"
}
```

**Response (200):**
```json
{
  "success": true,
  "empresa": { "...": "..." }
}
```

---

## ⚠️ Códigos de Error

| Código | Descripción |
|--------|-------------|
| 200 | OK - Éxito |
| 201 | Created - Recurso creado |
| 400 | Bad Request - Solicitud inválida |
| 401 | Unauthorized - No autenticado |
| 403 | Forbidden - Sin permisos |
| 404 | Not Found - Recurso no encontrado |
| 422 | Unprocessable Entity - Validación fallida |
| 500 | Internal Server Error - Error del servidor |

---

## 📝 Notas Generales

- Todas las respuestas son en formato JSON
- Las fechas usan formato ISO 8601
- Los IDs son UUID v4
- Los montos están en CRC (colones costarricenses)
- Las sesiones expiran después de 24 horas de inactividad
- Implementar rate limiting: máx 100 requests/min por IP

