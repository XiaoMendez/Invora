"use client"

import { motion } from "framer-motion"
import {
  Package,
  BarChart3,
  Bell,
  MousePointerClick,
  Users,
  Shield,
} from "lucide-react"
import { useTranslation } from "@/hooks/useTranslation"

const featureIcons = [Package, BarChart3, Bell, MousePointerClick, Users, Shield]

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
}

export function FeaturesSection() {
  const { t } = useTranslation()

  const features = featureIcons.map((icon, i) => ({
    icon,
    title: t(`features.f${i + 1}title`),
    description: t(`features.f${i + 1}desc`),
  }))

  return (
    <section id="features" className="relative py-32">
      <div className="mx-auto max-w-7xl px-6">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-xs uppercase tracking-widest text-primary mb-3">
            {t('features.badge')}
          </p>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground text-balance">
            {t('features.title1')}{" "}
            <span className="text-primary">{t('features.title2')}</span>{" "}
            {t('features.title3')}
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-muted-foreground text-pretty leading-relaxed">
            {t('features.subtitle')}
          </p>
        </motion.div>

        {/* Features grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              className="group relative glass-card rounded-xl p-6 hover:border-primary/30 transition-all duration-500"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors duration-300">
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-foreground">{feature.title}</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
