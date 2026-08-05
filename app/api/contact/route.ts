import { NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"

const SUPPORT_EMAIL = "invoracr@gmail.com"

export async function POST(req: NextRequest) {
  try {
    const { nombre, email, asunto, mensaje } = await req.json()

    if (!nombre || !email || !asunto || !mensaje) {
      return NextResponse.json({ error: "Todos los campos son requeridos." }, { status: 400 })
    }

    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "Servicio de correo no configurado." }, { status: 503 })
    }

    const resend = new Resend(apiKey)

    const { error } = await resend.emails.send({
      from: "Invora Contacto <onboarding@resend.dev>",
      to: SUPPORT_EMAIL,
      replyTo: email,
      subject: `[Contacto Invora] ${asunto}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
          <h2 style="color: #7c3aed; margin-bottom: 24px;">Nuevo mensaje de contacto</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; font-weight: 600; color: #374151; width: 120px;">Nombre:</td>
              <td style="padding: 8px 0; color: #111827;">${nombre}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: 600; color: #374151;">Correo:</td>
              <td style="padding: 8px 0; color: #111827;">
                <a href="mailto:${email}" style="color: #7c3aed;">${email}</a>
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: 600; color: #374151;">Asunto:</td>
              <td style="padding: 8px 0; color: #111827;">${asunto}</td>
            </tr>
          </table>
          <hr style="margin: 24px 0; border: none; border-top: 1px solid #e5e7eb;" />
          <p style="font-weight: 600; color: #374151; margin-bottom: 8px;">Mensaje:</p>
          <p style="color: #111827; white-space: pre-wrap; line-height: 1.6;">${mensaje}</p>
          <hr style="margin: 24px 0; border: none; border-top: 1px solid #e5e7eb;" />
          <p style="font-size: 12px; color: #9ca3af;">
            Este correo fue enviado desde el formulario de contacto de
            <a href="https://invora.app" style="color: #7c3aed;">Invora</a>.
            Puedes responder directamente a este email para contactar a ${nombre}.
          </p>
        </div>
      `,
    })

    if (error) {
      console.error("[v0] Resend error:", error)
      return NextResponse.json({ error: "No se pudo enviar el mensaje. Intenta de nuevo." }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[v0] Contact route error:", err)
    return NextResponse.json({ error: "Error inesperado. Intenta de nuevo." }, { status: 500 })
  }
}
