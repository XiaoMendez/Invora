import createMiddleware from 'next-intl/middleware'
import { updateSession } from '@/lib/supabase/middleware'
import { type NextRequest, NextResponse } from 'next/server'

const handleI18nRouting = createMiddleware({
  locales: ['es', 'en', 'pt'],
  defaultLocale: 'es',
  localeCookie: 'NEXT_LOCALE',
})

export async function middleware(request: NextRequest) {
  // Primero aplicar i18n routing
  const i18nResponse = handleI18nRouting(request)

  // Luego actualizar sesión de Supabase
  const supabaseResponse = await updateSession(i18nResponse)

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
