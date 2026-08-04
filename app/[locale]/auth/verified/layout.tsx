import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Cuenta Confirmada | INVORA",
  description: "Tu cuenta de INVORA ha sido verificada exitosamente",
}

export default function VerifiedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
