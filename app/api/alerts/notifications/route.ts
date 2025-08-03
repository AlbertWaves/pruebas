import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import LogNotf from "@/models/LogNotf"
import Componentes from "@/models/Componentes"

export async function GET(request: Request) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const tipo = searchParams.get("tipo") // 'temperatura' o 'humedad'

    // Construir filtro
    const filter: any = {}
    if (tipo && (tipo === "temperatura" || tipo === "humedad")) {
      filter.tipo = tipo
    }

    // Obtener notificaciones
    const notifications = await LogNotf.find(filter).sort({ fechaHora: -1 }).limit(limit).lean()

    // Obtener información de componentes
    const notificationsWithComponents = await Promise.all(
      notifications.map(async (notification) => {
        const component = await Componentes.findOne({ _id: notification.idComponente }).lean()
        return {
          ...notification,
          nombreComponente: component?.nombreComponente || "Componente desconocido",
          tipoComponente: component?.tipo || "desconocido",
        }
      }),
    )

    return NextResponse.json(notificationsWithComponents)
  } catch (error) {
    console.error("Error al obtener notificaciones:", error)
    return NextResponse.json({ error: "Error al obtener notificaciones" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    await connectDB()

    const notificationData = await request.json()

    const newNotification = new LogNotf({
      fechaHora: new Date(),
      ...notificationData,
    })

    await newNotification.save()
    return NextResponse.json(newNotification, { status: 201 })
  } catch (error) {
    console.error("Error al crear notificación:", error)
    return NextResponse.json({ error: "Error al crear notificación" }, { status: 500 })
  }
}
