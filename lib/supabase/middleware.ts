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

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname
  
  // Remove locale prefix from pathname for matching
  // Routes can be /es/dashboard, /en/dashboard, etc.
  const pathWithoutLocale = pathname.replace(/^\/(es|en|pt)/, '') || '/'
  
  const isAuthPage = pathWithoutLocale === '/login' || pathWithoutLocale === '/register'
  const isOnboardingPage = pathWithoutLocale === '/onboarding'
  const isDashboardPage = pathWithoutLocale.startsWith('/dashboard')

  // If not authenticated and trying to access protected routes
  if (!user && (isDashboardPage || isOnboardingPage)) {
    const url = request.nextUrl.clone()
    // Extract locale from original pathname
    const locale = pathname.match(/^\/(es|en|pt)/)?.[1] || 'es'
    url.pathname = `/${locale}/login`
    return NextResponse.redirect(url)
  }

  // If authenticated, check empresa assignment
  if (user) {
    // Check if user has an empresa configured
    const { data: userEmpresa, error } = await supabase
      .from("usuario_empresa")
      .select("id_empresa")
      .eq("id_usuario", user.id)
      .single()

    // If error is NOT_FOUND, user hasn't been assigned to an empresa yet
    const hasEmpresa = !error && !!userEmpresa?.id_empresa

    // If user needs onboarding (no empresa) and trying to access dashboard
    if (!hasEmpresa && isDashboardPage) {
      const url = request.nextUrl.clone()
      const locale = pathname.match(/^\/(es|en|pt)/)?.[1] || 'es'
      url.pathname = `/${locale}/onboarding`
      return NextResponse.redirect(url)
    }

    // If user has empresa and trying to access onboarding, redirect to dashboard
    if (hasEmpresa && isOnboardingPage) {
      const url = request.nextUrl.clone()
      const locale = pathname.match(/^\/(es|en|pt)/)?.[1] || 'es'
      url.pathname = `/${locale}/dashboard`
      return NextResponse.redirect(url)
    }

    // If authenticated and on auth pages, redirect appropriately
    if (isAuthPage) {
      const url = request.nextUrl.clone()
      const locale = pathname.match(/^\/(es|en|pt)/)?.[1] || 'es'
      url.pathname = hasEmpresa ? `/${locale}/dashboard` : `/${locale}/onboarding`
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
