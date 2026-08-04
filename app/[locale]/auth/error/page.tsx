"use client"

import Link from "next/link"
import { AlertTriangle, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StarsBackgroundCanvas } from "@/components/space-scene-canvas"
import { useTranslation } from "@/hooks/useTranslation"

export default function AuthErrorPage() {
  const { t } = useTranslation()

  return (
    <div className="relative min-h-screen flex items-center justify-center">
      <StarsBackgroundCanvas />

      <div className="absolute top-6 left-6 z-20">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("common.back")}
        </Link>
      </div>

      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="glass-card rounded-2xl p-8 text-center">
          <div className="flex flex-col items-center gap-4 mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 border border-destructive/20">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">{t("auth.authErrorTitle")}</h1>
            <p className="text-sm text-muted-foreground max-w-sm">
              {t("auth.authErrorDesc")}
            </p>
          </div>

          <div className="space-y-3 mb-6">
            <div className="rounded-lg bg-secondary/50 p-4 text-left">
              <p className="text-xs text-muted-foreground mb-2 font-medium">
                {t("auth.authErrorCauses")}
              </p>
              <ul className="text-xs text-muted-foreground space-y-1 ml-4 list-disc">
                <li>{t("auth.authErrorCause1")}</li>
                <li>{t("auth.authErrorCause2")}</li>
                <li>{t("auth.authErrorCause3")}</li>
                <li>{t("auth.authErrorCause4")}</li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Link href="/login" className="w-full">
              <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                {t("auth.tryAgain")}
              </Button>
            </Link>
            <Link href="/register" className="w-full">
              <Button variant="outline" className="w-full border-border/30">
                {t("auth.createNewAccount")}
              </Button>
            </Link>
          </div>

          <p className="text-xs text-muted-foreground mt-6">
            {t("auth.needHelp")}{" "}
            <Link href="/contacto" className="text-primary hover:text-primary/80 font-medium">
              {t("auth.contactUs")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
