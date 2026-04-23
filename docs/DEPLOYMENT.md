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
- Cuenta en [Supabase](https://supabase.com/) - Gratis
- Cuenta en [Vercel](https://vercel.com/) - Gratis

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
2. Clic en "New project"
3. Configura:
   - **Name**: invora
   - **Database Password**: Genera una contraseña segura
   - **Region**: America/Costa Rica (o la más cercana)
4. Espera a que se inicialice (~2 minutos)

#### 3.2. Ejecutar Migraciones
En el **SQL Editor** de Supabase, ejecutar en orden:

```sql
-- 1. Crear esquema completo
-- Copiar y ejecutar contenido de: scripts/001_create_schema.sql

-- 2. Agregar políticas RLS
-- Copiar y ejecutar contenido de: scripts/002_add_rls_policies.sql
```

#### 3.3. Configurar URLs de Redirección
1. En Supabase, ve a **Authentication > URL Configuration**
2. Configura:
   - **Site URL**: `http://localhost:3000`
   - **Redirect URLs**: 
     ```
     http://localhost:3000/auth/callback
     http://localhost:3000/auth/confirm
     ```

### 4. Configurar Variables de Entorno

```bash
# Copiar archivo de ejemplo
cp .env.example .env.local
```

Editar `.env.local` con tus valores de Supabase:

```env
# Supabase - Obtener de Project Settings > API
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Sitio
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**Donde obtener las claves:**
- Supabase Dashboard → Project Settings → API
- Visible en la sección "Project API keys"

### 5. Iniciar Servidor de Desarrollo

```bash
pnpm dev
```

La aplicación estará disponible en: `http://localhost:3000`

---

## 🌐 Despliegue en Vercel

### Método 1: Deploy automático desde GitHub (Recomendado)

#### Paso 1: Conectar Repositorio
1. Ve a [vercel.com/new](https://vercel.com/new)
2. Clic en "Import Git Repository"
3. Selecciona tu repositorio GitHub de Invora
4. Vercel detectará automáticamente Next.js

#### Paso 2: Configurar Variables de Entorno
En el formulario de importación o en Vercel Dashboard:

| Variable | Valor | Dónde obtenerlo |
|----------|-------|-----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://tu-proyecto.supabase.co` | Supabase Settings > API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Tu Anon Key | Supabase Settings > API |
| `SUPABASE_SERVICE_ROLE_KEY` | Tu Service Role Key | Supabase Settings > API |
| `NEXT_PUBLIC_SITE_URL` | Tu URL en Vercel | Vercel asigna automáticamente |

#### Paso 3: Deploy
1. Clic en "Deploy"
2. Vercel construirá y desplegará automáticamente
3. Tu sitio estará disponible en `https://[tu-proyecto].vercel.app`

### Método 2: Deploy manual con CLI

```bash
# Instalar Vercel CLI globalmente
npm install -g vercel

# Autenticarse
vercel login

# Deploy
vercel

# Deploy a producción
vercel --prod
```

---

## 🔧 Configuración de Producción

### 1. Actualizar URLs en Supabase

En Supabase Dashboard > Authentication > URL Configuration:

```
Site URL: https://tu-proyecto.vercel.app

Redirect URLs:
  - https://tu-proyecto.vercel.app/auth/callback
  - https://tu-proyecto.vercel.app/auth/confirm
```

### 2. Variables de Entorno en Vercel

**Vercel Dashboard → Settings → Environment Variables**

Configurar para los 3 ambientes:
- **Production**
- **Preview** (Branch preview deployments)
- **Development**

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
NEXT_PUBLIC_SITE_URL=https://tu-proyecto.vercel.app
```

### 3. Configurar Dominio Personalizado (Opcional)

En Vercel Dashboard → Settings → Domains:
1. Agrega tu dominio personalizado
2. Sigue las instrucciones para configurar DNS
3. Vercel emite certificado SSL automáticamente

---

## 🐳 Despliegue con Docker

### Dockerfile

```dockerfile
FROM node:18-alpine AS base
WORKDIR /app

# Instalar dependencias
FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN corepack enable pnpm && pnpm install --frozen-lockfile

# Construir aplicación
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN corepack enable pnpm && pnpm build

# Ejecutar
FROM base AS runner
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
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
      - NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}
    restart: unless-stopped
```

### Ejecutar con Docker

```bash
# Construir imagen
docker build -t invora .

# Ejecutar contenedor
docker run -p 3000:3000 --env-file .env.local invora

# O con Docker Compose
docker-compose up -d

# Ver logs
docker logs -f invora

# Detener contenedor
docker-compose down
```

---

## ✅ Lista de Verificación Pre-Despliegue

- [ ] Variables de entorno configuradas en Vercel
- [ ] Migraciones de BD ejecutadas en Supabase
- [ ] URLs de redirección configuradas en Supabase Auth
- [ ] RLS habilitado en todas las tablas
- [ ] Prueba de login funcionando
- [ ] Build de producción sin errores (`pnpm build`)
- [ ] Prueba de endpoints API en staging
- [ ] Base de datos con backups automáticos habilitados
- [ ] Dominio personalizado configurado (si aplica)
- [ ] Certificado SSL activo

---

## 🔍 Troubleshooting

### Error: "Invalid API key"
```
✗ Verifica en Supabase Dashboard > Settings > API
✗ Asegúrate que no haya espacios extra en las claves
✗ Copia el valor completo sin comillas
```

### Error: "Row Level Security policy violation"
```
✓ Ejecuta scripts/002_add_rls_policies.sql en Supabase SQL Editor
✓ Verifica que las funciones helper existan
✓ Asegúrate que el usuario esté autenticado
```

### Error: "Email confirmation required"
Para desarrollo local desactiva confirmación de email:
1. Supabase Dashboard → Authentication → Providers → Email
2. Deshabilita "Confirm email" (solo development)

### Build falla en Vercel
```
✓ Revisa que TODAS las variables estén configuradas
✓ Verifica el Build Log en Vercel Dashboard
✓ Asegúrate que Next.js versión es correcta
```

### Sitio lento en producción
```
✓ Habilita Vercel Edge Caching
✓ Optimiza imágenes con next/image
✓ Revisa métricas en Vercel Analytics
```

---

## 📊 Monitoreo en Producción

### Vercel Analytics
- Habilitado automáticamente con `@vercel/analytics`
- Vercel Dashboard → Analytics

### Logs en tiempo real
```bash
# Ver últimos logs
vercel logs

# Ver logs en tiempo real
vercel logs --follow

# Filtrar por nivel
vercel logs --level=error
```

### Supabase Monitoring
1. Supabase Dashboard → Logs
2. Ver queries lentas y errores
3. Configurar alertas de uptime

---

## 🔄 CI/CD Automático

El proyecto incluye GitHub Actions (`.github/workflows/deploy.yml`):

```yaml
name: Deploy a Producción
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: pnpm install
      - run: pnpm build
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

Configurar en GitHub:
1. Settings → Secrets and variables → Actions
2. Agregar `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`

---

## 📞 Soporte

- Vercel Docs: https://vercel.com/docs
- Supabase Docs: https://supabase.com/docs
- Next.js Docs: https://nextjs.org/docs

