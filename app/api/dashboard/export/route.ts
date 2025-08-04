import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import HistorialTemp from "@/models/HistorialTemp"
import HistorialHum from "@/models/HistorialHum"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const range = searchParams.get("range") || "24h"
    const format = searchParams.get("format") || "json"

    // Calcular fecha de inicio
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

    // Obtener datos
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

    // Combinar datos
    const exportData = []
    const tempMap = new Map()
    const humMap = new Map()

    tempData.forEach((item) => {
      const timeKey = item.fechaRegistro.toISOString()
      tempMap.set(timeKey, item.temperatura)
    })

    humData.forEach((item) => {
      const timeKey = item.fechaRegistro.toISOString()
      humMap.set(timeKey, item.humedad)
    })

    const allTimeKeys = new Set([...tempMap.keys(), ...humMap.keys()])

    Array.from(allTimeKeys)
      .sort()
      .forEach((timeKey) => {
        const date = new Date(timeKey)
        exportData.push({
          fecha: date.toLocaleDateString("es-ES"),
          hora: date.toLocaleTimeString("es-ES"),
          temperatura: tempMap.get(timeKey) || null,
          humedad: humMap.get(timeKey) || null,
        })
      })

    if (format === "csv") {
      // Generar CSV
      const csvHeader = "Fecha,Hora,Temperatura,Humedad\n"
      const csvData = exportData
        .map((row) => `${row.fecha},${row.hora},${row.temperatura || ""},${row.humedad || ""}`)
        .join("\n")

      return new NextResponse(csvHeader + csvData, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="datos_hermetia_${range}.csv"`,
        },
      })
    }

    // Retornar JSON por defecto
    return NextResponse.json(exportData, {
      headers: {
        "Content-Disposition": `attachment; filename="datos_hermetia_${range}.json"`,
      },
    })
  } catch (error) {
    console.error("Error al exportar datos:", error)
    return NextResponse.json({ error: "Error al exportar datos" }, { status: 500 })
  }
}
