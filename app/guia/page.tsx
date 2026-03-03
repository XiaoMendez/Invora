import { StaticPageLayout } from "@/components/static-page-layout"

const steps = [
  {
    number: "01",
    title: "Crea tu cuenta",
    description:
      "Registra tu empresa en INVORA con solo tu nombre, correo y una contrasena. El proceso toma menos de un minuto.",
  },
  {
    number: "02",
    title: "Configura tus categorias",
    description:
      "Organiza tu inventario creando categorias personalizadas. INVORA incluye categorias predeterminadas como Alimentos, Bebidas y Limpieza para que empieces rapido.",
  },
  {
    number: "03",
    title: "Agrega tus productos",
    description:
      "Registra cada producto con su nombre, SKU, precio de costo, precio de venta y stock minimo. Asigna categorias y proveedores para un control completo.",
  },
  {
    number: "04",
    title: "Registra movimientos",
    description:
      "Cada vez que ingrese o salga mercaderia, registra el movimiento. INVORA actualizara el stock automaticamente y te alertara si un producto esta por debajo del minimo.",
  },
  {
    number: "05",
    title: "Revisa tus reportes",
    description:
      "Accede al dashboard para ver el resumen de tu inventario: valor total, productos con stock bajo, tendencias mensuales y distribucion por categorias.",
  },
]

export default function GuiaPage() {
  return (
    <StaticPageLayout title="Guia de Inicio Rapido">
      <p className="text-lg mb-12">
        Sigue estos pasos para comenzar a gestionar tu inventario con INVORA de
        forma rapida y sencilla.
      </p>

      <div className="flex flex-col gap-8">
        {steps.map((step) => (
          <div
            key={step.number}
            className="glass-card rounded-xl p-6 flex items-start gap-6"
          >
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-lg">
              {step.number}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {step.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </StaticPageLayout>
  )
}
