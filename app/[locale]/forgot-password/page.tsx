"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, Loader2, CheckCircle, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Auth3DScene } from "@/components/auth-3d-scene"
import { createClient } from "@/lib/supabase/client"
import { useTranslation } from "@/hooks/useTranslation"

type Step = "request" | "sent"

export default function ForgotPasswordPage() {
  const router = useRouter()
  const { t } = useTranslation()
  const [step, setStep] = useState<Step>("request")
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      if (!email.trim()) {
        setError(t("auth.emailPlaceholder"))
        return
      }

      const supabase = createClient()

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email.toLowerCase().trim(),
        {
          redirectTo: `${window.location.origin}/reset-password`,
        }
      )

      if (resetError) {
        setError(resetError.message || t("auth.connectionError"))
        return
      }

      setStep("sent")
    } catch (err) {
      console.error("[v0] Reset password error:", err)
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
          {step === "request" ? (
            <>
              <div className="flex flex-col items-center mb-8">
                <div className="p-3 rounded-full bg-primary/10 mb-4">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <h1 className="text-2xl font-bold text-foreground">
                  {t("auth.forgotPasswordTitle")}
                </h1>
                <p className="text-sm text-muted-foreground mt-2 text-center">
                  {t("auth.forgotPasswordSubtitle")}
                </p>
              </div>

              {error && (
                <div className="mb-4 rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-red-400">
                  {error}
                </div>
              )}

              <form onSubmit={handleRequestReset} className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="email" className="text-sm text-foreground">
                    {t("auth.email")}
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder={t("auth.emailPlaceholder")}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                      {t("common.loading")}
                    </>
                  ) : (
                    t("auth.sendResetLink")
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
            </>
          ) : (
            <>
              <div className="flex flex-col items-center mb-8">
                <div className="p-3 rounded-full bg-green-500/10 mb-4">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                </div>
                <h1 className="text-2xl font-bold text-foreground">
                  {t("auth.resetSent")}
                </h1>
                <p className="text-sm text-muted-foreground mt-2 text-center">
                  {t("auth.resetSentDesc")}
                </p>
              </div>

              <div className="bg-secondary/30 rounded-lg p-4 mb-6 border border-border/30">
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground block mb-1">
                    {t("auth.confirmTip")}:
                  </span>
                  {t("auth.confirmTipText")}
                </p>
              </div>

              <Button
                onClick={() => router.push("/login")}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-11"
              >
                {t("auth.goToLogin")}
              </Button>

              <button
                onClick={() => {
                  setStep("request")
                  setEmail("")
                  setError("")
                }}
                className="w-full mt-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {t("auth.requestNewLink")}
              </button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  )
}
