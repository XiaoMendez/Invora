"use client"

import { StaticPageLayout } from "@/components/static-page-layout"
import Link from "next/link"
import { Mail, MessageCircle, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTranslation } from "@/hooks/useTranslation"

export default function SoportePage() {
  const { t } = useTranslation()

  const faqs = [
    { qKey: "staticPages.support.faq1q", aKey: "staticPages.support.faq1a" },
    { qKey: "staticPages.support.faq2q", aKey: "staticPages.support.faq2a" },
    { qKey: "staticPages.support.faq3q", aKey: "staticPages.support.faq3a" },
    { qKey: "staticPages.support.faq4q", aKey: "staticPages.support.faq4a" },
  ]

  return (
    <StaticPageLayout
      title={t("staticPages.support.title")}
      subtitle={t("staticPages.support.subtitle")}
    >
      <div className="grid md:grid-cols-3 gap-6 mb-16">
        <div className="glass-card rounded-xl p-6 flex flex-col items-center text-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <Mail className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-foreground font-semibold">{t("staticPages.support.emailTitle")}</h3>
          <p className="text-sm">{t("staticPages.support.emailDesc")}</p>
          <Link href="/contacto">
            <Button variant="outline" size="sm" className="border-border/30 text-foreground">
              {t("staticPages.support.emailBtn")}
            </Button>
          </Link>
        </div>
        <div className="glass-card rounded-xl p-6 flex flex-col items-center text-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <MessageCircle className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-foreground font-semibold">{t("staticPages.support.chatTitle")}</h3>
          <p className="text-sm">{t("staticPages.support.chatDesc")}</p>
          <Link href="/contacto">
            <Button variant="outline" size="sm" className="border-border/30 text-foreground">
              {t("staticPages.support.chatBtn")}
            </Button>
          </Link>
        </div>
        <div className="glass-card rounded-xl p-6 flex flex-col items-center text-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <Clock className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-foreground font-semibold">{t("staticPages.support.hoursTitle")}</h3>
          <p className="text-sm">{t("staticPages.support.hoursDesc")}</p>
        </div>
      </div>

      <section>
        <h2 className="text-xl font-semibold text-foreground mb-6">
          {t("staticPages.support.faqTitle")}
        </h2>
        <div className="flex flex-col gap-4">
          {faqs.map((faq) => (
            <div key={faq.qKey} className="glass-card rounded-xl p-6">
              <h3 className="text-foreground font-semibold mb-2">{t(faq.qKey)}</h3>
              <p className="text-sm">{t(faq.aKey)}</p>
            </div>
          ))}
        </div>
      </section>
    </StaticPageLayout>
  )
}
