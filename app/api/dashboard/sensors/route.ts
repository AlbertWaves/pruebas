import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Componentes from "@/models/Componentes"

export async function GET() {
  try {
    await connectDB()

    // Obtener todos los componentes
    const components = await Componentes.find({}).lean()

    // Separar sensores y actuadores
    const sensors = components.filter((comp) => comp.tipo === "sensor")
    const actuators = components.filter((comp) => comp.tipo === "actuador")

    // Crear objeto de estado compatible con el frontend existente
    const sensorStatus = {
      // Sensores DHT11
      edoDht11A: sensors.find((s) => s._id === 1)?.estado || false,
      edoDht11B: sensors.find((s) => s._id === 2)?.estado || false,

      // Actuadores
      edoHumificador: actuators.find((a) => a._id === 3)?.estado || false,
      edoVentilador: actuators.find((a) => a._id === 4)?.estado || false,
      edoCalefactor: actuators.find((a) => a._id === 5)?.estado || false,
    }

    return NextResponse.json(sensorStatus)
  } catch (error) {
    console.error("Error al obtener estado de componentes:", error)
    return NextResponse.json({ error: "Error al obtener estado de componentes" }, { status: 500 })
  }
}
