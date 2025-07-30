import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import HistorialTemp from "@/models/HistorialTemp"
import HistorialHum from "@/models/HistorialHum"

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const range = searchParams.get("range") || "24h"

    // Calcular fecha de inicio basada en el rango
    const now = new Date()
    const startDate = new Date()

    switch (range) {
      case "24h":
        startDate.setHours(now.getHours() - 24)
        break
      case "7d":
        startDate.setDate(now.getDate() - 7)
        break
      case "30d":
        startDate.setDate(now.getDate() - 30)
        break
      default:
        startDate.setHours(now.getHours() - 24)
    }

    // Obtener datos de temperatura y humedad
    const [tempData, humData] = await Promise.all([
      HistorialTemp.find({
        idInfoIncubadora: 1,
        fechaRegistro: { $gte: startDate },
      })
        .sort({ fechaRegistro: 1 })
        .lean(),

      HistorialHum.find({
        idInfoIncubadora: 1,
        fechaRegistro: { $gte: startDate },
      })
        .sort({ fechaRegistro: 1 })
        .lean(),
    ])

    // Combinar datos por timestamp
    const combinedData = []
    const tempMap = new Map()
    const humMap = new Map()

    // Crear mapas por timestamp
    tempData.forEach((item) => {
      const timeKey = new Date(item.fechaRegistro).toISOString().slice(0, 16) // YYYY-MM-DDTHH:MM
      tempMap.set(timeKey, item.temperatura)
    })

    humData.forEach((item) => {
      const timeKey = new Date(item.fechaRegistro).toISOString().slice(0, 16)
      humMap.set(timeKey, item.humedad)
    })

    // Combinar datos
    const allTimeKeys = new Set([...tempMap.keys(), ...humMap.keys()])

    Array.from(allTimeKeys)
      .sort()
      .forEach((timeKey) => {
        const date = new Date(timeKey)
        combinedData.push({
          time: date.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
          temperatura: tempMap.get(timeKey) || 0,
          humedad: humMap.get(timeKey) || 0,
        })
      })

    return NextResponse.json(combinedData.slice(-50)) // Últimos 50 registros
  } catch (error) {
    console.error("Error al obtener datos históricos:", error)
    return NextResponse.json({ error: "Error al obtener datos históricos" }, { status: 500 })
  }
}
