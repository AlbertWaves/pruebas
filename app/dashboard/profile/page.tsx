"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, User, Lock, Eye, EyeOff, CheckCircle, AlertTriangle } from "lucide-react"

interface UserData {
  _id: number
  nombre: string
  primerApell: string
  segundoApell: string
  numTel: string
  correo: string
  idRol: number
}

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Estados para información personal
  const [personalInfo, setPersonalInfo] = useState({
    nombre: "",
    primerApell: "",
    segundoApell: "",
    numTel: "",
    correo: "",
  })

  // Estados para cambio de contraseña
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)
      setPersonalInfo({
        nombre: parsedUser.nombre || "",
        primerApell: parsedUser.primerApell || "",
        segundoApell: parsedUser.segundoApell || "",
        numTel: parsedUser.numTel || "",
        correo: parsedUser.correo || "",
      })
    } else {
      router.push("/")
    }
  }, [router])

  const handlePersonalInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    try {
      const response = await fetch(`/api/users/${user?._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...personalInfo,
          updateType: "profile",
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess("Información actualizada exitosamente")
        // Actualizar localStorage
        const updatedUser = { ...user, ...personalInfo }
        localStorage.setItem("user", JSON.stringify(updatedUser))
        setUser(updatedUser)
      } else {
        setError(data.error || "Error al actualizar la información")
      }
    } catch (error) {
      console.error("Error:", error)
      setError("Error de conexión")
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    // Validaciones
    if (passwordData.newPassword.length < 8) {
      setError("La nueva contraseña debe tener al menos 8 caracteres")
      return
    }

    if (passwordData.newPassword === "123456789") {
      setError("No puedes usar la contraseña por defecto")
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("Las nuevas contraseñas no coinciden")
      return
    }

    if (passwordData.currentPassword === passwordData.newPassword) {
      setError("La nueva contraseña debe ser diferente a la actual")
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user?._id,
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
          isFirstTime: false,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess("Contraseña cambiada exitosamente")
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        })
      } else {
        setError(data.error || "Error al cambiar la contraseña")
      }
    } catch (error) {
      console.error("Error:", error)
      setError("Error de conexión")
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
          <p className="mt-4 text-gray-600">Cargando perfil...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="sm" onClick={() => router.back()} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mi Perfil</h1>
            <p className="text-gray-600">Gestiona tu información personal y configuración de cuenta</p>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="personal" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="personal" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Información Personal
            </TabsTrigger>
            <TabsTrigger value="password" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Cambiar Contraseña
            </TabsTrigger>
          </TabsList>

          <TabsContent value="personal">
            <Card>
              <CardHeader>
                <CardTitle>Información Personal</CardTitle>
                <CardDescription>
                  Actualiza tu información personal. Estos cambios se reflejarán en todo el sistema.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePersonalInfoSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nombre">Nombre</Label>
                      <Input
                        id="nombre"
                        value={personalInfo.nombre}
                        onChange={(e) => setPersonalInfo({ ...personalInfo, nombre: e.target.value })}
                        placeholder="Tu nombre"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="primerApell">Primer Apellido</Label>
                      <Input
                        id="primerApell"
                        value={personalInfo.primerApell}
                        onChange={(e) => setPersonalInfo({ ...personalInfo, primerApell: e.target.value })}
                        placeholder="Tu primer apellido"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="segundoApell">Segundo Apellido</Label>
                      <Input
                        id="segundoApell"
                        value={personalInfo.segundoApell}
                        onChange={(e) => setPersonalInfo({ ...personalInfo, segundoApell: e.target.value })}
                        placeholder="Tu segundo apellido (opcional)"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="numTel">Número de Teléfono</Label>
                      <Input
                        id="numTel"
                        value={personalInfo.numTel}
                        onChange={(e) => setPersonalInfo({ ...personalInfo, numTel: e.target.value })}
                        placeholder="Tu número de teléfono"
                        required
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="correo">Correo Electrónico</Label>
                      <Input
                        id="correo"
                        type="email"
                        value={personalInfo.correo}
                        onChange={(e) => setPersonalInfo({ ...personalInfo, correo: e.target.value })}
                        placeholder="tu@email.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setPersonalInfo({
                          nombre: user.nombre || "",
                          primerApell: user.primerApell || "",
                          segundoApell: user.segundoApell || "",
                          numTel: user.numTel || "",
                          correo: user.correo || "",
                        })
                        setError("")
                        setSuccess("")
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700">
                      {loading ? "Guardando..." : "Guardar Cambios"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="password">
            <Card>
              <CardHeader>
                <CardTitle>Cambiar Contraseña</CardTitle>
                <CardDescription>
                  Actualiza tu contraseña para mantener tu cuenta segura. Necesitarás tu contraseña actual.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Contraseña Actual</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showPasswords.current ? "text" : "password"}
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        placeholder="Ingresa tu contraseña actual"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                      >
                        {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Nueva Contraseña</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showPasswords.new ? "text" : "password"}
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        placeholder="Ingresa tu nueva contraseña"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                      >
                        {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500">Mínimo 8 caracteres, debe ser diferente a la actual</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar Nueva Contraseña</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showPasswords.confirm ? "text" : "password"}
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        placeholder="Confirma tu nueva contraseña"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                      >
                        {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setPasswordData({
                          currentPassword: "",
                          newPassword: "",
                          confirmPassword: "",
                        })
                        setError("")
                        setSuccess("")
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700">
                      {loading ? "Cambiando..." : "Cambiar Contraseña"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
