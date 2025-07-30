"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Home, Bell, Users, LogOut, ChevronDown } from "lucide-react"
import Image from "next/image"

interface DashboardUser {
  _id: number
  nombre: string
  primerApell: string
  segundoApell: string
  correo: string
  idRol: number
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<DashboardUser | null>(null)
  const router = useRouter()

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

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-green-700 font-medium">Cargando...</span>
        </div>
      </div>
    )
  }

  const menuItems = [
    {
      title: "Dashboard Principal",
      url: "/dashboard",
      icon: Home,
    },
    {
      title: "Sistema de Alertas",
      url: "/dashboard/alerts",
      icon: Bell,
    },
  ]

  // Solo mostrar gestión de usuarios si es administrador
  if (user.idRol === 1) {
    menuItems.push({
      title: "Gestión de Usuarios",
      url: "/dashboard/users",
      icon: Users,
    })
  }

  return (
    <SidebarProvider>
      <Sidebar className="border-r border-green-100 bg-white">
        <SidebarHeader className="p-6 border-b border-green-100 bg-green-50">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Image src="/logo.svg" alt="Hermetia Vitalis" width={40} height={40} className="drop-shadow-sm" />
              <div className="absolute -inset-1 bg-green-500 rounded-full opacity-10 blur-sm"></div>
            </div>
            <div>
              <span className="font-bold text-lg text-green-800">Hermetia Vitalis</span>
              <p className="text-xs text-green-600 font-medium">Sistema Inteligente</p>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent className="px-4 bg-white">
          <SidebarGroup>
            <SidebarGroupLabel className="text-green-700 font-semibold mb-2">Navegación</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {menuItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      className="hover:bg-green-50 hover:text-green-700 rounded-lg transition-all duration-200"
                    >
                      <a href={item.url} className="flex items-center space-x-3 p-3">
                        <item.icon className="w-5 h-5" />
                        <span className="font-medium">{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="p-4 border-t border-green-100 bg-green-50">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start p-3 hover:bg-green-100 rounded-lg">
                <Avatar className="w-10 h-10 mr-3 ring-2 ring-green-200">
                  <AvatarFallback className="bg-green-100 text-green-700 font-semibold">
                    {user.nombre.charAt(0)}
                    {user.primerApell.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left">
                  <p className="text-sm font-semibold text-gray-900">
                    {user.nombre} {user.primerApell}
                  </p>
                  <p className="text-xs text-gray-500">{user.correo}</p>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-white border border-green-100 shadow-xl">
              <div className="px-3 py-2 border-b border-green-100">
                <Badge
                  variant={user.idRol === 1 ? "default" : "secondary"}
                  className={user.idRol === 1 ? "bg-green-500 text-white" : "bg-gray-100 text-gray-700"}
                >
                  {user.idRol === 1 ? "Administrador" : "Usuario"}
                </Badge>
              </div>
              <DropdownMenuItem onClick={handleLogout} className="text-red-600 hover:bg-red-50 hover:text-red-700">
                <LogOut className="w-4 h-4 mr-2" />
                Cerrar Sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="bg-gradient-to-br from-gray-50 to-green-50">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-green-100 px-6 bg-white shadow-sm">
          <SidebarTrigger className="-ml-1 hover:bg-green-50 rounded-lg" />
          <div className="flex items-center space-x-2 ml-4">
            <Image src="/logo.svg" alt="Hermetia Vitalis" width={24} height={24} />
            <span className="font-semibold text-green-700">Hermetia Vitalis</span>
          </div>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
