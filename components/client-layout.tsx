'use client'

import { ReactNode } from 'react'
import { DashboardSidebar, DashboardHeader, DashboardSidebarProvider } from '@/components/dashboard/sidebar'

export function ClientLayout({
  children,
  empresa,
}: {
  children: ReactNode
  empresa?: {
    id: string
    nombre: string
    email: string
  }
}) {
  return (
    <DashboardSidebarProvider>
      <div className="min-h-screen bg-background text-foreground">
        {/* Sidebar (includes its own mobile drawer) */}
        <DashboardSidebar />

        {/* Main Content */}
        <div className="flex flex-col md:ml-64 min-w-0">
          <DashboardHeader empresa={empresa} />
          <main className="flex-1 overflow-auto">
            <div className="p-4 md:p-6 lg:p-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </DashboardSidebarProvider>
  )
}
