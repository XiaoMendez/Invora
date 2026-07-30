'use client'

import { ReactNode, useState, useEffect } from 'react'
import { DashboardSidebar, DashboardHeader } from '@/components/dashboard/sidebar'
import { Menu, X } from 'lucide-react'

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Sidebar */}
      <DashboardSidebar />

      {/* Mobile Menu Button */}
      {isMobile && (
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="fixed top-4 left-4 z-50 md:hidden p-2 rounded-lg hover:bg-secondary/50"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      )}

      {/* Main Content */}
      <div className="flex flex-col md:ml-64">
        <DashboardHeader empresa={empresa} />
        <main className="flex-1 overflow-auto">
          <div className="p-4 md:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
