"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import { Thermometer, Droplets, RefreshCw, TrendingUp, Clock, Download } from "lucide-react"
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
  const [sensorStatus, setSensorStatus] = useState({
    dht11A: true,
    dht11B: true,
    calefactor: false,
    humificador: false,
    ventilador: false,
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
        setSensorStatus({
          dht11A: data.edoDht11A,
          dht11B: data.edoDht11B,
          calefactor: data.edoCalefactor,
          humificador: data.edoHumificador,
          ventilador: data.edoVentilador,
        })
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

  const getActiveSensorsCount = () => {
    return Object.values(sensorStatus).filter(Boolean).length
  }

  const getTotalSensorsCount = () => {
    return Object.keys(sensorStatus).length
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Monitoreo Hermetia Vitalis</h1>
          <p className="text-gray-600">Sistema de monitoreo para incubadoras de Hermetia illucens</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">°C</span>
            <Switch checked={!isCelsius} onCheckedChange={(checked) => setIsCelsius(!checked)} />
            <span className="text-sm text-gray-600">°F</span>
          </div>
          <Button variant="outline" size="sm" onClick={loadCurrentData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualizar
          </Button>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Auto ON</span>
            <Switch checked={isAutoRefresh} onCheckedChange={setIsAutoRefresh} />
          </div>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estado General</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {getActiveSensorsCount()}/{getTotalSensorsCount()} Sensores
            </div>
            <p className="text-xs text-muted-foreground">Sistemas operativos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertas Críticas</CardTitle>
            <div className="h-4 w-4 text-red-500">⚠</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {!isTemperatureOptimal() || !isHumidityOptimal() ? "1" : "0"}
            </div>
            <p className="text-xs text-muted-foreground">Condiciones críticas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Advertencias</CardTitle>
            <div className="h-4 w-4 text-yellow-500">⚡</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {(!isTemperatureOptimal() ? 1 : 0) + (!isHumidityOptimal() ? 1 : 0)}
            </div>
            <p className="text-xs text-muted-foreground">Condiciones de precaución</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Última Actualización</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sensorData.timestamp}</div>
            <div className="flex items-center space-x-2 mt-2">
              <Switch checked={isAutoRefresh} onCheckedChange={setIsAutoRefresh} />
              <span className="text-xs text-muted-foreground">Auto-actualizar</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Temperature */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Thermometer className="h-5 w-5 text-red-500" />
                <CardTitle>Temperatura</CardTitle>
              </div>
              <div className={`w-3 h-3 rounded-full ${isTemperatureOptimal() ? "bg-green-500" : "bg-red-500"}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center mb-4">
              <div className="relative w-32 h-32">
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
                    stroke={isTemperatureOptimal() ? "#10b981" : "#ef4444"}
                    strokeWidth="3"
                    strokeDasharray={`${(convertTemperature(sensorData.temperatura) / 50) * 100}, 100`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{convertTemperature(sensorData.temperatura).toFixed(1)}</div>
                    <div className="text-sm text-gray-500">{getTemperatureUnit()}</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Rango óptimo: {getOptimalRangeText()}</p>
              <Badge
                variant={isTemperatureOptimal() ? "default" : "destructive"}
                className={isTemperatureOptimal() ? "bg-green-100 text-green-800" : ""}
              >
                {isTemperatureOptimal() ? "Óptima" : "Fuera de rango"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Humidity */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Droplets className="h-5 w-5 text-blue-500" />
                <CardTitle>Humedad</CardTitle>
              </div>
              <div className={`w-3 h-3 rounded-full ${isHumidityOptimal() ? "bg-green-500" : "bg-red-500"}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center mb-4">
              <div className="relative w-32 h-32">
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
                    stroke={isHumidityOptimal() ? "#3b82f6" : "#ef4444"}
                    strokeWidth="3"
                    strokeDasharray={`${sensorData.humedad}, 100`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{sensorData.humedad.toFixed(1)}</div>
                    <div className="text-sm text-gray-500">%</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">
                Rango óptimo: {optimalRange.humedadMin}% - {optimalRange.humedadMax}%
              </p>
              <Badge
                variant={isHumidityOptimal() ? "default" : "destructive"}
                className={isHumidityOptimal() ? "bg-green-100 text-green-800" : ""}
              >
                {isHumidityOptimal() ? "Óptima" : "Fuera de rango"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Historical Trends */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Tendencias Históricas</CardTitle>
              <CardDescription>Datos de temperatura y humedad en el tiempo</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24h">Últimas 24h</SelectItem>
                  <SelectItem value="7d">Últimos 7d</SelectItem>
                  <SelectItem value="30d">Últimos 30d</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="grafico" className="w-full">
            <TabsList>
              <TabsTrigger value="grafico">Gráfico</TabsTrigger>
              <TabsTrigger value="tabla">Tabla</TabsTrigger>
            </TabsList>
            <TabsContent value="grafico" className="mt-4">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={historicalData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="temperatura" stroke="#ef4444" strokeWidth={2} name="Temperatura" />
                    <Line type="monotone" dataKey="humedad" stroke="#3b82f6" strokeWidth={2} name="Humedad" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
            <TabsContent value="tabla" className="mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Hora</TableHead>
                    <TableHead>Temperatura</TableHead>
                    <TableHead>Humedad</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {historicalData.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>{row.time}</TableCell>
                      <TableCell>
                        {convertTemperature(row.temperatura).toFixed(1)}
                        {getTemperatureUnit()}
                      </TableCell>
                      <TableCell>{row.humedad.toFixed(1)}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
