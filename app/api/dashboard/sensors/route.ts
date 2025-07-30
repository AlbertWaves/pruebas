import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import EdoSensores from "@/models/EdoSensores"

export async function GET() {
  try {
    await connectDB()

    // Obtener el estado de los sensores (solo hay uno)
    const edoSensores = await EdoSensores.findOne({ _id: 1 }).lean()

    if (!edoSensores) {
      return NextResponse.json({ error: "No se encontró estado de sensores" }, { status: 404 })
    }

    return NextResponse.json(edoSensores)
  } catch (error) {
    console.error("Error al obtener estado de sensores:", error)
    return NextResponse.json({ error: "Error al obtener estado de sensores" }, { status: 500 })
  }
}
