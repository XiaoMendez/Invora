"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function CTASection() {
  return (
    <section id="contact" className="relative py-32">
      <div className="mx-auto max-w-4xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="glass-card rounded-2xl p-10 md:p-16 text-center relative overflow-hidden"
        >
          {/* Subtle glow background */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none" />

          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground text-balance">
              Lleva tu inventario a otra dimension
            </h2>
            <p className="mt-4 text-muted-foreground max-w-xl mx-auto leading-relaxed text-pretty">
              Unete a cientos de PYMEs costarricenses que ya confian en INVORA
              para gestionar su inventario de forma inteligente.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/dashboard">
                <Button
                  size="lg"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 text-base group"
                >
                  Empezar Ahora
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export function Footer() {
  return (
    <footer className="border-t border-border/30 py-12">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Image
              src="/images/invora-logo.png"
              alt="INVORA Logo"
              width={100}
              height={33}
              className="h-7 w-auto mb-4"
            />
            <p className="text-sm text-muted-foreground leading-relaxed">
              Sistema de inventario inteligente para PYMEs en Costa Rica.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">Producto</h4>
            <ul className="flex flex-col gap-2">
              {["Funciones", "Precios", "Integraciones", "Actualizaciones"].map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">Empresa</h4>
            <ul className="flex flex-col gap-2">
              {["Sobre Nosotros", "Blog", "Contacto", "Soporte"].map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">Legal</h4>
            <ul className="flex flex-col gap-2">
              {["Terminos de Servicio", "Privacidad", "Cookies"].map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-6 border-t border-border/30 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; 2026 INVORA. Todos los derechos reservados.
          </p>
          <p className="text-xs text-muted-foreground">
            Hecho con amor en Costa Rica
          </p>
        </div>
      </div>
    </footer>
  )
}
