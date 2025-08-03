"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Lock, AlertTriangle, CheckCircle } from "lucide-react"

export default function ChangePasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const userId = searchParams.get("userId")
  const isRequired = searchParams.get("required") === "true"

  useEffect(() => {
    if (!userId) {
      router.push("/")
    }
  }, [userId, router])

  const validatePassword = (password: string) => {
    if (password.length < 8) {
      return "La contraseña debe tener al menos 8 caracteres"
    }
    if (password === "123456789") {
      return "No puedes usar la contraseña por defecto"
    }
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    // Validaciones
    const passwordError = validatePassword(newPassword)
    if (passwordError) {
      setError(passwordError)
      return
    }

    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden")
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
          userId,
          newPassword,
          isFirstTime: true,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess("Contraseña cambiada exitosamente")
        setTimeout(() => {
          router.push("/dashboard")
        }, 2000)
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

  if (!userId) {
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <div className="bg-green-100 p-3 rounded-full">
              <Lock className="h-12 w-12 text-green-600" />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Cambio de Contraseña {isRequired ? "Requerido" : ""}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {isRequired
              ? "Debes cambiar tu contraseña por defecto para continuar"
              : "Establece una nueva contraseña para tu cuenta"}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Nueva Contraseña
            </CardTitle>
            {isRequired && (
              <CardDescription className="text-orange-600 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Este cambio es obligatorio para continuar
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">Nueva Contraseña</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Ingresa tu nueva contraseña"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-xs text-gray-500">Mínimo 8 caracteres, no puede ser la contraseña por defecto</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Nueva Contraseña</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirma tu nueva contraseña"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

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

              <Button type="submit" disabled={loading} className="w-full bg-green-600 hover:bg-green-700">
                {loading ? "Cambiando contraseña..." : "Cambiar Contraseña"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {isRequired && (
          <div className="text-center">
            <p className="text-xs text-gray-500">No puedes acceder al sistema hasta cambiar tu contraseña</p>
          </div>
        )}
      </div>
    </div>
  )
}
