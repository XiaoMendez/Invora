"use client"

import { createContext, useContext, useState } from "react"
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
  Menu,
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { createClient } from "@/lib/supabase/client"
import { SettingsDialog } from "@/components/SettingsDialog"
import { useTranslation } from "@/hooks/useTranslation"
import { usePreferences } from "@/contexts/PreferencesContext"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

/* ------------------------------------------------------------------ */
/* Shared context so the header's hamburger button can open the       */
/* sidebar's mobile drawer even though they're rendered as siblings.  */
/* ------------------------------------------------------------------ */
const MobileSidebarContext = createContext<{
  open: boolean
  setOpen: (open: boolean) => void
} | null>(null)

export function DashboardSidebarProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <MobileSidebarContext.Provider value={{ open, setOpen }}>
      {children}
    </MobileSidebarContext.Provider>
  )
}

function useMobileSidebar() {
  const ctx = useContext(MobileSidebarContext)
  if (!ctx) {
    throw new Error("useMobileSidebar must be used within DashboardSidebarProvider")
  }
  return ctx
}

function useSidebarLinks() {
  const { preferences } = usePreferences()
  const locale = preferences.locale
  return [
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
}

/* Nav list shared by the desktop rail and the mobile drawer. */
function SidebarNavList({
  collapsed,
  onNavigate,
}: {
  collapsed: boolean
  onNavigate?: () => void
}) {
  const pathname = usePathname()
  const { t } = useTranslation()
  const { data: alertasData } = useSWR("/api/alertas", fetcher, { refreshInterval: 60000 })
  const alertCount: number = alertasData?.alertas?.length ?? 0
  const sidebarLinks = useSidebarLinks()

  return (
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
                  onClick={onNavigate}
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
  )
}

export function DashboardSidebar() {
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const { t } = useTranslation()
  const { preferences } = usePreferences()
  const locale = preferences.locale
  const { open, setOpen } = useMobileSidebar()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.refresh()
    router.push(`/${locale}/login`)
  }

  return (
    <TooltipProvider delayDuration={0}>
      {/* Desktop rail */}
      <aside
        className={cn(
          "fixed left-0 top-0 bottom-0 z-40 flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300",
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
          <SidebarNavList collapsed={collapsed} />
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

      {/* Mobile drawer */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-72 flex flex-col p-0 bg-sidebar border-sidebar-border">
          <SheetHeader className="px-4 h-20 flex-row items-center justify-start border-b border-sidebar-border space-y-0">
            <SheetTitle asChild>
              <Link href={`/${locale}`} className="flex items-center" onClick={() => setOpen(false)}>
                <ThemeLogo width={280} height={94} alt="INVORA" className="h-10 w-auto" />
              </Link>
            </SheetTitle>
          </SheetHeader>

          <nav className="flex-1 overflow-y-auto py-4 px-2">
            <SidebarNavList collapsed={false} onNavigate={() => setOpen(false)} />
          </nav>

          <div className="border-t border-sidebar-border p-3 space-y-2">
            <div className="flex items-center justify-center">
              <SettingsDialog inline />
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/50 transition-colors w-full"
            >
              <LogOut className="h-4 w-4 flex-shrink-0" />
              <span>{t("sidebar.logout")}</span>
            </button>
          </div>
        </SheetContent>
      </Sheet>
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
  const { setOpen } = useMobileSidebar()
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)

  const initials = empresa?.nombre
    ? empresa.nombre.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "IN"

  return (
    <header className="sticky top-0 z-30 flex flex-col border-b border-border/30 glass">
      <div className="flex h-16 items-center justify-between gap-2 px-3 md:px-6">
        <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
          <button
            onClick={() => setOpen(true)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors md:hidden"
            aria-label={t("sidebar.expand")}
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="relative max-w-md flex-1 hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("header.searchPlaceholder")}
              className="pl-9 bg-secondary/50 border-border/30 text-sm h-9"
            />
          </div>

          <button
            onClick={() => setMobileSearchOpen((v) => !v)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors sm:hidden"
            aria-label={t("header.searchPlaceholder")}
          >
            <Search className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center gap-2 md:gap-3 shrink-0">
          <Link href={`/${locale}/dashboard/productos`}>
            <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 h-9 gap-2 px-2.5 md:px-3">
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

          <div className="flex items-center gap-2 rounded-lg bg-secondary/30 px-2 py-1.5 md:px-3">
            <div className="h-7 w-7 shrink-0 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium text-primary">
              {initials}
            </div>
            <div className="hidden sm:block min-w-0">
              <p className="text-xs font-medium text-foreground truncate max-w-[140px]">{empresa?.nombre || t("header.myCompany")}</p>
              <p className="text-[10px] text-muted-foreground truncate max-w-[140px]">{empresa?.email || ""}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile search row */}
      {mobileSearchOpen && (
        <div className="px-3 pb-3 sm:hidden">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              autoFocus
              placeholder={t("header.searchPlaceholder")}
              className="pl-9 bg-secondary/50 border-border/30 text-sm h-9"
            />
          </div>
        </div>
      )}
    </header>
  )
}
