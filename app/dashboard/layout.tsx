"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Home, AlertTriangle, Users, LogOut, Settings, Leaf } from "lucide-react"

interface DashboardUser {
  _id: number
  nombre: string
  primerApell: string
  correo: string
  idRol: number
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<DashboardUser | null>(null)

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      setUser(JSON.parse(userData))
    } else {
      router.push("/")
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("user")
    router.push("/")
  }

  const navigation = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: Home,
      current: pathname === "/dashboard",
    },
    {
      name: "Sistema de Alertas",
      href: "/dashboard/alerts",
      icon: AlertTriangle,
      current: pathname === "/dashboard/alerts",
    },
    {
      name: "Gestión de Usuarios",
      href: "/dashboard/users",
      icon: Users,
      current: pathname === "/dashboard/users",
      adminOnly: true,
    },
  ]

  const filteredNavigation = navigation.filter((item) => !item.adminOnly || user?.idRol === 1)

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-center border-b border-gray-200">
            <div className="flex items-center gap-2">
              <div className="bg-green-100 p-2 rounded-lg">
                <Leaf className="h-6 w-6 text-green-600" />
              </div>
              <span className="text-xl font-bold text-gray-900">Hermetia Vitalis</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-2 py-4">
            {filteredNavigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                    item.current ? "bg-green-100 text-green-900" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <Icon
                    className={`mr-3 h-5 w-5 flex-shrink-0 ${
                      item.current ? "text-green-500" : "text-gray-400 group-hover:text-gray-500"
                    }`}
                  />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* User menu */}
          <div className="border-t border-gray-200 p-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start p-2">
                  <Avatar className="h-8 w-8 mr-3">
                    <AvatarFallback className="bg-green-100 text-green-600">
                      {user.nombre.charAt(0)}
                      {user.primerApell.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium text-gray-900">
                      {user.nombre} {user.primerApell}
                    </span>
                    <span className="text-xs text-gray-500">{user.correo}</span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/profile" className="flex items-center">
                    <Leaf className="mr-2 h-4 w-4" />
                    Mi Perfil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings" className="flex items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    Configuración
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  Cerrar Sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="pl-64">
        <main className="py-6">{children}</main>
      </div>
    </div>
  )
}
