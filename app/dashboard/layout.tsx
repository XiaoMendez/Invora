"use client"

import { DashboardSidebar, DashboardHeader } from "@/components/dashboard/sidebar"
import { StarsBackground } from "@/components/space-scene"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative min-h-screen">
      <StarsBackground />
      <DashboardSidebar />
      <div className="pl-64 transition-all duration-300">
        <DashboardHeader />
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}
