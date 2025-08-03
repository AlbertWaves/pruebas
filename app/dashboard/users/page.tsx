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
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Users, UserPlus, Search, Filter, MoreHorizontal, Edit, Trash2, RotateCcw } from "lucide-react"
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
    contrasena: "",
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

  const validatePassword = (password: string) => {
    return password.length >= 6
  }

  const validateForm = (userData: any) => {
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

    if (!validateEmail(userData.correo)) {
      newErrors.correo = "Ingrese un correo electrónico válido"
    }

    if (!validatePhone(userData.numTel)) {
      newErrors.numTel = "Ingrese un número de teléfono válido (mínimo 10 dígitos)"
    }

    if (userData.contrasena && !validatePassword(userData.contrasena)) {
      newErrors.contrasena = "La contraseña debe tener al menos 6 caracteres"
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
        const createdUser = await response.json()
        setUsers((prev) => [...prev, createdUser])
        setNewUser({
          nombre: "",
          primerApell: "",
          segundoApell: "",
          numTel: "",
          correo: "",
          contrasena: "",
          idRol: 2,
        })
        setErrors({})
        setIsCreateDialogOpen(false)
        alert("Usuario creado exitosamente")
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

    if (!validateForm(editingUser)) {
      return
    }

    try {
      const response = await fetch(`/api/users/${editingUser._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingUser),
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

  const handleResetPassword = async (userId: number) => {
    if (
      confirm(
        "¿Estás seguro de que deseas resetear la contraseña de este usuario? La contraseña será cambiada a '123456789'",
      )
    ) {
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
  }

  if (loading) {
    return <div>Cargando...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
          <p className="text-gray-600">Gestionar cuentas de usuario, roles y permisos del sistema</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700">
              <UserPlus className="w-4 h-4 mr-2" />
              Agregar Usuario
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Usuario</DialogTitle>
              <DialogDescription>
                Agregar un nuevo usuario al sistema. Recibirán credenciales de acceso por correo electrónico.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre *</Label>
                <Input
                  id="nombre"
                  placeholder="Ingresa el nombre"
                  value={newUser.nombre}
                  onChange={(e) => {
                    const value = handleNameInput(e)
                    setNewUser((prev) => ({ ...prev, nombre: value }))
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
                  placeholder="Ingresa el primer apellido"
                  value={newUser.primerApell}
                  onChange={(e) => {
                    const value = handleNameInput(e)
                    setNewUser((prev) => ({ ...prev, primerApell: value }))
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
                  placeholder="Ingresa el segundo apellido (opcional)"
                  value={newUser.segundoApell}
                  onChange={(e) => {
                    const value = handleNameInput(e)
                    setNewUser((prev) => ({ ...prev, segundoApell: value }))
                  }}
                  className={errors.segundoApell ? "border-red-500" : ""}
                />
                {errors.segundoApell && <p className="text-sm text-red-500">{errors.segundoApell}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="correo">Correo Electrónico *</Label>
                <Input
                  id="correo"
                  type="email"
                  placeholder="Ingresa el correo electrónico"
                  value={newUser.correo}
                  onChange={(e) => setNewUser((prev) => ({ ...prev, correo: e.target.value }))}
                  className={errors.correo ? "border-red-500" : ""}
                  required
                />
                {errors.correo && <p className="text-sm text-red-500">{errors.correo}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefono">Número de Teléfono *</Label>
                <Input
                  id="telefono"
                  placeholder="Ingresa el número de teléfono"
                  value={newUser.numTel}
                  onChange={(e) => {
                    const value = handlePhoneInput(e)
                    setNewUser((prev) => ({ ...prev, numTel: value }))
                  }}
                  className={errors.numTel ? "border-red-500" : ""}
                  required
                />
                {errors.numTel && <p className="text-sm text-red-500">{errors.numTel}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="contrasena">Contraseña *</Label>
                <Input
                  id="contrasena"
                  type="password"
                  placeholder="Ingresa la contraseña (mínimo 6 caracteres)"
                  value={newUser.contrasena}
                  onChange={(e) => setNewUser((prev) => ({ ...prev, contrasena: e.target.value }))}
                  className={errors.contrasena ? "border-red-500" : ""}
                  required
                />
                {errors.contrasena && <p className="text-sm text-red-500">{errors.contrasena}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="rol">Rol *</Label>
                <Select
                  value={newUser.idRol.toString()}
                  onValueChange={(value) => setNewUser((prev) => ({ ...prev, idRol: Number(value) }))}
                >
                  <SelectTrigger>
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

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" className="bg-green-600 hover:bg-green-700">
                  Crear Usuario
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activos</CardTitle>
            <Users className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactivos</CardTitle>
            <Users className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.inactive}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Administradores</CardTitle>
            <Users className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.admins}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios Regulares</CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{stats.regularUsers}</div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Usuarios ({filteredUsers.length})</CardTitle>
              <CardDescription>Gestionar cuentas de usuario y sus niveles de acceso</CardDescription>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar usuarios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-48">
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
              size="sm"
              onClick={() => {
                setSearchTerm("")
                setRoleFilter("all")
              }}
            >
              <Filter className="w-4 h-4 mr-2" />
              Limpiar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user._id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarFallback className="bg-green-100 text-green-600">
                          {user.nombre.charAt(0)}
                          {user.primerApell.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {user.nombre} {user.primerApell} {user.segundoApell}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm">{user.correo}</p>
                      <p className="text-sm text-gray-500">{user.numTel}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.estado ? "default" : "destructive"}>
                      {user.estado ? "Activo" : "Inactivo"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={getRoleBadgeVariant(user.idRol)}
                      className={user.idRol === 1 ? "bg-green-100 text-green-800" : ""}
                    >
                      {getRoleName(user.idRol)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
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
                        <DropdownMenuItem onClick={() => handleResetPassword(user._id)} className="text-orange-600">
                          <RotateCcw className="w-4 h-4 mr-2" />
                          Resetear Contraseña
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Usuario</DialogTitle>
            <DialogDescription>Modificar la información del usuario seleccionado.</DialogDescription>
          </DialogHeader>
          {editingUser && (
            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="editNombre">Nombre *</Label>
                <Input
                  id="editNombre"
                  value={editingUser.nombre}
                  onChange={(e) => {
                    const value = handleNameInput(e)
                    setEditingUser((prev) => (prev ? { ...prev, nombre: value } : null))
                  }}
                  className={errors.nombre ? "border-red-500" : ""}
                  required
                />
                {errors.nombre && <p className="text-sm text-red-500">{errors.nombre}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="editPrimerApell">Primer Apellido *</Label>
                <Input
                  id="editPrimerApell"
                  value={editingUser.primerApell}
                  onChange={(e) => {
                    const value = handleNameInput(e)
                    setEditingUser((prev) => (prev ? { ...prev, primerApell: value } : null))
                  }}
                  className={errors.primerApell ? "border-red-500" : ""}
                  required
                />
                {errors.primerApell && <p className="text-sm text-red-500">{errors.primerApell}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="editSegundoApell">Segundo Apellido</Label>
                <Input
                  id="editSegundoApell"
                  value={editingUser.segundoApell}
                  onChange={(e) => {
                    const value = handleNameInput(e)
                    setEditingUser((prev) => (prev ? { ...prev, segundoApell: value } : null))
                  }}
                  className={errors.segundoApell ? "border-red-500" : ""}
                />
                {errors.segundoApell && <p className="text-sm text-red-500">{errors.segundoApell}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="editCorreo">Correo Electrónico *</Label>
                <Input
                  id="editCorreo"
                  type="email"
                  value={editingUser.correo}
                  onChange={(e) => setEditingUser((prev) => (prev ? { ...prev, correo: e.target.value } : null))}
                  className={errors.correo ? "border-red-500" : ""}
                  required
                />
                {errors.correo && <p className="text-sm text-red-500">{errors.correo}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="editTelefono">Número de Teléfono *</Label>
                <Input
                  id="editTelefono"
                  value={editingUser.numTel}
                  onChange={(e) => {
                    const value = handlePhoneInput(e)
                    setEditingUser((prev) => (prev ? { ...prev, numTel: value } : null))
                  }}
                  className={errors.numTel ? "border-red-500" : ""}
                  required
                />
                {errors.numTel && <p className="text-sm text-red-500">{errors.numTel}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="editEstado">Estado</Label>
                <Select
                  value={editingUser.estado.toString()}
                  onValueChange={(value) =>
                    setEditingUser((prev) => (prev ? { ...prev, estado: value === "true" } : null))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Activo</SelectItem>
                    <SelectItem value="false">Inactivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="editRol">Rol *</Label>
                <Select
                  value={editingUser.idRol.toString()}
                  onValueChange={(value) => setEditingUser((prev) => (prev ? { ...prev, idRol: Number(value) } : null))}
                >
                  <SelectTrigger>
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

              <div className="space-y-2">
                <Label>Contraseña</Label>
                <div className="p-3 bg-gray-50 rounded-md">
                  <p className="text-sm text-gray-600">
                    Para cambiar la contraseña, usa la opción "Resetear Contraseña" en el menú de acciones. Esto
                    establecerá la contraseña por defecto (123456789).
                  </p>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" className="bg-green-600 hover:bg-green-700">
                  Actualizar Usuario
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
