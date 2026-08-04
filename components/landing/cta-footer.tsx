"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeLogo } from "@/components/theme-logo"
import { useTranslation } from "@/hooks/useTranslation"
import { usePreferences } from "@/contexts/PreferencesContext"

export function CTASection() {
  const { t } = useTranslation()
  const { preferences } = usePreferences()
  const locale = preferences.locale

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
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none" />

          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground text-balance">
              {t('cta.title')}
            </h2>
            <p className="mt-4 text-muted-foreground max-w-xl mx-auto leading-relaxed text-pretty">
              {t('cta.subtitle')}
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href={`/${locale}/register`}>
                <Button
                  size="lg"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 text-base group"
                >
                  {t('cta.button')}
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
  const { t } = useTranslation()
  const { preferences } = usePreferences()
  const locale = preferences.locale

  const footerProducto = [
    { label: t('footer.features'), href: `/${locale}/funciones` },
    { label: t('footer.guide'), href: `/${locale}/guia` },
  ]

  const footerEmpresa = [
    { label: t('footer.about'), href: `/${locale}/sobre-nosotros` },
    { label: t('footer.contact'), href: `/${locale}/contacto` },
    { label: t('footer.support'), href: `/${locale}/soporte` },
  ]

  const footerLegal = [
    { label: t('footer.terms'), href: `/${locale}/terminos` },
    { label: t('footer.privacy'), href: `/${locale}/privacidad` },
    { label: t('footer.cookies'), href: `/${locale}/cookies` },
  ]

  return (
    <footer className="border-t border-border/30 py-12">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <ThemeLogo
              width={640}
              height={160}
              alt="INVORA Logo"
              className="h-20 w-auto mb-4"
            />
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t('footer.tagline')}
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">{t('footer.product')}</h4>
            <ul className="flex flex-col gap-2">
              {footerProducto.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">{t('footer.company')}</h4>
            <ul className="flex flex-col gap-2">
              {footerEmpresa.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">{t('footer.legal')}</h4>
            <ul className="flex flex-col gap-2">
              {footerLegal.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-6 border-t border-border/30 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; 2026 INVORA. {t('footer.rights')}
          </p>
          <p className="text-xs text-muted-foreground">
            {t('footer.madeWith')}
          </p>
        </div>
      </div>
    </footer>
  )
}
