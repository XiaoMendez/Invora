"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowRight, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTranslation } from "@/hooks/useTranslation"
import { usePreferences } from "@/contexts/PreferencesContext"

export function HeroSection() {
  const { t } = useTranslation()
  const { preferences } = usePreferences()
  const locale = preferences.locale

  const stats = [
    { value: t('hero.stat1value'), label: t('hero.stat1label') },
    { value: t('hero.stat2value'), label: t('hero.stat2label') },
    { value: t('hero.stat3value'), label: t('hero.stat3label') },
    { value: t('hero.stat4value'), label: t('hero.stat4label') },
  ]

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Black stars for light mode */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top left star cluster */}
        <motion.div 
          className="absolute top-10 left-6 light:block hidden"
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          <Star className="h-8 w-8 text-black fill-black opacity-30" />
        </motion.div>
        
        {/* Top right stars */}
        <motion.div 
          className="absolute top-20 right-12 light:block hidden"
          animate={{ y: [0, 15, 0] }}
          transition={{ duration: 5, repeat: Infinity }}
        >
          <Star className="h-6 w-6 text-black fill-black opacity-25" />
        </motion.div>
        
        {/* Bottom left star */}
        <motion.div 
          className="absolute bottom-32 left-10 light:block hidden"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 6, repeat: Infinity }}
        >
          <Star className="h-7 w-7 text-black fill-black opacity-20" />
        </motion.div>

        {/* Bottom right stars */}
        <motion.div 
          className="absolute bottom-24 right-8 light:block hidden"
          animate={{ y: [0, 12, 0] }}
          transition={{ duration: 4.5, repeat: Infinity }}
        >
          <Star className="h-5 w-5 text-black fill-black opacity-28" />
        </motion.div>

        {/* Center accent stars */}
        <motion.div 
          className="absolute top-1/3 right-1/4 light:block hidden"
          animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.35, 0.2] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <Star className="h-4 w-4 text-black fill-black" />
        </motion.div>

        <motion.div 
          className="absolute top-2/3 left-1/4 light:block hidden"
          animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0.3, 0.15] }}
          transition={{ duration: 3.5, repeat: Infinity }}
        >
          <Star className="h-5 w-5 text-black fill-black" />
        </motion.div>
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">
        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight text-foreground text-balance leading-[1.1]"
        >
          {t('hero.title1')}
          <br />
          <span className="bg-gradient-to-r from-primary via-[oklch(0.75_0.15_340)] to-primary bg-clip-text text-transparent">
            {t('hero.title2')}
          </span>{" "}
          {t('hero.title3')}
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mx-auto mt-6 max-w-2xl text-base md:text-lg text-muted-foreground leading-relaxed text-pretty"
        >
          {t('hero.subtitle')}
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link href={`/${locale}/register`}>
            <Button
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 text-base group animate-pulse-glow"
            >
              {t('hero.cta')}
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          <a href="#features">
            <Button
              size="lg"
              variant="outline"
              className="border-border/50 text-foreground hover:bg-secondary px-8 py-6 text-base"
            >
              {t('hero.secondary')}
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
          {stats.map((stat) => (
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
