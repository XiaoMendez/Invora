# 🚀 Guía de Despliegue

<p align="center">
  <img src="https://img.shields.io/badge/Deploy-Vercel-black?style=for-the-badge&logo=vercel" alt="Vercel"/>
  <img src="https://img.shields.io/badge/Database-Supabase-3ECF8E?style=for-the-badge&logo=supabase" alt="Supabase"/>
</p>

---

## 📋 Requisitos Previos

### Software Necesario
- [Node.js](https://nodejs.org/) 18+ LTS
- [pnpm](https://pnpm.io/) (recomendado) o npm
- [Git](https://git-scm.com/)
- Cuenta en [Supabase](https://supabase.com/)
- Cuenta en [Vercel](https://vercel.com/) (opcional para deploy)

### Verificar Instalación
```bash
node --version    # v18.0.0 o superior
pnpm --version    # 8.0.0 o superior
git --version     # 2.0.0 o superior
```

---

## 🛠️ Instalación Local

### 1. Clonar el Repositorio

```bash
git clone https://github.com/XiaoMendez/Invora.git
cd Invora
```

### 2. Instalar Dependencias

```bash
# Con pnpm (recomendado)
pnpm install

# O con npm
npm install
```

### 3. Configurar Supabase

#### 3.1. Crear Proyecto en Supabase
1. Ve a [app.supabase.com](https://app.supabase.com)
2. Crea un nuevo proyecto
3. Espera a que se inicialice (~2 minutos)

#### 3.2. Ejecutar Migraciones
En el **SQL Editor** de Supabase, ejecutar en orden:

```sql
-- Primero: Crear esquema
-- Copiar contenido de: scripts/001_create_schema.sql

-- Segundo: Agregar políticas RLS
-- Copiar contenido de: scripts/002_add_rls_policies.sql
```

#### 3.3. Configurar Autenticación
1. En Supabase, ve a **Authentication > URL Configuration**
2. Configura:
   - Site URL: `http://localhost:3000`
   - Redirect URLs: `http://localhost:3000/auth/callback`

### 4. Configurar Variables de Entorno

```bash
# Copiar archivo de ejemplo
cp .env.example .env.local
```

Editar `.env.local` con tus valores:

```env
# Supabase (obtener de Project Settings > API)
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key

# Sitio
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 5. Iniciar Servidor de Desarrollo

```bash
pnpm dev
```

La aplicación estará disponible en: `http://localhost:3000`

---

## 🌐 Despliegue en Vercel

### Método 1: Deploy desde GitHub

1. **Conectar Repositorio**
   - Ve a [vercel.com/new](https://vercel.com/new)
   - Importa tu repositorio de GitHub

2. **Configurar Variables de Entorno**
   En Vercel Dashboard > Settings > Environment Variables:
   
   | Variable | Valor |
   |----------|-------|
   | `NEXT_PUBLIC_SUPABASE_URL` | Tu URL de Supabase |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Tu Anon Key |
   | `SUPABASE_SERVICE_ROLE_KEY` | Tu Service Role Key |
   | `NEXT_PUBLIC_SITE_URL` | URL de tu app en Vercel |

3. **Deploy**
   - Vercel detectará automáticamente Next.js
   - Click en "Deploy"

### Método 2: Deploy desde CLI

```bash
# Instalar Vercel CLI
pnpm add -g vercel

# Login
vercel login

# Deploy
vercel
```

---

## 🔧 Configuración de Producción

### Supabase - URLs de Redirección

Actualizar en Supabase Dashboard > Authentication > URL Configuration:

```
Site URL: https://invorastock.vercel.app
Redirect URLs:
  - https://invorastock.vercel.app/auth/callback
  - https://invorastock.vercel.app/auth/confirm
```

### Variables de Entorno de Producción

```env
NEXT_PUBLIC_SITE_URL=https://invorastock.vercel.app
```

---

## 🐳 Docker (Opcional)

### Dockerfile

```dockerfile
FROM node:18-alpine AS base

# Instalar dependencias
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable pnpm && pnpm install --frozen-lockfile

# Builder
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN corepack enable pnpm && pnpm build

# Runner
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
```

### Docker Compose

```yaml
version: '3.8'
services:
  web:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
      - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
```

### Ejecutar con Docker

```bash
# Construir imagen
docker build -t invora .

# Ejecutar contenedor
docker run -p 3000:3000 --env-file .env.local invora

# O con Docker Compose
docker-compose up -d
```

---

## ✅ Lista de Verificación Pre-Despliegue

- [ ] Variables de entorno configuradas
- [ ] Migraciones de base de datos ejecutadas
- [ ] URLs de redirección configuradas en Supabase
- [ ] Políticas RLS habilitadas
- [ ] Pruebas de autenticación funcionando
- [ ] Build de producción sin errores (`pnpm build`)

---

## 🔍 Troubleshooting

### Error: "Invalid API key"
- Verifica que `NEXT_PUBLIC_SUPABASE_ANON_KEY` sea correcto
- Asegúrate de que no haya espacios extra

### Error: "Row Level Security policy violation"
- Ejecuta `scripts/002_add_rls_policies.sql` en Supabase
- Verifica que las funciones helper existan

### Error: "Email confirmation required"
- En Supabase: Authentication > Providers > Email
- Deshabilita "Confirm email" para desarrollo local

### Build falla en Vercel
- Revisa que todas las variables de entorno estén configuradas
- Verifica el log de build para errores específicos

---

## 📊 Monitoreo

### Vercel Analytics
- Habilitado automáticamente con `@vercel/analytics`
- Ver métricas en Vercel Dashboard > Analytics

### Logs
```bash
# Ver logs en Vercel
vercel logs

# Ver logs en tiempo real
vercel logs --follow
```

---

## 🔄 CI/CD

El proyecto usa GitHub Actions para CI/CD automático:

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm build
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```
