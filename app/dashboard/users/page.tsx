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
import { Users, UserPlus, Search, Filter, MoreHorizontal, Edit, Trash2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface User {
  _id: number
  nombre: string
  primerApell: string
  segundoApell: string
  numTel: string
  correo: string
  idRol: number
  fechaCreacion?: string
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
    const admins = users.filter((u) => u.idRol === 1).length
    const regularUsers = users.filter((u) => u.idRol === 2).length
    const inactive = 0 // Por ahora no hay usuarios inactivos

    return { total, admins, regularUsers, inactive }
  }

  const stats = getUserStats()

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()

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
    setIsEditDialogOpen(true)
  }

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingUser) return

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
                <Label htmlFor="nombre">Nombre</Label>
                <Input
                  id="nombre"
                  placeholder="Ingresa el nombre"
                  value={newUser.nombre}
                  onChange={(e) => setNewUser((prev) => ({ ...prev, nombre: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="primerApell">Primer Apellido</Label>
                <Input
                  id="primerApell"
                  placeholder="Ingresa el primer apellido"
                  value={newUser.primerApell}
                  onChange={(e) => setNewUser((prev) => ({ ...prev, primerApell: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="segundoApell">Segundo Apellido</Label>
                <Input
                  id="segundoApell"
                  placeholder="Ingresa el segundo apellido (opcional)"
                  value={newUser.segundoApell}
                  onChange={(e) => setNewUser((prev) => ({ ...prev, segundoApell: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="correo">Correo Electrónico</Label>
                <Input
                  id="correo"
                  type="email"
                  placeholder="Ingresa el correo electrónico"
                  value={newUser.correo}
                  onChange={(e) => setNewUser((prev) => ({ ...prev, correo: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefono">Número de Teléfono</Label>
                <Input
                  id="telefono"
                  placeholder="Ingresa el número de teléfono"
                  value={newUser.numTel}
                  onChange={(e) => setNewUser((prev) => ({ ...prev, numTel: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contrasena">Contraseña</Label>
                <Input
                  id="contrasena"
                  type="password"
                  placeholder="Ingresa la contraseña"
                  value={newUser.contrasena}
                  onChange={(e) => setNewUser((prev) => ({ ...prev, contrasena: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rol">Rol</Label>
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
            <CardTitle className="text-sm font-medium">Usuarios Regulares</CardTitle>
            <Users className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.regularUsers}</div>
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
            <CardTitle className="text-sm font-medium">Inactivos</CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{stats.inactive}</div>
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
                <Label htmlFor="editNombre">Nombre</Label>
                <Input
                  id="editNombre"
                  value={editingUser.nombre}
                  onChange={(e) => setEditingUser((prev) => (prev ? { ...prev, nombre: e.target.value } : null))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="editPrimerApell">Primer Apellido</Label>
                <Input
                  id="editPrimerApell"
                  value={editingUser.primerApell}
                  onChange={(e) => setEditingUser((prev) => (prev ? { ...prev, primerApell: e.target.value } : null))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="editSegundoApell">Segundo Apellido</Label>
                <Input
                  id="editSegundoApell"
                  value={editingUser.segundoApell}
                  onChange={(e) => setEditingUser((prev) => (prev ? { ...prev, segundoApell: e.target.value } : null))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="editCorreo">Correo Electrónico</Label>
                <Input
                  id="editCorreo"
                  type="email"
                  value={editingUser.correo}
                  onChange={(e) => setEditingUser((prev) => (prev ? { ...prev, correo: e.target.value } : null))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="editTelefono">Número de Teléfono</Label>
                <Input
                  id="editTelefono"
                  value={editingUser.numTel}
                  onChange={(e) => setEditingUser((prev) => (prev ? { ...prev, numTel: e.target.value } : null))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="editRol">Rol</Label>
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
