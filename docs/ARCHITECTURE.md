# 📐 Arquitectura del Sistema

<p align="center">
  <img src="https://img.shields.io/badge/Arquitectura-Cliente--Servidor-blue?style=for-the-badge" alt="Arquitectura"/>
  <img src="https://img.shields.io/badge/Patrón-MVC-green?style=for-the-badge" alt="MVC"/>
</p>

---

## 🏗️ Tipo de Arquitectura

Invora utiliza una **arquitectura Cliente-Servidor** con el patrón **MVC (Model-View-Controller)** adaptado al ecosistema de Next.js:

- **Model**: Supabase (PostgreSQL) con Row Level Security
- **View**: Componentes React con Server/Client Components
- **Controller**: API Routes de Next.js + Supabase SDK

---

## 🧩 Componentes Principales

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENTE (Browser)                        │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    Next.js Frontend                      │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │    │
│  │  │   Landing    │  │  Dashboard   │  │    Auth      │   │    │
│  │  │   (RSC)      │  │   (Client)   │  │   (Client)   │   │    │
│  │  └──────────────┘  └──────────────┘  └──────────────┘   │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      SERVIDOR (Vercel Edge)                      │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                   Next.js API Routes                     │    │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐    │    │
│  │  │ /auth/*  │ │/productos│ │/movimien │ │/reportes │    │    │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘    │    │
│  └─────────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    Middleware                            │    │
│  │              (Autenticación + Redirecciones)             │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ PostgreSQL Protocol
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     BASE DE DATOS (Supabase)                     │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    PostgreSQL 15                         │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │    │
│  │  │    Tablas    │  │   Triggers   │  │   RLS        │   │    │
│  │  │   + Vistas   │  │  + Functions │  │  Policies    │   │    │
│  │  └──────────────┘  └──────────────┘  └──────────────┘   │    │
│  └─────────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                   Supabase Auth                          │    │
│  │              (JWT + Session Management)                  │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📁 Estructura del Proyecto

```
invora/
├── 📂 app/                      # Next.js App Router
│   ├── 📂 api/                  # API Routes (Backend)
│   │   ├── 📂 auth/             # Endpoints de autenticación
│   │   │   ├── login/route.ts
│   │   │   ├── register/route.ts
│   │   │   ├── logout/route.ts
│   │   │   └── session/route.ts
│   │   ├── 📂 productos/        # CRUD de productos
│   │   ├── 📂 movimientos/      # Gestión de inventario
│   │   ├── 📂 categorias/       # Gestión de categorías
│   │   ├── 📂 alertas/          # Sistema de alertas
│   │   ├── 📂 reportes/         # Generación de reportes
│   │   ├── 📂 dashboard/        # Datos del dashboard
│   │   └── 📂 empresa/          # Configuración empresa
│   │
│   ├── 📂 auth/                 # Páginas de autenticación
│   │   ├── callback/            # OAuth callback
│   │   ├── confirm/             # Confirmación de email
│   │   └── error/               # Errores de auth
│   │
│   ├── 📂 dashboard/            # Panel de administración
│   │   ├── layout.tsx           # Layout con sidebar
│   │   ├── page.tsx             # Dashboard principal
│   │   ├── 📂 productos/        # Gestión de productos
│   │   ├── 📂 movimientos/      # Historial de movimientos
│   │   ├── 📂 reportes/         # Reportes y análisis
│   │   ├── 📂 alertas/          # Centro de alertas
│   │   └── 📂 configuracion/    # Ajustes
│   │
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Landing page
│   ├── login/page.tsx           # Página de login
│   └── register/page.tsx        # Página de registro
│
├── 📂 components/               # Componentes React
│   ├── 📂 ui/                   # shadcn/ui components
│   ├── 📂 dashboard/            # Componentes del dashboard
│   ├── 📂 landing/              # Componentes de landing
│   └── space-scene.tsx          # Escena 3D
│
├── 📂 lib/                      # Utilidades y configuración
│   ├── 📂 supabase/             # Cliente Supabase
│   │   ├── client.ts            # Cliente del navegador
│   │   ├── server.ts            # Cliente del servidor
│   │   ├── middleware.ts        # Helpers de middleware
│   │   └── empresa.ts           # Helpers de empresa
│   ├── auth.ts                  # Utilidades de autenticación
│   ├── db.ts                    # Conexión directa PostgreSQL
│   └── utils.ts                 # Utilidades generales
│
├── 📂 scripts/                  # Scripts SQL
│   ├── 001_create_schema.sql    # Esquema de base de datos
│   └── 002_add_rls_policies.sql # Políticas de seguridad
│
├── 📂 public/                   # Archivos estáticos
│   └── 📂 images/               # Imágenes y logos
│
├── middleware.ts                # Middleware de Next.js
├── tailwind.config.ts           # Configuración de Tailwind
└── next.config.js               # Configuración de Next.js
```

---

## 🔄 Flujo de Datos

### 1. Autenticación

```
Usuario ──► Login Form ──► /api/auth/login ──► Supabase Auth
                                                    │
Usuario ◄── Redirect ◄── Session Cookie ◄──────────┘
```

### 2. Operaciones CRUD

```
Dashboard ──► SWR Hook ──► /api/productos ──► Supabase Client
                                                   │
                                                   ▼
                                            PostgreSQL + RLS
                                                   │
Dashboard ◄── Re-render ◄── JSON Response ◄───────┘
```

### 3. Movimientos de Inventario

```
Nuevo Movimiento ──► /api/movimientos (POST)
                           │
                           ▼
                    Validar cantidad
                           │
                           ▼
                    Actualizar stock (producto)
                           │
                           ▼
                    Insertar movimiento_inventario
                           │
                           ▼
                    Respuesta con nuevo stock
```

---

## 🔐 Seguridad

### Row Level Security (RLS)

Cada tabla tiene políticas RLS que garantizan:

1. **Aislamiento de datos**: Usuarios solo ven datos de su empresa
2. **Validación de roles**: Operaciones según rol del usuario
3. **Integridad**: No se pueden modificar datos de otras empresas

```sql
-- Ejemplo de política RLS
CREATE POLICY pol_producto_select ON producto
  FOR SELECT TO public
  USING (id_empresa = fn_empresa_del_usuario());
```

### Middleware de Autenticación

```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  // Verificar sesión en rutas protegidas
  // Redirigir a login si no autenticado
  // Refrescar tokens si es necesario
}
```

---

## 🌐 Comunicación entre Componentes

| Origen | Destino | Método | Datos |
|--------|---------|--------|-------|
| Cliente | API Routes | fetch/SWR | JSON |
| API Routes | Supabase | SDK | SQL/RPC |
| Supabase | PostgreSQL | Wire Protocol | Queries |
| Components | Components | Props/Context | State |

---

## 📦 Patrones Utilizados

### Server Components (RSC)
- Landing page
- Páginas estáticas

### Client Components
- Dashboard interactivo
- Formularios
- Componentes con estado

### Data Fetching
- **SWR**: Cache y revalidación automática
- **Server Actions**: Mutaciones desde servidor

---

## 🚀 Escalabilidad

El sistema está diseñado para escalar:

- **Horizontal**: Vercel Edge Functions
- **Vertical**: Supabase Pro tiers
- **Cache**: SWR + HTTP caching
- **CDN**: Assets estáticos en Vercel Edge

