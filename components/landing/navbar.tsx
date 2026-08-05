"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeLogo } from "@/components/theme-logo"
import { useTranslation } from "@/hooks/useTranslation"
import { usePreferences } from "@/contexts/PreferencesContext"

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { t } = useTranslation()
  const { preferences } = usePreferences()
  const locale = preferences.locale

  const navLinks = [
    { label: t('nav.home'), href: "#hero" },
    { label: t('nav.features'), href: "#features" },
    { label: t('nav.contact'), href: `/${locale}/contacto` },
  ]

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? "glass py-3" : "py-5 bg-transparent"
      }`}
    >
      <nav className="mx-auto max-w-7xl flex items-center justify-between px-6">
        <Link href={`/${locale}`} className="flex items-center gap-2">
          <ThemeLogo
            width={800}
            height={200}
            alt="INVORA Logo"
            className="h-14 dark:h-20 w-auto"
          />
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Link href={`/${locale}/login`}>
            <Button variant="ghost" className="text-sm text-muted-foreground hover:text-foreground">
              {t('nav.login')}
            </Button>
          </Link>
          <Link href={`/${locale}/register`}>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 text-sm px-6">
              {t('nav.register')}
            </Button>
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass mx-4 mt-2 rounded-xl overflow-hidden"
          >
            <div className="flex flex-col p-4 gap-3">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="text-sm text-muted-foreground hover:text-foreground py-2 transition-colors"
                >
                  {link.label}
                </a>
              ))}
              <Link href={`/${locale}/login`}>
                <Button variant="ghost" className="w-full text-muted-foreground mt-2">
                  {t('nav.login')}
                </Button>
              </Link>
              <Link href={`/${locale}/register`}>
                <Button className="w-full bg-primary text-primary-foreground">
                  {t('nav.register')}
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
