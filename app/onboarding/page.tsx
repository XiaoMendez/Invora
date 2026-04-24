"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { StarsBackground } from "@/components/space-scene"
import { Building2, Loader2, Rocket } from "lucide-react"
import Image from "next/image"

export default function OnboardingPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    telefono: "",
    direccion: "",
    descripcion: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!formData.nombre.trim()) {
      setError("El nombre de la empresa es requerido")
      return
    }

    if (!formData.email.trim()) {
      setError("El email de la empresa es requerido")
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch("/api/empresa/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Error al configurar la empresa")
      }

      router.push("/dashboard")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al configurar la empresa")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4">
      <StarsBackground />
      
      <Card className="w-full max-w-lg bg-card/95 backdrop-blur-sm border-border/50 z-10">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <Image
              src="/images/invora-logo.png"
              alt="Invora"
              width={180}
              height={60}
              className="h-12 w-auto"
            />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl flex items-center justify-center gap-2">
              <Rocket className="h-6 w-6 text-primary" />
              Configura tu Empresa
            </CardTitle>
            <CardDescription>
              Antes de continuar, necesitamos algunos datos de tu empresa para personalizar tu experiencia.
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="nombre">
                Nombre de la Empresa <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="nombre"
                  placeholder="Mi Empresa S.A."
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="pl-10"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">
                Email de Contacto <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="contacto@miempresa.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={isLoading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefono">Telefono (opcional)</Label>
              <Input
                id="telefono"
                type="tel"
                placeholder="+506 8888-8888"
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="direccion">Direccion (opcional)</Label>
              <Input
                id="direccion"
                placeholder="San Jose, Costa Rica"
                value={formData.direccion}
                onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripcion (opcional)</Label>
              <Textarea
                id="descripcion"
                placeholder="Breve descripcion de tu empresa..."
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                disabled={isLoading}
                rows={3}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Configurando...
                </>
              ) : (
                <>
                  <Rocket className="mr-2 h-4 w-4" />
                  Comenzar a usar Invora
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
