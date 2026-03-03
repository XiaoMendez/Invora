"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Loader2, Send, CheckCircle, Mail, MapPin, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

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
    } catch {
      setError("Error de conexion. Intenta de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/30 py-4">
        <div className="mx-auto max-w-5xl px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/images/invora-logo.png"
              alt="INVORA Logo"
              width={360}
              height={120}
              className="h-14 w-auto"
              priority
            />
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-16">
        <h1 className="text-3xl font-bold text-foreground mb-4 text-balance">Contacto</h1>
        <p className="text-muted-foreground mb-12 max-w-2xl leading-relaxed">
          Tienes alguna pregunta, sugerencia o necesitas ayuda? Envianos un
          mensaje y te responderemos lo antes posible.
        </p>

        <div className="grid md:grid-cols-3 gap-12">
          {/* Contact Form */}
          <div className="md:col-span-2">
            {success ? (
              <div className="glass-card rounded-2xl p-8 text-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
                    <CheckCircle className="h-8 w-8 text-green-400" />
                  </div>
                  <h2 className="text-xl font-bold text-foreground">
                    Mensaje enviado
                  </h2>
                  <p className="text-muted-foreground max-w-sm">
                    Gracias por contactarnos. Te responderemos a la brevedad
                    posible.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4 border-border/30 text-foreground"
                    onClick={() => setSuccess(false)}
                  >
                    Enviar otro mensaje
                  </Button>
                </div>
              </div>
            ) : (
              <div className="glass-card rounded-2xl p-8">
                {error && (
                  <div className="mb-6 rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-red-400">
                    {error}
                  </div>
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
                        Correo electronico
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
                      placeholder="Escribe tu mensaje aqui..."
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
          </div>

          {/* Contact Info */}
          <div className="flex flex-col gap-6">
            <div className="glass-card rounded-xl p-6 flex flex-col gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-foreground font-semibold mb-1">Email</h3>
                <p className="text-sm text-muted-foreground">
                  contacto@invora.cr
                </p>
              </div>
            </div>
            <div className="glass-card rounded-xl p-6 flex flex-col gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Phone className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-foreground font-semibold mb-1">Telefono</h3>
                <p className="text-sm text-muted-foreground">
                  +506 8888-8888
                </p>
              </div>
            </div>
            <div className="glass-card rounded-xl p-6 flex flex-col gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-foreground font-semibold mb-1">Ubicacion</h3>
                <p className="text-sm text-muted-foreground">
                  San Jose, Costa Rica
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-border/30 py-8">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <p className="text-xs text-muted-foreground">
            &copy; 2026 INVORA. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}
