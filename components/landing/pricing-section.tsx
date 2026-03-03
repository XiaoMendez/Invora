"use client"

import { motion } from "framer-motion"
import { Check } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

const plans = [
  {
    name: "Starter",
    price: "4,900",
    period: "/mes",
    description: "Perfecto para comenzar a organizar tu inventario.",
    features: [
      "Hasta 100 productos",
      "1 usuario",
      "Reportes basicos",
      "Soporte por email",
    ],
    cta: "Comenzar Ahora",
    highlighted: false,
  },
  {
    name: "Profesional",
    price: "14,900",
    period: "/mes",
    description: "Para PYMEs que necesitan control total.",
    features: [
      "Productos ilimitados",
      "Hasta 5 usuarios",
      "Reportes avanzados",
      "Alertas inteligentes",
      "Escaneo de codigos",
      "Soporte prioritario",
    ],
    cta: "Elegir Profesional",
    highlighted: true,
  },
  {
    name: "Empresa",
    price: "29,900",
    period: "/mes",
    description: "Solucion completa para equipos grandes.",
    features: [
      "Todo de Profesional",
      "Usuarios ilimitados",
      "API personalizada",
      "Integraciones avanzadas",
      "Gestor de cuenta dedicado",
      "SLA garantizado",
    ],
    cta: "Contactar",
    highlighted: false,
  },
]

export function PricingSection() {
  return (
    <section id="pricing" className="relative py-32">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-xs uppercase tracking-widest text-primary mb-3">
            Precios
          </p>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground text-balance">
            Planes que <span className="text-primary">crecen</span> con tu negocio
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-muted-foreground text-pretty leading-relaxed">
            Precios en colones costarricenses. Sin costos ocultos, sin compromisos.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 items-start">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className={`relative rounded-xl p-6 flex flex-col ${
                plan.highlighted
                  ? "glass-card border-primary/40 scale-105 shadow-[0_0_60px_oklch(0.72_0.19_310_/_0.1)]"
                  : "glass-card"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-medium text-primary-foreground">
                  Mas Popular
                </div>
              )}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-foreground">{plan.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
              </div>
              <div className="mb-6">
                <span className="text-3xl font-bold text-foreground">
                  {`\u20A1${plan.price}`}
                </span>
                {plan.period && (
                  <span className="text-sm text-muted-foreground">{plan.period}</span>
                )}
              </div>
              <ul className="mb-8 flex-1 flex flex-col gap-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 text-primary flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link href="/register">
                <Button
                  className={`w-full ${
                    plan.highlighted
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                >
                  {plan.cta}
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
