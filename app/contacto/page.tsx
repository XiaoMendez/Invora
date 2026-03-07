"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Loader2, Send, CheckCircle, Mail, MapPin, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { StaticFooterLayout } from "@/components/static-footer-layout"

export default function ContactoPage() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({
    nombre: "",
    email: "",
    asunto: "",
    mensaje: "",
  })

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

      if (!res.ok) {
        setError(data.error || "Error al enviar el mensaje")
        return
      }

      setSuccess(true)
      setForm({ nombre: "", email: "", asunto: "", mensaje: "" })
      
      // Reset success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000)
    } catch {
      setError("Error de conexión. Intenta de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  const contactInfo = [
    {
      icon: Mail,
      title: "Email",
      value: "hola@invora.io",
      href: "mailto:hola@invora.io",
    },
    {
      icon: Phone,
      title: "Teléfono",
      value: "+506 2567 1234",
      href: "tel:+50625671234",
    },
    {
      icon: MapPin,
      title: "Ubicación",
      value: "San José, Costa Rica",
      href: "#",
    },
  ]

  return (
    <StaticFooterLayout
      title="Ponte en Contacto"
      subtitle="¿Tienes preguntas o sugerencias? Nos encantaría escucharte. Completa el formulario o utiliza nuestros canales de contacto directo."
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
                <h2 className="text-2xl font-bold text-foreground">
                  ¡Mensaje enviado!
                </h2>
                <p className="text-muted-foreground max-w-sm">
                  Gracias por contactarnos. Te responderemos lo antes posible.
                </p>
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
                    <Label htmlFor="nombre" className="text-sm text-foreground">
                      Nombre completo
                    </Label>
                    <Input
                      id="nombre"
                      type="text"
                      placeholder="Tu nombre"
                      value={form.nombre}
                      onChange={(e) =>
                        setForm({ ...form, nombre: e.target.value })
                      }
                      required
                      className="bg-secondary/50 border-border/30 h-11"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="email" className="text-sm text-foreground">
                      Correo electrónico
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="tu@correo.com"
                      value={form.email}
                      onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                      }
                      required
                      className="bg-secondary/50 border-border/30 h-11"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="asunto" className="text-sm text-foreground">
                    Asunto
                  </Label>
                  <Input
                    id="asunto"
                    type="text"
                    placeholder="Tema de tu mensaje"
                    value={form.asunto}
                    onChange={(e) =>
                      setForm({ ...form, asunto: e.target.value })
                    }
                    required
                    className="bg-secondary/50 border-border/30 h-11"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="mensaje" className="text-sm text-foreground">
                    Mensaje
                  </Label>
                  <Textarea
                    id="mensaje"
                    placeholder="Escribe tu mensaje aquí..."
                    value={form.mensaje}
                    onChange={(e) =>
                      setForm({ ...form, mensaje: e.target.value })
                    }
                    required
                    rows={6}
                    className="bg-secondary/50 border-border/30 resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-11 mt-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Enviar Mensaje
                    </>
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
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <a href={info.href} className="group">
                  <div className="glass-card rounded-xl p-6 flex flex-col gap-4 border border-border/20 group-hover:border-primary/40 transition-all">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <IconComponent className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-foreground font-semibold mb-1">
                        {info.title}
                      </h3>
                      <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                        {info.value}
                      </p>
                    </div>
                  </div>
                </a>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* FAQ Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="mt-16 pt-12 border-t border-border/20"
      >
        <h2 className="text-2xl font-bold text-foreground mb-6">Preguntas Frecuentes</h2>
        <div className="space-y-4">
          <div className="glass-card rounded-lg p-6 border border-border/20">
            <h3 className="font-semibold text-foreground mb-2">
              ¿Cuál es el tiempo de respuesta esperado?
            </h3>
            <p className="text-sm text-muted-foreground">
              Nos esforzamos por responder todos los mensajes dentro de 24 horas hábiles.
            </p>
          </div>
          <div className="glass-card rounded-lg p-6 border border-border/20">
            <h3 className="font-semibold text-foreground mb-2">
              ¿Ofrecen soporte técnico?
            </h3>
            <p className="text-sm text-muted-foreground">
              Sí, ofrecemos soporte técnico a través de email y teléfono durante horario comercial.
            </p>
          </div>
          <div className="glass-card rounded-lg p-6 border border-border/20">
            <h3 className="font-semibold text-foreground mb-2">
              ¿Pueden ayudarme con la implementación?
            </h3>
            <p className="text-sm text-muted-foreground">
              Claro, contáctanos y te proporcionaremos asistencia para la implementación de INVORA en tu negocio.
            </p>
          </div>
        </div>
      </motion.div>
    </StaticFooterLayout>
  )
}
