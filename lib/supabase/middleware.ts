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
  const isAuthPage = pathname === '/login' || pathname === '/register'
  const isOnboardingPage = pathname === '/onboarding'
  const isDashboardPage = pathname.startsWith('/dashboard')

  // If not authenticated and trying to access protected routes
  if (!user && (isDashboardPage || isOnboardingPage)) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // If authenticated, check empresa assignment
  if (user) {
    // Check if user has an empresa configured
    const { data: userEmpresa } = await supabase
      .from("usuario_empresa")
      .select("id_empresa")
      .eq("id_usuario", user.id)
      .single()

    const hasEmpresa = !!userEmpresa?.id_empresa

    // If user needs onboarding (no empresa) and trying to access dashboard
    if (!hasEmpresa && isDashboardPage) {
      const url = request.nextUrl.clone()
      url.pathname = '/onboarding'
      return NextResponse.redirect(url)
    }

    // If user has empresa and trying to access onboarding, redirect to dashboard
    if (hasEmpresa && isOnboardingPage) {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }

    // If authenticated and on auth pages, redirect appropriately
    if (isAuthPage) {
      const url = request.nextUrl.clone()
      url.pathname = hasEmpresa ? '/dashboard' : '/onboarding'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
