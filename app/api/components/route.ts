import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Componentes from "@/models/Componentes"

export async function GET() {
  try {
    await connectDB()

    const components = await Componentes.find({}).lean()
    return NextResponse.json(components)
  } catch (error) {
    console.error("Error al obtener componentes:", error)
    return NextResponse.json({ error: "Error al obtener componentes" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    await connectDB()

    const { componentId, estado } = await request.json()

    const updatedComponent = await Componentes.findOneAndUpdate({ _id: componentId }, { estado }, { new: true }).lean()

    if (!updatedComponent) {
      return NextResponse.json({ error: "Componente no encontrado" }, { status: 404 })
    }

    return NextResponse.json(updatedComponent)
  } catch (error) {
    console.error("Error al actualizar componente:", error)
    return NextResponse.json({ error: "Error al actualizar componente" }, { status: 500 })
  }
}
