"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Users, UserPlus, Search, Filter, MoreHorizontal, Edit, Trash2, RotateCcw, Shield } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface User {
  _id: number
  nombre: string
  primerApell: string
  segundoApell: string
  numTel: string
  correo: string
  estado: boolean
  idRol: number
}

interface Role {
  _id: number
  nombreRol: string
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [loading, setLoading] = useState(true)

  const [newUser, setNewUser] = useState({
    nombre: "",
    primerApell: "",
    segundoApell: "",
    numTel: "",
    correo: "",
    idRol: 2,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

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

  const validateForm = (userData: any, isEdit = false) => {
    const newErrors: Record<string, string> = {}

    if (!validateName(userData.nombre)) {
      newErrors.nombre = "El nombre debe contener solo letras y tener al menos 2 caracteres"
    }

    if (!validateName(userData.primerApell)) {
      newErrors.primerApell = "El apellido debe contener solo letras y tener al menos 2 caracteres"
    }

    if (userData.segundoApell && !validateName(userData.segundoApell)) {
      newErrors.segundoApell = "El segundo apellido debe contener solo letras"
    }

    if (!isEdit && !validateEmail(userData.correo)) {
      newErrors.correo = "Ingrese un correo electrónico válido"
    }

    if (!validatePhone(userData.numTel)) {
      newErrors.numTel = "Ingrese un número de teléfono válido (mínimo 10 dígitos)"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.correo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.numTel.includes(searchTerm)

    const matchesRole = roleFilter === "all" || user.idRol.toString() === roleFilter

    return matchesSearch && matchesRole
  })

  const getUserStats = () => {
    const total = users.length
    const active = users.filter((u) => u.estado).length
    const inactive = users.filter((u) => !u.estado).length
    const admins = users.filter((u) => u.idRol === 1).length
    const regularUsers = users.filter((u) => u.idRol === 2).length

    return { total, active, inactive, admins, regularUsers }
  }

  const stats = getUserStats()

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm(newUser)) {
      return
    }

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      })

      if (response.ok) {
        const result = await response.json()
        setUsers((prev) => [...prev, result.user])
        setNewUser({
          nombre: "",
          primerApell: "",
          segundoApell: "",
          numTel: "",
          correo: "",
          idRol: 2,
        })
        setErrors({})
        setIsCreateDialogOpen(false)
        alert("Usuario creado exitosamente con contraseña por defecto: 123456789")
      } else {
        const errorData = await response.json()
        alert(errorData.error || "Error al crear el usuario")
      }
    } catch (error) {
      console.error("Error al crear usuario:", error)
      alert("Error al crear el usuario")
    }
  }

  const handleEditUser = (user: User) => {
    setEditingUser(user)
    setErrors({})
    setIsEditDialogOpen(true)
  }

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingUser) return

    if (!validateForm(editingUser, true)) {
      return
    }

    try {
      const response = await fetch(`/api/users/${editingUser._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: editingUser.nombre,
          primerApell: editingUser.primerApell,
          segundoApell: editingUser.segundoApell,
          numTel: editingUser.numTel,
          estado: editingUser.estado,
          idRol: editingUser.idRol,
        }),
      })

      if (response.ok) {
        const updatedUser = await response.json()
        setUsers((prev) => prev.map((u) => (u._id === editingUser._id ? updatedUser : u)))
        setIsEditDialogOpen(false)
        setEditingUser(null)
        setErrors({})
        alert("Usuario actualizado exitosamente")
      } else {
        const errorData = await response.json()
        alert(errorData.error || "Error al actualizar el usuario")
      }
    } catch (error) {
      console.error("Error al actualizar usuario:", error)
      alert("Error al actualizar el usuario")
    }
  }

  const handleDeleteUser = async (userId: number) => {
    if (confirm("¿Estás seguro de que deseas eliminar este usuario?")) {
      try {
        const response = await fetch(`/api/users/${userId}`, {
          method: "DELETE",
        })

        if (response.ok) {
          setUsers((prev) => prev.filter((u) => u._id !== userId))
          alert("Usuario eliminado exitosamente")
        } else {
          const errorData = await response.json()
          alert(errorData.error || "Error al eliminar el usuario")
        }
      } catch (error) {
        console.error("Error al eliminar usuario:", error)
        alert("Error al eliminar el usuario")
      }
    }
  }

  const handleResetPassword = async (userId: number) => {
    try {
      const response = await fetch(`/api/users/${userId}/reset-password`, {
        method: "POST",
      })

      if (response.ok) {
        alert("Contraseña reseteada exitosamente. La nueva contraseña es: 123456789")
      } else {
        const errorData = await response.json()
        alert(errorData.error || "Error al resetear la contraseña")
      }
    } catch (error) {
      console.error("Error al resetear contraseña:", error)
      alert("Error al resetear la contraseña")
    }
  }

  const getRoleName = (idRol: number) => {
    const role = roles.find((r) => r._id === idRol)
    return role ? role.nombreRol : "Desconocido"
  }

  const getRoleBadgeVariant = (idRol: number) => {
    return idRol === 1 ? "default" : "secondary"
  }

  const handlePhoneInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9+\-\s()]/g, "")
    return value
  }

  const handleNameInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "")
    return value
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
            <p className="text-lg text-gray-600">Gestionar cuentas de usuario, roles y permisos del sistema</p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700" size="lg">
                <UserPlus className="w-5 h-5 mr-2" />
                Agregar Usuario
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle className="text-xl">Crear Nuevo Usuario</DialogTitle>
                <DialogDescription className="text-base">
                  Agregar un nuevo usuario al sistema. La contraseña por defecto será: 123456789
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateUser} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <Label htmlFor="nombre" className="text-base font-medium">
                      Nombre *
                    </Label>
                    <Input
                      id="nombre"
                      placeholder="Ingresa el nombre"
                      value={newUser.nombre}
                      onChange={(e) => {
                        const value = handleNameInput(e)
                        setNewUser((prev) => ({ ...prev, nombre: value }))
                      }}
                      className={`text-base h-12 ${errors.nombre ? "border-red-500" : ""}`}
                      required
                    />
                    {errors.nombre && <p className="text-sm text-red-500">{errors.nombre}</p>}
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="primerApell" className="text-base font-medium">
                      Primer Apellido *
                    </Label>
                    <Input
                      id="primerApell"
                      placeholder="Primer apellido"
                      value={newUser.primerApell}
                      onChange={(e) => {
                        const value = handleNameInput(e)
                        setNewUser((prev) => ({ ...prev, primerApell: value }))
                      }}
                      className={`text-base h-12 ${errors.primerApell ? "border-red-500" : ""}`}
                      required
                    />
                    {errors.primerApell && <p className="text-sm text-red-500">{errors.primerApell}</p>}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="segundoApell" className="text-base font-medium">
                    Segundo Apellido
                  </Label>
                  <Input
                    id="segundoApell"
                    placeholder="Segundo apellido (opcional)"
                    value={newUser.segundoApell}
                    onChange={(e) => {
                      const value = handleNameInput(e)
                      setNewUser((prev) => ({ ...prev, segundoApell: value }))
                    }}
                    className={`text-base h-12 ${errors.segundoApell ? "border-red-500" : ""}`}
                  />
                  {errors.segundoApell && <p className="text-sm text-red-500">{errors.segundoApell}</p>}
                </div>

                <div className="space-y-3">
                  <Label htmlFor="correo" className="text-base font-medium">
                    Correo Electrónico *
                  </Label>
                  <Input
                    id="correo"
                    type="email"
                    placeholder="correo@ejemplo.com"
                    value={newUser.correo}
                    onChange={(e) => setNewUser((prev) => ({ ...prev, correo: e.target.value }))}
                    className={`text-base h-12 ${errors.correo ? "border-red-500" : ""}`}
                    required
                  />
                  {errors.correo && <p className="text-sm text-red-500">{errors.correo}</p>}
                </div>

                <div className="space-y-3">
                  <Label htmlFor="telefono" className="text-base font-medium">
                    Número de Teléfono *
                  </Label>
                  <Input
                    id="telefono"
                    placeholder="Número de teléfono"
                    value={newUser.numTel}
                    onChange={(e) => {
                      const value = handlePhoneInput(e)
                      setNewUser((prev) => ({ ...prev, numTel: value }))
                    }}
                    className={`text-base h-12 ${errors.numTel ? "border-red-500" : ""}`}
                    required
                  />
                  {errors.numTel && <p className="text-sm text-red-500">{errors.numTel}</p>}
                </div>

                <div className="space-y-3">
                  <Label htmlFor="rol" className="text-base font-medium">
                    Rol *
                  </Label>
                  <Select
                    value={newUser.idRol.toString()}
                    onValueChange={(value) => setNewUser((prev) => ({ ...prev, idRol: Number(value) }))}
                  >
                    <SelectTrigger className="text-base h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role._id} value={role._id.toString()}>
                          {role.nombreRol}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="bg-blue-50 p-4 rounded-md">
                  <p className="text-sm text-blue-800">
                    <strong>Nota:</strong> La contraseña por defecto será <code>123456789</code>. El usuario deberá
                    cambiarla en su primer inicio de sesión.
                  </p>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)} size="lg">
                    Cancelar
                  </Button>
                  <Button type="submit" className="bg-green-600 hover:bg-green-700" size="lg">
                    Crear Usuario
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <Card className="shadow-lg border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-lg font-semibold">Total Usuarios</CardTitle>
              <Users className="h-6 w-6 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600 mb-2">{stats.total}</div>
              <p className="text-sm text-muted-foreground">Usuarios registrados</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-lg font-semibold">Activos</CardTitle>
              <Users className="h-6 w-6 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600 mb-2">{stats.active}</div>
              <p className="text-sm text-muted-foreground">Cuentas habilitadas</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-lg font-semibold">Inactivos</CardTitle>
              <Users className="h-6 w-6 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600 mb-2">{stats.inactive}</div>
              <p className="text-sm text-muted-foreground">Cuentas deshabilitadas</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-lg font-semibold">Administradores</CardTitle>
              <Shield className="h-6 w-6 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600 mb-2">{stats.admins}</div>
              <p className="text-sm text-muted-foreground">Con permisos completos</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-lg font-semibold">Usuarios Regulares</CardTitle>
              <Users className="h-6 w-6 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-600 mb-2">{stats.regularUsers}</div>
              <p className="text-sm text-muted-foreground">Acceso limitado</p>
            </CardContent>
          </Card>
        </div>

        {/* Users Table */}
        <Card className="shadow-lg border-0">
          <CardHeader className="pb-6">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl mb-2">Usuarios ({filteredUsers.length})</CardTitle>
                <CardDescription className="text-base">
                  Gestionar cuentas de usuario y sus niveles de acceso
                </CardDescription>
              </div>
            </div>

            {/* Search and Filter */}
            <div className="flex items-center space-x-6 mt-6">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Buscar usuarios..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 text-base h-12"
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-48 text-base h-12">
                  <SelectValue placeholder="Todos los roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los roles</SelectItem>
                  {roles.map((role) => (
                    <SelectItem key={role._id} value={role._id.toString()}>
                      {role.nombreRol}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="lg"
                onClick={() => {
                  setSearchTerm("")
                  setRoleFilter("all")
                }}
                className="bg-transparent"
              >
                <Filter className="w-5 h-5 mr-2" />
                Limpiar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-base font-semibold">Usuario</TableHead>
                    <TableHead className="text-base font-semibold">Contacto</TableHead>
                    <TableHead className="text-base font-semibold">Estado</TableHead>
                    <TableHead className="text-base font-semibold">Rol</TableHead>
                    <TableHead className="text-base font-semibold">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user._id} className="hover:bg-gray-50">
                      <TableCell>
                        <div className="flex items-center space-x-4">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback className="bg-green-100 text-green-600 text-lg">
                              {user.nombre.charAt(0)}
                              {user.primerApell.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold text-base">
                              {user.nombre} {user.primerApell} {user.segundoApell}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-base">{user.correo}</p>
                          <p className="text-sm text-gray-500">{user.numTel}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.estado ? "default" : "destructive"} className="text-sm px-3 py-1">
                          {user.estado ? "Activo" : "Inactivo"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={getRoleBadgeVariant(user.idRol)}
                          className={`text-sm px-3 py-1 ${user.idRol === 1 ? "bg-green-100 text-green-800" : ""}`}
                        >
                          {getRoleName(user.idRol)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-10 w-10">
                              <MoreHorizontal className="w-5 h-5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditUser(user)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteUser(user._id)} className="text-red-600">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Eliminar
                            </DropdownMenuItem>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-orange-600">
                                  <RotateCcw className="w-4 h-4 mr-2" />
                                  Resetear Contraseña
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="text-xl">¿Resetear contraseña?</AlertDialogTitle>
                                  <AlertDialogDescription className="text-base">
                                    Esta acción cambiará la contraseña del usuario a la contraseña por defecto:{" "}
                                    <strong>123456789</strong>
                                    <br />
                                    <br />
                                    El usuario deberá cambiar su contraseña en el próximo inicio de sesión.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleResetPassword(user._id)}
                                    className="bg-orange-600 hover:bg-orange-700"
                                  >
                                    Resetear Contraseña
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Edit User Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-xl">Editar Usuario</DialogTitle>
              <DialogDescription className="text-base">
                Modificar la información del usuario seleccionado.
              </DialogDescription>
            </DialogHeader>
            {editingUser && (
              <form onSubmit={handleUpdateUser} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <Label htmlFor="editNombre" className="text-base font-medium">
                      Nombre *
                    </Label>
                    <Input
                      id="editNombre"
                      value={editingUser.nombre}
                      onChange={(e) => {
                        const value = handleNameInput(e)
                        setEditingUser((prev) => (prev ? { ...prev, nombre: value } : null))
                      }}
                      className={`text-base h-12 ${errors.nombre ? "border-red-500" : ""}`}
                      required
                    />
                    {errors.nombre && <p className="text-sm text-red-500">{errors.nombre}</p>}
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="editPrimerApell" className="text-base font-medium">
                      Primer Apellido *
                    </Label>
                    <Input
                      id="editPrimerApell"
                      value={editingUser.primerApell}
                      onChange={(e) => {
                        const value = handleNameInput(e)
                        setEditingUser((prev) => (prev ? { ...prev, primerApell: value } : null))
                      }}
                      className={`text-base h-12 ${errors.primerApell ? "border-red-500" : ""}`}
                      required
                    />
                    {errors.primerApell && <p className="text-sm text-red-500">{errors.primerApell}</p>}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="editSegundoApell" className="text-base font-medium">
                    Segundo Apellido
                  </Label>
                  <Input
                    id="editSegundoApell"
                    value={editingUser.segundoApell}
                    onChange={(e) => {
                      const value = handleNameInput(e)
                      setEditingUser((prev) => (prev ? { ...prev, segundoApell: value } : null))
                    }}
                    className={`text-base h-12 ${errors.segundoApell ? "border-red-500" : ""}`}
                  />
                  {errors.segundoApell && <p className="text-sm text-red-500">{errors.segundoApell}</p>}
                </div>

                <div className="space-y-3">
                  <Label htmlFor="editTelefono" className="text-base font-medium">
                    Número de Teléfono *
                  </Label>
                  <Input
                    id="editTelefono"
                    value={editingUser.numTel}
                    onChange={(e) => {
                      const value = handlePhoneInput(e)
                      setEditingUser((prev) => (prev ? { ...prev, numTel: value } : null))
                    }}
                    className={`text-base h-12 ${errors.numTel ? "border-red-500" : ""}`}
                    required
                  />
                  {errors.numTel && <p className="text-sm text-red-500">{errors.numTel}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <Label htmlFor="editEstado" className="text-base font-medium">
                      Estado
                    </Label>
                    <Select
                      value={editingUser.estado.toString()}
                      onValueChange={(value) =>
                        setEditingUser((prev) => (prev ? { ...prev, estado: value === "true" } : null))
                      }
                    >
                      <SelectTrigger className="text-base h-12">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Activo</SelectItem>
                        <SelectItem value="false">Inactivo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="editRol" className="text-base font-medium">
                      Rol *
                    </Label>
                    <Select
                      value={editingUser.idRol.toString()}
                      onValueChange={(value) =>
                        setEditingUser((prev) => (prev ? { ...prev, idRol: Number(value) } : null))
                      }
                    >
                      <SelectTrigger className="text-base h-12">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map((role) => (
                          <SelectItem key={role._id} value={role._id.toString()}>
                            {role.nombreRol}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-md">
                  <p className="text-sm text-gray-600">
                    <strong>Nota:</strong> El correo electrónico no se puede modificar desde aquí. Para cambiar la
                    contraseña, usa la opción "Resetear Contraseña" en el menú de acciones.
                  </p>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)} size="lg">
                    Cancelar
                  </Button>
                  <Button type="submit" className="bg-green-600 hover:bg-green-700" size="lg">
                    Actualizar Usuario
                  </Button>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
