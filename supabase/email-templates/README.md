# Plantillas de Email para Supabase

Esta carpeta contiene las plantillas de correo personalizadas para INVORA.

## Como configurar en Supabase

1. Ve a tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard)
2. Navega a **Authentication** > **Email Templates**
3. Selecciona la plantilla que deseas editar
4. Copia el contenido del archivo HTML correspondiente
5. Pegalo en el editor de plantillas de Supabase
6. Guarda los cambios

## Plantillas disponibles

### `confirm-signup.html`
- **Tipo en Supabase:** Confirm signup
- **Proposito:** Correo de confirmacion de cuenta para nuevos usuarios
- **Variables disponibles:**
  - `{{ .ConfirmationURL }}` - URL de confirmacion (REQUERIDO)
  - `{{ .Email }}` - Correo del usuario
  - `{{ .SiteURL }}` - URL del sitio

## Configuracion del Redirect URL

Para que el flujo funcione correctamente, configura el **Redirect URL** en Supabase:

1. Ve a **Authentication** > **URL Configuration**
2. En **Site URL** pon tu dominio: `https://tu-dominio.com`
3. En **Redirect URLs** agrega:
   - `https://tu-dominio.com/auth/confirm`
   - `https://tu-dominio.com/auth/callback`
   - `http://localhost:3000/auth/confirm` (para desarrollo)
   - `http://localhost:3000/auth/callback` (para desarrollo)

## Flujo de confirmacion

1. Usuario se registra en `/register`
2. Se redirige a `/auth/confirm` (pagina de "revisa tu correo")
3. Usuario recibe correo con boton de confirmacion
4. Al hacer clic, Supabase procesa y redirige a `/auth/callback`
5. El callback verifica el codigo y redirige a `/dashboard`

## Personalizacion

Los colores utilizados siguen la paleta de INVORA:
- Primario: `#8b5cf6` (violeta)
- Secundario: `#ec4899` (magenta)
- Acento: `#a855f7` (purpura claro)
- Fondo: `#0a0a0f` (casi negro)

Puedes modificar estos valores en el HTML para ajustar a tu marca.
