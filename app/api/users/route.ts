import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import User from "@/models/User"

export async function GET() {
  try {
    await connectDB()

    const users = await User.find({}, { contrasena: 0 }).lean()
    return NextResponse.json(users)
  } catch (error) {
    console.error("Error al obtener usuarios:", error)
    return NextResponse.json({ error: "Error al obtener usuarios" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const userData = await request.json()

    // Verificar si el email ya existe
    const existingUser = await User.findOne({ correo: userData.correo })
    if (existingUser) {
      return NextResponse.json({ error: "El correo electrónico ya está registrado" }, { status: 400 })
    }

    // Obtener el siguiente ID
    const lastUser = await User.findOne().sort({ _id: -1 }).lean()
    const nextId = lastUser ? lastUser._id + 1 : 1

    const newUser = new User({
      _id: nextId,
      ...userData,
      estado: true, // Por defecto activo
    })

    await newUser.save()

    // Retornar sin contraseña
    const { contrasena, ...userWithoutPassword } = newUser.toObject()
    return NextResponse.json(userWithoutPassword, { status: 201 })
  } catch (error) {
    console.error("Error al crear usuario:", error)
    return NextResponse.json({ error: "Error al crear usuario" }, { status: 500 })
  }
}
