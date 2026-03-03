import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { queryOne } from "@/lib/db"
import { createSession } from "@/lib/auth"
import { cookies } from "next/headers"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email y contrasena son requeridos" },
        { status: 400 }
      )
    }

    const empresa = await queryOne<{
      id: string
      nombre: string
      email: string
      password_hash: string
      activo: boolean
    }>(
      "SELECT id, nombre, email, password_hash, activo FROM empresa WHERE email = $1",
      [email.toLowerCase().trim()]
    )

    if (!empresa) {
      return NextResponse.json(
        { error: "Credenciales invalidas" },
        { status: 401 }
      )
    }

    if (!empresa.activo) {
      return NextResponse.json(
        { error: "La cuenta esta desactivada" },
        { status: 403 }
      )
    }

    if (!empresa.password_hash) {
      return NextResponse.json(
        { error: "Esta cuenta no tiene contrasena configurada" },
        { status: 401 }
      )
    }

    const validPassword = await bcrypt.compare(password, empresa.password_hash)

    if (!validPassword) {
      return NextResponse.json(
        { error: "Credenciales invalidas" },
        { status: 401 }
      )
    }

    const token = await createSession({
      empresaId: empresa.id,
      empresaNombre: empresa.nombre,
      email: empresa.email,
    })

    const cookieStore = await cookies()
    cookieStore.set("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    })

    return NextResponse.json({
      success: true,
      empresa: {
        id: empresa.id,
        nombre: empresa.nombre,
        email: empresa.email,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    const message =
      error instanceof Error ? error.message : "Error interno del servidor"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
