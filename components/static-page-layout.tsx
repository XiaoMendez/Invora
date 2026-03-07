"use client"

import Link from "next/link"
import Image from "next/image"
import { ArrowLeft } from "lucide-react"
import { motion } from "framer-motion"
import { StarsBackgroundCanvas } from "@/components/space-scene-canvas"

export function StaticPageLayout({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode
  title: string
  subtitle?: string
}) {
  return (
    <div className="relative min-h-screen flex flex-col bg-background">
      <StarsBackgroundCanvas />
      
      {/* Navigation */}
      <header className="relative z-20 border-b border-border/20 backdrop-blur-md bg-background/50">
        <div className="mx-auto max-w-5xl px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/images/invora-logo.png"
              alt="INVORA Logo"
              width={360}
              height={120}
              className="h-10 w-auto"
              priority
            />
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio
          </Link>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="relative z-10 flex-1">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-5xl px-6 py-16"
        >
          {/* Title Section */}
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 text-balance">
              {title}
            </h1>
            {subtitle && (
              <p className="text-lg text-muted-foreground max-w-3xl">
                {subtitle}
              </p>
            )}
          </div>
          
          {/* Content */}
          <div className="prose prose-invert max-w-none text-muted-foreground leading-relaxed">
            {children}
          </div>
        </motion.div>
      </main>
      
      {/* Footer */}
      <footer className="relative z-20 border-t border-border/20 backdrop-blur-md bg-background/50">
        <div className="mx-auto max-w-5xl px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>&copy; 2024 INVORA. Todos los derechos reservados.</p>
            <div className="flex gap-6">
              <Link href="/privacidad" className="hover:text-foreground transition-colors">
                Privacidad
              </Link>
              <Link href="/terminos" className="hover:text-foreground transition-colors">
                Terminos
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
