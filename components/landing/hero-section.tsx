"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function HeroSection() {
  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">
        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight text-foreground text-balance leading-[1.1]"
        >
          Control total de tu
          <br />
          <span className="bg-gradient-to-r from-primary via-[oklch(0.75_0.15_340)] to-primary bg-clip-text text-transparent">
            inventario
          </span>{" "}
          en un solo lugar
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mx-auto mt-6 max-w-2xl text-base md:text-lg text-muted-foreground leading-relaxed text-pretty"
        >
          INVORA es el sistema de inventario disenado para PYMEs en Costa Rica.
          Gestiona productos, rastrea movimientos y toma decisiones con datos en tiempo real.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link href="/register">
            <Button
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 text-base group animate-pulse-glow"
            >
              Comenzar Ahora
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          <a href="#features">
            <Button
              size="lg"
              variant="outline"
              className="border-border/50 text-foreground hover:bg-secondary px-8 py-6 text-base"
            >
              Ver Funciones
            </Button>
          </a>
        </motion.div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-0 md:divide-x divide-border/30"
        >
          {[
            { value: "500+", label: "PYMEs Activas" },
            { value: "99.9%", label: "Uptime" },
            { value: "50K+", label: "Productos Gestionados" },
            { value: "24/7", label: "Soporte" },
          ].map((stat) => (
            <div key={stat.label} className="text-center px-4">
              <div className="text-2xl md:text-3xl font-bold text-foreground">
                {stat.value}
              </div>
              <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
