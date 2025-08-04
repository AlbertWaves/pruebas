"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Settings,
  Bell,
  RotateCcw,
  Save,
  Download,
  FileSpreadsheet,
  FileJson,
  Thermometer,
  Droplets,
  Zap,
} from "lucide-react"

interface AlertConfig {
  tempMin: number
  tempMax: number
  humedadMin: number
  humedadMax: number
}

interface ActuatorAlert {
  _id: string
  fechaRegistro: string
  idActuador: number
  nombreActuador: string
  tipo: "warning"
  mensaje: string
}

interface ThresholdAlert {
  _id: string
  fechaRegistro: string
  tipo: string
  valor: number
  umbral: number
  condicion: string
  idComponente: number
  nombreComponente: string
  mensaje: string
}

export default function AlertsPage() {
  const [config, setConfig] = useState<AlertConfig>({
    tempMin: 26,
    tempMax: 29,
    humedadMin: 60,
    humedadMax: 80,
  })

  const [globalNotifications, setGlobalNotifications] = useState(true)
  const [tempNotifications, setTempNotifications] = useState(true)
  const [humedadNotifications, setHumedadNotifications] = useState(true)
  const [actuatorAlerts, setActuatorAlerts] = useState<ActuatorAlert[]>([])
  const [thresholdAlerts, setThresholdAlerts] = useState<ThresholdAlert[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadConfig()
    loadActuatorAlerts()
    loadThresholdAlerts()
  }, [])

  const loadConfig = async () => {
    try {
      const response = await fetch("/api/alerts/config")
      if (response.ok) {
        const data = await response.json()
        setConfig({
          tempMin: data.tempMin,
          tempMax: data.tempMax,
          humedadMin: data.humedadMin,
          humedadMax: data.humedadMax,
        })
      }
    } catch (error) {
      console.error("Error loading config:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadActuatorAlerts = async () => {
    try {
      const response = await fetch("/api/alerts/history")
      if (response.ok) {
        const data = await response.json()
        setActuatorAlerts(data)
      }
    } catch (error) {
      console.error("Error loading actuator alerts:", error)
    }
  }

  const loadThresholdAlerts = async () => {
    try {
      const response = await fetch("/api/alerts/thresholds")
      if (response.ok) {
        const data = await response.json()
        setThresholdAlerts(data)
      }
    } catch (error) {
      console.error("Error loading threshold alerts:", error)
    }
  }

  const handleSaveConfig = async () => {
    try {
      const response = await fetch("/api/alerts/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      })

      if (response.ok) {
        alert("Configuración guardada exitosamente")
      } else {
        alert("Error al guardar la configuración")
      }
    } catch (error) {
      console.error("Error al guardar configuración:", error)
      alert("Error al guardar la configuración")
    }
  }

  const handleResetConfig = () => {
    setConfig({
      tempMin: 26,
      tempMax: 29,
      humedadMin: 60,
      humedadMax: 80,
    })
  }

  const handleExportAlerts = async (type: "actuators" | "thresholds", format: "csv" | "json" | "pdf") => {
    try {
      const alerts = type === "actuators" ? actuatorAlerts : thresholdAlerts

      if (format === "csv") {
        const csvHeader =
          type === "actuators"
            ? "Fecha,Hora,Actuador,Tipo,Mensaje\n"
            : "Fecha,Hora,Parámetro,Valor,Umbral,Condición,Componente,Mensaje\n"

        const csvData = alerts
          .map((alert) => {
            const date = new Date(alert.fechaRegistro)
            if (type === "actuators") {
              const actuatorAlert = alert as ActuatorAlert
              return `${date.toLocaleDateString("es-ES")},${date.toLocaleTimeString("es-ES")},${actuatorAlert.nombreActuador},${actuatorAlert.tipo},${actuatorAlert.mensaje}`
            } else {
              const thresholdAlert = alert as ThresholdAlert
              return `${date.toLocaleDateString("es-ES")},${date.toLocaleTimeString("es-ES")},${thresholdAlert.tipo},${thresholdAlert.valor},${thresholdAlert.umbral},${thresholdAlert.condicion},${thresholdAlert.nombreComponente},${thresholdAlert.mensaje}`
            }
          })
          .join("\n")

        const blob = new Blob([csvHeader + csvData], { type: "text/csv" })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `alertas_${type}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else if (format === "json") {
        const blob = new Blob([JSON.stringify(alerts, null, 2)], { type: "application/json" })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `alertas_${type}.json`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error("Error al exportar alertas:", error)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString("es-ES")
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Cargando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Sistema de Alertas</h1>
            <p className="text-lg text-gray-600">Configuración de umbrales y gestión de notificaciones</p>
          </div>
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-gray-600">Notificaciones Globales</span>
              <Switch checked={globalNotifications} onCheckedChange={setGlobalNotifications} />
            </div>
            <Bell className="w-6 h-6 text-gray-600" />
          </div>
        </div>

        {/* Alert Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="shadow-lg border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-lg font-semibold">Alertas Actuadores</CardTitle>
              <Zap className="h-6 w-6 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600 mb-2">{actuatorAlerts.length}</div>
              <p className="text-sm text-muted-foreground">Uso de actuadores</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-lg font-semibold">Alertas Umbrales</CardTitle>
              <Thermometer className="h-6 w-6 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600 mb-2">{thresholdAlerts.length}</div>
              <p className="text-sm text-muted-foreground">Fuera de rango</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-lg font-semibold">Total Alertas</CardTitle>
              <Bell className="h-6 w-6 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {actuatorAlerts.length + thresholdAlerts.length}
              </div>
              <p className="text-sm text-muted-foreground">Historial completo</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-lg font-semibold">Configuraciones</CardTitle>
              <Settings className="h-6 w-6 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600 mb-2">2</div>
              <p className="text-sm text-muted-foreground">Parámetros configurados</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="configuracion" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="configuracion" className="text-base">
              Configuración de Umbrales
            </TabsTrigger>
            <TabsTrigger value="actuadores" className="text-base">
              Historial de Actuadores
            </TabsTrigger>
            <TabsTrigger value="umbrales" className="text-base">
              Historial de Umbrales
            </TabsTrigger>
          </TabsList>

          <TabsContent value="configuracion" className="space-y-6">
            <Card className="shadow-lg border-0">
              <CardHeader className="pb-6">
                <CardTitle className="text-2xl">Configuración de Umbrales</CardTitle>
                <CardDescription className="text-base">
                  Define los rangos aceptables para cada parámetro ambiental
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Temperature Configuration */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-5 h-5 bg-red-500 rounded-full"></div>
                      <h3 className="text-xl font-semibold">Temperatura</h3>
                    </div>
                    <div className="flex items-center space-x-6">
                      <div className="flex items-center space-x-3">
                        <span className="text-base text-gray-600">Notificaciones</span>
                        <Switch checked={tempNotifications} onCheckedChange={setTempNotifications} />
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-base text-gray-600">Activo</span>
                        <Switch checked={true} />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label htmlFor="tempMin" className="text-base font-medium">
                        Valor Mínimo (°C)
                      </Label>
                      <Input
                        id="tempMin"
                        type="number"
                        value={config.tempMin}
                        onChange={(e) => setConfig((prev) => ({ ...prev, tempMin: Number(e.target.value) }))}
                        className="text-base h-12"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="tempMax" className="text-base font-medium">
                        Valor Máximo (°C)
                      </Label>
                      <Input
                        id="tempMax"
                        type="number"
                        value={config.tempMax}
                        onChange={(e) => setConfig((prev) => ({ ...prev, tempMax: Number(e.target.value) }))}
                        className="text-base h-12"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Switch checked={tempNotifications} onCheckedChange={setTempNotifications} />
                    <span className="text-base text-gray-600">Enviar notificaciones para este parámetro</span>
                  </div>
                </div>

                {/* Humidity Configuration */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-5 h-5 bg-blue-500 rounded-full"></div>
                      <h3 className="text-xl font-semibold">Humedad</h3>
                    </div>
                    <div className="flex items-center space-x-6">
                      <div className="flex items-center space-x-3">
                        <span className="text-base text-gray-600">Notificaciones</span>
                        <Switch checked={humedadNotifications} onCheckedChange={setHumedadNotifications} />
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-base text-gray-600">Activo</span>
                        <Switch checked={true} />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label htmlFor="humedadMin" className="text-base font-medium">
                        Valor Mínimo
                      </Label>
                      <div className="relative">
                        <Input
                          id="humedadMin"
                          type="number"
                          value={config.humedadMin}
                          onChange={(e) => setConfig((prev) => ({ ...prev, humedadMin: Number(e.target.value) }))}
                          className="text-base h-12"
                        />
                        <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-base">
                          %
                        </span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="humedadMax" className="text-base font-medium">
                        Valor Máximo
                      </Label>
                      <div className="relative">
                        <Input
                          id="humedadMax"
                          type="number"
                          value={config.humedadMax}
                          onChange={(e) => setConfig((prev) => ({ ...prev, humedadMax: Number(e.target.value) }))}
                          className="text-base h-12"
                        />
                        <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-base">
                          %
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Switch checked={humedadNotifications} onCheckedChange={setHumedadNotifications} />
                    <span className="text-base text-gray-600">Enviar notificaciones para este parámetro</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between pt-8">
                  <Button variant="outline" onClick={handleResetConfig} size="lg" className="px-8 bg-transparent">
                    <RotateCcw className="w-5 h-5 mr-2" />
                    Restablecer
                  </Button>
                  <Button
                    onClick={handleSaveConfig}
                    className="bg-green-600 hover:bg-green-700"
                    size="lg"
                    className="px-8"
                  >
                    <Save className="w-5 h-5 mr-2" />
                    Guardar Cambios
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="actuadores" className="space-y-6">
            <Card className="shadow-lg border-0">
              <CardHeader className="pb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl mb-2">Historial de Uso de Actuadores</CardTitle>
                    <CardDescription className="text-base">
                      Registro de activaciones de actuadores del sistema
                    </CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="lg" className="px-6 bg-transparent">
                        <Download className="w-5 h-5 mr-2" />
                        Exportar
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => handleExportAlerts("actuators", "csv")}>
                        <FileSpreadsheet className="w-4 h-4 mr-2" />
                        CSV
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleExportAlerts("actuators", "json")}>
                        <FileJson className="w-4 h-4 mr-2" />
                        JSON
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {actuatorAlerts.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-lg text-gray-500">No hay alertas de actuadores</p>
                    </div>
                  ) : (
                    actuatorAlerts.map((alert) => (
                      <div
                        key={alert._id}
                        className="flex items-center justify-between p-6 border rounded-lg bg-white shadow-sm"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-4 h-4 rounded-full bg-orange-500" />
                          <div>
                            <p className="font-semibold text-base">{alert.mensaje}</p>
                            <p className="text-sm text-gray-500 mt-1">
                              {formatDate(alert.fechaRegistro)} - {alert.nombreActuador}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-sm px-3 py-1">
                            Activación
                          </Badge>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="umbrales" className="space-y-6">
            <Card className="shadow-lg border-0">
              <CardHeader className="pb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl mb-2">Historial de Alertas de Umbrales</CardTitle>
                    <CardDescription className="text-base">
                      Registro de valores fuera de los rangos configurados
                    </CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="lg" className="px-6 bg-transparent">
                        <Download className="w-5 h-5 mr-2" />
                        Exportar
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => handleExportAlerts("thresholds", "csv")}>
                        <FileSpreadsheet className="w-4 h-4 mr-2" />
                        CSV
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleExportAlerts("thresholds", "json")}>
                        <FileJson className="w-4 h-4 mr-2" />
                        JSON
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {thresholdAlerts.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-lg text-gray-500">No hay alertas de umbrales</p>
                    </div>
                  ) : (
                    thresholdAlerts.map((alert) => (
                      <div
                        key={alert._id}
                        className="flex items-center justify-between p-6 border rounded-lg bg-white shadow-sm"
                      >
                        <div className="flex items-center space-x-4">
                          <div
                            className={`w-4 h-4 rounded-full ${alert.tipo === "temperatura" ? "bg-red-500" : "bg-blue-500"}`}
                          />
                          <div className="flex items-center space-x-3">
                            {alert.tipo === "temperatura" ? (
                              <Thermometer className="w-5 h-5 text-red-500" />
                            ) : (
                              <Droplets className="w-5 h-5 text-blue-500" />
                            )}
                            <div>
                              <p className="font-semibold text-base">{alert.mensaje}</p>
                              <p className="text-sm text-gray-500 mt-1">
                                {formatDate(alert.fechaRegistro)} - {alert.nombreComponente}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant={alert.condicion === "mayor" ? "destructive" : "secondary"}
                            className="text-sm px-3 py-1"
                          >
                            {alert.condicion === "mayor" ? "Superior" : "Inferior"}
                          </Badge>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
