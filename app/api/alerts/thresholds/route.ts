import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import LogNotf from "@/models/LogNotf"
import Componentes from "@/models/Componentes"

export async function GET() {
  try {
    await connectToDatabase()

    // Obtener todas las alertas de umbrales
    const thresholdAlerts = await LogNotf.find({}).sort({ fechaHora: -1 }).lean()

    // Obtener todos los componentes para mapear nombres
    const componentes = await Componentes.find({}).lean()
    const componentesMap = new Map(componentes.map((comp) => [comp._id, comp.nombreComponente]))

    // Mapear las alertas con nombres de componentes
    const alertsWithNames = thresholdAlerts.map((alert) => ({
      _id: alert._id.toString(),
      fechaRegistro: alert.fechaHora,
      tipo: alert.tipo,
      valor: alert.valor,
      umbral: alert.umbral,
      condicion: alert.condicion,
      idComponente: alert.idComponente,
      nombreComponente: componentesMap.get(alert.idComponente) || `Componente ${alert.idComponente}`,
      mensaje: `${alert.tipo === "temperatura" ? "Temperatura" : "Humedad"} ${alert.condicion} al umbral: ${alert.valor}${alert.tipo === "temperatura" ? "°C" : "%"} (Límite: ${alert.umbral}${alert.tipo === "temperatura" ? "°C" : "%"})`,
    }))

    return NextResponse.json(alertsWithNames)
  } catch (error) {
    console.error("Error fetching threshold alerts:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
