"use client"

import { useEffect, useState, Suspense } from "react"
import Link from "next/link"
import Image from "next/image"
import { useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { CheckCircle2, Mail, ArrowRight, Loader2, XCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StarsBackgroundCanvas } from "@/components/space-scene-canvas"
import { createClient } from "@/lib/supabase/client"
import { useTranslation } from "@/hooks/useTranslation"

type ConfirmationStatus = "loading" | "success" | "error" | "already_confirmed"

export default function EmailConfirmPage() {
  return (
    <Suspense fallback={<ConfirmPageFallback />}>
      <EmailConfirmContent />
    </Suspense>
  )
}

function ConfirmPageFallback() {
  return (
    <div className="relative min-h-screen flex items-center justify-center">
      <StarsBackgroundCanvas />
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="glass-card rounded-2xl p-8">
          <div className="flex flex-col items-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
            <p className="text-sm text-muted-foreground">...</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function EmailConfirmContent() {
  const searchParams = useSearchParams()
  const { t } = useTranslation()
  const [status, setStatus] = useState<ConfirmationStatus>("loading")
  const [errorMessage, setErrorMessage] = useState("")

  const tokenHash = searchParams.get("token_hash")
  const type = searchParams.get("type")
  const verified = searchParams.get("verified")
  const nextUrl = searchParams.get("next") ?? "/dashboard"

  useEffect(() => {
    async function confirmEmail() {
      if (verified === "true") {
        setStatus("success")
        return
      }

      if (!tokenHash || type !== "email") {
        setStatus("success")
        return
      }

      try {
        const supabase = createClient()

        const { error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: "email",
        })

        if (error) {
          if (error.message.includes("already") || error.message.includes("expired")) {
            setStatus("already_confirmed")
          } else {
            setErrorMessage(error.message)
            setStatus("error")
          }
        } else {
          setStatus("success")
        }
      } catch (err) {
        console.error("Email confirmation error:", err)
        setErrorMessage(t("auth.errorTitle"))
        setStatus("error")
      }
    }

    confirmEmail()
  }, [tokenHash, type, t])

  return (
    <div className="relative min-h-screen flex items-center justify-center">
      <StarsBackgroundCanvas />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <div className="glass-card rounded-2xl p-8">
          <div className="flex flex-col items-center mb-6">
            <Image
              src="/images/invora-logo.png"
              alt="INVORA"
              width={360}
              height={120}
              className="h-20 w-auto mb-6"
            />
          </div>

          {status === "loading" && <LoadingState t={t} />}
          {status === "success" && <SuccessState hasToken={!!tokenHash || verified === "true"} nextUrl={nextUrl} t={t} />}
          {status === "already_confirmed" && <AlreadyConfirmedState t={t} />}
          {status === "error" && <ErrorState message={errorMessage} t={t} />}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          {t("auth.needHelp")}{" "}
          <Link
            href="/soporte"
            className="text-primary hover:text-primary/80 font-medium transition-colors"
          >
            {t("auth.contactSupport")}
          </Link>
        </p>
      </motion.div>
    </div>
  )
}

function LoadingState({ t }: { t: (key: string) => string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center text-center"
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 border border-primary/20 mb-6">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
      <h1 className="text-xl font-bold text-foreground mb-2">
        {t("auth.confirmVerifying")}
      </h1>
      <p className="text-sm text-muted-foreground">
        {t("auth.confirmVerifyingDesc")}
      </p>
    </motion.div>
  )
}

function SuccessState({ hasToken, nextUrl = "/dashboard", t }: { hasToken: boolean; nextUrl?: string; t: (key: string) => string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
        className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6"
      >
        {hasToken ? (
          <CheckCircle2 className="h-8 w-8 text-emerald-500" />
        ) : (
          <Mail className="h-8 w-8 text-primary" />
        )}
      </motion.div>

      <h1 className="text-xl font-bold text-foreground mb-2">
        {hasToken ? t("auth.confirmVerified") : t("auth.confirmEmailSent")}
      </h1>

      <p className="text-sm text-muted-foreground mb-6 max-w-sm">
        {hasToken
          ? t("auth.confirmSuccess")
          : t("auth.confirmEmailSentDesc")
        }
      </p>

      {!hasToken && (
        <div className="w-full rounded-lg bg-secondary/50 p-4 mb-6">
          <p className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground">{t("auth.confirmTip")}:</span>{" "}
            {t("auth.confirmTipText")}
          </p>
        </div>
      )}

      <div className="flex flex-col gap-3 w-full">
        <Link href={hasToken ? nextUrl : "/login"} className="w-full">
          <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-11 gap-2">
            {hasToken ? t("auth.confirmGoToDashboard") : t("auth.confirmGoToLogin")}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>

        {!hasToken && (
          <Link href="/" className="w-full">
            <Button variant="outline" className="w-full border-border/30 h-11">
              {t("auth.confirmBackHome")}
            </Button>
          </Link>
        )}
      </div>
    </motion.div>
  )
}

function AlreadyConfirmedState({ t }: { t: (key: string) => string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center text-center"
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/10 border border-blue-500/20 mb-6">
        <CheckCircle2 className="h-8 w-8 text-blue-500" />
      </div>

      <h1 className="text-xl font-bold text-foreground mb-2">
        {t("auth.alreadyVerifiedTitle")}
      </h1>

      <p className="text-sm text-muted-foreground mb-6 max-w-sm">
        {t("auth.alreadyVerifiedDesc")}
      </p>

      <div className="flex flex-col gap-3 w-full">
        <Link href="/login" className="w-full">
          <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-11 gap-2">
            {t("auth.loginTitle")}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
        <Link href="/" className="w-full">
          <Button variant="outline" className="w-full border-border/30 h-11">
            {t("auth.confirmBackHome")}
          </Button>
        </Link>
      </div>
    </motion.div>
  )
}

function ErrorState({ message, t }: { message: string; t: (key: string) => string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center text-center"
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 border border-destructive/20 mb-6">
        <XCircle className="h-8 w-8 text-destructive" />
      </div>

      <h1 className="text-xl font-bold text-foreground mb-2">
        {t("auth.errorTitle")}
      </h1>

      <p className="text-sm text-muted-foreground mb-4 max-w-sm">
        {t("auth.errorDesc")}
      </p>

      {message && (
        <div className="w-full rounded-lg bg-destructive/10 border border-destructive/20 p-3 mb-6">
          <p className="text-xs text-red-400">{message}</p>
        </div>
      )}

      <div className="w-full rounded-lg bg-secondary/50 p-4 mb-6">
        <p className="text-xs text-muted-foreground mb-2 font-medium">{t("auth.errorSolutions")}</p>
        <ul className="text-xs text-muted-foreground space-y-1 ml-4 list-disc text-left">
          <li>{t("auth.errorSol1")}</li>
          <li>{t("auth.errorSol2")}</li>
          <li>{t("auth.errorSol3")}</li>
        </ul>
      </div>

      <div className="flex flex-col gap-3 w-full">
        <Link href="/register" className="w-full">
          <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-11 gap-2">
            <RefreshCw className="h-4 w-4" />
            {t("auth.registerAgain")}
          </Button>
        </Link>
        <Link href="/login" className="w-full">
          <Button variant="outline" className="w-full border-border/30 h-11">
            {t("auth.loginTitle")}
          </Button>
        </Link>
      </div>
    </motion.div>
  )
}
