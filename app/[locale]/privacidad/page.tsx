"use client"

import { StaticFooterLayout } from "@/components/static-footer-layout"
import { useTranslation } from "@/hooks/useTranslation"

export default function PrivacidadPage() {
  const { t } = useTranslation()

  const sections = [
    { key: "p1", title: t("staticPages.privacidad.s1title"), body: t("staticPages.privacidad.s1body"), list: [
      t("staticPages.privacidad.s1l1"), t("staticPages.privacidad.s1l2"),
      t("staticPages.privacidad.s1l3"), t("staticPages.privacidad.s1l4"),
    ]},
    { key: "p2", title: t("staticPages.privacidad.s2title"), body: t("staticPages.privacidad.s2body"), list: [
      t("staticPages.privacidad.s2l1"), t("staticPages.privacidad.s2l2"),
      t("staticPages.privacidad.s2l3"), t("staticPages.privacidad.s2l4"), t("staticPages.privacidad.s2l5"),
    ]},
    { key: "p3", title: t("staticPages.privacidad.s3title"), body: t("staticPages.privacidad.s3body"), list: [
      t("staticPages.privacidad.s3l1"), t("staticPages.privacidad.s3l2"),
      t("staticPages.privacidad.s3l3"), t("staticPages.privacidad.s3l4"), t("staticPages.privacidad.s3l5"),
    ]},
    { key: "p4", title: t("staticPages.privacidad.s4title"), body: t("staticPages.privacidad.s4body") },
    { key: "p5", title: t("staticPages.privacidad.s5title"), body: t("staticPages.privacidad.s5body") },
    { key: "p6", title: t("staticPages.privacidad.s6title"), body: t("staticPages.privacidad.s6body"), list: [
      t("staticPages.privacidad.s6l1"), t("staticPages.privacidad.s6l2"),
      t("staticPages.privacidad.s6l3"), t("staticPages.privacidad.s6l4"),
    ]},
    { key: "p7", title: t("staticPages.privacidad.s7title"), body: t("staticPages.privacidad.s7body") },
  ]

  return (
    <StaticFooterLayout
      title={t("staticPages.privacidad.title")}
      subtitle={t("staticPages.privacidad.subtitle")}
    >
      <div className="space-y-8">
        {sections.map((section) => (
          <section key={section.key}>
            <h2 className="text-2xl font-semibold text-foreground mb-4">{section.title}</h2>
            <p className="text-muted-foreground">{section.body}</p>
            {section.list && (
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mt-3">
                {section.list.filter(Boolean).map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            )}
          </section>
        ))}
        <p className="text-sm text-muted-foreground italic pt-6 border-t border-border/20">
          {t("staticPages.privacidad.updated")}
        </p>
      </div>
    </StaticFooterLayout>
  )
}
