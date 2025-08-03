import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import LogNotf from "@/models/LogNotf"
import Componentes from "@/models/Componentes"

export async function GET() {
  try {
    await connectDB()

    // Obtener alertas de las últimas 24 horas
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)

    const alerts = await LogNotf.find({
      fechaHora: { $gte: yesterday },
    })
      .sort({ fechaHora: -1 })
      .lean()

    // Obtener información de los componentes
    const alertsWithComponents = await Promise.all(
      alerts.map(async (alert) => {
        const component = await Componentes.findOne({ _id: alert.idComponente }).lean()
        return {
          ...alert,
          nombreComponente: component?.nombreComponente || "Componente desconocido",
          tipo:
            alert.tipo === "temperatura" && (alert.condicion === "mayor" || alert.condicion === "menor")
              ? "critical"
              : "warning",
          mensaje: `${alert.tipo === "temperatura" ? "Temperatura" : "Humedad"} ${alert.condicion} al umbral (${alert.valor}${alert.tipo === "temperatura" ? "°C" : "%"})`,
        }
      }),
    )

    return NextResponse.json(alertsWithComponents)
  } catch (error) {
    console.error("Error al obtener alertas activas:", error)
    return NextResponse.json({ error: "Error al obtener alertas activas" }, { status: 500 })
  }
}
