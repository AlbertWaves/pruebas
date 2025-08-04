import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import AlerActuadores from "@/models/AlerActuadores"
import Componentes from "@/models/Componentes"

export async function GET() {
  try {
    await connectToDatabase()

    // Obtener todas las alertas de actuadores
    const actuatorAlerts = await AlerActuadores.find({}).sort({ fechaRegistro: -1 }).lean()

    // Obtener todos los componentes para mapear nombres
    const componentes = await Componentes.find({}).lean()
    const componentesMap = new Map(componentes.map((comp) => [comp._id, comp.nombreComponente]))

    // Mapear las alertas con nombres de componentes
    const alertsWithNames = actuatorAlerts.map((alert) => ({
      _id: alert._id.toString(),
      fechaRegistro: alert.fechaRegistro,
      idActuador: alert.idActuador,
      nombreActuador: componentesMap.get(alert.idActuador) || `Actuador ${alert.idActuador}`,
      tipo: "warning" as const,
      mensaje: `Actuador ${componentesMap.get(alert.idActuador) || alert.idActuador} activado`,
    }))

    return NextResponse.json(alertsWithNames)
  } catch (error) {
    console.error("Error fetching actuator alerts:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
