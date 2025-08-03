"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  User,
  Lock,
  Eye,
  EyeOff,
  Save,
  AlertTriangle,
  CheckCircle,
  ArrowLeft,
  Mail,
  Phone,
  UserCircle,
} from "lucide-react"

interface DashboardUser {
  _id: number
  nombre: string
  primerApell: string
  segundoApell: string
  correo: string
  numTel: string
  idRol: number
}

export default function ProfilePage() {
  const [user, setUser] = useState<DashboardUser | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Estados para información personal
  const [personalInfo, setPersonalInfo] = useState({
    nombre: "",
    primerApell: "",
    segundoApell: "",
    correo: "",
    numTel: "",
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

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)
      setPersonalInfo({
        nombre: parsedUser.nombre,
        primerApell: parsedUser.primerApell,
        segundoApell: parsedUser.segundoApell,
        correo: parsedUser.correo,
        numTel: parsedUser.numTel,
      })
    }
  }, [])

  // Validaciones
  const validateName = (name: string) => {
    const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/
    return nameRegex.test(name) && name.trim().length >= 2
  }

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validatePhone = (phone: string) => {
    const phoneRegex = /^[0-9+\-\s()]+$/
    return phoneRegex.test(phone) && phone.replace(/\D/g, "").length >= 10
  }

  const validatePassword = (password: string) => {
    if (password.length < 8) {
      return "La contraseña debe tener al menos 8 caracteres"
    }
    if (password === "123456789") {
      return "No puedes usar la contraseña por defecto"
    }
    return ""
  }

  const validatePersonalForm = () => {
    const newErrors: Record<string, string> = {}

    if (!validateName(personalInfo.nombre)) {
      newErrors.nombre = "El nombre debe contener solo letras y tener al menos 2 caracteres"
    }

    if (!validateName(personalInfo.primerApell)) {
      newErrors.primerApell = "El apellido debe contener solo letras y tener al menos 2 caracteres"
    }

    if (personalInfo.segundoApell && !validateName(personalInfo.segundoApell)) {
      newErrors.segundoApell = "El segundo apellido debe contener solo letras"
    }

    if (!validateEmail(personalInfo.correo)) {
      newErrors.correo = "Ingrese un correo electrónico válido"
    }

    if (!validatePhone(personalInfo.numTel)) {
      newErrors.numTel = "Ingrese un número de teléfono válido (mínimo 10 dígitos)"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handlePersonalInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!validatePersonalForm()) {
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`/api/users/${user?._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(personalInfo),
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
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setError("Todos los campos son requeridos")
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("Las contraseñas nuevas no coinciden")
      return
    }

    const passwordError = validatePassword(passwordData.newPassword)
    if (passwordError) {
      setError(passwordError)
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
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess("Contraseña actualizada exitosamente")
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

  const handleNameInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "")
    return value
  }

  const handlePhoneInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9+\-\s()]/g, "")
    return value
  }

  if (!user) {
    return <div>Cargando...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mi Perfil</h1>
          <p className="text-gray-600">Gestiona tu información personal y configuración de cuenta</p>
        </div>
      </div>

      {/* Profile Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <Avatar className="w-16 h-16">
              <AvatarFallback className="bg-green-100 text-green-600 text-xl">
                {user.nombre.charAt(0)}
                {user.primerApell.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-semibold">
                {user.nombre} {user.primerApell} {user.segundoApell}
              </h2>
              <p className="text-gray-600">{user.correo}</p>
              <p className="text-sm text-gray-500">{user.idRol === 1 ? "Administrador" : "Usuario"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="personal" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="personal" className="flex items-center space-x-2">
            <User className="w-4 h-4" />
            <span>Información Personal</span>
          </TabsTrigger>
          <TabsTrigger value="password" className="flex items-center space-x-2">
            <Lock className="w-4 h-4" />
            <span>Cambiar Contraseña</span>
          </TabsTrigger>
        </TabsList>

        {/* Información Personal */}
        <TabsContent value="personal">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <UserCircle className="h-5 w-5" />
                <span>Información Personal</span>
              </CardTitle>
              <CardDescription>
                Actualiza tu información personal. Estos cambios se reflejarán en todo el sistema.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePersonalInfoSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nombre">Nombre *</Label>
                    <Input
                      id="nombre"
                      value={personalInfo.nombre}
                      onChange={(e) => {
                        const value = handleNameInput(e)
                        setPersonalInfo((prev) => ({ ...prev, nombre: value }))
                      }}
                      className={errors.nombre ? "border-red-500" : ""}
                      required
                    />
                    {errors.nombre && <p className="text-sm text-red-500">{errors.nombre}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="primerApell">Primer Apellido *</Label>
                    <Input
                      id="primerApell"
                      value={personalInfo.primerApell}
                      onChange={(e) => {
                        const value = handleNameInput(e)
                        setPersonalInfo((prev) => ({ ...prev, primerApell: value }))
                      }}
                      className={errors.primerApell ? "border-red-500" : ""}
                      required
                    />
                    {errors.primerApell && <p className="text-sm text-red-500">{errors.primerApell}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="segundoApell">Segundo Apellido</Label>
                    <Input
                      id="segundoApell"
                      value={personalInfo.segundoApell}
                      onChange={(e) => {
                        const value = handleNameInput(e)
                        setPersonalInfo((prev) => ({ ...prev, segundoApell: value }))
                      }}
                      className={errors.segundoApell ? "border-red-500" : ""}
                    />
                    {errors.segundoApell && <p className="text-sm text-red-500">{errors.segundoApell}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="numTel">Número de Teléfono *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="numTel"
                        value={personalInfo.numTel}
                        onChange={(e) => {
                          const value = handlePhoneInput(e)
                          setPersonalInfo((prev) => ({ ...prev, numTel: value }))
                        }}
                        className={`pl-10 ${errors.numTel ? "border-red-500" : ""}`}
                        required
                      />
                    </div>
                    {errors.numTel && <p className="text-sm text-red-500">{errors.numTel}</p>}
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="correo">Correo Electrónico *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="correo"
                        type="email"
                        value={personalInfo.correo}
                        onChange={(e) => setPersonalInfo((prev) => ({ ...prev, correo: e.target.value }))}
                        className={`pl-10 ${errors.correo ? "border-red-500" : ""}`}
                        required
                      />
                    </div>
                    {errors.correo && <p className="text-sm text-red-500">{errors.correo}</p>}
                  </div>
                </div>

                {/* Mensajes */}
                {error && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {success && (
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">{success}</AlertDescription>
                  </Alert>
                )}

                <Separator />

                <div className="flex justify-end">
                  <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700">
                    <Save className="w-4 h-4 mr-2" />
                    {loading ? "Guardando..." : "Guardar Cambios"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cambiar Contraseña */}
        <TabsContent value="password">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Lock className="h-5 w-5" />
                <span>Cambiar Contraseña</span>
              </CardTitle>
              <CardDescription>
                Actualiza tu contraseña para mantener tu cuenta segura. Asegúrate de usar una contraseña fuerte.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                {/* Contraseña Actual */}
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Contraseña Actual *</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showPasswords.current ? "text" : "password"}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData((prev) => ({ ...prev, currentPassword: e.target.value }))}
                      placeholder="Ingresa tu contraseña actual"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPasswords((prev) => ({ ...prev, current: !prev.current }))}
                    >
                      {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                {/* Nueva Contraseña */}
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Nueva Contraseña *</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showPasswords.new ? "text" : "password"}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData((prev) => ({ ...prev, newPassword: e.target.value }))}
                      placeholder="Ingresa tu nueva contraseña"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPasswords((prev) => ({ ...prev, new: !prev.new }))}
                    >
                      {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">Mínimo 8 caracteres, no puede ser la contraseña por defecto</p>
                </div>

                {/* Confirmar Nueva Contraseña */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Nueva Contraseña *</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showPasswords.confirm ? "text" : "password"}
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                      placeholder="Confirma tu nueva contraseña"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPasswords((prev) => ({ ...prev, confirm: !prev.confirm }))}
                    >
                      {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                {/* Mensajes */}
                {error && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {success && (
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">{success}</AlertDescription>
                  </Alert>
                )}

                <Separator />

                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700">
                    <Lock className="w-4 h-4 mr-2" />
                    {loading ? "Cambiando..." : "Cambiar Contraseña"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
