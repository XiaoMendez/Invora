import createMiddleware from 'next-intl/middleware'
import { updateSession } from '@/lib/supabase/middleware'
import { type NextRequest, NextResponse } from 'next/server'

const handleI18nRouting = createMiddleware({
  locales: ['es', 'en', 'pt'],
  defaultLocale: 'es',
  localeCookie: 'NEXT_LOCALE',
})

export async function middleware(request: NextRequest) {
  // Primero actualizar sesión de Supabase
  const supabaseResponse = await updateSession(request)

  // Si Supabase retorna un redirect, usarlo directamente
  if (supabaseResponse.status === 307 || supabaseResponse.status === 308) {
    return supabaseResponse
  }

  // Si no es un redirect, aplicar i18n routing
  let response = handleI18nRouting(request) || NextResponse.next()

  // Copiar cookies de Supabase a la respuesta final
  supabaseResponse.headers.getSetCookie().forEach((cookie) => {
    response.headers.append('set-cookie', cookie)
  })

  return response
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
