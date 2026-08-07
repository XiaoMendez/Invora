import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  // IMPORTANT: Do NOT run any DB queries here.
  // The middleware only needs to know if the user is authenticated.
  // DB queries (e.g. usuario_empresa) break on production because:
  //   1. HTTPS changes cookie names to __Secure- prefix
  //   2. RLS policies can silently return null for new accounts
  //   3. It adds latency to every request
  // Onboarding redirect is handled client-side via /api/auth/session.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  // Remove locale prefix from pathname for matching
  const pathWithoutLocale = pathname.replace(/^\/(es|en|pt)/, '') || '/'

  const isAuthPage = pathWithoutLocale === '/login' || pathWithoutLocale === '/register'
  const isOnboardingPage = pathWithoutLocale === '/onboarding'
  const isDashboardPage = pathWithoutLocale.startsWith('/dashboard')

  // If not authenticated and trying to access protected routes → login
  if (!user && (isDashboardPage || isOnboardingPage)) {
    const url = request.nextUrl.clone()
    const locale = pathname.match(/^\/(es|en|pt)/)?.[1] || 'es'
    url.pathname = `/${locale}/login`
    return NextResponse.redirect(url)
  }

  // If authenticated and on auth pages → dashboard
  // (onboarding check is done client-side via /api/auth/session)
  if (user && isAuthPage) {
    const url = request.nextUrl.clone()
    const locale = pathname.match(/^\/(es|en|pt)/)?.[1] || 'es'
    url.pathname = `/${locale}/dashboard`
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
