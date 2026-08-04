"use client"

import { StaticPageLayout } from "@/components/static-page-layout"
import { useTranslation } from "@/hooks/useTranslation"

export default function CookiesPage() {
  const { t } = useTranslation()

  return (
    <StaticPageLayout
      title={t("staticPages.cookies.title")}
      subtitle={t("staticPages.cookies.subtitle")}
    >
      <div className="flex flex-col gap-8">
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">
            {t("staticPages.cookies.whatTitle")}
          </h2>
          <p className="text-muted-foreground">{t("staticPages.cookies.whatBody")}</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">
            {t("staticPages.cookies.usedTitle")}
          </h2>
          <div className="flex flex-col gap-4">
            <div className="glass-card rounded-xl p-5">
              <h3 className="text-foreground font-semibold mb-1">
                {t("staticPages.cookies.sessionTitle")}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t("staticPages.cookies.sessionBody")}
              </p>
            </div>
            <div className="glass-card rounded-xl p-5">
              <h3 className="text-foreground font-semibold mb-1">
                {t("staticPages.cookies.analyticsTitle")}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t("staticPages.cookies.analyticsBody")}
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">
            {t("staticPages.cookies.manageTitle")}
          </h2>
          <p className="text-muted-foreground">{t("staticPages.cookies.manageBody")}</p>
        </section>
      </div>
    </StaticPageLayout>
  )
}
