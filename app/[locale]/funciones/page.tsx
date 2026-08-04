"use client"

import { StaticPageLayout } from "@/components/static-page-layout"
import { Package, BarChart3, Bell, QrCode, Shield, Users } from "lucide-react"
import { useTranslation } from "@/hooks/useTranslation"

export default function FuncionesPage() {
  const { t } = useTranslation()

  const features = [
    { icon: Package, titleKey: "staticPages.features.f1title", descKey: "staticPages.features.f1desc" },
    { icon: BarChart3, titleKey: "staticPages.features.f2title", descKey: "staticPages.features.f2desc" },
    { icon: Bell, titleKey: "staticPages.features.f3title", descKey: "staticPages.features.f3desc" },
    { icon: QrCode, titleKey: "staticPages.features.f4title", descKey: "staticPages.features.f4desc" },
    { icon: Shield, titleKey: "staticPages.features.f5title", descKey: "staticPages.features.f5desc" },
    { icon: Users, titleKey: "staticPages.features.f6title", descKey: "staticPages.features.f6desc" },
  ]

  return (
    <StaticPageLayout
      title={t("staticPages.features.title")}
      subtitle={t("staticPages.features.subtitle")}
    >
      <div className="grid md:grid-cols-2 gap-8">
        {features.map((feature) => (
          <div
            key={feature.titleKey}
            className="glass-card rounded-xl p-6 flex flex-col gap-4"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <feature.icon className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">
              {t(feature.titleKey)}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t(feature.descKey)}
            </p>
          </div>
        ))}
      </div>
    </StaticPageLayout>
  )
}
