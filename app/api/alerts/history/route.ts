import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import AlerActuadores from "@/models/AlerActuadores"
import Actuadores from "@/models/Actuadores"

export async function GET() {
  try {
    await connectDB()

    // Obtener historial de alertas (últimos 30 días)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const alerts = await AlerActuadores.find({
      fechaRegistro: { $gte: thirtyDaysAgo },
    })
      .sort({ fechaRegistro: -1 })
      .limit(50)
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
    console.error("Error al obtener historial de alertas:", error)
    return NextResponse.json({ error: "Error al obtener historial de alertas" }, { status: 500 })
  }
}
