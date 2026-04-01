"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { CheckCircle2, Mail, ArrowRight, Loader2, XCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StarsBackgroundCanvas } from "@/components/space-scene-canvas"
import { createClient } from "@/lib/supabase/client"

type ConfirmationStatus = "loading" | "success" | "error" | "already_confirmed"

export default function EmailConfirmPage() {
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<ConfirmationStatus>("loading")
  const [errorMessage, setErrorMessage] = useState("")

  const tokenHash = searchParams.get("token_hash")
  const type = searchParams.get("type")
  const verified = searchParams.get("verified")
  const nextUrl = searchParams.get("next") ?? "/dashboard"

  useEffect(() => {
    async function confirmEmail() {
      // If coming from callback with verified=true, show success
      if (verified === "true") {
        setStatus("success")
        return
      }

      if (!tokenHash || type !== "email") {
        // No token - show the "check your email" state
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
        setErrorMessage("Error al verificar el correo")
        setStatus("error")
      }
    }

    confirmEmail()
  }, [tokenHash, type])

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
              width={300}
              height={100}
              className="h-16 w-auto mb-6"
            />
          </div>

          {status === "loading" && <LoadingState />}
          {status === "success" && <SuccessState hasToken={!!tokenHash || verified === "true"} nextUrl={nextUrl} />}
          {status === "already_confirmed" && <AlreadyConfirmedState />}
          {status === "error" && <ErrorState message={errorMessage} />}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          {"Necesitas ayuda? "}
          <Link
            href="/soporte"
            className="text-primary hover:text-primary/80 font-medium transition-colors"
          >
            Contacta con soporte
          </Link>
        </p>
      </motion.div>
    </div>
  )
}

function LoadingState() {
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
        Verificando tu correo
      </h1>
      <p className="text-sm text-muted-foreground">
        Por favor espera mientras confirmamos tu direccion de correo electronico...
      </p>
    </motion.div>
  )
}

function SuccessState({ hasToken, nextUrl = "/dashboard" }: { hasToken: boolean; nextUrl?: string }) {
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
        {hasToken ? "Correo verificado" : "Revisa tu correo"}
      </h1>

      <p className="text-sm text-muted-foreground mb-6 max-w-sm">
        {hasToken
          ? "Tu direccion de correo ha sido confirmada exitosamente. Ya puedes acceder a todas las funciones de INVORA."
          : "Te hemos enviado un enlace de confirmacion. Por favor revisa tu bandeja de entrada y haz clic en el enlace para activar tu cuenta."
        }
      </p>

      {!hasToken && (
        <div className="w-full rounded-lg bg-secondary/50 p-4 mb-6">
          <p className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground">Consejo:</span> Si no encuentras el correo, revisa tu carpeta de spam o correo no deseado.
          </p>
        </div>
      )}

      <div className="flex flex-col gap-3 w-full">
        <Link href={hasToken ? nextUrl : "/login"} className="w-full">
          <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-11 gap-2">
            {hasToken ? "Ir al Dashboard" : "Ir a Iniciar Sesion"}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
        
        {!hasToken && (
          <Link href="/" className="w-full">
            <Button variant="outline" className="w-full border-border/30 h-11">
              Volver al Inicio
            </Button>
          </Link>
        )}
      </div>
    </motion.div>
  )
}

function AlreadyConfirmedState() {
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
        Correo ya verificado
      </h1>

      <p className="text-sm text-muted-foreground mb-6 max-w-sm">
        Tu direccion de correo ya fue verificada anteriormente. Puedes iniciar sesion para acceder a tu cuenta.
      </p>

      <div className="flex flex-col gap-3 w-full">
        <Link href="/login" className="w-full">
          <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-11 gap-2">
            Iniciar Sesion
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
        <Link href="/" className="w-full">
          <Button variant="outline" className="w-full border-border/30 h-11">
            Volver al Inicio
          </Button>
        </Link>
      </div>
    </motion.div>
  )
}

function ErrorState({ message }: { message: string }) {
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
        Error de verificacion
      </h1>

      <p className="text-sm text-muted-foreground mb-4 max-w-sm">
        No pudimos verificar tu correo electronico. El enlace puede haber expirado o ser invalido.
      </p>

      {message && (
        <div className="w-full rounded-lg bg-destructive/10 border border-destructive/20 p-3 mb-6">
          <p className="text-xs text-red-400">{message}</p>
        </div>
      )}

      <div className="w-full rounded-lg bg-secondary/50 p-4 mb-6">
        <p className="text-xs text-muted-foreground mb-2 font-medium">Posibles soluciones:</p>
        <ul className="text-xs text-muted-foreground space-y-1 ml-4 list-disc text-left">
          <li>Solicita un nuevo enlace de verificacion</li>
          <li>Asegurate de usar el enlace mas reciente</li>
          <li>Intenta registrarte de nuevo</li>
        </ul>
      </div>

      <div className="flex flex-col gap-3 w-full">
        <Link href="/register" className="w-full">
          <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-11 gap-2">
            <RefreshCw className="h-4 w-4" />
            Registrarse de Nuevo
          </Button>
        </Link>
        <Link href="/login" className="w-full">
          <Button variant="outline" className="w-full border-border/30 h-11">
            Ir a Iniciar Sesion
          </Button>
        </Link>
      </div>
    </motion.div>
  )
}
