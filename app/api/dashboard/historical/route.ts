import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import HistorialTemp from "@/models/HistorialTemp"
import HistorialHum from "@/models/HistorialHum"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    await connectDB()

    const url = new URL(request.url)
    const range = url.searchParams.get("range") || "24h"

    const startDate = new Date()

    switch (range) {
      case "24h":
        startDate.setHours(startDate.getHours() - 24)
        break
      case "7d":
        startDate.setDate(startDate.getDate() - 7)
        break
      case "30d":
        startDate.setDate(startDate.getDate() - 30)
        break
      default:
        startDate.setHours(startDate.getHours() - 24)
    }

    // Obtener datos de temperatura y humedad
    const [tempData, humData] = await Promise.all([
      HistorialTemp.find({
        fechaRegistro: { $gte: startDate },
      })
        .sort({ fechaRegistro: 1 })
        .limit(100),
      HistorialHum.find({
        fechaRegistro: { $gte: startDate },
      })
        .sort({ fechaRegistro: 1 })
        .limit(100),
    ])

    // Combinar datos por timestamp
    const combinedData = []
    const tempMap = new Map()
    const humMap = new Map()

    // Crear mapas por timestamp
    tempData.forEach((item) => {
      const timeKey = new Date(item.fechaRegistro).toISOString().slice(0, 16) // YYYY-MM-DDTHH:MM
      tempMap.set(timeKey, item.valorTemperatura)
    })

    humData.forEach((item) => {
      const timeKey = new Date(item.fechaRegistro).toISOString().slice(0, 16)
      humMap.set(timeKey, item.valorHumedad)
    })

    // Combinar datos
    const allTimeKeys = new Set([...tempMap.keys(), ...humMap.keys()])

    Array.from(allTimeKeys)
      .sort()
      .forEach((timeKey) => {
        const date = new Date(timeKey)
        combinedData.push({
          time: date.toLocaleTimeString("es-ES", {
            hour: "2-digit",
            minute: "2-digit",
            day: "2-digit",
            month: "2-digit",
          }),
          temperatura: tempMap.get(timeKey) || 0,
          humedad: humMap.get(timeKey) || 0,
        })
      })

    return NextResponse.json(combinedData.slice(-50)) // Últimos 50 puntos
  } catch (error) {
    console.error("Error al obtener datos históricos:", error)
    return NextResponse.json({ error: "Error al obtener datos históricos" }, { status: 500 })
  }
}
