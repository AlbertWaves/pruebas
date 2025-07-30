import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import User from "@/models/User"
import bcrypt from "bcryptjs"

export async function GET() {
  try {
    await connectDB()
    const users = await User.find({}).select("-contrasena")
    return NextResponse.json(users)
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Error al obtener usuarios" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const body = await request.json()

    // Validar campos requeridos
    const { nombre, primerApell, correo, numTel, contrasena, idRol } = body

    if (!nombre || !primerApell || !correo || !numTel || !contrasena) {
      return NextResponse.json({ error: "Todos los campos requeridos deben ser proporcionados" }, { status: 400 })
    }

    // Verificar si el correo ya existe
    const existingUser = await User.findOne({ correo })
    if (existingUser) {
      return NextResponse.json({ error: "El correo electrónico ya está registrado" }, { status: 400 })
    }

    // Generar nuevo ID
    const lastUser = await User.findOne().sort({ _id: -1 })
    const newId = lastUser ? lastUser._id + 1 : 1

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(contrasena, 10)

    // Crear usuario
    const newUser = new User({
      _id: newId,
      nombre,
      primerApell,
      segundoApell: body.segundoApell || "",
      numTel,
      correo,
      contrasena: hashedPassword,
      estado: true,
      idRol: idRol || 2,
    })

    await newUser.save()

    // Retornar usuario sin contraseña
    const userResponse = newUser.toObject()
    delete userResponse.contrasena

    return NextResponse.json(userResponse, { status: 201 })
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json({ error: "Error al crear usuario" }, { status: 500 })
  }
}
