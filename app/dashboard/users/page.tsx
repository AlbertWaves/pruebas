"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Users, UserPlus, Edit, Trash2, Shield, UserCheck, UserX, Key } from "lucide-react"

interface User {
  _id: string
  nombre: string
  email: string
  rol: string
  fechaCreacion: string
  activo: boolean
}

interface Role {
  _id: string
  nombre: string
  descripcion: string
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    rol: "",
    password: "",
  })

  useEffect(() => {
    loadUsers()
    loadRoles()
  }, [])

  const loadUsers = async () => {
    try {
      const response = await fetch("/api/users")
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      }
    } catch (error) {
      console.error("Error loading users:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadRoles = async () => {
    try {
      const response = await fetch("/api/roles")
      if (response.ok) {
        const data = await response.json()
        setRoles(data)
      }
    } catch (error) {
      console.error("Error loading roles:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = editingUser ? `/api/users/${editingUser._id}` : "/api/users"
      const method = editingUser ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        await loadUsers()
        setIsDialogOpen(false)
        setEditingUser(null)
        setFormData({ nombre: "", email: "", rol: "", password: "" })
      } else {
        alert("Error al guardar usuario")
      }
    } catch (error) {
      console.error("Error saving user:", error)
      alert("Error al guardar usuario")
    }
  }

  const handleEdit = (user: User) => {
    setEditingUser(user)
    setFormData({
      nombre: user.nombre,
      email: user.email,
      rol: user.rol,
      password: "",
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (userId: string) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        await loadUsers()
      } else {
        alert("Error al eliminar usuario")
      }
    } catch (error) {
      console.error("Error deleting user:", error)
      alert("Error al eliminar usuario")
    }
  }

  const handleResetPassword = async (userId: string) => {
    try {
      const response = await fetch(`/api/users/${userId}/reset-password`, {
        method: "POST",
      })

      if (response.ok) {
        alert("Contraseña restablecida exitosamente")
      } else {
        alert("Error al restablecer contraseña")
      }
    } catch (error) {
      console.error("Error resetting password:", error)
      alert("Error al restablecer contraseña")
    }
  }

  const getRoleBadgeColor = (rol: string) => {
    const roleLower = rol?.toLowerCase() || ""
    switch (roleLower) {
      case "admin":
        return "bg-red-100 text-red-800 border-red-200"
      case "operador":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "viewer":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getAdminCount = () => {
    return users.filter((user) => user.rol?.toLowerCase() === "admin").length
  }

  const getActiveCount = () => {
    return users.filter((user) => user.activo).length
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Cargando usuarios...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Gestión de Usuarios</h1>
            <p className="text-lg text-gray-600">Administra usuarios y permisos del sistema</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="px-6">
                <UserPlus className="w-5 h-5 mr-2" />
                Nuevo Usuario
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-xl">{editingUser ? "Editar Usuario" : "Crear Nuevo Usuario"}</DialogTitle>
                <DialogDescription className="text-base">
                  {editingUser ? "Modifica los datos del usuario" : "Completa los datos para crear un nuevo usuario"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="nombre" className="text-base font-medium">
                    Nombre Completo
                  </Label>
                  <Input
                    id="nombre"
                    value={formData.nombre}
                    onChange={(e) => setFormData((prev) => ({ ...prev, nombre: e.target.value }))}
                    required
                    className="text-base h-12"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="email" className="text-base font-medium">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                    required
                    className="text-base h-12"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="rol" className="text-base font-medium">
                    Rol
                  </Label>
                  <Select
                    value={formData.rol}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, rol: value }))}
                  >
                    <SelectTrigger className="text-base h-12">
                      <SelectValue placeholder="Selecciona un rol" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role._id} value={role.nombre} className="text-base">
                          {role.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {!editingUser && (
                  <div className="space-y-3">
                    <Label htmlFor="password" className="text-base font-medium">
                      Contraseña
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                      required={!editingUser}
                      className="text-base h-12"
                    />
                  </div>
                )}
                <div className="flex justify-end space-x-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsDialogOpen(false)
                      setEditingUser(null)
                      setFormData({ nombre: "", email: "", rol: "", password: "" })
                    }}
                    className="px-6"
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" className="px-6">
                    {editingUser ? "Actualizar" : "Crear"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="shadow-lg border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-lg font-semibold">Total Usuarios</CardTitle>
              <Users className="h-6 w-6 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600 mb-2">{users.length}</div>
              <p className="text-sm text-muted-foreground">Usuarios registrados</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-lg font-semibold">Administradores</CardTitle>
              <Shield className="h-6 w-6 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600 mb-2">{getAdminCount()}</div>
              <p className="text-sm text-muted-foreground">Con permisos completos</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-lg font-semibold">Usuarios Activos</CardTitle>
              <UserCheck className="h-6 w-6 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600 mb-2">{getActiveCount()}</div>
              <p className="text-sm text-muted-foreground">Cuentas habilitadas</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-lg font-semibold">Usuarios Inactivos</CardTitle>
              <UserX className="h-6 w-6 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-600 mb-2">{users.length - getActiveCount()}</div>
              <p className="text-sm text-muted-foreground">Cuentas deshabilitadas</p>
            </CardContent>
          </Card>
        </div>

        {/* Users Table */}
        <Card className="shadow-lg border-0">
          <CardHeader className="pb-6">
            <CardTitle className="text-2xl mb-2">Lista de Usuarios</CardTitle>
            <CardDescription className="text-base">Gestiona todos los usuarios del sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-base font-semibold">Nombre</TableHead>
                    <TableHead className="text-base font-semibold">Email</TableHead>
                    <TableHead className="text-base font-semibold">Rol</TableHead>
                    <TableHead className="text-base font-semibold">Estado</TableHead>
                    <TableHead className="text-base font-semibold">Fecha Creación</TableHead>
                    <TableHead className="text-base font-semibold">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user._id} className="hover:bg-gray-50">
                      <TableCell className="text-base font-medium">{user.nombre}</TableCell>
                      <TableCell className="text-base">{user.email}</TableCell>
                      <TableCell>
                        <Badge className={`text-sm px-3 py-1 ${getRoleBadgeColor(user.rol)}`}>
                          {user.rol || "Sin rol"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.activo ? "default" : "secondary"} className="text-sm px-3 py-1">
                          {user.activo ? "Activo" : "Inactivo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-base">
                        {new Date(user.fechaCreacion).toLocaleDateString("es-ES")}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm" onClick={() => handleEdit(user)} className="h-9 px-3">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleResetPassword(user._id)}
                            className="h-9 px-3"
                          >
                            <Key className="w-4 h-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-9 px-3 text-red-600 hover:text-red-700 bg-transparent"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>¿Eliminar usuario?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta acción no se puede deshacer. El usuario será eliminado permanentemente.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(user._id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Eliminar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
