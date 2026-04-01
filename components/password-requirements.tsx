"use client"

import { Check, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface Requirement {
  label: string
  met: boolean
}

interface PasswordRequirementsProps {
  password: string
  visible: boolean
}

function getRequirements(password: string): Requirement[] {
  return [
    {
      label: "Al menos 8 caracteres",
      met: password.length >= 8,
    },
    {
      label: "Una letra mayuscula",
      met: /[A-Z]/.test(password),
    },
    {
      label: "Un caracter especial (!@#$%^&*...)",
      met: /[^A-Za-z0-9]/.test(password),
    },
  ]
}

export function getPasswordStrength(password: string): number {
  const requirements = getRequirements(password)
  return requirements.filter((r) => r.met).length
}

export function isPasswordValid(password: string): boolean {
  return getRequirements(password).every((r) => r.met)
}

export function PasswordRequirements({ password, visible }: PasswordRequirementsProps) {
  const requirements = getRequirements(password)
  const metCount = requirements.filter((r) => r.met).length
  const strengthPercent = (metCount / requirements.length) * 100

  const strengthColor =
    metCount === 0
      ? "bg-border"
      : metCount === 1
      ? "bg-red-400"
      : metCount === 2
      ? "bg-yellow-400"
      : "bg-green-400"

  const strengthLabel =
    metCount === 0
      ? ""
      : metCount === 1
      ? "Debil"
      : metCount === 2
      ? "Regular"
      : "Fuerte"

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, height: 0, marginTop: 0 }}
          animate={{ opacity: 1, height: "auto", marginTop: 8 }}
          exit={{ opacity: 0, height: 0, marginTop: 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="overflow-hidden"
        >
          <div className="rounded-lg border border-border/30 bg-secondary/30 px-4 py-3 flex flex-col gap-3">
            {/* Barra de fuerza */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-1.5 rounded-full bg-border/40 overflow-hidden">
                <motion.div
                  className={`h-full rounded-full transition-colors duration-300 ${strengthColor}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${strengthPercent}%` }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                />
              </div>
              {strengthLabel && (
                <span
                  className={`text-xs font-medium w-12 text-right transition-colors duration-300 ${
                    metCount === 1
                      ? "text-red-400"
                      : metCount === 2
                      ? "text-yellow-400"
                      : "text-green-400"
                  }`}
                >
                  {strengthLabel}
                </span>
              )}
            </div>

            {/* Lista de requisitos */}
            <ul className="flex flex-col gap-1.5">
              {requirements.map((req) => (
                <motion.li
                  key={req.label}
                  className="flex items-center gap-2"
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.15 }}
                >
                  <span
                    className={`flex items-center justify-center rounded-full w-4 h-4 shrink-0 transition-colors duration-300 ${
                      req.met
                        ? "bg-green-500/20 text-green-400"
                        : "bg-border/30 text-muted-foreground/50"
                    }`}
                  >
                    {req.met ? (
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    ) : (
                      <X className="w-2.5 h-2.5 stroke-[2.5]" />
                    )}
                  </span>
                  <span
                    className={`text-xs transition-colors duration-300 ${
                      req.met ? "text-green-400" : "text-muted-foreground"
                    }`}
                  >
                    {req.label}
                  </span>
                </motion.li>
              ))}
            </ul>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
