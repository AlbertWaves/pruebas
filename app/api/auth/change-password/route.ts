import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import User from "@/models/User"

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const { userId, currentPassword, newPassword } = await request.json()

    // Buscar usuario
    const user = await User.findOne({ _id: userId })

    if (!user || user.contrasena !== currentPassword) {
      return NextResponse.json({ error: "Contraseña actual incorrecta" }, { status: 401 })
    }

    // Verificar que la nueva contraseña no sea la misma que la actual
    if (currentPassword === newPassword) {
      return NextResponse.json({ error: "La nueva contraseña debe ser diferente a la actual" }, { status: 400 })
    }

    // Verificar que la nueva contraseña no sea la por defecto
    if (newPassword === "123456789") {
      return NextResponse.json({ error: "No puede usar la contraseña por defecto" }, { status: 400 })
    }

    // Validar longitud mínima
    if (newPassword.length < 6) {
      return NextResponse.json({ error: "La contraseña debe tener al menos 6 caracteres" }, { status: 400 })
    }

    // Actualizar contraseña
    await User.findOneAndUpdate({ _id: userId }, { contrasena: newPassword })

    return NextResponse.json({ message: "Contraseña actualizada exitosamente" })
  } catch (error) {
    console.error("Error al cambiar contraseña:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
