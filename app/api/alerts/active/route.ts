import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import AlerActuadores from "@/models/AlerActuadores"
import Actuadores from "@/models/Actuadores"

export async function GET() {
  try {
    await connectDB()

    // Obtener alertas de las últimas 24 horas
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)

    const alerts = await AlerActuadores.find({
      fechaRegistro: { $gte: yesterday },
    })
      .sort({ fechaRegistro: -1 })
      .lean()

    // Obtener información de los actuadores
    const alertsWithActuators = await Promise.all(
      alerts.map(async (alert) => {
        const actuador = await Actuadores.findOne({ _id: alert.idActuador }).lean()
        return {
          ...alert,
          nombreActuador: actuador?.nombreActuador || "Actuador desconocido",
          tipo: "warning" as const,
          mensaje: `Se activó ${actuador?.nombreActuador || "actuador"}`,
        }
      }),
    )

    return NextResponse.json(alertsWithActuators)
  } catch (error) {
    console.error("Error al obtener alertas activas:", error)
    return NextResponse.json({ error: "Error al obtener alertas activas" }, { status: 500 })
  }
}
