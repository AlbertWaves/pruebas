import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import LogNotf from "@/models/LogNotf"
import AlerActuadores from "@/models/AlerActuadores"
import Componentes from "@/models/Componentes"

export async function GET() {
  try {
    await connectDB()

    // Obtener todas las alertas de LOGNOTF
    const logNotifications = await LogNotf.find({}).sort({ fechaHora: -1 }).limit(100).lean()

    // Obtener todas las alertas de actuadores
    const actuatorAlerts = await AlerActuadores.find({}).sort({ fechaRegistro: -1 }).limit(100).lean()

    // Obtener información de componentes
    const allComponentIds = [
      ...logNotifications.map((n) => n.idComponente),
      ...actuatorAlerts.map((a) => a.idComponente),
    ]
    const uniqueComponentIds = [...new Set(allComponentIds)]
    const componentes = await Componentes.find({ _id: { $in: uniqueComponentIds } }).lean()
    const componentMap = new Map(componentes.map((c) => [c._id, c]))

    // Formatear alertas de LOGNOTF
    const formattedLogAlerts = logNotifications.map((notification) => ({
      _id: notification._id.toString(),
      fechaRegistro: notification.fechaHora.toISOString(),
      idComponente: notification.idComponente,
      nombreComponente: componentMap.get(notification.idComponente)?.nombreComponente || "Componente desconocido",
      tipo: notification.valor > notification.umbral ? "critical" : "warning",
      mensaje: `${notification.tipo} ${notification.condicion} al umbral: ${notification.valor}${notification.tipo === "temperatura" ? "°C" : "%"} (límite: ${notification.umbral}${notification.tipo === "temperatura" ? "°C" : "%"})`,
      fuente: "sensor",
    }))

    // Formatear alertas de actuadores
    const formattedActuatorAlerts = actuatorAlerts.map((alert) => ({
      _id: alert._id.toString(),
      fechaRegistro: alert.fechaRegistro.toISOString(),
      idComponente: alert.idComponente,
      nombreComponente: componentMap.get(alert.idComponente)?.nombreComponente || "Actuador desconocido",
      tipo: "warning" as const,
      mensaje: `Se activó ${componentMap.get(alert.idComponente)?.nombreComponente || "actuador"}`,
      fuente: "actuador",
    }))

    // Combinar y ordenar todas las alertas
    const allAlerts = [...formattedLogAlerts, ...formattedActuatorAlerts].sort(
      (a, b) => new Date(b.fechaRegistro).getTime() - new Date(a.fechaRegistro).getTime(),
    )

    return NextResponse.json(allAlerts)
  } catch (error) {
    console.error("Error fetching alert history:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
