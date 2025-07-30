"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import { Thermometer, Droplets, RefreshCw, Clock, Download, Cpu, Zap, Activity } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface SensorData {
  temperatura: number
  humedad: number
  timestamp: string
}

interface OptimalRange {
  tempMin: number
  tempMax: number
  humedadMin: number
  humedadMax: number
}

interface HistoricalData {
  time: string
  temperatura: number
  humedad: number
}

interface SensorStatus {
  edoDht11A: boolean
  edoDht11B: boolean
  edoCalefactor: boolean
  edoHumificador: boolean
  edoVentilador: boolean
}

export default function Dashboard() {
  const [sensorData, setSensorData] = useState<SensorData>({
    temperatura: 0,
    humedad: 0,
    timestamp: new Date().toLocaleTimeString(),
  })

  const [optimalRange, setOptimalRange] = useState<OptimalRange>({
    tempMin: 26,
    tempMax: 29,
    humedadMin: 60,
    humedadMax: 80,
  })

  const [isAutoRefresh, setIsAutoRefresh] = useState(true)
  const [isCelsius, setIsCelsius] = useState(true)
  const [timeRange, setTimeRange] = useState("24h")
  const [historicalData, setHistoricalData] = useState<HistoricalData[]>([])
  const [sensorStatus, setSensorStatus] = useState<SensorStatus>({
    edoDht11A: true,
    edoDht11B: true,
    edoCalefactor: false,
    edoHumificador: false,
    edoVentilador: false,
  })

  // Cargar datos iniciales
  useEffect(() => {
    loadCurrentData()
    loadOptimalRange()
    loadHistoricalData()
    loadSensorStatus()
  }, [])

  // Auto-refresh
  useEffect(() => {
    if (isAutoRefresh) {
      const interval = setInterval(() => {
        loadCurrentData()
        loadSensorStatus()
      }, 30000) // Actualizar cada 30 segundos
      return () => clearInterval(interval)
    }
  }, [isAutoRefresh])

  const loadCurrentData = async () => {
    try {
      const response = await fetch("/api/dashboard/current")
      if (response.ok) {
        const data = await response.json()
        setSensorData({
          temperatura: data.temperActual,
          humedad: data.humedActual,
          timestamp: new Date().toLocaleTimeString(),
        })
      }
    } catch (error) {
      console.error("Error loading current data:", error)
    }
  }

  const loadOptimalRange = async () => {
    try {
      const response = await fetch("/api/dashboard/config")
      if (response.ok) {
        const data = await response.json()
        setOptimalRange({
          tempMin: data.tempMin,
          tempMax: data.tempMax,
          humedadMin: data.humedadMin,
          humedadMax: data.humedadMax,
        })
      }
    } catch (error) {
      console.error("Error loading optimal range:", error)
    }
  }

  const loadHistoricalData = async () => {
    try {
      const response = await fetch(`/api/dashboard/historical?range=${timeRange}`)
      if (response.ok) {
        const data = await response.json()
        setHistoricalData(data)
      }
    } catch (error) {
      console.error("Error loading historical data:", error)
    }
  }

  const loadSensorStatus = async () => {
    try {
      const response = await fetch("/api/dashboard/sensors")
      if (response.ok) {
        const data = await response.json()
        setSensorStatus(data)
      }
    } catch (error) {
      console.error("Error loading sensor status:", error)
    }
  }

  // Actualizar datos históricos cuando cambie el rango de tiempo
  useEffect(() => {
    loadHistoricalData()
  }, [timeRange])

  const convertTemperature = (temp: number) => {
    return isCelsius ? temp : (temp * 9) / 5 + 32
  }

  const getTemperatureUnit = () => (isCelsius ? "°C" : "°F")

  const getOptimalRangeText = () => {
    const minTemp = convertTemperature(optimalRange.tempMin)
    const maxTemp = convertTemperature(optimalRange.tempMax)
    return `${minTemp.toFixed(1)}° - ${maxTemp.toFixed(1)}°`
  }

  const isTemperatureOptimal = () => {
    return sensorData.temperatura >= optimalRange.tempMin && sensorData.temperatura <= optimalRange.tempMax
  }

  const isHumidityOptimal = () => {
    return sensorData.humedad >= optimalRange.humedadMin && sensorData.humedad <= optimalRange.humedadMax
  }

  // Separar sensores de actuadores
  const getActiveSensorsCount = () => {
    return [sensorStatus.edoDht11A, sensorStatus.edoDht11B].filter(Boolean).length
  }

  const getTotalSensorsCount = () => {
    return 2 // Solo DHT11A y DHT11B son sensores
  }

  const getActiveActuatorsCount = () => {
    return [sensorStatus.edoCalefactor, sensorStatus.edoHumificador, sensorStatus.edoVentilador].filter(Boolean).length
  }

  const getTotalActuatorsCount = () => {
    return 3 // Calefactor, Humificador y Ventilador son actuadores
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-green-800">Monitoreo Hermetia Vitalis</h1>
          <p className="text-gray-600 mt-2 text-lg">Sistema de monitoreo para incubadoras de Hermetia illucens</p>
        </div>
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3 bg-white rounded-lg p-3 shadow-sm border border-green-100">
            <span className="text-sm text-gray-600 font-medium">°C</span>
            <Switch checked={!isCelsius} onCheckedChange={(checked) => setIsCelsius(!checked)} />
            <span className="text-sm text-gray-600 font-medium">°F</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={loadCurrentData}
            className="border-green-200 hover:bg-green-50 bg-white text-green-700"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualizar
          </Button>
          <div className="flex items-center space-x-3 bg-white rounded-lg p-3 shadow-sm border border-green-100">
            <span className="text-sm text-gray-600 font-medium">Auto</span>
            <Switch checked={isAutoRefresh} onCheckedChange={setIsAutoRefresh} />
          </div>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-white border-green-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-green-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Estado General</CardTitle>
            <Activity className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Cpu className="h-4 w-4 text-green-500" />
                <div className="text-lg font-bold text-green-700">
                  {getActiveSensorsCount()}/{getTotalSensorsCount()} Sensores
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Zap className="h-4 w-4 text-green-600" />
                <div className="text-lg font-bold text-green-600">
                  {getActiveActuatorsCount()}/{getTotalActuatorsCount()} Actuadores
                </div>
              </div>
            </div>
            <p className="text-xs text-green-600 mt-3 font-medium">Sistemas operativos</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-red-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-red-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-700">Alertas Críticas</CardTitle>
            <div className="h-5 w-5 text-red-500">⚠</div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {!isTemperatureOptimal() || !isHumidityOptimal() ? "1" : "0"}
            </div>
            <p className="text-xs text-red-600 mt-2 font-medium">Condiciones críticas</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-yellow-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-yellow-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-700">Advertencias</CardTitle>
            <div className="h-5 w-5 text-yellow-500">⚡</div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">
              {(!isTemperatureOptimal() ? 1 : 0) + (!isHumidityOptimal() ? 1 : 0)}
            </div>
            <p className="text-xs text-yellow-600 mt-2 font-medium">Condiciones de precaución</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-green-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-green-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Última Actualización</CardTitle>
            <Clock className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">{sensorData.timestamp}</div>
            <div className="flex items-center space-x-2 mt-3">
              <Switch checked={isAutoRefresh} onCheckedChange={setIsAutoRefresh} />
              <span className="text-xs text-green-600 font-medium">Auto-actualizar</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Temperature */}
        <Card className="shadow-xl border-green-200 bg-white overflow-hidden">
          <CardHeader className="bg-green-600 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Thermometer className="h-6 w-6" />
                <CardTitle className="text-xl">Temperatura</CardTitle>
              </div>
              <div
                className={`w-4 h-4 rounded-full ${isTemperatureOptimal() ? "bg-green-300" : "bg-red-300"} shadow-lg`}
              />
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <div className="flex items-center justify-center mb-6">
              <div className="relative w-40 h-40">
                <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#f0f0f0"
                    strokeWidth="3"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke={isTemperatureOptimal() ? "#16a34a" : "#ef4444"}
                    strokeWidth="3"
                    strokeDasharray={`${(convertTemperature(sensorData.temperatura) / 50) * 100}, 100`}
                    className="drop-shadow-sm"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-800">
                      {convertTemperature(sensorData.temperatura).toFixed(1)}
                    </div>
                    <div className="text-sm text-gray-500 font-medium">{getTemperatureUnit()}</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-3 font-medium">Rango óptimo: {getOptimalRangeText()}</p>
              <Badge
                variant={isTemperatureOptimal() ? "default" : "destructive"}
                className={isTemperatureOptimal() ? "bg-green-500 text-white shadow-lg" : "shadow-lg"}
              >
                {isTemperatureOptimal() ? "Óptima" : "Fuera de rango"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Humidity */}
        <Card className="shadow-xl border-green-200 bg-white overflow-hidden">
          <CardHeader className="bg-green-600 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Droplets className="h-6 w-6" />
                <CardTitle className="text-xl">Humedad</CardTitle>
              </div>
              <div
                className={`w-4 h-4 rounded-full ${isHumidityOptimal() ? "bg-green-300" : "bg-red-300"} shadow-lg`}
              />
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <div className="flex items-center justify-center mb-6">
              <div className="relative w-40 h-40">
                <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#f0f0f0"
                    strokeWidth="3"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke={isHumidityOptimal() ? "#16a34a" : "#ef4444"}
                    strokeWidth="3"
                    strokeDasharray={`${sensorData.humedad}, 100`}
                    className="drop-shadow-sm"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-800">{sensorData.humedad.toFixed(1)}</div>
                    <div className="text-sm text-gray-500 font-medium">%</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-3 font-medium">
                Rango óptimo: {optimalRange.humedadMin}% - {optimalRange.humedadMax}%
              </p>
              <Badge
                variant={isHumidityOptimal() ? "default" : "destructive"}
                className={isHumidityOptimal() ? "bg-green-500 text-white shadow-lg" : "shadow-lg"}
              >
                {isHumidityOptimal() ? "Óptima" : "Fuera de rango"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Historical Trends */}
      <Card className="shadow-xl border-green-200 bg-white">
        <CardHeader className="bg-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Tendencias Históricas</CardTitle>
              <CardDescription className="text-green-100 mt-1">
                Datos de temperatura y humedad en el tiempo
              </CardDescription>
            </div>
            <div className="flex items-center space-x-3">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32 bg-white text-gray-800">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24h">Últimas 24h</SelectItem>
                  <SelectItem value="7d">Últimos 7d</SelectItem>
                  <SelectItem value="30d">Últimos 30d</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" className="bg-white text-gray-800 hover:bg-gray-100">
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <Tabs defaultValue="grafico" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-green-50">
              <TabsTrigger value="grafico" className="data-[state=active]:bg-white data-[state=active]:text-green-700">
                Gráfico
              </TabsTrigger>
              <TabsTrigger value="tabla" className="data-[state=active]:bg-white data-[state=active]:text-green-700">
                Tabla
              </TabsTrigger>
            </TabsList>
            <TabsContent value="grafico" className="mt-6">
              <div className="h-80 bg-green-50 rounded-lg p-4 border border-green-100">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={historicalData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#d1fae5" />
                    <XAxis dataKey="time" stroke="#16a34a" />
                    <YAxis stroke="#16a34a" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #16a34a",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="temperatura"
                      stroke="#dc2626"
                      strokeWidth={3}
                      name="Temperatura"
                      dot={{ fill: "#dc2626", strokeWidth: 2, r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="humedad"
                      stroke="#16a34a"
                      strokeWidth={3}
                      name="Humedad"
                      dot={{ fill: "#16a34a", strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
            <TabsContent value="tabla" className="mt-6">
              <div className="bg-white rounded-lg border border-green-100 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-green-50">
                      <TableHead className="font-semibold text-green-700">Hora</TableHead>
                      <TableHead className="font-semibold text-green-700">Temperatura</TableHead>
                      <TableHead className="font-semibold text-green-700">Humedad</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {historicalData.map((row, index) => (
                      <TableRow key={index} className="hover:bg-green-50">
                        <TableCell className="font-medium">{row.time}</TableCell>
                        <TableCell>
                          <span className="text-red-600 font-semibold">
                            {convertTemperature(row.temperatura).toFixed(1)}
                            {getTemperatureUnit()}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-green-600 font-semibold">{row.humedad.toFixed(1)}%</span>
                        </TableCell>
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
  )
}
