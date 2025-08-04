"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Users, UserPlus, Search, Edit, Trash2, RotateCcw, Shield } from "lucide-react"

interface Role {
  _id: string
  nombre: string
  descripcion: string
}

export default function UsersPage() {
  const [users, setUsers] = useState([])
  const [roles, setRoles] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const [newUser, setNewUser] = useState({
    nombre: "",
    email: "",
    password: "",
    rol: "",
  })

  const [editUser, setEditUser] = useState({
    nombre: "",
    email: "",
    rol: "",
  })

  useEffect(() => {
    loadUsers()
    loadRoles()
  }, [])

  useEffect(() => {
    filterUsers()
  }, [users, searchTerm, roleFilter])

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

  const filterUsers = () => {
    let filtered = users

    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (roleFilter !== "all") {
      filtered = filtered.filter((user) => user.rol === roleFilter)
    }

    setFilteredUsers(filtered)
  }

  const handleCreateUser = async () => {
    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      })

      if (response.ok) {
        loadUsers()
        setIsCreateDialogOpen(false)
        setNewUser({ nombre: "", email: "", password: "", rol: "" })
        alert("Usuario creado exitosamente")
      } else {
        alert("Error al crear usuario")
      }
    } catch (error) {
      console.error("Error creating user:", error)
      alert("Error al crear usuario")
    }
  }

  const handleEditUser = async () => {
    if (!selectedUser) return

    try {
      const response = await fetch(`/api/users/${selectedUser._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editUser),
      })

      if (response.ok) {
        loadUsers()
        setIsEditDialogOpen(false)
        setSelectedUser(null)
        alert("Usuario actualizado exitosamente")
      } else {
        alert("Error al actualizar usuario")
      }
    } catch (error) {
      console.error("Error updating user:", error)
      alert("Error al actualizar usuario")
    }
  }

  const handleDeleteUser = async (userId) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        loadUsers()
        alert("Usuario eliminado exitosamente")
      } else {
        alert("Error al eliminar usuario")
      }
    } catch (error) {
      console.error("Error deleting user:", error)
      alert("Error al eliminar usuario")
    }
  }

  const handleResetPassword = async (userId) => {
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

  const openEditDialog = (user) => {
    setSelectedUser(user)
    setEditUser({
      nombre: user.nombre,
      email: user.email,
      rol: user.rol,
    })
    setIsEditDialogOpen(true)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("es-ES")
  }

  const getRoleBadgeColor = (role) => {
    switch (role.toLowerCase()) {
      case "admin":
        return "bg-red-100 text-red-800"
      case "supervisor":
        return "bg-blue-100 text-blue-800"
      case "operador":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
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
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="px-6">
                <UserPlus className="w-5 h-5 mr-2" />
                Nuevo Usuario
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-xl">Crear Nuevo Usuario</DialogTitle>
                <DialogDescription className="text-base">
                  Ingresa los datos del nuevo usuario del sistema.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre" className="text-base font-medium">
                    Nombre completo
                  </Label>
                  <Input
                    id="nombre"
                    value={newUser.nombre}
                    onChange={(e) => setNewUser({ ...newUser, nombre: e.target.value })}
                    className="text-base h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-base font-medium">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    className="text-base h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-base font-medium">
                    Contraseña
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    className="text-base h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rol" className="text-base font-medium">
                    Rol
                  </Label>
                  <Select value={newUser.rol} onValueChange={(value) => setNewUser({ ...newUser, rol: value })}>
                    <SelectTrigger className="text-base h-12">
                      <SelectValue placeholder="Selecciona un rol" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role._id} value={role.nombre}>
                          {role.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateUser}>Crear Usuario</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
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
              <div className="text-3xl font-bold text-red-600 mb-2">
                {users.filter((user) => user.rol.toLowerCase() === "admin").length}
              </div>
              <p className="text-sm text-muted-foreground">Con permisos completos</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-lg font-semibold">Usuarios Activos</CardTitle>
              {/* Placeholder for User icon */}
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600 mb-2">{users.filter((user) => user.activo).length}</div>
              <p className="text-sm text-muted-foreground">Cuentas habilitadas</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-lg font-semibold">Roles</CardTitle>
              {/* Placeholder for Shield icon */}
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600 mb-2">{roles.length}</div>
              <p className="text-sm text-muted-foreground">Roles configurados</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="shadow-lg border-0">
          <CardHeader className="pb-6">
            <CardTitle className="text-xl">Filtros y Búsqueda</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    placeholder="Buscar por nombre o email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 text-base h-12"
                  />
                </div>
              </div>
              <div className="w-full md:w-48">
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="text-base h-12">
                    <SelectValue placeholder="Filtrar por rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los roles</SelectItem>
                    {roles.map((role) => (
                      <SelectItem key={role._id} value={role.nombre}>
                        {role.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card className="shadow-lg border-0">
          <CardHeader className="pb-6">
            <CardTitle className="text-2xl">Lista de Usuarios</CardTitle>
            <CardDescription className="text-base">
              {filteredUsers.length} usuario{filteredUsers.length !== 1 ? "s" : ""} encontrado
              {filteredUsers.length !== 1 ? "s" : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-base font-semibold">Usuario</TableHead>
                    <TableHead className="text-base font-semibold">Email</TableHead>
                    <TableHead className="text-base font-semibold">Rol</TableHead>
                    <TableHead className="text-base font-semibold">Fecha Creación</TableHead>
                    <TableHead className="text-base font-semibold">Estado</TableHead>
                    <TableHead className="text-base font-semibold">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user._id} className="hover:bg-gray-50">
                      <TableCell className="font-medium text-base">{user.nombre}</TableCell>
                      <TableCell className="text-base">{user.email}</TableCell>
                      <TableCell>
                        <Badge className={`${getRoleBadgeColor(user.rol)} text-sm px-3 py-1`}>{user.rol}</Badge>
                      </TableCell>
                      <TableCell className="text-base">{formatDate(user.fechaCreacion)}</TableCell>
                      <TableCell>
                        <Badge variant={user.activo ? "default" : "secondary"} className="text-sm px-3 py-1">
                          {user.activo ? "Activo" : "Inactivo"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm" onClick={() => openEditDialog(user)} className="h-9 px-3">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm" className="h-9 px-3 bg-transparent">
                                <RotateCcw className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-xl">Restablecer Contraseña</AlertDialogTitle>
                                <AlertDialogDescription className="text-base">
                                  ¿Estás seguro de que quieres restablecer la contraseña de {user.nombre}? Se generará
                                  una nueva contraseña temporal.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleResetPassword(user._id)}>
                                  Restablecer
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-9 px-3 text-red-600 hover:text-red-700 bg-transparent"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-xl">Eliminar Usuario</AlertDialogTitle>
                                <AlertDialogDescription className="text-base">
                                  ¿Estás seguro de que quieres eliminar a {user.nombre}? Esta acción no se puede
                                  deshacer.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteUser(user._id)}
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

        {/* Edit User Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl">Editar Usuario</DialogTitle>
              <DialogDescription className="text-base">Modifica los datos del usuario seleccionado.</DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-nombre" className="text-base font-medium">
                  Nombre completo
                </Label>
                <Input
                  id="edit-nombre"
                  value={editUser.nombre}
                  onChange={(e) => setEditUser({ ...editUser, nombre: e.target.value })}
                  className="text-base h-12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email" className="text-base font-medium">
                  Email
                </Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editUser.email}
                  onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                  className="text-base h-12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-rol" className="text-base font-medium">
                  Rol
                </Label>
                <Select value={editUser.rol} onValueChange={(value) => setEditUser({ ...editUser, rol: value })}>
                  <SelectTrigger className="text-base h-12">
                    <SelectValue placeholder="Selecciona un rol" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role._id} value={role.nombre}>
                        {role.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleEditUser}>Guardar Cambios</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
