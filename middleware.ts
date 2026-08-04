import { updateSession } from '@/lib/supabase/middleware'
import { type NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const locales = ['es', 'en', 'pt']
  
  // Check if locale is present in the pathname
  const hasLocale = locales.some(locale => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`)
  
  // If no locale, add default locale 'es'
  if (!hasLocale && pathname !== '/' && !pathname.startsWith('/_next')) {
    const url = request.nextUrl.clone()
    url.pathname = `/es${pathname}`
    return NextResponse.redirect(url)
  }
  
  // Handle root path without locale
  if (pathname === '/') {
    const url = request.nextUrl.clone()
    url.pathname = '/es'
    return NextResponse.redirect(url)
  }

  // Update Supabase session
  const supabaseResponse = await updateSession(request)

  // If Supabase returns a redirect, use it
  if (supabaseResponse.status === 307 || supabaseResponse.status === 308) {
    return supabaseResponse
  }

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
