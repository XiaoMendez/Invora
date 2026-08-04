"use client"

import { StaticPageLayout } from "@/components/static-page-layout"
import { useTranslation } from "@/hooks/useTranslation"

export default function GuiaPage() {
  const { t } = useTranslation()

  const steps = [
    { numKey: "staticPages.guide.step1num", titleKey: "staticPages.guide.step1title", descKey: "staticPages.guide.step1desc" },
    { numKey: "staticPages.guide.step2num", titleKey: "staticPages.guide.step2title", descKey: "staticPages.guide.step2desc" },
    { numKey: "staticPages.guide.step3num", titleKey: "staticPages.guide.step3title", descKey: "staticPages.guide.step3desc" },
    { numKey: "staticPages.guide.step4num", titleKey: "staticPages.guide.step4title", descKey: "staticPages.guide.step4desc" },
    { numKey: "staticPages.guide.step5num", titleKey: "staticPages.guide.step5title", descKey: "staticPages.guide.step5desc" },
  ]

  return (
    <StaticPageLayout
      title={t("staticPages.guide.title")}
      subtitle={t("staticPages.guide.subtitle")}
    >
      <div className="flex flex-col gap-8">
        {steps.map((step) => (
          <div
            key={step.numKey}
            className="glass-card rounded-xl p-6 flex items-start gap-6"
          >
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-lg">
              {t(step.numKey)}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {t(step.titleKey)}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t(step.descKey)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </StaticPageLayout>
  )
}
