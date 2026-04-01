"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Eye, EyeOff, ArrowLeft, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Auth3DScene } from "@/components/auth-3d-scene"
import { PasswordRequirements, isPasswordValid } from "@/components/password-requirements"
import { createClient } from "@/lib/supabase/client"

export default function RegisterPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [passwordFocused, setPasswordFocused] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({
    nombre: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (form.password !== form.confirmPassword) {
      setError("Las contrasenas no coinciden")
      return
    }

    if (!isPasswordValid(form.password)) {
      setError("La contrasena no cumple con los requisitos minimos")
      return
    }

    setLoading(true)

    try {
      const supabase = createClient()

      // Sign up with Supabase Auth
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin
      const { data, error: authError } = await supabase.auth.signUp({
        email: form.email.toLowerCase().trim(),
        password: form.password,
        options: {
          data: {
            empresa_nombre: form.nombre.trim(),
          },
          emailRedirectTo: `${siteUrl}/auth/callback`,
        },
      })

      if (authError) {
        setError(authError.message || "Error al crear la cuenta")
        return
      }

      if (!data.user) {
        setError("Error al crear la cuenta")
        return
      }

      // Create empresa record in database
      const { error: empresaError } = await supabase.from("empresa").insert({
        id: data.user.id,
        nombre: form.nombre.trim(),
        email: form.email.toLowerCase().trim(),
      })

      if (empresaError) {
        console.error("[v0] Error creating empresa:", empresaError)
      }

      // Create default categories
      const categorias = [
        { nombre: "General", descripcion: "Categoria general" },
        { nombre: "Alimentos", descripcion: "Productos alimenticios" },
        { nombre: "Bebidas", descripcion: "Bebidas y liquidos" },
        { nombre: "Limpieza", descripcion: "Productos de limpieza" },
      ]

      await supabase.from("categoria").insert(
        categorias.map((cat) => ({
          id_empresa: data.user.id,
          ...cat,
        }))
      )

      // Check if email confirmation is required
      if (data.session) {
        // Auto confirmed - redirect to dashboard
        router.refresh()
        router.push("/dashboard")
      } else {
        // Email confirmation required - redirect to confirm page
        router.push("/auth/confirm")
      }
    } catch (err) {
      console.error("[v0] Register error:", err)
      setError("Error de conexion. Intenta de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center py-12">
      <Auth3DScene variant="register" />

      <div className="absolute top-6 left-6 z-20">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al inicio
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <div className="glass-card rounded-2xl p-8">
          <div className="flex flex-col items-center mb-8">
            <Image
              src="/images/invora-logo.png"
              alt="INVORA"
              width={400}
              height={133}
              className="h-24 w-auto mb-6"
            />
            <h1 className="text-2xl font-bold text-foreground">Crear Cuenta</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Registra tu empresa en INVORA
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <Label htmlFor="nombre" className="text-sm text-foreground">
                Nombre de la empresa
              </Label>
              <Input
                id="nombre"
                type="text"
                placeholder="Mi Empresa S.A."
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
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
                placeholder="tu@empresa.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                className="bg-secondary/50 border-border/30 h-11"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="password" className="text-sm text-foreground">
                Contrasena
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Minimo 8 caracteres"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  required
                  className="bg-secondary/50 border-border/30 h-11 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? "Ocultar contrasena" : "Mostrar contrasena"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <PasswordRequirements
                password={form.password}
                visible={passwordFocused || form.password.length > 0}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="confirmPassword" className="text-sm text-foreground">
                Confirmar contrasena
              </Label>
              <Input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                placeholder="Repite tu contrasena"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                required
                className="bg-secondary/50 border-border/30 h-11"
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
                  Creando cuenta...
                </>
              ) : (
                "Crear Cuenta"
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            {"Ya tienes cuenta? "}
            <Link
              href="/login"
              className="text-primary hover:text-primary/80 font-medium transition-colors"
            >
              Inicia sesion
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
