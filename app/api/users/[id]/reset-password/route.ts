import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import User from "@/models/User"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()

    const userId = Number.parseInt(params.id)

    // Verificar que el usuario existe
    const user = await User.findOne({ _id: userId })

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    // Resetear contraseña a la por defecto
    await User.findOneAndUpdate({ _id: userId }, { contrasena: "123456789" })

    return NextResponse.json({
      message: "Contraseña reseteada exitosamente",
      defaultPassword: "123456789",
    })
  } catch (error) {
    console.error("Error resetting password:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
