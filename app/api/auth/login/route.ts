import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import User from "@/models/User"

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const { email, password } = await request.json()

    // Buscar usuario por email
    const user = await User.findOne({ correo: email }).lean()

    if (!user || user.contrasena !== password) {
      return NextResponse.json({ error: "Credenciales incorrectas" }, { status: 401 })
    }

    // Remover contraseña de la respuesta
    const { contrasena, ...userWithoutPassword } = user

    return NextResponse.json({
      message: "Login exitoso",
      user: userWithoutPassword,
    })
  } catch (error) {
    console.error("Error en login:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
