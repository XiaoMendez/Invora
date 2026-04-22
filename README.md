<p align="center">
  <img src="public/images/invora-logo.png" alt="Invora Logo" width="300"/>
</p>

<h1 align="center">INVORA</h1>

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
  <a href="#-instalación">Instalación</a> •
  <a href="#-documentación">Documentación</a>
</p>

---

## 📋 Descripción

**Invora** es un sistema de gestión de inventario moderno y escalable, diseñado específicamente para pequeñas y medianas empresas (PYMEs) en Costa Rica. La plataforma permite gestionar productos, controlar movimientos de inventario, generar reportes detallados y recibir alertas de stock bajo, todo desde una interfaz intuitiva y responsiva.

### 🎯 Objetivo del Proyecto

Desarrollar una solución web completa que permita a las PYMEs:
- Digitalizar y automatizar la gestión de su inventario
- Reducir pérdidas por falta de control de stock
- Tomar decisiones informadas basadas en datos reales
- Mejorar la eficiencia operativa del negocio

---

## ✨ Características

| Módulo | Estado | Descripción |
|--------|--------|-------------|
| 🔐 **Autenticación** | ✅ Completo | Registro, login, verificación de email con Supabase Auth |
| 📦 **Productos** | ✅ Completo | CRUD completo con categorías, SKU, precios y stock |
| 📊 **Dashboard** | ✅ Completo | Métricas en tiempo real, gráficos de rendimiento |
| 🔄 **Movimientos** | ✅ Completo | Entradas, salidas, ajustes con historial completo |
| 📈 **Reportes** | ✅ Completo | Análisis por período, exportación CSV |
| 🔔 **Alertas** | 🔄 En Proceso | Notificaciones de stock bajo |
| ⚙️ **Configuración** | ✅ Completo | Perfil de empresa, preferencias |
| 🌐 **Landing Page** | ✅ Completo | Página de presentación con escena 3D |

### Características Técnicas

- **Multi-tenant**: Soporte para múltiples empresas con aislamiento de datos
- **Row Level Security (RLS)**: Seguridad a nivel de fila en PostgreSQL
- **Tiempo Real**: Actualización automática de datos
- **Responsive**: Diseño adaptable a dispositivos móviles
- **Dark Mode**: Interfaz optimizada para tema oscuro

---

## 🛠 Tecnologías

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

### Herramientas de Desarrollo
| Herramienta | Uso |
|-------------|-----|
| pnpm | Gestor de paquetes |
| ESLint | Linting de código |
| Vercel | Despliegue y hosting |
| Git/GitHub | Control de versiones |

---

## 🚀 Instalación

### Prerrequisitos

- Node.js 18+ 
- pnpm (recomendado) o npm
- Cuenta en Supabase
- Git

## 📸 Capturas de Pantalla

### Landing Page
<p align="center">
  <em>Página de inicio con escena 3D interactiva</em>
</p>

### Dashboard
<p align="center">
  <em>Panel de control con métricas en tiempo real</em>
</p>

### Gestión de Productos
<p align="center">
  <em>Interfaz para administrar el catálogo de productos</em>
</p>

### Movimientos de Inventario
<p align="center">
  <em>Registro y seguimiento de entradas/salidas</em>
</p>

---

## 📚 Documentación

| Documento | Descripción |
|-----------|-------------|
| [📐 ARCHITECTURE.md](./docs/ARCHITECTURE.md) | Arquitectura del sistema |
| [🗃️ DATABASE.md](./docs/DATABASE.md) | Diseño de base de datos |
| [🔌 API.md](./docs/API.md) | Documentación de endpoints |
| [🚀 DEPLOYMENT.md](./docs/DEPLOYMENT.md) | Guía de despliegue |
| [🔮 ROADMAP.md](./docs/ROADMAP.md) | Funcionalidades pendientes |
| [🤖 AI_USAGE.md](./docs/AI_USAGE.md) | Uso de IA en el desarrollo |

---

## 👥 Equipo

| Nombre | Rol | Contacto |
|--------|-----|----------|
| Xiao Mendez | Desarrollador Full Stack | xiaomendezli@gmail.com |

---

## 📄 Licencia

Este proyecto fue desarrollado como parte del curso de Desarrollo Web.

---

<p align="center">
  <strong>Invora</strong> - Control total de tu inventario en un solo lugar
</p>

<p align="center">
  <a href="https://invorastock.vercel.app">🌐 Demo en Vivo</a>
</p>
