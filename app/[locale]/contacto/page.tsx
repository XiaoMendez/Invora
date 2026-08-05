"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Loader2, Send, CheckCircle, Mail, MapPin, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { StaticFooterLayout } from "@/components/static-footer-layout"
import { useTranslation } from "@/hooks/useTranslation"

export default function ContactoPage() {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({ nombre: "", email: "", asunto: "", mensaje: "" })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || t("staticPages.contact.errorSend")); return }
      setSuccess(true)
      setForm({ nombre: "", email: "", asunto: "", mensaje: "" })
      setTimeout(() => setSuccess(false), 3000)
    } catch {
      setError(t("staticPages.contact.connectionError"))
    } finally {
      setLoading(false)
    }
  }

  const contactInfo = [
    { icon: Mail, title: t("staticPages.contact.emailContactTitle"), value: "invoracr@gmail.com", href: "mailto:invoracr@gmail.com" },
    { icon: Phone, title: t("staticPages.contact.phoneTitle"), value: "+506 2567 1234", href: "tel:+50625671234" },
    { icon: MapPin, title: t("staticPages.contact.locationTitle"), value: "San José, Costa Rica", href: "#" },
  ]

  return (
    <StaticFooterLayout
      title={t("staticPages.contact.title")}
      subtitle={t("staticPages.contact.subtitle")}
    >
      <div className="grid md:grid-cols-3 gap-12 mb-12">
        {/* Contact Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="md:col-span-2"
        >
          {success ? (
            <div className="glass-card rounded-2xl p-8 text-center border border-green-500/20">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center gap-4"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10 border border-green-500/30">
                  <CheckCircle className="h-8 w-8 text-green-400" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">{t("staticPages.contact.successTitle")}</h2>
                <p className="text-muted-foreground max-w-sm">{t("staticPages.contact.successDesc")}</p>
              </motion.div>
            </div>
          ) : (
            <div className="glass-card rounded-2xl p-8 border border-border/20">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-red-400"
                >
                  {error}
                </motion.div>
              )}
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div className="grid md:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="nombre" className="text-sm text-foreground">{t("staticPages.contact.fullName")}</Label>
                    <Input id="nombre" type="text" placeholder={t("staticPages.contact.fullNamePlaceholder")}
                      value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                      required className="bg-secondary/50 border-border/30 h-11" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="email" className="text-sm text-foreground">{t("staticPages.contact.email")}</Label>
                    <Input id="email" type="email" placeholder={t("staticPages.contact.emailPlaceholder")}
                      value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                      required className="bg-secondary/50 border-border/30 h-11" />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="asunto" className="text-sm text-foreground">{t("staticPages.contact.subject")}</Label>
                  <Input id="asunto" type="text" placeholder={t("staticPages.contact.subjectPlaceholder")}
                    value={form.asunto} onChange={(e) => setForm({ ...form, asunto: e.target.value })}
                    required className="bg-secondary/50 border-border/30 h-11" />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="mensaje" className="text-sm text-foreground">{t("staticPages.contact.message")}</Label>
                  <Textarea id="mensaje" placeholder={t("staticPages.contact.messagePlaceholder")}
                    value={form.mensaje} onChange={(e) => setForm({ ...form, mensaje: e.target.value })}
                    required rows={6} className="bg-secondary/50 border-border/30 resize-none" />
                </div>
                <Button type="submit" disabled={loading}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-11 mt-2">
                  {loading ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{t("staticPages.contact.sending")}</>
                  ) : (
                    <><Send className="mr-2 h-4 w-4" />{t("staticPages.contact.send")}</>
                  )}
                </Button>
              </form>
            </div>
          )}
        </motion.div>

        {/* Contact Info */}
        <div className="flex flex-col gap-6">
          {contactInfo.map((info, index) => {
            const IconComponent = info.icon
            return (
              <motion.div key={index} initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }} viewport={{ once: true }}>
                <a href={info.href} className="group">
                  <div className="glass-card rounded-xl p-6 flex flex-col gap-4 border border-border/20 group-hover:border-primary/40 transition-all">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <IconComponent className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-foreground font-semibold mb-1">{info.title}</h3>
                      <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">{info.value}</p>
                    </div>
                  </div>
                </a>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* FAQ Section */}
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }} viewport={{ once: true }}
        className="mt-16 pt-12 border-t border-border/20">
        <h2 className="text-2xl font-bold text-foreground mb-6">{t("staticPages.contact.faqTitle")}</h2>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card rounded-lg p-6 border border-border/20">
              <h3 className="font-semibold text-foreground mb-2">{t(`staticPages.contact.faq${i}q`)}</h3>
              <p className="text-sm text-muted-foreground">{t(`staticPages.contact.faq${i}a`)}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </StaticFooterLayout>
  )
}
