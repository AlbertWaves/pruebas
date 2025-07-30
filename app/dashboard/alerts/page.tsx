"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { AlertTriangle, Bell, Settings, History, Thermometer, Droplets } from "lucide-react"

interface Alert {
  _id: string
  tipo: string
  mensaje: string
  timestamp: string
  activa: boolean
  valor: number
}

interface AlertConfig {
  tempMin: number
  tempMax: number
  humedadMin: number
  humedadMax: number
  notificacionesActivas: boolean
}

export default function AlertsPage() {
  const [activeAlerts, setActiveAlerts] = useState<Alert[]>([])
  const [alertHistory, setAlertHistory] = useState<Alert[]>([])
  const [alertConfig, setAlertConfig] = useState<AlertConfig>({
    tempMin: 26,
    tempMax: 29,
    humedadMin: 60,
    humedadMax: 80,
    notificacionesActivas: true,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadActiveAlerts()
    loadAlertHistory()
    loadAlertConfig()
  }, [])

  const loadActiveAlerts = async () => {
    try {
      const response = await fetch("/api/alerts/active")
      if (response.ok) {
        const data = await response.json()
        setActiveAlerts(data)
      }
    } catch (error) {
      console.error("Error loading active alerts:", error)
    }
  }

  const loadAlertHistory = async () => {
    try {
      const response = await fetch("/api/alerts/history")
      if (response.ok) {
        const data = await response.json()
        setAlertHistory(data)
      }
    } catch (error) {
      console.error("Error loading alert history:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadAlertConfig = async () => {
    try {
      const response = await fetch("/api/alerts/config")
      if (response.ok) {
        const data = await response.json()
        setAlertConfig(data)
      }
    } catch (error) {
      console.error("Error loading alert config:", error)
    }
  }

  const saveAlertConfig = async () => {
    try {
      const response = await fetch("/api/alerts/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(alertConfig),
      })

      if (response.ok) {
        // Mostrar mensaje de éxito
        console.log("Configuración guardada exitosamente")
      }
    } catch (error) {
      console.error("Error saving alert config:", error)
    }
  }

  const getAlertIcon = (tipo: string) => {
    switch (tipo) {
      case "temperatura":
        return <Thermometer className="w-4 h-4" />
      case "humedad":
        return <Droplets className="w-4 h-4" />
      default:
        return <AlertTriangle className="w-4 h-4" />
    }
  }

  const getAlertColor = (tipo: string) => {
    switch (tipo) {
      case "temperatura":
        return "text-red-600 bg-red-50 border-red-200"
      case "humedad":
        return "text-blue-600 bg-blue-50 border-blue-200"
      default:
        return "text-yellow-600 bg-yellow-50 border-yellow-200"
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-green-700 font-medium">Cargando alertas...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-green-800">Sistema de Alertas</h1>
          <p className="text-gray-600 mt-2 text-lg">Monitorea y configura las alertas del sistema</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white border-red-200 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-700">Alertas Activas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-800">{activeAlerts.length}</div>
            <p className="text-xs text-red-600 mt-1">Requieren atención</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-green-200 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Notificaciones</CardTitle>
            <Bell className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-800">{alertConfig.notificacionesActivas ? "ON" : "OFF"}</div>
            <p className="text-xs text-green-600 mt-1">Estado del sistema</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-blue-200 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Historial</CardTitle>
            <History className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-800">{alertHistory.length}</div>
            <p className="text-xs text-blue-600 mt-1">Alertas registradas</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-green-50">
          <TabsTrigger value="active" className="data-[state=active]:bg-white data-[state=active]:text-green-700">
            Alertas Activas
          </TabsTrigger>
          <TabsTrigger value="config" className="data-[state=active]:bg-white data-[state=active]:text-green-700">
            Configuración
          </TabsTrigger>
          <TabsTrigger value="history" className="data-[state=active]:bg-white data-[state=active]:text-green-700">
            Historial
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-6">
          <Card className="shadow-xl border-green-200 bg-white">
            <CardHeader className="bg-green-600 text-white">
              <CardTitle className="text-xl">Alertas Activas</CardTitle>
              <CardDescription className="text-green-100">Alertas que requieren atención inmediata</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {activeAlerts.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Bell className="w-8 h-8 text-green-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay alertas activas</h3>
                  <p className="text-gray-600">Todos los parámetros están dentro de los rangos normales</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeAlerts.map((alert) => (
                    <div key={alert._id} className={`p-4 rounded-lg border ${getAlertColor(alert.tipo)}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          {getAlertIcon(alert.tipo)}
                          <div>
                            <h4 className="font-semibold capitalize">{alert.tipo}</h4>
                            <p className="text-sm">{alert.mensaje}</p>
                            <p className="text-xs mt-1 opacity-75">Valor actual: {alert.valor}</p>
                          </div>
                        </div>
                        <Badge variant="destructive" className="ml-4">
                          Activa
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="config" className="mt-6">
          <Card className="shadow-xl border-green-200 bg-white">
            <CardHeader className="bg-green-600 text-white">
              <CardTitle className="text-xl">Configuración de Alertas</CardTitle>
              <CardDescription className="text-green-100">
                Define los rangos óptimos para temperatura y humedad
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div>
                    <h3 className="font-semibold text-green-800">Notificaciones</h3>
                    <p className="text-sm text-green-600">Activar/desactivar alertas del sistema</p>
                  </div>
                  <Switch
                    checked={alertConfig.notificacionesActivas}
                    onCheckedChange={(checked) => setAlertConfig({ ...alertConfig, notificacionesActivas: checked })}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-green-800 flex items-center space-x-2">
                      <Thermometer className="w-5 h-5" />
                      <span>Temperatura (°C)</span>
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="tempMin" className="text-green-700">
                          Mínima
                        </Label>
                        <Input
                          id="tempMin"
                          type="number"
                          value={alertConfig.tempMin}
                          onChange={(e) =>
                            setAlertConfig({ ...alertConfig, tempMin: Number.parseFloat(e.target.value) })
                          }
                          className="border-green-200 focus:border-green-500"
                        />
                      </div>
                      <div>
                        <Label htmlFor="tempMax" className="text-green-700">
                          Máxima
                        </Label>
                        <Input
                          id="tempMax"
                          type="number"
                          value={alertConfig.tempMax}
                          onChange={(e) =>
                            setAlertConfig({ ...alertConfig, tempMax: Number.parseFloat(e.target.value) })
                          }
                          className="border-green-200 focus:border-green-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-green-800 flex items-center space-x-2">
                      <Droplets className="w-5 h-5" />
                      <span>Humedad (%)</span>
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="humedadMin" className="text-green-700">
                          Mínima
                        </Label>
                        <Input
                          id="humedadMin"
                          type="number"
                          value={alertConfig.humedadMin}
                          onChange={(e) =>
                            setAlertConfig({ ...alertConfig, humedadMin: Number.parseFloat(e.target.value) })
                          }
                          className="border-green-200 focus:border-green-500"
                        />
                      </div>
                      <div>
                        <Label htmlFor="humedadMax" className="text-green-700">
                          Máxima
                        </Label>
                        <Input
                          id="humedadMax"
                          type="number"
                          value={alertConfig.humedadMax}
                          onChange={(e) =>
                            setAlertConfig({ ...alertConfig, humedadMax: Number.parseFloat(e.target.value) })
                          }
                          className="border-green-200 focus:border-green-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button onClick={saveAlertConfig} className="bg-green-600 hover:bg-green-700 text-white">
                    <Settings className="w-4 h-4 mr-2" />
                    Guardar Configuración
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <Card className="shadow-xl border-green-200 bg-white">
            <CardHeader className="bg-green-600 text-white">
              <CardTitle className="text-xl">Historial de Alertas</CardTitle>
              <CardDescription className="text-green-100">
                Registro completo de todas las alertas del sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-green-50">
                      <TableHead className="font-semibold text-green-700">Tipo</TableHead>
                      <TableHead className="font-semibold text-green-700">Mensaje</TableHead>
                      <TableHead className="font-semibold text-green-700">Valor</TableHead>
                      <TableHead className="font-semibold text-green-700">Fecha</TableHead>
                      <TableHead className="font-semibold text-green-700">Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {alertHistory.map((alert) => (
                      <TableRow key={alert._id} className="hover:bg-green-50">
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getAlertIcon(alert.tipo)}
                            <span className="capitalize font-medium">{alert.tipo}</span>
                          </div>
                        </TableCell>
                        <TableCell>{alert.mensaje}</TableCell>
                        <TableCell className="font-semibold">{alert.valor}</TableCell>
                        <TableCell>{new Date(alert.timestamp).toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge
                            variant={alert.activa ? "destructive" : "secondary"}
                            className={alert.activa ? "" : "bg-green-100 text-green-800"}
                          >
                            {alert.activa ? "Activa" : "Resuelta"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
