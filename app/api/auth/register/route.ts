import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { query, queryOne } from "@/lib/db"
import { createSession } from "@/lib/auth"
import { cookies } from "next/headers"

export async function POST(request: Request) {
  try {
    const { nombre, email, password } = await request.json()

    if (!nombre || !email || !password) {
      return NextResponse.json(
        { error: "Todos los campos son requeridos" },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "La contrasena debe tener al menos 6 caracteres" },
        { status: 400 }
      )
    }

    const existing = await queryOne(
      "SELECT id FROM empresa WHERE email = $1",
      [email.toLowerCase().trim()]
    )

    if (existing) {
      return NextResponse.json(
        { error: "Ya existe una cuenta con este correo" },
        { status: 409 }
      )
    }

    const passwordHash = await bcrypt.hash(password, 12)

    const rows = await query<{ id: string; nombre: string; email: string }>(
      `INSERT INTO empresa (nombre, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, nombre, email`,
      [nombre.trim(), email.toLowerCase().trim(), passwordHash]
    )

    const empresa = rows[0]

    // Create some default categories for the new empresa
    await query(
      `INSERT INTO categoria (id_empresa, nombre, descripcion)
       VALUES ($1, 'General', 'Categoria general'),
              ($1, 'Alimentos', 'Productos alimenticios'),
              ($1, 'Bebidas', 'Bebidas y liquidos'),
              ($1, 'Limpieza', 'Productos de limpieza')`,
      [empresa.id]
    )

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
    console.error("Register error:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
