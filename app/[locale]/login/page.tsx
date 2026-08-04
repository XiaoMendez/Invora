"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Eye, EyeOff, ArrowLeft, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Auth3DScene } from "@/components/auth-3d-scene"
import { ThemeLogo } from "@/components/theme-logo"
import { createClient } from "@/lib/supabase/client"
import { useTranslation } from "@/hooks/useTranslation"

export default function LoginPage() {
  const router = useRouter()
  const { t } = useTranslation()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({ email: "", password: "" })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const supabase = createClient()
      
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: form.email.toLowerCase().trim(),
        password: form.password,
      })

      if (authError) {
        setError(authError.message || t("auth.invalidCredentials"))
        return
      }

      if (!data.user || !data.session) {
        setError(t("auth.loginError"))
        return
      }

      router.refresh()
      router.push("/dashboard")
    } catch (err) {
      console.error("[v0] Login error:", err)
      setError(t("auth.connectionError"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center">
      <Auth3DScene variant="login" />

      <div className="absolute top-6 left-6 z-20">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("common.back")}
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
            <ThemeLogo
              width={360}
              height={120}
              alt="INVORA"
              className="h-20 w-auto mb-6"
            />
            <h1 className="text-2xl font-bold text-foreground">{t("auth.loginTitle")}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {t("auth.loginSubtitle")}
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <Label htmlFor="email" className="text-sm text-foreground">
                {t("auth.email")}
              </Label>
              <Input
                id="email"
                type="email"
                placeholder={t("auth.emailPlaceholder")}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                className="bg-secondary/50 border-border/30 h-11"
              />
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm text-foreground">
                  {t("auth.password")}
                </Label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-primary hover:text-primary/80 transition-colors"
                >
                  {t("auth.forgotPassword")}
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={t("auth.passwordPlaceholder")}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  className="bg-secondary/50 border-border/30 h-11 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? t("auth.hidePassword") : t("auth.showPassword")}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-11 mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("auth.signingIn")}
                </>
              ) : (
                t("auth.loginTitle")
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            {t("auth.noAccount")}{" "}
            <Link
              href="/register"
              className="text-primary hover:text-primary/80 font-medium transition-colors"
            >
              {t("auth.registerHere")}
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
