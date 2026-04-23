<p align="center">
  <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Invora-Banner-8CYKOMUQQr0Ei3wdRpcLHH4Sc1EJ3f.png" alt="Invora Banner" width="100%"/>
</p>

<p align="center">
  <strong>Sistema de Gestión de Inventario Inteligente para PYMEs</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js" alt="Next.js"/>
  <img src="https://img.shields.io/badge/TypeScript-5.7-blue?style=for-the-badge&logo=typescript" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase" alt="Supabase"/>
  <img src="https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind"/>
</p>

<p align="center">
  <a href="#-descripción">Descripción</a> •
  <a href="#-características">Características</a> •
  <a href="#-tecnologías">Tecnologías</a> •
  <a href="#-documentación">Documentación</a> •
  <a href="#-instalación">Instalación</a>
</p>

---

## 📚 Documentación

Toda la documentación técnica del proyecto está organizada en archivos separados para facilitar la navegación:

| Documento | Descripción |
|-----------|-------------|
| [**Arquitectura**](docs/ARCHITECTURE.md) | Estructura del sistema, patrones MVC, flujo de datos y componentes |
| [**Base de Datos**](docs/DATABASE.md) | Esquema ER, tablas, relaciones, RLS y funciones SQL |
| [**API**](docs/API.md) | Endpoints REST, autenticación, ejemplos de request/response |
| [**Despliegue**](docs/DEPLOYMENT.md) | Guía de instalación local, Vercel y Docker |
| [**Roadmap**](docs/ROADMAP.md) | Funcionalidades pendientes, plan de desarrollo y mejoras futuras |

---

## 📋 Descripción

**Invora** es un sistema de gestión de inventario moderno y escalable, diseñado específicamente para pequeñas y medianas empresas (PYMEs) en Costa Rica. La plataforma permite gestionar productos, controlar movimientos de inventario, generar reportes detallados y recibir alertas de stock bajo, todo desde una interfaz intuitiva y responsiva.

### Objetivo del Proyecto

Desarrollar una solución web completa que permita a las PYMEs:
- Digitalizar y automatizar la gestión de su inventario
- Reducir pérdidas por falta de control de stock
- Tomar decisiones informadas basadas en datos reales
- Mejorar la eficiencia operativa del negocio

---

## Características

| Módulo | Estado | Descripción |
|--------|--------|-------------|
| **Autenticación** | Completo | Registro, login, verificación de email con Supabase Auth |
| **Productos** | Completo | CRUD completo con categorías, SKU, precios y stock |
| **Dashboard** | Completo | Métricas en tiempo real, gráficos de rendimiento |
| **Movimientos** | Completo | Entradas, salidas, ajustes con historial completo |
| **Reportes** | Completo | Análisis por período, exportación CSV |
| **Alertas** | En Proceso | Notificaciones de stock bajo |
| **Configuración** | Completo | Perfil de empresa, preferencias |
| **Landing Page** | Completo | Página de presentación con escena 3D |

### Características Técnicas

- **Multi-tenant**: Soporte para múltiples empresas con aislamiento de datos
- **Row Level Security (RLS)**: Seguridad a nivel de fila en PostgreSQL
- **Tiempo Real**: Actualización automática de datos
- **Responsive**: Diseño adaptable a dispositivos móviles
- **Dark Mode**: Interfaz optimizada para tema oscuro

> Para más detalles técnicos, consulta la [documentación de arquitectura](docs/ARCHITECTURE.md).

---

## Tecnologías

### Frontend
| Tecnología | Versión | Uso |
|------------|---------|-----|
| Next.js | 14.2.15 | Framework React con App Router |
| React | 18.2.0 | Biblioteca de UI |
| TypeScript | 5.7.3 | Tipado estático |
| Tailwind CSS | 3.4.4 | Estilos utilitarios |
| shadcn/ui | Latest | Componentes de UI |
| Recharts | 2.15.0 | Gráficos y visualizaciones |
| Three.js | 0.169.0 | Escena 3D en landing |
| Framer Motion | 11.11.0 | Animaciones |

### Backend
| Tecnología | Versión | Uso |
|------------|---------|-----|
| Supabase | 2.47.0 | Backend as a Service |
| PostgreSQL | 15+ | Base de datos relacional |
| Supabase Auth | Integrado | Autenticación y autorización |
| Row Level Security | Nativo | Seguridad de datos |

> Para más detalles sobre la base de datos, consulta la [documentación de base de datos](docs/DATABASE.md).

### Herramientas de Desarrollo
| Herramienta | Uso |
|-------------|-----|
| pnpm | Gestor de paquetes |
| ESLint | Linting de código |
| Vercel | Despliegue y hosting |
| Git/GitHub | Control de versiones |

---

## Instalación

### Prerrequisitos

- Node.js 18+ 
- pnpm (recomendado) o npm
- Cuenta en Supabase
- Git

### Instalación Rápida

```bash
# 1. Clonar el repositorio
git clone https://github.com/XiaoMendez/Invora.git
cd Invora

# 2. Instalar dependencias
pnpm install

# 3. Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus credenciales de Supabase

# 4. Ejecutar migraciones en Supabase SQL Editor
# scripts/001_create_schema.sql
# scripts/002_add_rls_policies.sql

# 5. Iniciar servidor de desarrollo
pnpm dev
```

> Para instrucciones detalladas de instalación y despliegue, consulta la [guía de despliegue](docs/DEPLOYMENT.md).

---

## Estructura del Proyecto

```
invora/
├── app/                    # Next.js App Router
│   ├── api/                # API Routes
│   ├── dashboard/          # Panel de administración
│   ├── auth/               # Páginas de autenticación
│   └── page.tsx            # Landing page
├── components/             # Componentes React
│   ├── ui/                 # shadcn/ui components
│   ├── dashboard/          # Componentes del dashboard
│   └── landing/            # Componentes de landing
├── lib/                    # Utilidades y configuración
│   └── supabase/           # Cliente Supabase
├── scripts/                # Scripts SQL de migración
├── docs/                   # Documentación técnica
└── public/                 # Assets estáticos
```

> Para más detalles sobre la estructura, consulta la [documentación de arquitectura](docs/ARCHITECTURE.md).

---

## API

El sistema expone una API RESTful con los siguientes recursos principales:

| Recurso | Endpoints | Descripción |
|---------|-----------|-------------|
| Auth | `/api/auth/*` | Registro, login, logout, sesión |
| Productos | `/api/productos` | CRUD de productos |
| Movimientos | `/api/movimientos` | Historial de inventario |
| Categorías | `/api/categorias` | Gestión de categorías |
| Dashboard | `/api/dashboard` | Estadísticas y métricas |
| Reportes | `/api/reportes` | Generación de reportes |
| Alertas | `/api/alertas` | Sistema de notificaciones |

> Para documentación completa de la API, consulta la [referencia de API](docs/API.md).

---

## Equipo

| Nombre | Rol | Contacto |
|--------|-----|----------|
| Xiao Mendez | Desarrollador Full Stack | xiaomendezli@gmail.com |

---

## Roadmap

El proyecto tiene planificadas las siguientes mejoras:

- **Alta Prioridad**: Gestión de usuarios, roles y permisos, historial de cambios
- **Media Prioridad**: Exportación PDF, códigos de barras, notificaciones email
- **Futuro**: App móvil PWA, integraciones externas, multi-sucursal

> Para ver el plan completo de desarrollo, consulta el [roadmap](docs/ROADMAP.md).

---

## Licencia

Este proyecto fue desarrollado como parte del curso de Desarrollo Web.

---

<p align="center">
  <strong>Invora</strong> - Control total de tu inventario en un solo lugar
</p>

<p align="center">
  <a href="https://invorastock.vercel.app">Demo en Vivo</a> •
  <a href="docs/DEPLOYMENT.md">Guía de Despliegue</a> •
  <a href="docs/API.md">Documentación API</a>
</p>
