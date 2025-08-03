import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { db } = await connectDB()
    const userId = Number.parseInt(params.id)

    if (isNaN(userId)) {
      return NextResponse.json({ error: "ID de usuario inválido" }, { status: 400 })
    }

    // Verificar que el usuario existe
    const user = await db.collection("USUARIOS").findOne({ _id: userId })
    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    // Resetear la contraseña a la por defecto
    const result = await db.collection("USUARIOS").updateOne(
      { _id: userId },
      {
        $set: {
          contrasena: "123456789",
        },
      },
    )

    if (result.modifiedCount === 0) {
      return NextResponse.json({ error: "No se pudo resetear la contraseña" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Contraseña reseteada exitosamente a 123456789",
    })
  } catch (error) {
    console.error("Error al resetear contraseña:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
