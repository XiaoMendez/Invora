"use client"

import { StaticFooterLayout } from "@/components/static-footer-layout"
import { useTranslation } from "@/hooks/useTranslation"

export default function TerminosPage() {
  const { t } = useTranslation()

  const sections = [
    { key: "t1", title: t("staticPages.terminos.s1title"), body: t("staticPages.terminos.s1body") },
    { key: "t2", title: t("staticPages.terminos.s2title"), body: t("staticPages.terminos.s2body"), list: [
      t("staticPages.terminos.s2l1"), t("staticPages.terminos.s2l2"), t("staticPages.terminos.s2l3"),
      t("staticPages.terminos.s2l4"), t("staticPages.terminos.s2l5"),
    ]},
    { key: "t3", title: t("staticPages.terminos.s3title"), body: t("staticPages.terminos.s3body"), list: [
      t("staticPages.terminos.s3l1"), t("staticPages.terminos.s3l2"),
      t("staticPages.terminos.s3l3"), t("staticPages.terminos.s3l4"),
    ]},
    { key: "t4", title: t("staticPages.terminos.s4title"), body: t("staticPages.terminos.s4body"), list: [
      t("staticPages.terminos.s4l1"), t("staticPages.terminos.s4l2"),
      t("staticPages.terminos.s4l3"), t("staticPages.terminos.s4l4"), t("staticPages.terminos.s4l5"),
    ]},
    { key: "t5", title: t("staticPages.terminos.s5title"), body: t("staticPages.terminos.s5body") },
    { key: "t6", title: t("staticPages.terminos.s6title"), body: t("staticPages.terminos.s6body"), list: [
      t("staticPages.terminos.s6l1"), t("staticPages.terminos.s6l2"), t("staticPages.terminos.s6l3"),
    ]},
    { key: "t7", title: t("staticPages.terminos.s7title"), body: t("staticPages.terminos.s7body") },
    { key: "t8", title: t("staticPages.terminos.s8title"), body: t("staticPages.terminos.s8body") },
    { key: "t9", title: t("staticPages.terminos.s9title"), body: t("staticPages.terminos.s9body") },
    { key: "t10", title: t("staticPages.terminos.s10title"), body: t("staticPages.terminos.s10body") },
    { key: "t11", title: t("staticPages.terminos.s11title"), body: t("staticPages.terminos.s11body") },
  ]

  return (
    <StaticFooterLayout
      title={t("staticPages.terminos.title")}
      subtitle={t("staticPages.terminos.subtitle")}
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
          {t("staticPages.terminos.updated")}
        </p>
      </div>
    </StaticFooterLayout>
  )
}
