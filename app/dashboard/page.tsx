"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import {
  Thermometer,
  Droplets,
  Activity,
  Bell,
  Download,
  FileSpreadsheet,
  FileJson,
  FileText,
  RefreshCw,
  BarChart3,
  TrendingUp,
} from "lucide-react"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"

interface SensorData {
  _id: string
  nombreComponente: string
  tipo: string
  estado: boolean
}

interface CurrentData {
  temperatura: number
  humedad: number
  fechaActualizacion: string
}

interface HistoricalData {
  fecha: string
  temperatura: number
  humedad: number
}

interface Config {
  tempMin: number
  tempMax: number
  humedadMin: number
  humedadMax: number
}

export default function DashboardPage() {
  const [sensors, setSensors] = useState<SensorData[]>([])
  const [actuators, setActuators] = useState<SensorData[]>([])
  const [currentData, setCurrentData] = useState<CurrentData | null>(null)
  const [historicalData, setHistoricalData] = useState<HistoricalData[]>([])
  const [config, setConfig] = useState<Config>({
    tempMin: 26,
    tempMax: 29,
    humedadMin: 60,
    humedadMax: 80,
  })
  const [totalAlerts, setTotalAlerts] = useState(0)
  const [loading, setLoading] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const chartRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadData()
    const interval = setInterval(() => {
      if (autoRefresh) {
        loadData()
      }
    }, 30000) // Actualizar cada 30 segundos

    return () => clearInterval(interval)
  }, [autoRefresh])

  const loadData = async () => {
    try {
      await Promise.all([loadSensors(), loadCurrentData(), loadHistoricalData(), loadConfig(), loadTotalAlerts()])
    } catch (error) {
      console.error("Error loading dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadSensors = async () => {
    try {
      const response = await fetch("/api/components")
      if (response.ok) {
        const data = await response.json()
        setSensors(data.filter((item: SensorData) => item.tipo === "sensor"))
        setActuators(data.filter((item: SensorData) => item.tipo === "actuador"))
      }
    } catch (error) {
      console.error("Error loading sensors:", error)
    }
  }

  const loadCurrentData = async () => {
    try {
      const response = await fetch("/api/dashboard/current")
      if (response.ok) {
        const data = await response.json()
        setCurrentData(data)
      }
    } catch (error) {
      console.error("Error loading current data:", error)
    }
  }

  const loadHistoricalData = async () => {
    try {
      const response = await fetch("/api/dashboard/historical")
      if (response.ok) {
        const data = await response.json()
        setHistoricalData(data)
      }
    } catch (error) {
      console.error("Error loading historical data:", error)
    }
  }

  const loadConfig = async () => {
    try {
      const response = await fetch("/api/dashboard/config")
      if (response.ok) {
        const data = await response.json()
        setConfig(data)
      }
    } catch (error) {
      console.error("Error loading config:", error)
    }
  }

  const loadTotalAlerts = async () => {
    try {
      const [actuatorResponse, thresholdResponse] = await Promise.all([
        fetch("/api/alerts/history"),
        fetch("/api/alerts/thresholds"),
      ])

      let total = 0
      if (actuatorResponse.ok) {
        const actuatorData = await actuatorResponse.json()
        total += actuatorData.length
      }
      if (thresholdResponse.ok) {
        const thresholdData = await thresholdResponse.json()
        total += thresholdData.length
      }

      setTotalAlerts(total)
    } catch (error) {
      console.error("Error loading total alerts:", error)
    }
  }

  const getTemperatureStatus = () => {
    if (!currentData) return { status: "normal", color: "text-gray-500" }

    const temp = currentData.temperatura
    if (temp < config.tempMin || temp > config.tempMax) {
      return { status: "Fuera de rango", color: "text-red-500" }
    }
    return { status: "Óptima", color: "text-green-500" }
  }

  const getHumidityStatus = () => {
    if (!currentData) return { status: "normal", color: "text-gray-500" }

    const humidity = currentData.humedad
    if (humidity < config.humedadMin || humidity > config.humedadMax) {
      return { status: "Fuera de rango", color: "text-red-500" }
    }
    return { status: "Óptima", color: "text-green-500" }
  }

  const getTemperatureProgress = () => {
    if (!currentData) return 0
    const temp = currentData.temperatura
    const range = config.tempMax - config.tempMin
    const progress = ((temp - config.tempMin) / range) * 100
    return Math.max(0, Math.min(100, progress))
  }

  const getHumidityProgress = () => {
    if (!currentData) return 0
    const humidity = currentData.humedad
    const range = config.humedadMax - config.humedadMin
    const progress = ((humidity - config.humedadMin) / range) * 100
    return Math.max(0, Math.min(100, progress))
  }

  const handleExport = async (format: "csv" | "json" | "pdf") => {
    try {
      if (format === "pdf") {
        await exportToPDF()
      } else {
        const response = await fetch(`/api/dashboard/export?format=${format}`)
        if (response.ok) {
          const blob = await response.blob()
          const url = window.URL.createObjectURL(blob)
          const a = document.createElement("a")
          a.href = url
          a.download = `dashboard_data.${format}`
          document.body.appendChild(a)
          a.click()
          window.URL.revokeObjectURL(url)
          document.body.removeChild(a)
        }
      }
    } catch (error) {
      console.error("Error exporting data:", error)
    }
  }

  const exportToPDF = async () => {
    if (!chartRef.current) return

    try {
      const canvas = await html2canvas(chartRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
      })

      const pdf = new jsPDF("p", "mm", "a4")
      const imgWidth = 190
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      // Título
      pdf.setFontSize(20)
      pdf.text("Reporte del Dashboard - Hermetia Vitalis", 20, 20)

      // Fecha
      pdf.setFontSize(12)
      pdf.text(`Fecha: ${new Date().toLocaleDateString("es-ES")}`, 20, 30)

      // Datos actuales
      if (currentData) {
        pdf.text(`Temperatura actual: ${currentData.temperatura}°C`, 20, 45)
        pdf.text(`Humedad actual: ${currentData.humedad}%`, 20, 55)
        pdf.text(`Última actualización: ${new Date(currentData.fechaActualizacion).toLocaleString("es-ES")}`, 20, 65)
      }

      // Gráfico
      pdf.text("Tendencias Históricas:", 20, 80)
      pdf.addImage(canvas.toDataURL("image/png"), "PNG", 10, 90, imgWidth, imgHeight)

      pdf.save("dashboard_reporte.pdf")
    } catch (error) {
      console.error("Error generating PDF:", error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Cargando dashboard...</div>
      </div>
    )
  }

  const tempStatus = getTemperatureStatus()
  const humidityStatus = getHumidityStatus()

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Monitoreo Hermetia Vitalis</h1>
            <p className="text-lg text-gray-600">Sistema de monitoreo para incubadoras de Hermetia illucens</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Auto</span>
              <Button
                variant={autoRefresh ? "default" : "outline"}
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
                className="h-9"
              >
                {autoRefresh ? "ON" : "OFF"}
              </Button>
            </div>
            <Button variant="outline" size="sm" onClick={() => loadData()} className="h-9">
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualizar
            </Button>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="shadow-lg border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-lg font-semibold">Sensores</CardTitle>
              <Activity className="h-6 w-6 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {sensors.filter((s) => s.estado).length}/{sensors.length}
              </div>
              <p className="text-sm text-muted-foreground">Sensores activos</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-lg font-semibold">Actuadores</CardTitle>
              <Activity className="h-6 w-6 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600 mb-2">
                {actuators.filter((a) => a.estado).length}/{actuators.length}
              </div>
              <p className="text-sm text-muted-foreground">Actuadores activos</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-lg font-semibold">Total Alertas</CardTitle>
              <Bell className="h-6 w-6 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600 mb-2">{totalAlerts}</div>
              <p className="text-sm text-muted-foreground">Historial completo</p>
            </CardContent>
          </Card>
        </div>

        {/* Environmental Data */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Temperature */}
          <Card className="shadow-lg border-0">
            <CardHeader className="pb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Thermometer className="h-6 w-6 text-red-500" />
                  <CardTitle className="text-xl">Temperatura</CardTitle>
                </div>
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="text-5xl font-bold text-gray-900 mb-2">
                  {currentData?.temperatura || "--"}
                  <span className="text-2xl text-gray-500">°C</span>
                </div>
                <div className="w-32 h-32 mx-auto relative">
                  <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="3"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke={tempStatus.status === "Óptima" ? "#10b981" : "#ef4444"}
                      strokeWidth="3"
                      strokeDasharray={`${getTemperatureProgress()}, 100`}
                    />
                  </svg>
                </div>
              </div>
              <div className="text-center space-y-2">
                <p className="text-sm text-gray-600">
                  Rango óptimo: {config.tempMin}° - {config.tempMax}°
                </p>
                <Badge
                  variant={tempStatus.status === "Óptima" ? "default" : "destructive"}
                  className="text-sm px-3 py-1"
                >
                  {tempStatus.status}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Humidity */}
          <Card className="shadow-lg border-0">
            <CardHeader className="pb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Droplets className="h-6 w-6 text-blue-500" />
                  <CardTitle className="text-xl">Humedad</CardTitle>
                </div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="text-5xl font-bold text-gray-900 mb-2">
                  {currentData?.humedad || "--"}
                  <span className="text-2xl text-gray-500">%</span>
                </div>
                <div className="w-32 h-32 mx-auto relative">
                  <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="3"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke={humidityStatus.status === "Óptima" ? "#10b981" : "#ef4444"}
                      strokeWidth="3"
                      strokeDasharray={`${getHumidityProgress()}, 100`}
                    />
                  </svg>
                </div>
              </div>
              <div className="text-center space-y-2">
                <p className="text-sm text-gray-600">
                  Rango óptimo: {config.humedadMin}% - {config.humedadMax}%
                </p>
                <Badge
                  variant={humidityStatus.status === "Óptima" ? "default" : "destructive"}
                  className="text-sm px-3 py-1"
                >
                  {humidityStatus.status}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Historical Trends */}
        <Card className="shadow-lg border-0">
          <CardHeader className="pb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <TrendingUp className="h-6 w-6 text-green-500" />
                <div>
                  <CardTitle className="text-2xl mb-1">Tendencias Históricas</CardTitle>
                  <CardDescription className="text-base">Datos de temperatura y humedad en el tiempo</CardDescription>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">Últimas 24h</span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="lg" className="px-6 bg-transparent">
                      <Download className="w-5 h-5 mr-2" />
                      Exportar
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handleExport("csv")}>
                      <FileSpreadsheet className="w-4 h-4 mr-2" />
                      CSV
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExport("json")}>
                      <FileJson className="w-4 h-4 mr-2" />
                      JSON
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExport("pdf")}>
                      <FileText className="w-4 h-4 mr-2" />
                      PDF
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="grafico" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="grafico" className="text-base">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Gráfico
                </TabsTrigger>
                <TabsTrigger value="tabla" className="text-base">
                  Tabla
                </TabsTrigger>
              </TabsList>

              <TabsContent value="grafico">
                <div ref={chartRef} className="bg-white p-4 rounded-lg">
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={historicalData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="fecha" tickFormatter={(value) => formatDate(value)} fontSize={12} />
                      <YAxis fontSize={12} />
                      <Tooltip
                        labelFormatter={(value) => `Fecha: ${formatDate(value)}`}
                        formatter={(value: number, name: string) => [
                          `${value}${name === "temperatura" ? "°C" : "%"}`,
                          name === "temperatura" ? "Temperatura" : "Humedad",
                        ]}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="temperatura"
                        stroke="#ef4444"
                        strokeWidth={2}
                        name="Temperatura"
                        dot={{ fill: "#ef4444", strokeWidth: 2, r: 4 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="humedad"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        name="Humedad"
                        dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>

              <TabsContent value="tabla">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-base font-semibold">Fecha y Hora</TableHead>
                        <TableHead className="text-base font-semibold">Temperatura (°C)</TableHead>
                        <TableHead className="text-base font-semibold">Humedad (%)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {historicalData.slice(0, 20).map((item, index) => (
                        <TableRow key={index} className="hover:bg-gray-50">
                          <TableCell className="text-base">{formatDate(item.fecha)}</TableCell>
                          <TableCell className="text-base font-medium">{item.temperatura}°C</TableCell>
                          <TableCell className="text-base font-medium">{item.humedad}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
