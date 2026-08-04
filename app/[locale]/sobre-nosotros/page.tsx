"use client"

import { StaticPageLayout } from "@/components/static-page-layout"
import { useTranslation } from "@/hooks/useTranslation"

export default function SobreNosotrosPage() {
  const { t } = useTranslation()

  return (
    <StaticPageLayout
      title={t("staticPages.about.title")}
      subtitle={t("staticPages.about.subtitle")}
    >
      <div className="flex flex-col gap-8">
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">
            {t("staticPages.about.missionTitle")}
          </h2>
          <p>{t("staticPages.about.missionText")}</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">
            {t("staticPages.about.whatTitle")}
          </h2>
          <p>{t("staticPages.about.whatText")}</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">
            {t("staticPages.about.whyTitle")}
          </h2>
          <p>
            {t("staticPages.about.whyText1")}{" "}
            &ldquo;{t("staticPages.about.whyInventario")}&rdquo;{" "}
            e &ldquo;{t("staticPages.about.whyInnovacion")}&rdquo;.{" "}
            {t("staticPages.about.whyText2")}
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">
            {t("staticPages.about.valuesTitle")}
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="glass-card rounded-xl p-6">
              <h3 className="text-foreground font-semibold mb-2">{t("staticPages.about.v1title")}</h3>
              <p className="text-sm">{t("staticPages.about.v1desc")}</p>
            </div>
            <div className="glass-card rounded-xl p-6">
              <h3 className="text-foreground font-semibold mb-2">{t("staticPages.about.v2title")}</h3>
              <p className="text-sm">{t("staticPages.about.v2desc")}</p>
            </div>
            <div className="glass-card rounded-xl p-6">
              <h3 className="text-foreground font-semibold mb-2">{t("staticPages.about.v3title")}</h3>
              <p className="text-sm">{t("staticPages.about.v3desc")}</p>
            </div>
            <div className="glass-card rounded-xl p-6">
              <h3 className="text-foreground font-semibold mb-2">{t("staticPages.about.v4title")}</h3>
              <p className="text-sm">{t("staticPages.about.v4desc")}</p>
            </div>
          </div>
        </section>
      </div>
    </StaticPageLayout>
  )
}
