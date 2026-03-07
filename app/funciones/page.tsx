import { StaticPageLayout } from "@/components/static-page-layout"
import { Package, BarChart3, Bell, QrCode, Shield, Users } from "lucide-react"

export const metadata = {
  title: "Funciones - INVORA",
  description: "Descubre todas las funciones y herramientas que INVORA ofrece para tu negocio.",
}

const features = [
  {
    icon: Package,
    title: "Control Total del Inventario",
    description:
      "Registra productos, categorias y proveedores. Mantiene un seguimiento preciso del stock con entradas, salidas y ajustes automaticos.",
  },
  {
    icon: BarChart3,
    title: "Reportes Avanzados",
    description:
      "Visualiza el estado de tu inventario con graficos interactivos, tendencias mensuales y distribucion por categorias.",
  },
  {
    icon: Bell,
    title: "Alertas de Stock Bajo",
    description:
      "Recibe notificaciones automaticas cuando un producto alcance su nivel minimo de stock para que nunca te quedes sin existencias.",
  },
  {
    icon: QrCode,
    title: "Escaneo de Codigos",
    description:
      "Agiliza la entrada y salida de productos escaneando codigos de barra o QR directamente desde la aplicacion.",
  },
  {
    icon: Shield,
    title: "Seguridad Empresarial",
    description:
      "Tus datos estan protegidos con encriptacion de nivel empresarial, autenticacion segura y copias de seguridad automaticas.",
  },
  {
    icon: Users,
    title: "Gestion de Proveedores",
    description:
      "Administra tus proveedores, compara precios de compra y mantiene un historial completo de cada pedido.",
  },
]

export default function FuncionesPage() {
  return (
    <StaticPageLayout 
      title="Funciones y Herramientas"
      subtitle="INVORA ofrece todo lo que tu PYME necesita para gestionar el inventario de forma eficiente y sin complicaciones."
    >

      <div className="grid md:grid-cols-2 gap-8">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="glass-card rounded-xl p-6 flex flex-col gap-4"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <feature.icon className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">
              {feature.title}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </StaticPageLayout>
  )
}
