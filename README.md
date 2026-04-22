<p align="center">
  <img src="public/images/invora-logo.png" alt="Invora Logo" width="400"/>
</p>

<h1 align="center">INVORA</h1>

<p align="center">
  <strong>Sistema de Gestion de Inventario Inteligente para PYMEs</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js" alt="Next.js"/>
  <img src="https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase" alt="Supabase"/>
  <img src="https://img.shields.io/badge/TailwindCSS-3.4-06B6D4?style=for-the-badge&logo=tailwind-css" alt="Tailwind"/>
  <img src="https://img.shields.io/badge/Vercel-Deployed-000000?style=for-the-badge&logo=vercel" alt="Vercel"/>
</p>

<p align="center">
  <a href="https://invorastock.vercel.app">Ver Demo en Vivo</a>
</p>

---

## Tabla de Contenidos

- [Descripcion del Proyecto](#descripcion-del-proyecto)
- [Caracteristicas Principales](#caracteristicas-principales)
- [Stack Tecnologico](#stack-tecnologico)
- [Arquitectura del Sistema](#arquitectura-del-sistema)
- [Diseno de Base de Datos](#diseno-de-base-de-datos)
- [Documentacion de API](#documentacion-de-api)
- [Guia de Instalacion](#guia-de-instalacion)
- [Despliegue en Produccion](#despliegue-en-produccion)
- [Uso de Inteligencia Artificial](#uso-de-inteligencia-artificial)
- [Roadmap y Mejoras Futuras](#roadmap-y-mejoras-futuras)
- [Informacion del Desarrollador](#informacion-del-desarrollador)

---

## Descripcion del Proyecto

**Invora** es una plataforma web moderna de gestion de inventario desarrollada especificamente para pequenas y medianas empresas (PYMEs) en Costa Rica. El sistema permite digitalizar y automatizar el control de inventario, proporcionando herramientas intuitivas para gestionar productos, rastrear movimientos de stock, generar reportes analiticos y recibir alertas automaticas cuando los niveles de inventario caen por debajo de umbrales criticos.

### Problema que Resuelve

Las PYMEs frecuentemente enfrentan desafios significativos en la gestion de su inventario:

- **Falta de visibilidad**: No tienen datos precisos sobre existencias actuales
- **Perdidas por desabastecimiento**: Ventas perdidas por no tener productos disponibles
- **Sobreinventario**: Capital inmovilizado en productos que no rotan
- **Procesos manuales**: Uso de Excel o papel que genera errores humanos
- **Falta de reportes**: Dificultad para tomar decisiones basadas en datos

### Solucion Propuesta

Invora aborda estos problemas mediante:

- Dashboard en tiempo real con metricas clave del negocio
- Sistema de alertas automaticas para stock bajo
- Historial completo de movimientos para trazabilidad
- Reportes exportables para analisis detallado
- Interfaz intuitiva que no requiere capacitacion tecnica
- Arquitectura multi-tenant que permite escalar a multiples empresas

---

## Caracteristicas Principales

### Modulo de Autenticacion

| Funcionalidad | Descripcion |
|---------------|-------------|
| Registro de usuarios | Creacion de cuenta con verificacion de email |
| Inicio de sesion | Autenticacion segura con Supabase Auth |
| Recuperacion de contrasena | Flujo de reseteo via email |
| Validacion de contrasena | Requisitos de seguridad (8+ caracteres, mayuscula, caracter especial) |
| Sesiones persistentes | Mantenimiento de sesion entre visitas |

### Modulo de Productos

| Funcionalidad | Descripcion |
|---------------|-------------|
| CRUD completo | Crear, leer, actualizar y eliminar productos |
| Categorias | Organizacion de productos por categoria |
| SKU automatico | Generacion de codigos unicos |
| Precios duales | Precio de costo y precio de venta |
| Stock minimo | Configuracion de umbrales de alerta |
| Busqueda y filtros | Busqueda por nombre, SKU o categoria |

### Modulo de Movimientos

| Funcionalidad | Descripcion |
|---------------|-------------|
| Entradas | Registro de compras y recepciones |
| Salidas | Registro de ventas y despachos |
| Ajustes | Correcciones de inventario (positivas/negativas) |
| Historial | Registro completo con fecha, cantidad y motivo |
| Exportacion | Descarga de movimientos en formato CSV |

### Modulo de Dashboard

| Funcionalidad | Descripcion |
|---------------|-------------|
| KPIs principales | Total productos, valor inventario, movimientos del dia |
| Graficos de tendencia | Visualizacion de entradas vs salidas por mes |
| Distribucion por categoria | Grafico de torta con porcentajes |
| Productos con stock bajo | Lista de items que requieren atencion |
| Movimientos recientes | Ultimas transacciones registradas |

### Modulo de Alertas

| Funcionalidad | Descripcion |
|---------------|-------------|
| Deteccion automatica | Identificacion de productos bajo stock minimo |
| Dashboard de alertas | Vista consolidada de todos los productos criticos |
| Niveles de severidad | Clasificacion por urgencia (critico, bajo, normal) |

### Modulo de Reportes

| Funcionalidad | Descripcion |
|---------------|-------------|
| Filtros por periodo | 30 dias, 3 meses, 7 meses, 1 ano |
| Metricas avanzadas | Valor total, rotacion promedio, SKUs activos |
| Graficos interactivos | Tendencias y distribuciones visuales |

### Modulo de Configuracion

| Funcionalidad | Descripcion |
|---------------|-------------|
| Perfil de empresa | Nombre, email, telefono, direccion |
| Identificacion fiscal | Numero de cedula juridica |
| Preferencias | Configuraciones personalizadas |

---

## Stack Tecnologico

### Frontend

```
Framework:        Next.js 15 (App Router)
Lenguaje:         TypeScript 5.7
Estilos:          Tailwind CSS 3.4
Componentes UI:   shadcn/ui (Radix UI)
Graficos:         Recharts 2.15
Animaciones:      Framer Motion 11.11
3D:               Three.js 0.169 / React Three Fiber
Iconos:           Lucide React
Formularios:      React Hook Form + Zod
Data Fetching:    SWR
```

### Backend

```
BaaS:             Supabase
Base de Datos:    PostgreSQL 15+
Autenticacion:    Supabase Auth
Almacenamiento:   Supabase Storage
APIs:             Next.js API Routes (REST)
Seguridad:        Row Level Security (RLS)
```

### Infraestructura

```
Hosting:          Vercel
CI/CD:            Vercel Git Integration
Dominio:          invorastock.vercel.app
SSL:              Automatico via Vercel
```

### Herramientas de Desarrollo

```
Package Manager:  pnpm
Linting:          ESLint
Formatting:       Prettier
Version Control:  Git + GitHub
IDE:              VS Code / Cursor
AI Assistant:     v0.dev, Claude, ChatGPT
```

---

## Arquitectura del Sistema

### Patron Arquitectonico

Invora implementa una arquitectura **Cliente-Servidor** con el patron **MVC** (Modelo-Vista-Controlador) adaptado para aplicaciones modernas de React:

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENTE                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │    Vista    │  │ Controlador │  │   Estado    │             │
│  │  (React +   │◄─┤  (Hooks +   │◄─┤    (SWR)    │             │
│  │  shadcn/ui) │  │   Actions)  │  │             │             │
│  └─────────────┘  └──────┬──────┘  └─────────────┘             │
│                          │                                      │
└──────────────────────────┼──────────────────────────────────────┘
                           │ HTTPS/REST
┌──────────────────────────┼──────────────────────────────────────┐
│                     SERVIDOR                                     │
│                          ▼                                       │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Next.js API Routes                          │   │
│  │         /api/productos, /api/movimientos, etc.          │   │
│  └───────────────────────┬─────────────────────────────────┘   │
│                          │                                       │
│  ┌───────────────────────▼─────────────────────────────────┐   │
│  │              Supabase Client (Server)                    │   │
│  │           Autenticacion + Queries + RLS                  │   │
│  └───────────────────────┬─────────────────────────────────┘   │
│                          │                                       │
└──────────────────────────┼──────────────────────────────────────┘
                           │
┌──────────────────────────┼──────────────────────────────────────┐
│                    BASE DE DATOS                                 │
│                          ▼                                       │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                   PostgreSQL                             │   │
│  │    Tablas + Vistas + Funciones + Triggers + RLS         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Estructura de Carpetas

```
invora/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Rutas de autenticacion
│   │   ├── login/
│   │   └── register/
│   ├── api/                      # API Routes (Backend)
│   │   ├── alertas/
│   │   ├── categorias/
│   │   ├── dashboard/
│   │   ├── empresa/
│   │   ├── movimientos/
│   │   ├── productos/
│   │   └── reportes/
│   ├── auth/                     # Callbacks de auth
│   │   ├── callback/
│   │   ├── confirm/
│   │   ├── error/
│   │   └── verified/
│   ├── dashboard/                # Paginas del dashboard
│   │   ├── alertas/
│   │   ├── configuracion/
│   │   ├── movimientos/
│   │   ├── productos/
│   │   └── reportes/
│   ├── globals.css               # Estilos globales + tokens
│   ├── layout.tsx                # Layout principal
│   └── page.tsx                  # Landing page
├── components/                   # Componentes React
│   ├── dashboard/                # Componentes del dashboard
│   ├── landing/                  # Componentes del landing
│   └── ui/                       # shadcn/ui components
├── lib/                          # Utilidades y configuracion
│   ├── supabase/                 # Cliente Supabase
│   │   ├── client.ts             # Cliente para browser
│   │   ├── server.ts             # Cliente para server
│   │   ├── middleware.ts         # Middleware de auth
│   │   └── empresa.ts            # Helper para obtener empresa
│   ├── db.ts                     # Conexion PostgreSQL
│   └── env.ts                    # Validacion de env vars
├── scripts/                      # Scripts SQL
│   ├── 001_create_schema.sql     # Esquema inicial
│   └── 002_add_rls_policies.sql  # Politicas RLS
├── public/                       # Assets estaticos
│   └── images/
├── types/                        # Definiciones TypeScript
│   └── env.d.ts
├── docs/                         # Documentacion adicional
├── .env.example                  # Template de variables
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

### Flujo de Datos

```
1. Usuario interactua con la UI (Click, Form Submit)
           │
           ▼
2. Componente React dispara accion
           │
           ▼
3. SWR mutate() o fetch() a API Route
           │
           ▼
4. API Route valida sesion con Supabase Auth
           │
           ▼
5. API Route ejecuta query con RLS activo
           │
           ▼
6. PostgreSQL aplica politicas y retorna datos
           │
           ▼
7. API Route formatea respuesta JSON
           │
           ▼
8. SWR actualiza cache y re-renderiza UI
           │
           ▼
9. Usuario ve los datos actualizados
```

---

## Diseno de Base de Datos

### Diagrama Entidad-Relacion

```
┌──────────────────┐       ┌──────────────────┐
│     empresa      │       │  usuario_empresa │
├──────────────────┤       ├──────────────────┤
│ id (PK)          │◄──────┤ id_empresa (FK)  │
│ nombre           │       │ id_usuario (FK)  │───► auth.users
│ email            │       │ rol              │
│ telefono         │       │ creado_en        │
│ direccion        │       └──────────────────┘
│ id_fiscal        │
│ logo_url         │
│ creado_en        │
└────────┬─────────┘
         │
         │ 1:N
         ▼
┌──────────────────┐       ┌──────────────────┐
│    categoria     │       │     producto     │
├──────────────────┤       ├──────────────────┤
│ id (PK)          │◄──────┤ id_categoria(FK) │
│ id_empresa (FK)  │       │ id (PK)          │
│ nombre           │       │ id_empresa (FK)  │
│ descripcion      │       │ nombre           │
│ creado_en        │       │ sku              │
└──────────────────┘       │ descripcion      │
                           │ stock            │
                           │ stock_minimo     │
                           │ precio_costo     │
                           │ precio_venta     │
                           │ activo           │
                           │ creado_en        │
                           └────────┬─────────┘
                                    │
                                    │ 1:N
                                    ▼
                           ┌──────────────────┐
                           │   movimiento_    │
                           │   inventario     │
                           ├──────────────────┤
                           │ id (PK)          │
                           │ id_empresa (FK)  │
                           │ id_producto (FK) │
                           │ tipo             │
                           │ cantidad         │
                           │ stock_antes      │
                           │ stock_despues    │
                           │ motivo           │
                           │ creado_en        │
                           └──────────────────┘
```

### Descripcion de Tablas

#### Tabla: `empresa`

Almacena la informacion de las empresas registradas en el sistema.

| Columna | Tipo | Restricciones | Descripcion |
|---------|------|---------------|-------------|
| id | UUID | PK, DEFAULT uuid_generate_v4() | Identificador unico |
| nombre | VARCHAR(255) | NOT NULL | Nombre de la empresa |
| email | VARCHAR(255) | NOT NULL | Email de contacto |
| telefono | VARCHAR(20) | NULL | Telefono de contacto |
| direccion | TEXT | NULL | Direccion fisica |
| id_fiscal | VARCHAR(50) | NULL | Cedula juridica |
| logo_url | TEXT | NULL | URL del logo |
| creado_en | TIMESTAMPTZ | DEFAULT NOW() | Fecha de creacion |

#### Tabla: `usuario_empresa`

Relaciona usuarios con empresas, permitiendo que un usuario pertenezca a multiples empresas con diferentes roles.

| Columna | Tipo | Restricciones | Descripcion |
|---------|------|---------------|-------------|
| id | UUID | PK | Identificador unico |
| id_usuario | UUID | FK → auth.users, NOT NULL | Usuario de Supabase |
| id_empresa | UUID | FK → empresa, NOT NULL | Empresa asociada |
| rol | rol_usuario | DEFAULT 'operador' | Rol del usuario |
| creado_en | TIMESTAMPTZ | DEFAULT NOW() | Fecha de asignacion |

#### Tabla: `categoria`

Categorias para organizar productos.

| Columna | Tipo | Restricciones | Descripcion |
|---------|------|---------------|-------------|
| id | UUID | PK | Identificador unico |
| id_empresa | UUID | FK → empresa, NOT NULL | Empresa propietaria |
| nombre | VARCHAR(100) | NOT NULL | Nombre de categoria |
| descripcion | TEXT | NULL | Descripcion opcional |
| creado_en | TIMESTAMPTZ | DEFAULT NOW() | Fecha de creacion |

#### Tabla: `producto`

Catalogo de productos con informacion de precios y stock.

| Columna | Tipo | Restricciones | Descripcion |
|---------|------|---------------|-------------|
| id | UUID | PK | Identificador unico |
| id_empresa | UUID | FK → empresa, NOT NULL | Empresa propietaria |
| id_categoria | UUID | FK → categoria, NULL | Categoria asignada |
| nombre | VARCHAR(255) | NOT NULL | Nombre del producto |
| sku | VARCHAR(50) | UNIQUE por empresa | Codigo unico |
| descripcion | TEXT | NULL | Descripcion del producto |
| stock | INTEGER | DEFAULT 0, >= 0 | Cantidad actual |
| stock_minimo | INTEGER | DEFAULT 0, >= 0 | Umbral de alerta |
| precio_costo | NUMERIC(12,2) | DEFAULT 0 | Costo de adquisicion |
| precio_venta | NUMERIC(12,2) | DEFAULT 0 | Precio de venta |
| activo | BOOLEAN | DEFAULT TRUE | Estado del producto |
| creado_en | TIMESTAMPTZ | DEFAULT NOW() | Fecha de creacion |

#### Tabla: `movimiento_inventario`

Registro historico de todos los movimientos de inventario.

| Columna | Tipo | Restricciones | Descripcion |
|---------|------|---------------|-------------|
| id | UUID | PK | Identificador unico |
| id_empresa | UUID | FK → empresa, NOT NULL | Empresa propietaria |
| id_producto | UUID | FK → producto, NOT NULL | Producto afectado |
| tipo | tipo_movimiento | NOT NULL | Tipo de movimiento |
| cantidad | INTEGER | NOT NULL, > 0 | Cantidad movida |
| stock_antes | INTEGER | NOT NULL | Stock previo |
| stock_despues | INTEGER | NOT NULL | Stock posterior |
| motivo | TEXT | NULL | Razon del movimiento |
| creado_en | TIMESTAMPTZ | DEFAULT NOW() | Fecha del movimiento |

### Tipos Enumerados

```sql
CREATE TYPE rol_usuario AS ENUM ('admin', 'operador', 'viewer');

CREATE TYPE tipo_movimiento AS ENUM (
  'entrada',
  'salida', 
  'ajuste_positivo',
  'ajuste_negativo',
  'devolucion_venta',
  'devolucion_compra'
);
```

### Funciones de Base de Datos

#### `fn_empresa_del_usuario()`

Retorna el ID de la empresa asociada al usuario autenticado.

```sql
CREATE OR REPLACE FUNCTION public.fn_empresa_del_usuario()
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id_empresa 
  FROM public.usuario_empresa 
  WHERE id_usuario = auth.uid() 
  LIMIT 1;
$$;
```

#### `fn_rol_del_usuario()`

Retorna el rol del usuario autenticado en su empresa.

```sql
CREATE OR REPLACE FUNCTION public.fn_rol_del_usuario()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT rol 
  FROM public.usuario_empresa 
  WHERE id_usuario = auth.uid() 
  LIMIT 1;
$$;
```

### Vistas

#### `v_historial_inventario`

Vista que combina movimientos con informacion del producto para facilitar consultas.

```sql
CREATE VIEW v_historial_inventario AS
SELECT 
  m.id,
  m.id_empresa,
  m.id_producto,
  p.nombre AS producto,
  p.sku,
  m.tipo,
  m.cantidad,
  m.stock_antes,
  m.stock_despues,
  m.motivo,
  m.creado_en
FROM movimiento_inventario m
JOIN producto p ON p.id = m.id_producto;
```

### Politicas de Seguridad (RLS)

Todas las tablas tienen Row Level Security habilitado. Las politicas aseguran que los usuarios solo puedan acceder a datos de su propia empresa.

```sql
-- Ejemplo: Politica SELECT para productos
CREATE POLICY pol_producto_select ON producto
  FOR SELECT
  TO public
  USING (id_empresa = fn_empresa_del_usuario());

-- Ejemplo: Politica INSERT para productos
CREATE POLICY pol_producto_insert ON producto
  FOR INSERT
  TO public
  WITH CHECK (
    id_empresa IN (
      SELECT id_empresa FROM usuario_empresa WHERE id_usuario = auth.uid()
    )
  );
```

---

## Documentacion de API

### Autenticacion

Todas las rutas API requieren autenticacion mediante cookies de sesion de Supabase. El cliente automaticamente incluye las credenciales en cada request.

### Endpoints Disponibles

#### Productos

**GET /api/productos**

Obtiene la lista de productos de la empresa.

```
Query Parameters:
- search (string): Buscar por nombre o SKU
- categoria (uuid): Filtrar por categoria
- activo (boolean): Filtrar por estado

Response 200:
{
  "productos": [
    {
      "id": "uuid",
      "nombre": "Producto 1",
      "sku": "SKU-001",
      "stock": 100,
      "stock_minimo": 10,
      "precio_costo": 500.00,
      "precio_venta": 750.00,
      "activo": true,
      "categoria": { "id": "uuid", "nombre": "General" }
    }
  ]
}
```

**POST /api/productos**

Crea un nuevo producto.

```
Request Body:
{
  "nombre": "Nuevo Producto",
  "sku": "SKU-002",
  "id_categoria": "uuid",
  "stock": 50,
  "stock_minimo": 5,
  "precio_costo": 100.00,
  "precio_venta": 150.00
}

Response 201:
{
  "producto": { ... },
  "success": true
}
```

**PUT /api/productos**

Actualiza un producto existente.

```
Request Body:
{
  "id": "uuid",
  "nombre": "Producto Actualizado",
  ...
}

Response 200:
{
  "producto": { ... },
  "success": true
}
```

**DELETE /api/productos**

Elimina un producto.

```
Query Parameters:
- id (uuid): ID del producto a eliminar

Response 200:
{
  "success": true
}
```

#### Movimientos

**GET /api/movimientos**

Obtiene el historial de movimientos.

```
Query Parameters:
- producto (uuid): Filtrar por producto
- tipo (string): Filtrar por tipo de movimiento
- desde (date): Fecha inicial
- hasta (date): Fecha final
- limit (number): Limite de resultados

Response 200:
{
  "movimientos": [
    {
      "id": "uuid",
      "producto": "Nombre del producto",
      "sku": "SKU-001",
      "tipo": "entrada",
      "cantidad": 50,
      "stock_antes": 100,
      "stock_despues": 150,
      "motivo": "Compra de inventario",
      "creado_en": "2024-01-15T10:30:00Z"
    }
  ]
}
```

**POST /api/movimientos**

Registra un nuevo movimiento de inventario.

```
Request Body:
{
  "id_producto": "uuid",
  "tipo": "entrada",
  "cantidad": 50,
  "motivo": "Compra de inventario"
}

Response 201:
{
  "movimiento": { ... },
  "success": true
}
```

#### Categorias

**GET /api/categorias**

Obtiene las categorias de la empresa.

```
Response 200:
{
  "categorias": [
    {
      "id": "uuid",
      "nombre": "General",
      "descripcion": "Categoria general"
    }
  ]
}
```

**POST /api/categorias**

Crea una nueva categoria.

```
Request Body:
{
  "nombre": "Nueva Categoria",
  "descripcion": "Descripcion opcional"
}

Response 201:
{
  "categoria": { ... }
}
```

#### Dashboard

**GET /api/dashboard**

Obtiene los datos del dashboard.

```
Response 200:
{
  "stats": {
    "totalProductos": 150,
    "valorInventario": 5000000,
    "movimientosHoy": 12,
    "alertasActivas": 3
  },
  "recentMovements": [...],
  "lowStockProducts": [...],
  "categoryData": [...],
  "monthlyTrend": [...]
}
```

#### Alertas

**GET /api/alertas**

Obtiene productos con stock bajo.

```
Response 200:
{
  "alertas": [
    {
      "id": "uuid",
      "nombre": "Producto",
      "sku": "SKU-001",
      "stock": 5,
      "stock_minimo": 10,
      "nivel": "critico"
    }
  ],
  "empresa": {
    "nombre": "Mi Empresa",
    "email": "email@empresa.com"
  }
}
```

#### Reportes

**GET /api/reportes**

Obtiene datos para reportes.

```
Query Parameters:
- periodo (string): "30d", "3m", "7m", "1y"

Response 200:
{
  "kpis": {
    "valorTotal": 5000000,
    "rotacionPromedio": 2.5,
    "skusActivos": 150
  },
  "tendencia": [...],
  "distribucionCategoria": [...]
}
```

#### Empresa

**GET /api/empresa**

Obtiene informacion de la empresa.

```
Response 200:
{
  "empresa": {
    "id": "uuid",
    "nombre": "Mi Empresa",
    "email": "email@empresa.com",
    "telefono": "8888-8888",
    "direccion": "San Jose, Costa Rica",
    "id_fiscal": "3-101-123456"
  },
  "userEmail": "usuario@email.com"
}
```

**PUT /api/empresa**

Actualiza informacion de la empresa.

```
Request Body:
{
  "nombre": "Empresa Actualizada",
  "telefono": "8888-8888",
  "direccion": "Nueva direccion",
  "id_fiscal": "3-101-123456"
}

Response 200:
{
  "empresa": { ... },
  "success": true
}
```

### Codigos de Error

| Codigo | Descripcion |
|--------|-------------|
| 400 | Bad Request - Datos invalidos o faltantes |
| 401 | Unauthorized - Usuario no autenticado |
| 403 | Forbidden - Sin permisos para la operacion |
| 404 | Not Found - Recurso no encontrado |
| 500 | Internal Server Error - Error del servidor |

---

## Guia de Instalacion

### Requisitos Previos

- Node.js 18.0 o superior
- pnpm 8.0 o superior (recomendado) o npm/yarn
- Cuenta en Supabase (gratuita disponible)
- Git

### Paso 1: Clonar el Repositorio

```bash
git clone https://github.com/XiaoMendez/Invora.git
cd Invora
```

### Paso 2: Instalar Dependencias

```bash
pnpm install
```

### Paso 3: Configurar Supabase

1. Crear un nuevo proyecto en [supabase.com](https://supabase.com)
2. Ir a Settings > API para obtener las credenciales
3. Ir al SQL Editor y ejecutar los scripts:
   - `scripts/001_create_schema.sql`
   - `scripts/002_add_rls_policies.sql`

### Paso 4: Variables de Entorno

Crear archivo `.env.local` basado en `.env.example`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key

# Optional: Service Role Key (for admin operations)
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key

# Site URL (for auth redirects)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Paso 5: Configurar Autenticacion en Supabase

1. Ir a Authentication > URL Configuration
2. Configurar Site URL: `http://localhost:3000`
3. Agregar Redirect URLs:
   - `http://localhost:3000/auth/callback`
   - `http://localhost:3000/auth/verified`

### Paso 6: Ejecutar en Desarrollo

```bash
pnpm dev
```

La aplicacion estara disponible en `http://localhost:3000`

---

## Despliegue en Produccion

### Despliegue en Vercel

#### Opcion 1: Desde la Interfaz Web

1. Ir a [vercel.com](https://vercel.com) e iniciar sesion
2. Click en "Import Project"
3. Conectar con el repositorio de GitHub
4. Configurar variables de entorno:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_SITE_URL` (usar URL de Vercel)
5. Click en "Deploy"

#### Opcion 2: Desde CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Iniciar sesion
vercel login

# Desplegar
vercel --prod
```

### Configuracion Post-Despliegue

1. Actualizar Supabase Authentication:
   - Site URL: `https://tu-dominio.vercel.app`
   - Redirect URLs: 
     - `https://tu-dominio.vercel.app/auth/callback`
     - `https://tu-dominio.vercel.app/auth/verified`

2. Actualizar variable de entorno en Vercel:
   - `NEXT_PUBLIC_SITE_URL=https://tu-dominio.vercel.app`

---

## Uso de Inteligencia Artificial

### Herramientas de IA Utilizadas

Durante el desarrollo de Invora, se utilizaron diversas herramientas de inteligencia artificial como asistentes de desarrollo:

| Herramienta | Uso Principal |
|-------------|---------------|
| **v0.dev** | Generacion de componentes UI, prototipos rapidos |
| **Claude (Anthropic)** | Arquitectura, logica de negocio, debugging |
| **ChatGPT (OpenAI)** | Documentacion, consultas tecnicas |
| **GitHub Copilot** | Autocompletado de codigo |

### Areas de Aplicacion

#### Diseno de Interfaz

Las herramientas de IA fueron utilizadas para generar componentes de interfaz siguiendo patrones modernos de diseno. Cada componente generado fue revisado, adaptado y personalizado para cumplir con los requisitos especificos del proyecto.

#### Arquitectura de Base de Datos

El esquema de base de datos fue disenado con asistencia de IA para implementar mejores practicas como:
- Normalizacion adecuada
- Indices optimizados
- Politicas de seguridad RLS
- Funciones y triggers eficientes

#### Logica de Negocio

Los algoritmos de calculo de stock, generacion de reportes y deteccion de alertas fueron desarrollados iterativamente con retroalimentacion de IA para asegurar precision y eficiencia.

#### Debugging y Optimizacion

Las herramientas de IA ayudaron a identificar y resolver problemas de rendimiento, errores de logica y vulnerabilidades de seguridad.

### Comprension del Codigo

Todo el codigo generado con asistencia de IA fue:

1. **Revisado manualmente** para asegurar calidad y coherencia
2. **Adaptado** a los requisitos especificos del proyecto
3. **Comprendido** en su totalidad por el desarrollador
4. **Documentado** para facilitar mantenimiento futuro

El desarrollador puede explicar cada componente, funcion y decision arquitectonica del sistema, demostrando comprension completa del codigo implementado.

---

## Roadmap y Mejoras Futuras

### Fase 1: Funcionalidades Pendientes

| Funcionalidad | Prioridad | Descripcion |
|---------------|-----------|-------------|
| Notificaciones Email | Alta | Envio automatico de alertas por correo |
| Codigos de Barras | Alta | Escaneo de productos con camara |
| Multi-sucursal | Media | Gestion de multiples ubicaciones |
| Roles Avanzados | Media | Permisos granulares por usuario |

### Fase 2: Mejoras de UX

| Funcionalidad | Prioridad | Descripcion |
|---------------|-----------|-------------|
| PWA | Alta | Instalacion como app nativa |
| Modo Offline | Media | Funcionamiento sin conexion |
| Temas Personalizados | Baja | Seleccion de colores corporativos |

### Fase 3: Integraciones

| Funcionalidad | Prioridad | Descripcion |
|---------------|-----------|-------------|
| Facturacion Electronica | Alta | Integracion con Hacienda CR |
| Proveedores | Media | Gestion de ordenes de compra |
| E-commerce | Baja | Sincronizacion con tiendas online |

### Fase 4: Analytics Avanzados

| Funcionalidad | Prioridad | Descripcion |
|---------------|-----------|-------------|
| Prediccion de Demanda | Media | ML para forecast de ventas |
| Dashboards Personalizados | Media | Widgets configurables |
| Exportacion Avanzada | Baja | PDF, Excel con graficos |

---

## Informacion del Desarrollador

<p align="center">
  <strong>Desarrollado por</strong>
</p>

<p align="center">
  <strong>Xiao Mendez</strong><br/>
  Estudiante de Ingenieria en Sistemas<br/>
  Universidad de Costa Rica
</p>

<p align="center">
  <a href="mailto:xiaomendezli@gmail.com">Email</a> •
  <a href="https://github.com/XiaoMendez">GitHub</a>
</p>

---

<p align="center">
  <img src="public/images/invora-logo.png" alt="Invora" width="150"/>
</p>

<p align="center">
  <strong>Invora</strong> - Control total de tu inventario en un solo lugar
</p>

<p align="center">
  <a href="https://invorastock.vercel.app">invorastock.vercel.app</a>
</p>

<p align="center">
  <sub>Proyecto desarrollado como parte del curso de Desarrollo Web - 2024</sub>
</p>
