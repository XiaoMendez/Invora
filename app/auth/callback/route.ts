import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/dashboard"

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Redirect to confirm page with success indicator, then user can go to dashboard
      const confirmUrl = new URL("/auth/confirm", origin)
      confirmUrl.searchParams.set("verified", "true")
      confirmUrl.searchParams.set("next", next)
      return NextResponse.redirect(confirmUrl)
    }
  }

  // Return the user to an error page with some instructions
  return NextResponse.redirect(new URL("/auth/error", request.url))
}
