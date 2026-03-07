"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { ArrowLeft, Mail, MapPin, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StarsBackgroundCanvas } from "@/components/space-scene-canvas"

export function StaticFooterLayout({
  title,
  subtitle,
  children,
  showContact = false,
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
  showContact?: boolean
}) {
  return (
    <div className="relative min-h-screen flex flex-col bg-background">
      <StarsBackgroundCanvas />

      {/* Navigation */}
      <nav className="relative z-20 border-b border-border/20 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/images/invora-logo.png"
              alt="INVORA"
              width={400}
              height={133}
              className="h-8 w-auto"
            />
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Link>
        </div>
      </nav>

      {/* Main content */}
      <main className="relative z-10 flex-1">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto px-4 py-16"
        >
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              {title}
            </h1>
            {subtitle && (
              <p className="text-lg text-muted-foreground max-w-2xl">
                {subtitle}
              </p>
            )}
          </div>

          {/* Content */}
          <div className="prose prose-invert max-w-none mb-12">
            {children}
          </div>

          {/* Contact Section */}
          {showContact && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="mt-16 pt-12 border-t border-border/20"
            >
              <div className="grid md:grid-cols-3 gap-8">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-primary" />
                    <span className="text-sm font-semibold">Email</span>
                  </div>
                  <a
                    href="mailto:hola@invora.io"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    hola@invora.io
                  </a>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-primary" />
                    <span className="text-sm font-semibold">Teléfono</span>
                  </div>
                  <a
                    href="tel:+50625671234"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    +506 2567 1234
                  </a>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-primary" />
                    <span className="text-sm font-semibold">Ubicación</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    San José, Costa Rica
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-20 border-t border-border/20 backdrop-blur-md bg-background/50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>© 2024 INVORA. Todos los derechos reservados.</p>
            <div className="flex gap-6">
              <Link href="/privacidad" className="hover:text-foreground transition-colors">
                Privacidad
              </Link>
              <Link href="/terminos" className="hover:text-foreground transition-colors">
                Términos
              </Link>
              <Link href="/contacto" className="hover:text-foreground transition-colors">
                Contacto
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
