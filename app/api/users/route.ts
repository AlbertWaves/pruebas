import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import User from "@/models/User"

export async function GET() {
  try {
    await connectDB()

    const users = await User.find({}, { contrasena: 0 }).lean()

    return NextResponse.json(users)
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const userData = await request.json()

    // Validar campos requeridos
    const requiredFields = ["nombre", "primerApell", "numTel", "correo", "idRol"]
    for (const field of requiredFields) {
      if (!userData[field]) {
        return NextResponse.json({ error: `El campo ${field} es requerido` }, { status: 400 })
      }
    }

    // Verificar si el correo ya existe
    const existingUserByEmail = await User.findOne({ correo: userData.correo })
    if (existingUserByEmail) {
      return NextResponse.json({ error: "El correo electrónico ya está registrado" }, { status: 400 })
    }

    // Verificar si el número de teléfono ya existe
    const existingUserByPhone = await User.findOne({ numTel: userData.numTel })
    if (existingUserByPhone) {
      return NextResponse.json({ error: "El número de teléfono ya está registrado" }, { status: 400 })
    }

    // Obtener el siguiente ID
    const lastUser = await User.findOne({}, {}, { sort: { _id: -1 } })
    const nextId = lastUser ? lastUser._id + 1 : 1

    // Crear usuario con contraseña por defecto
    const newUser = new User({
      _id: nextId,
      nombre: userData.nombre,
      primerApell: userData.primerApell,
      segundoApell: userData.segundoApell || "",
      numTel: userData.numTel,
      correo: userData.correo,
      contrasena: "123456789", // Contraseña por defecto
      estado: true, // Activo por defecto
      idRol: userData.idRol,
    })

    await newUser.save()

    // Remover contraseña de la respuesta
    const { contrasena, ...userWithoutPassword } = newUser.toObject()

    return NextResponse.json({
      message: "Usuario creado exitosamente",
      user: userWithoutPassword,
    })
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
