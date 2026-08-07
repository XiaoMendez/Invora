"use client"

import useSWR from "swr"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { DashboardSidebar, DashboardHeader, DashboardSidebarProvider } from "@/components/dashboard/sidebar"
import { StarsBackground } from "@/components/space-scene"
import { Loader2 } from "lucide-react"
import { useTranslation } from "@/hooks/useTranslation"
import { usePreferences } from "@/contexts/PreferencesContext"

const fetcher = async (url: string) => {
  const res = await fetch(url)
  const text = await res.text()
  try {
    return JSON.parse(text)
  } catch {
    console.error("[v0] Non-JSON response from", url, ":", text.slice(0, 200))
    return { authenticated: false }
  }
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { t } = useTranslation()
  const { preferences } = usePreferences()
  const locale = preferences.locale
  const { data: session, isLoading } = useSWR("/api/auth/session", fetcher)

  useEffect(() => {
    if (!isLoading) {
      if (!session?.authenticated) {
        router.push(`/${locale}/login`)
      } else if (session?.needsOnboarding) {
        router.push(`/${locale}/onboarding`)
      }
    }
  }, [session, isLoading, router, locale])

  if (isLoading) {
    return (
      <div className="relative min-h-screen flex items-center justify-center">
        <StarsBackground />
        <div className="flex flex-col items-center gap-3 z-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
        </div>
      </div>
    )
  }

  if (!session?.authenticated || session?.needsOnboarding) {
    return null
  }

  return (
    <DashboardSidebarProvider>
      <div className="relative min-h-screen bg-background">
        <StarsBackground />
        <DashboardSidebar />
        <div className="md:pl-64 transition-all duration-300 min-w-0">
          <DashboardHeader empresa={session.empresa} />
          <main className="p-3 md:p-6 min-h-screen w-full max-w-full overflow-x-hidden">{children}</main>
        </div>
      </div>
    </DashboardSidebarProvider>
  )
}
