"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Clock, Settings, Bell, RotateCcw, Save, Download } from "lucide-react"

interface AlertConfig {
  tempMin: number
  tempMax: number
  humedadMin: number
  humedadMax: number
}

interface Alert {
  _id: string
  fechaRegistro: string
  idActuador: number
  nombreActuador: string
  tipo: "critical" | "warning"
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
  const [alertHistory, setAlertHistory] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadConfig()
    loadAlertHistory()
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

  const loadAlertHistory = async () => {
    try {
      const response = await fetch("/api/alerts/history")
      if (response.ok) {
        const data = await response.json()
        setAlertHistory(data)
      }
    } catch (error) {
      console.error("Error loading alert history:", error)
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

  const handleExportAlerts = async () => {
    try {
      const csvHeader = "Fecha,Hora,Actuador,Tipo,Mensaje\n"
      const csvData = alertHistory
        .map((alert) => {
          const date = new Date(alert.fechaRegistro)
          return `${date.toLocaleDateString("es-ES")},${date.toLocaleTimeString("es-ES")},${alert.nombreActuador},${alert.tipo},${alert.mensaje}`
        })
        .join("\n")

      const blob = new Blob([csvHeader + csvData], { type: "text/csv" })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "historial_alertas.csv"
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Error al exportar alertas:", error)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString("es-ES")
  }

  if (loading) {
    return <div>Cargando...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sistema de Alertas</h1>
          <p className="text-gray-600">Configuración de umbrales y gestión de notificaciones</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Notificaciones Globales</span>
            <Switch checked={globalNotifications} onCheckedChange={setGlobalNotifications} />
          </div>
          <Bell className="w-5 h-5 text-gray-600" />
        </div>
      </div>

      {/* Alert Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Alertas</CardTitle>
            <Bell className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{alertHistory.length}</div>
            <p className="text-xs text-muted-foreground">Historial completo</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertas Recientes</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {
                alertHistory.filter((alert) => {
                  const alertDate = new Date(alert.fechaRegistro)
                  const yesterday = new Date()
                  yesterday.setDate(yesterday.getDate() - 1)
                  return alertDate >= yesterday
                }).length
              }
            </div>
            <p className="text-xs text-muted-foreground">Últimas 24 horas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Configuraciones</CardTitle>
            <Settings className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">2</div>
            <p className="text-xs text-muted-foreground">Parámetros configurados</p>
          </CardContent>
        </Card>
      </div>

      {/* Configuration Section */}
      <Card>
        <CardHeader>
          <CardTitle>Configuración de Umbrales</CardTitle>
          <CardDescription>Define los rangos aceptables para cada parámetro ambiental</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Temperature Configuration */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                <h3 className="text-lg font-semibold">Temperatura</h3>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Notificaciones</span>
                  <Switch checked={tempNotifications} onCheckedChange={setTempNotifications} />
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Activo</span>
                  <Switch checked={true} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tempMin">Valor Mínimo (°C)</Label>
                <Input
                  id="tempMin"
                  type="number"
                  value={config.tempMin}
                  onChange={(e) => setConfig((prev) => ({ ...prev, tempMin: Number(e.target.value) }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tempMax">Valor Máximo (°C)</Label>
                <Input
                  id="tempMax"
                  type="number"
                  value={config.tempMax}
                  onChange={(e) => setConfig((prev) => ({ ...prev, tempMax: Number(e.target.value) }))}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch checked={tempNotifications} onCheckedChange={setTempNotifications} />
              <span className="text-sm text-gray-600">Enviar notificaciones para este parámetro</span>
            </div>
          </div>

          {/* Humidity Configuration */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                <h3 className="text-lg font-semibold">Humedad</h3>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Notificaciones</span>
                  <Switch checked={humedadNotifications} onCheckedChange={setHumedadNotifications} />
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Activo</span>
                  <Switch checked={true} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="humedadMin">Valor Mínimo</Label>
                <div className="relative">
                  <Input
                    id="humedadMin"
                    type="number"
                    value={config.humedadMin}
                    onChange={(e) => setConfig((prev) => ({ ...prev, humedadMin: Number(e.target.value) }))}
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="humedadMax">Valor Máximo</Label>
                <div className="relative">
                  <Input
                    id="humedadMax"
                    type="number"
                    value={config.humedadMax}
                    onChange={(e) => setConfig((prev) => ({ ...prev, humedadMax: Number(e.target.value) }))}
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch checked={humedadNotifications} onCheckedChange={setHumedadNotifications} />
              <span className="text-sm text-gray-600">Enviar notificaciones para este parámetro</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-6">
            <Button variant="outline" onClick={handleResetConfig}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Restablecer
            </Button>
            <Button onClick={handleSaveConfig} className="bg-green-600 hover:bg-green-700">
              <Save className="w-4 h-4 mr-2" />
              Guardar Cambios
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Alert History */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Historial de Alertas</CardTitle>
              <CardDescription>Todas las alertas generadas por el sistema</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={handleExportAlerts}>
              <Download className="w-4 h-4 mr-2" />
              Exportar CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {alertHistory.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No hay alertas en el historial</p>
              </div>
            ) : (
              alertHistory.map((alert) => (
                <div key={alert._id} className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <div
                      className={`w-3 h-3 rounded-full ${alert.tipo === "critical" ? "bg-red-500" : "bg-yellow-500"}`}
                    />
                    <div>
                      <p className="font-medium">{alert.mensaje}</p>
                      <p className="text-sm text-gray-500">
                        {formatDate(alert.fechaRegistro)} - {alert.nombreActuador}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">{alert.tipo === "critical" ? "Crítica" : "Advertencia"}</Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
