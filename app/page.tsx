"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Leaf, Shield, BarChart3 } from "lucide-react"
import { useRouter } from "next/navigation"
import Image from "next/image"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        localStorage.setItem("user", JSON.stringify(data.user))
        router.push("/dashboard")
      } else {
        setError(data.error || "Error al iniciar sesión")
      }
    } catch (error) {
      setError("Error de conexión")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fillRule=\"evenodd\"%3E%3Cg fill=\"%2316a34a\" fillOpacity=\"0.05\"%3E%3Ccircle cx=\"30\" cy=\"30\" r=\"4\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>
      
      <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-12 relative z-10">
        {/* Left Side - Features */}
        <div className="space-y-8 flex flex-col justify-center">
          {/* Logo and Title */}
          <div className="text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start mb-6">
              <div className="relative">
                <Image
                  src="/logo.svg"
                  alt="Hermetia Vitalis Logo"
                  width={80}
                  height={80}
                  className="drop-shadow-lg"
                />
                <div className="absolute -inset-2 bg-green-500 rounded-full opacity-10 blur-xl"></div>
              </div>
              <div className="ml-4">
                <h1 className="text-4xl lg:text-5xl font-bold text-green-800">
                  Hermetia Vitalis
                </h1>
                <p className="text-green-600 font-medium text-lg">Sistema Inteligente</p>
              </div>
            </div>
            <p className="text-xl text-gray-700 mb-8 leading-relaxed">
              Monitorea y controla incubadoras de <em>Hermetia illucens</em> de forma inteligente y sostenible.
            </p>
          </div>

          <div className="space-y-6">
            <Card className="bg-white border-green-200 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:border-green-300">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-14 h-14 bg-green-500 rounded-xl flex items-center justify-center shadow-lg">
                    <BarChart3 className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2 text-lg">Monitoreo Ambiental en Tiempo Real</h3>
                    <p className="text-gray-600 leading-relaxed">
                      Visualiza temperatura, humedad y otros parámetros críticos para asegurar condiciones óptimas de crecimiento.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-green-200 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:border-green-300">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-14 h-14 bg-green-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Shield className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2 text-lg">Alertas y Configuración Inteligente</h3>
                    <p className="text-gray-600 leading-relaxed">
                      Recibe notificaciones automáticas ante condiciones críticas y ajusta parámetros de forma remota.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-green-200 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:border-green-300">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-14 h-14 bg-green-700 rounded-xl flex items-center justify-center shadow-lg">
                    <Leaf className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2 text-lg">Análisis Histórico y Reportes</h3>
                    <p className="text-gray-600 leading-relaxed">
                      Analiza tendencias de crecimiento y genera reportes detallados del desarrollo de las larvas.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="flex items-center justify-center">
          <Card className="w-full max-w-md bg-white shadow-2xl border-green-200 overflow-hidden">
            <div className="bg-green-600 p-1">
              <div className="bg-white rounded-t-lg">
                <CardHeader className="text-center pb-8 pt-8">
                  <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg border-2 border-green-100">
                    <Image
                      src="/logo.svg"
                      alt="Hermetia Vitalis"
                      width={48}
                      height={48}
                    />
                  </div>
                  <CardTitle className="text-2xl font-bold text-gray-900">Bienvenido de nuevo</CardTitle>
                  <CardDescription className="text-gray-600">
                    Inicia sesión en tu cuenta para continuar
                  </CardDescription>
                </CardHeader>
              </div>
            </div>
            
            <CardContent className="p-8">
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700 font-medium">Correo Electrónico</Label>
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      placeholder="Ingresa tu correo electrónico"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="pl-10 h-12 border-green-200 focus:border-green-500 focus:ring-green-500 rounded-lg"
                    />
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <div className="w-5 h-5 text-green-500 font-bold">@</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-700 font-medium">Contraseña</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Ingresa tu contraseña"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="pr-10 h-12 border-green-200 focus:border-green-500 focus:ring-green-500 rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500 hover:text-green-700 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Iniciando sesión...</span>
                    </div>
                  ) : (
                    "Iniciar Sesión"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
