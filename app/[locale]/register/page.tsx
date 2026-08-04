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
import { PasswordRequirements, isPasswordValid } from "@/components/password-requirements"
import { createClient } from "@/lib/supabase/client"
import { useTranslation } from "@/hooks/useTranslation"

export default function RegisterPage() {
  const router = useRouter()
  const { t } = useTranslation()
  const [showPassword, setShowPassword] = useState(false)
  const [passwordFocused, setPasswordFocused] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (form.password !== form.confirmPassword) {
      setError(t("auth.passwordMismatch"))
      return
    }

    if (!isPasswordValid(form.password)) {
      setError(t("auth.passwordRequirements"))
      return
    }

    setLoading(true)

    try {
      const supabase = createClient()

      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin
      const { data, error: authError } = await supabase.auth.signUp({
        email: form.email.toLowerCase().trim(),
        password: form.password,
        options: {
          emailRedirectTo: `${siteUrl}/auth/callback`,
        },
      })

      if (authError) {
        setError(authError.message || t("auth.accountError"))
        return
      }

      if (!data.user) {
        setError(t("auth.accountError"))
        return
      }

      if (data.session) {
        router.refresh()
        router.push("/onboarding")
      } else {
        router.push("/auth/confirm")
      }
    } catch (err) {
      console.error("[v0] Register error:", err)
      setError(t("auth.connectionError"))
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
              width={480}
              height={120}
              alt="INVORA"
              className="h-14 w-auto mb-6"
            />
            <h1 className="text-2xl font-bold text-foreground">{t("auth.registerTitle")}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {t("auth.registerSubtitle")}
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
              <Label htmlFor="password" className="text-sm text-foreground">
                {t("auth.password")}
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={t("auth.passwordMinPlaceholder")}
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
                  aria-label={showPassword ? t("auth.hidePassword") : t("auth.showPassword")}
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
                {t("auth.confirmPassword")}
              </Label>
              <Input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                placeholder={t("auth.confirmPasswordPlaceholder")}
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
                  {t("auth.creatingAccount")}
                </>
              ) : (
                t("auth.registerTitle")
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            {t("auth.haveAccount")}{" "}
            <Link
              href="/login"
              className="text-primary hover:text-primary/80 font-medium transition-colors"
            >
              {t("auth.signIn")}
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
