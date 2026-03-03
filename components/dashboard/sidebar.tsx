"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import Image from "next/image"
import {
  LayoutDashboard,
  Package,
  BarChart3,
  ArrowLeftRight,
  Bell,
  Settings,
  ChevronLeft,
  LogOut,
  Search,
  Plus,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const sidebarLinks = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Productos", href: "/dashboard/productos", icon: Package },
  { label: "Movimientos", href: "/dashboard/movimientos", icon: ArrowLeftRight },
  { label: "Reportes", href: "/dashboard/reportes", icon: BarChart3 },
  { label: "Alertas", href: "/dashboard/alertas", icon: Bell, badge: 3 },
  { label: "Configuracion", href: "/dashboard/configuracion", icon: Settings },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/login")
  }

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "fixed left-0 top-0 bottom-0 z-40 flex flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300",
          collapsed ? "w-16" : "w-64"
        )}
      >
        {/* Logo Area */}
        <div className="flex items-center justify-between px-4 h-16 border-b border-sidebar-border">
          {!collapsed && (
            <Link href="/" className="flex items-center">
              <Image
                src="/images/invora-logo.png"
                alt="INVORA"
                width={160}
                height={53}
                className="h-10 w-auto"
              />
            </Link>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors",
              collapsed && "mx-auto"
            )}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <ChevronLeft
              className={cn(
                "h-4 w-4 transition-transform duration-300",
                collapsed && "rotate-180"
              )}
            />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-2">
          <ul className="flex flex-col gap-1">
            {sidebarLinks.map((link) => {
              const isActive = pathname === link.href
              return (
                <li key={link.href}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        href={link.href}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-200",
                          isActive
                            ? "bg-sidebar-accent text-sidebar-primary-foreground font-medium"
                            : "text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/50",
                          collapsed && "justify-center px-2"
                        )}
                      >
                        <link.icon
                          className={cn(
                            "h-4 w-4 flex-shrink-0",
                            isActive && "text-sidebar-primary"
                          )}
                        />
                        {!collapsed && (
                          <>
                            <span className="flex-1">{link.label}</span>
                            {link.badge && (
                              <Badge
                                variant="secondary"
                                className="bg-primary/20 text-primary text-[10px] h-5 min-w-5 flex items-center justify-center"
                              >
                                {link.badge}
                              </Badge>
                            )}
                          </>
                        )}
                      </Link>
                    </TooltipTrigger>
                    {collapsed && (
                      <TooltipContent side="right" className="bg-popover text-popover-foreground">
                        {link.label}
                        {link.badge && ` (${link.badge})`}
                      </TooltipContent>
                    )}
                  </Tooltip>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* User Section */}
        <div className="border-t border-sidebar-border p-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleLogout}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/50 transition-colors w-full",
                  collapsed && "justify-center px-2"
                )}
              >
                <LogOut className="h-4 w-4 flex-shrink-0" />
                {!collapsed && <span>Cerrar Sesion</span>}
              </button>
            </TooltipTrigger>
            {collapsed && (
              <TooltipContent side="right" className="bg-popover text-popover-foreground">
                Cerrar Sesion
              </TooltipContent>
            )}
          </Tooltip>
        </div>
      </aside>
    </TooltipProvider>
  )
}

interface EmpresaData {
  id: string
  nombre: string
  email: string
}

export function DashboardHeader({ empresa }: { empresa?: EmpresaData }) {
  const initials = empresa?.nombre
    ? empresa.nombre
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "IN"
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border/30 glass px-6">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar productos, categorias..."
            className="pl-9 bg-secondary/50 border-border/30 text-sm h-9"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Link href="/dashboard/productos">
          <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 h-9 gap-2">
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Nuevo Producto</span>
          </Button>
        </Link>

        <Link href="/dashboard/alertas">
          <button className="relative flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors">
            <Bell className="h-4 w-4" />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary" />
            <span className="sr-only">Notificaciones</span>
          </button>
        </Link>

        <div className="flex items-center gap-2 rounded-lg bg-secondary/30 px-3 py-1.5">
          <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium text-primary">
            {initials}
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-medium text-foreground">{empresa?.nombre || "Mi Empresa"}</p>
            <p className="text-[10px] text-muted-foreground">{empresa?.email || ""}</p>
          </div>
        </div>
      </div>
    </header>
  )
}
