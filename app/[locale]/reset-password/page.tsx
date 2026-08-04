"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, Loader2, Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Auth3DScene } from "@/components/auth-3d-scene"
import { createClient } from "@/lib/supabase/client"
import { useTranslation } from "@/hooks/useTranslation"

type State = "validating" | "loading" | "form" | "success" | "error"

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { t } = useTranslation()
  const [state, setState] = useState<State>("validating")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [form, setForm] = useState({ password: "", confirmPassword: "" })
  const [error, setError] = useState("")

  useEffect(() => {
    const validateToken = async () => {
      try {
        const supabase = createClient()
        const { data } = await supabase.auth.getUser()

        if (!data.user) {
          setState("error")
          setError(t("auth.invalidResetLinkDesc"))
          return
        }

        setState("form")
      } catch (err) {
        console.error("[v0] Token validation error:", err)
        setState("error")
        setError(t("auth.invalidResetLinkDesc"))
      }
    }

    validateToken()
  }, [t])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!form.password.trim() || !form.confirmPassword.trim()) {
      setError(t("common.required"))
      return
    }

    if (form.password !== form.confirmPassword) {
      setError(t("auth.passwordMismatch"))
      return
    }

    if (form.password.length < 8) {
      setError(t("auth.passwordRequirements"))
      return
    }

    setState("loading")

    try {
      const supabase = createClient()

      const { error: updateError } = await supabase.auth.updateUser({
        password: form.password,
      })

      if (updateError) {
        setError(updateError.message || t("auth.connectionError"))
        setState("form")
        return
      }

      setState("success")
    } catch (err) {
      console.error("[v0] Reset password error:", err)
      setError(t("auth.connectionError"))
      setState("form")
    }
  }

  if (state === "validating") {
    return (
      <div className="relative min-h-screen flex items-center justify-center">
        <Auth3DScene variant="login" />
        <div className="relative z-10 flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">{t("common.loading")}</p>
        </div>
      </div>
    )
  }

  if (state === "error") {
    return (
      <div className="relative min-h-screen flex items-center justify-center">
        <Auth3DScene variant="login" />

        <div className="absolute top-6 left-6 z-20">
          <Link
            href="/login"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("common.backShort")}
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
              <div className="p-3 rounded-full bg-destructive/10 mb-4">
                <AlertCircle className="h-6 w-6 text-destructive" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">
                {t("auth.invalidResetLink")}
              </h1>
              <p className="text-sm text-muted-foreground mt-2 text-center">
                {error}
              </p>
            </div>

            <div className="space-y-3">
              <Button
                onClick={() => router.push("/forgot-password")}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-11"
              >
                {t("auth.requestNewLink")}
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/login")}
                className="w-full h-11"
              >
                {t("auth.goToLogin")}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  if (state === "success") {
    return (
      <div className="relative min-h-screen flex items-center justify-center">
        <Auth3DScene variant="login" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 w-full max-w-md mx-4"
        >
          <div className="glass-card rounded-2xl p-8">
            <div className="flex flex-col items-center mb-8">
              <div className="p-3 rounded-full bg-green-500/10 mb-4">
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">
                {t("auth.resetSuccess")}
              </h1>
              <p className="text-sm text-muted-foreground mt-2 text-center">
                {t("auth.resetSuccessDesc")}
              </p>
            </div>

            <Button
              onClick={() => router.push("/login")}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-11"
            >
              {t("auth.goToLogin")}
            </Button>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center">
      <Auth3DScene variant="login" />

      <div className="absolute top-6 left-6 z-20">
        <Link
          href="/login"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("common.backShort")}
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
            <h1 className="text-2xl font-bold text-foreground">
              {t("auth.resetPasswordTitle")}
            </h1>
            <p className="text-sm text-muted-foreground mt-2 text-center">
              {t("auth.resetPasswordSubtitle")}
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <Label htmlFor="password" className="text-sm text-foreground">
                {t("auth.newPassword")}
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={t("auth.newPasswordPlaceholder")}
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
              <p className="text-xs text-muted-foreground">
                {t("auth.passwordMinPlaceholder")}
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="confirm" className="text-sm text-foreground">
                {t("auth.confirmPassword")}
              </Label>
              <div className="relative">
                <Input
                  id="confirm"
                  type={showConfirm ? "text" : "password"}
                  placeholder={t("auth.confirmPasswordPlaceholder")}
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  required
                  className="bg-secondary/50 border-border/30 h-11 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showConfirm ? t("auth.hidePassword") : t("auth.showPassword")}
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={state === "loading"}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-11 mt-2"
            >
              {state === "loading" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("common.loading")}
                </>
              ) : (
                t("auth.resetPasswordBtn")
              )}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  )
}
