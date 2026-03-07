"use client"

import useSWR from "swr"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { DashboardSidebar, DashboardHeader } from "@/components/dashboard/sidebar"
import { StarsBackground } from "@/components/space-scene"
import { Loader2 } from "lucide-react"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { data: session, isLoading } = useSWR("/api/auth/session", fetcher)

  useEffect(() => {
    if (!isLoading && !session?.authenticated) {
      router.push("/login")
    }
  }, [session, isLoading, router])

  if (isLoading) {
    return (
      <div className="relative min-h-screen flex items-center justify-center">
        <StarsBackground />
        <div className="flex flex-col items-center gap-3 z-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!session?.authenticated) {
    return null
  }

  return (
    <div className="relative min-h-screen bg-background">
      <StarsBackground />
      <DashboardSidebar />
      <div className="pl-64 transition-all duration-300">
        <DashboardHeader empresa={session?.empresa || { nombre: "Mi Empresa", email: session?.user?.email }} />
        <main className="p-6 min-h-screen">{children}</main>
      </div>
    </div>
  )
}
