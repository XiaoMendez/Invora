"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import useSWR from "swr"
import { ThemeLogo } from "@/components/theme-logo"
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
  Truck,
  Users,
  TrendingUp,
  FileText,
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
import { createClient } from "@/lib/supabase/client"
import { SettingsDialog } from "@/components/SettingsDialog"
import { useTranslation } from "@/hooks/useTranslation"
import { usePreferences } from "@/contexts/PreferencesContext"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function DashboardSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const { t } = useTranslation()
  const { preferences } = usePreferences()
  const locale = preferences.locale
  const { data: alertasData } = useSWR("/api/alertas", fetcher, { refreshInterval: 60000 })
  const alertCount: number = alertasData?.alertas?.length ?? 0

  const sidebarLinks = [
    { labelKey: "sidebar.dashboard", href: `/${locale}/dashboard`, icon: LayoutDashboard },
    { labelKey: "sidebar.products", href: `/${locale}/dashboard/productos`, icon: Package },
    { labelKey: "sidebar.purchaseOrders", href: `/${locale}/dashboard/ordenes-compra`, icon: FileText },
    { labelKey: "sidebar.salesOrders", href: `/${locale}/dashboard/ordenes-venta`, icon: TrendingUp },
    { labelKey: "sidebar.suppliers", href: `/${locale}/dashboard/proveedores`, icon: Truck },
    { labelKey: "sidebar.customers", href: `/${locale}/dashboard/clientes`, icon: Users },
    { labelKey: "sidebar.movements", href: `/${locale}/dashboard/movimientos`, icon: ArrowLeftRight },
    { labelKey: "sidebar.reports", href: `/${locale}/dashboard/reportes`, icon: BarChart3 },
    { labelKey: "sidebar.alerts", href: `/${locale}/dashboard/alertas`, icon: Bell, showAlertBadge: true },
    { labelKey: "sidebar.settings", href: `/${locale}/dashboard/configuracion`, icon: Settings },
  ]

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.refresh()
    router.push(`/${locale}/login`)
  }

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "fixed left-0 top-0 bottom-0 z-40 flex flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300",
          "hidden md:flex",
          collapsed ? "w-16" : "w-64"
        )}
      >
        {/* Logo Area */}
        <div className="flex items-center justify-between px-4 h-20 border-b border-sidebar-border">
          {!collapsed && (
            <Link href={`/${locale}`} className="flex items-center">
              <ThemeLogo
                width={280}
                height={94}
                alt="INVORA"
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
            aria-label={collapsed ? t("sidebar.expand") : t("sidebar.collapse")}
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
              const isActive = pathname === link.href || pathname.startsWith(link.href + "/")
              const label = t(link.labelKey)
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
                            <span className="flex-1">{label}</span>
                            {link.showAlertBadge && alertCount > 0 && (
                              <Badge
                                variant="secondary"
                                className="bg-primary/20 text-primary text-[10px] h-5 min-w-5 flex items-center justify-center"
                              >
                                {alertCount}
                              </Badge>
                            )}
                          </>
                        )}
                      </Link>
                    </TooltipTrigger>
                    {collapsed && (
                      <TooltipContent side="right" className="bg-popover text-popover-foreground">
                        {label}
                        {link.showAlertBadge && alertCount > 0 && ` (${alertCount})`}
                      </TooltipContent>
                    )}
                  </Tooltip>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* User Section */}
        <div className="border-t border-sidebar-border p-3 space-y-2">
          <div className="flex items-center justify-center">
            <SettingsDialog inline />
          </div>
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
                {!collapsed && <span>{t("sidebar.logout")}</span>}
              </button>
            </TooltipTrigger>
            {collapsed && (
              <TooltipContent side="right" className="bg-popover text-popover-foreground">
                {t("sidebar.logout")}
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
  const { t } = useTranslation()
  const { preferences } = usePreferences()
  const locale = preferences.locale

  const initials = empresa?.nombre
    ? empresa.nombre.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "IN"

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border/30 glass px-6">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("header.searchPlaceholder")}
            className="pl-9 bg-secondary/50 border-border/30 text-sm h-9"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Link href={`/${locale}/dashboard/productos`}>
          <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 h-9 gap-2">
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{t("header.newProduct")}</span>
          </Button>
        </Link>

        <Link href={`/${locale}/dashboard/alertas`}>
          <button className="relative flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors">
            <Bell className="h-4 w-4" />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary" />
            <span className="sr-only">{t("header.notifications")}</span>
          </button>
        </Link>

        <div className="flex items-center gap-2 rounded-lg bg-secondary/30 px-3 py-1.5">
          <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium text-primary">
            {initials}
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-medium text-foreground">{empresa?.nombre || t("header.myCompany")}</p>
            <p className="text-[10px] text-muted-foreground">{empresa?.email || ""}</p>
          </div>
        </div>
      </div>
    </header>
  )
}
