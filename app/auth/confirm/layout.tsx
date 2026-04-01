import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Confirmar Correo - INVORA",
  description: "Confirma tu direccion de correo electronico para activar tu cuenta de INVORA.",
}

export default function ConfirmLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
