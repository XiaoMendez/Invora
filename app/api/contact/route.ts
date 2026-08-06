import { NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"

const SUPPORT_EMAIL = "invoracr@gmail.com"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { nombre, email, asunto, mensaje } = body

    if (!nombre?.trim() || !email?.trim() || !asunto?.trim() || !mensaje?.trim()) {
      return NextResponse.json(
        { error: "Todos los campos son requeridos." },
        { status: 400 }
      )
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "El correo electrónico no es válido." },
        { status: 400 }
      )
    }

    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      console.error("[contact] RESEND_API_KEY is not set")
      return NextResponse.json(
        { error: "Servicio de correo no configurado." },
        { status: 503 }
      )
    }

    const resend = new Resend(apiKey)

    const { data, error } = await resend.emails.send({
      from: "Invora Contacto <noreply@invorastock.com>",
      to: [SUPPORT_EMAIL],
      reply_to: email,
      subject: `[Contacto Invora] ${asunto}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px; background: #ffffff;">
          <div style="margin-bottom: 32px;">
            <h1 style="font-size: 22px; font-weight: 700; color: #7c3aed; margin: 0 0 4px;">INVORA</h1>
            <p style="font-size: 14px; color: #6b7280; margin: 0;">Nuevo mensaje desde el formulario de contacto</p>
          </div>

          <div style="background: #f9fafb; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 6px 0; font-size: 13px; font-weight: 600; color: #374151; width: 100px; vertical-align: top;">Nombre</td>
                <td style="padding: 6px 0; font-size: 13px; color: #111827;">${nombre}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-size: 13px; font-weight: 600; color: #374151; vertical-align: top;">Correo</td>
                <td style="padding: 6px 0; font-size: 13px;">
                  <a href="mailto:${email}" style="color: #7c3aed; text-decoration: none;">${email}</a>
                </td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-size: 13px; font-weight: 600; color: #374151; vertical-align: top;">Asunto</td>
                <td style="padding: 6px 0; font-size: 13px; color: #111827;">${asunto}</td>
              </tr>
            </table>
          </div>

          <div style="margin-bottom: 24px;">
            <p style="font-size: 13px; font-weight: 600; color: #374151; margin: 0 0 8px;">Mensaje</p>
            <div style="background: #f9fafb; border-left: 3px solid #7c3aed; border-radius: 0 8px 8px 0; padding: 16px;">
              <p style="font-size: 14px; color: #111827; white-space: pre-wrap; line-height: 1.6; margin: 0;">${mensaje}</p>
            </div>
          </div>

          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
          <p style="font-size: 12px; color: #9ca3af; margin: 0;">
            Enviado desde el formulario de contacto de
            <a href="https://invora.app" style="color: #7c3aed; text-decoration: none;">invora.app</a>.
            Responde directamente a este correo para contactar a ${nombre}.
          </p>
        </div>
      `,
    })

    if (error) {
      console.error("[contact] Resend error:", JSON.stringify(error))
      return NextResponse.json(
        { error: "No se pudo enviar el mensaje. Intenta de nuevo más tarde." },
        { status: 500 }
      )
    }

    console.log("[contact] Email sent successfully, id:", data?.id)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[contact] Unexpected error:", err)
    return NextResponse.json(
      { error: "Error inesperado. Intenta de nuevo." },
      { status: 500 }
    )
  }
}
