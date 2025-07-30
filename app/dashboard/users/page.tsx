"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { UserPlus, Edit, Trash2, Users, Shield } from "lucide-react"
import { useRouter } from "next/navigation"

interface User {
  _id: string
  nombre: string
  primerApell: string
  segundoApell: string
  correo: string
  telefono: string
  idRol: number
  estado: boolean
}

interface Role {
  _id: number
  nombre: string
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [formData, setFormData] = useState({
    nombre: "",
    primerApell: "",
    segundoApell: "",
    correo: "",
    telefono: "",
    password: "",
    idRol: 2,
    estado: true,
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const router = useRouter()

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (!userData) {
      router.push("/")
      return
    }

    const user = JSON.parse(userData)
    if (user.idRol !== 1) {
      router.push("/dashboard")
      return
    }

    loadUsers()
    loadRoles()
  }, [router])

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
      setIsLoading(false)
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

  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!formData.nombre.trim()) {
      errors.nombre = "El nombre es requerido"
    }

    if (!formData.primerApell.trim()) {
      errors.primerApell = "El primer apellido es requerido"
    }

    if (!formData.correo.trim()) {
      errors.correo = "El correo es requerido"
    } else if (!/\S+@\S+\.\S+/.test(formData.correo)) {
      errors.correo = "El correo no es válido"
    }

    if (!formData.telefono.trim()) {
      errors.telefono = "El teléfono es requerido"
    } else if (!/^\d{10}$/.test(formData.telefono.replace(/\D/g, ""))) {
      errors.telefono = "El teléfono debe tener 10 dígitos"
    }

    if (!editingUser && !formData.password.trim()) {
      errors.password = "La contraseña es requerida"
    } else if (!editingUser && formData.password.length < 6) {
      errors.password = "La contraseña debe tener al menos 6 caracteres"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      const url = editingUser ? `/api/users/${editingUser._id}` : "/api/users"
      const method = editingUser ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        loadUsers()
        setIsDialogOpen(false)
        resetForm()
      }
    } catch (error) {
      console.error("Error saving user:", error)
    }
  }

  const handleEdit = (user: User) => {
    setEditingUser(user)
    setFormData({
      nombre: user.nombre,
      primerApell: user.primerApell,
      segundoApell: user.segundoApell,
      correo: user.correo,
      telefono: user.telefono,
      password: "",
      idRol: user.idRol,
      estado: user.estado,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (userId: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar este usuario?")) {
      try {
        const response = await fetch(`/api/users/${userId}`, {
          method: "DELETE",
        })

        if (response.ok) {
          loadUsers()
        }
      } catch (error) {
        console.error("Error deleting user:", error)
      }
    }
  }

  const resetForm = () => {
    setFormData({
      nombre: "",
      primerApell: "",
      segundoApell: "",
      correo: "",
      telefono: "",
      password: "",
      idRol: 2,
      estado: true,
    })
    setFormErrors({})
    setEditingUser(null)
  }

  const getRoleName = (idRol: number) => {
    const role = roles.find((r) => r._id === idRol)
    return role ? role.nombre : "Desconocido"
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-green-700 font-medium">Cargando usuarios...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-green-800">Gestión de Usuarios</h1>
          <p className="text-gray-600 mt-2 text-lg">Administra los usuarios del sistema Hermetia Vitalis</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="bg-green-600 hover:bg-green-700 text-white shadow-lg">
              <UserPlus className="w-4 h-4 mr-2" />
              Nuevo Usuario
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md bg-white border-green-200">
            <DialogHeader>
              <DialogTitle className="text-green-800">
                {editingUser ? "Editar Usuario" : "Crear Nuevo Usuario"}
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                {editingUser ? "Modifica los datos del usuario" : "Completa los datos para crear un nuevo usuario"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre" className="text-green-700">
                    Nombre
                  </Label>
                  <Input
                    id="nombre"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="border-green-200 focus:border-green-500"
                  />
                  {formErrors.nombre && <p className="text-red-500 text-xs">{formErrors.nombre}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="primerApell" className="text-green-700">
                    Primer Apellido
                  </Label>
                  <Input
                    id="primerApell"
                    value={formData.primerApell}
                    onChange={(e) => setFormData({ ...formData, primerApell: e.target.value })}
                    className="border-green-200 focus:border-green-500"
                  />
                  {formErrors.primerApell && <p className="text-red-500 text-xs">{formErrors.primerApell}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="segundoApell" className="text-green-700">
                  Segundo Apellido
                </Label>
                <Input
                  id="segundoApell"
                  value={formData.segundoApell}
                  onChange={(e) => setFormData({ ...formData, segundoApell: e.target.value })}
                  className="border-green-200 focus:border-green-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="correo" className="text-green-700">
                  Correo Electrónico
                </Label>
                <Input
                  id="correo"
                  type="email"
                  value={formData.correo}
                  onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
                  className="border-green-200 focus:border-green-500"
                />
                {formErrors.correo && <p className="text-red-500 text-xs">{formErrors.correo}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefono" className="text-green-700">
                  Teléfono
                </Label>
                <Input
                  id="telefono"
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  className="border-green-200 focus:border-green-500"
                />
                {formErrors.telefono && <p className="text-red-500 text-xs">{formErrors.telefono}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-green-700">
                  {editingUser ? "Nueva Contraseña (opcional)" : "Contraseña"}
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="border-green-200 focus:border-green-500"
                />
                {formErrors.password && <p className="text-red-500 text-xs">{formErrors.password}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="idRol" className="text-green-700">
                  Rol
                </Label>
                <Select
                  value={formData.idRol.toString()}
                  onValueChange={(value) => setFormData({ ...formData, idRol: Number.parseInt(value) })}
                >
                  <SelectTrigger className="border-green-200 focus:border-green-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role._id} value={role._id.toString()}>
                        {role.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="estado"
                  checked={formData.estado}
                  onCheckedChange={(checked) => setFormData({ ...formData, estado: checked })}
                />
                <Label htmlFor="estado" className="text-green-700">
                  Usuario activo
                </Label>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="border-green-200 text-green-700 hover:bg-green-50"
                >
                  Cancelar
                </Button>
                <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white">
                  {editingUser ? "Actualizar" : "Crear"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white border-green-200 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Total Usuarios</CardTitle>
            <Users className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-800">{users.length}</div>
            <p className="text-xs text-green-600 mt-1">Usuarios registrados</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-green-200 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Administradores</CardTitle>
            <Shield className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-800">{users.filter((user) => user.idRol === 1).length}</div>
            <p className="text-xs text-green-600 mt-1">Con permisos de admin</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-green-200 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Usuarios Activos</CardTitle>
            {/* User icon removed to avoid redeclaration */}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-800">{users.filter((user) => user.estado).length}</div>
            <p className="text-xs text-green-600 mt-1">Cuentas habilitadas</p>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card className="shadow-xl border-green-200 bg-white">
        <CardHeader className="bg-green-600 text-white">
          <CardTitle className="text-xl">Lista de Usuarios</CardTitle>
          <CardDescription className="text-green-100">Gestiona todos los usuarios del sistema</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-green-50">
                  <TableHead className="font-semibold text-green-700">Nombre</TableHead>
                  <TableHead className="font-semibold text-green-700">Correo</TableHead>
                  <TableHead className="font-semibold text-green-700">Teléfono</TableHead>
                  <TableHead className="font-semibold text-green-700">Rol</TableHead>
                  <TableHead className="font-semibold text-green-700">Estado</TableHead>
                  <TableHead className="font-semibold text-green-700">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user._id} className="hover:bg-green-50">
                    <TableCell className="font-medium">
                      {user.nombre} {user.primerApell} {user.segundoApell}
                    </TableCell>
                    <TableCell>{user.correo}</TableCell>
                    <TableCell>{user.telefono}</TableCell>
                    <TableCell>
                      <Badge
                        variant={user.idRol === 1 ? "default" : "secondary"}
                        className={user.idRol === 1 ? "bg-green-500 text-white" : "bg-gray-100 text-gray-700"}
                      >
                        {getRoleName(user.idRol)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={user.estado ? "default" : "secondary"}
                        className={user.estado ? "bg-green-500 text-white" : "bg-red-500 text-white"}
                      >
                        {user.estado ? "Activo" : "Inactivo"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(user)}
                          className="border-green-200 text-green-700 hover:bg-green-50"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(user._id)}
                          className="border-red-200 text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
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
  )
}
