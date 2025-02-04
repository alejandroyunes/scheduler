import React, { useState } from 'react'
import { Users, Clock, Search, UserPlus, X, AlertCircle, Pencil, Trash2 } from 'lucide-react'
import type { User, TimeBlock } from '../types/user'

import { generateUserColor } from '../core/utils'

export const Scheduler = () => {

  const [users, setUsers] = useState<User[]>([
    { id: '1', name: 'Jose', phone: '222 2222', email: 'user@user.com', location: 'Bogota D.C.', color: 'hsl(200, 70%, 60%)' },
    { id: '2', name: 'Maria', phone: '333 3333', email: 'Maria@user.com', location: 'Cali', color: 'hsl(150, 70%, 60%)' }
  ])

  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([])
  const [newUser, setNewUser] = useState<Partial<User>>({})
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilters, setSelectedFilters] = useState<string[]>([])
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedUserId, setSelectedUserId] = useState<string>('')
  const [selectedHour, setSelectedHour] = useState<number | null>(null)
  const [error, setError] = useState<string>('')

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (newUser.name && newUser.phone && newUser.email && newUser.location) {
      setUsers([...users, {
        ...newUser,
        id: Date.now().toString(),
        color: generateUserColor()
      } as User])
      setNewUser({})
    }
  }

  const handleEditUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser && editingUser.name && editingUser.phone && editingUser.email && editingUser.location) {
      setUsers(users.map(user =>
        user.id === editingUser.id ? editingUser : user
      ))
      setEditingUser(null)
    }
  }

  const handleDeleteUser = (userId: string) => {
    // Delete all time blocks associated with this user
    setTimeBlocks(timeBlocks.filter(block => block.userId !== userId));
    // Delete the user
    setUsers(users.filter(user => user.id !== userId));
    // Reset editing state if we're deleting the user being edited
    if (editingUser?.id === userId) {
      setEditingUser(null);
    }
  }

  const timeSlots = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    color: 'bg-green-100'
  }));

  const toggleFilter = (filter: string) => {
    setSelectedFilters(prev =>
      prev.includes(filter)
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    )
  }

  const filteredUsers = users.filter(user => {
    if (!searchTerm) return true;

    if (selectedFilters.length === 0) {
      return (
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return selectedFilters.some(filter => {
      switch (filter) {
        case 'name':
          return user.name.toLowerCase().includes(searchTerm.toLowerCase());
        case 'phone':
          return user.phone.toLowerCase().includes(searchTerm.toLowerCase());
        case 'email':
          return user.email.toLowerCase().includes(searchTerm.toLowerCase());
        default:
          return false;
      }
    })
  })

  const handleAddTimeBlock = () => {
    setError('')

    if (!selectedUserId || !selectedDate) {
      setError('Por favor seleccione un usuario y una fecha')
      return
    }

    if (!selectedHour && selectedHour !== 0) {
      setError('Por favor seleccione una hora')
      return
    }

    // Get tomorrow's date at midnight
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)

    const selectedDateTime = new Date(selectedDate)
    selectedDateTime.setDate(selectedDateTime.getDate() + 1)
    selectedDateTime.setHours(0, 0, 0, 0)

    // Check if the selected date is tomorrow (not today or after tomorrow)
    if (selectedDateTime.getTime() !== tomorrow.getTime()) {
      setError('Solo se pueden crear bloques para el día siguiente')
      return
    }

    const user = users.find(u => u.id === selectedUserId)
    if (!user) return

    // Check if the time block already exists
    const blockExists = timeBlocks.some(
      block =>
        block.date === selectedDate &&
        block.hour === selectedHour
    );

    if (blockExists) {
      setError('Ya existe un bloque de tiempo para esta hora');
      return;
    }

    const newBlock: TimeBlock = {
      id: Date.now().toString(),
      userId: selectedUserId,
      date: selectedDate,
      hour: selectedHour,
      userName: user.name,
      userColor: user.color
    };

    setTimeBlocks([...timeBlocks, newBlock]);
    setSelectedHour(null);
  }

  const getTimeBlocksForDate = () => {
    if (!selectedDate) return [];
    return timeBlocks.filter(block => block.date === selectedDate);
  }

  const currentTimeBlocks = getTimeBlocksForDate();

  // Get tomorrow's date in YYYY-MM-DD format for the date input min/max
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  return (

    <section className="grid grid-cols-12 gap-6">
      {/* Time slots */}
      <div className="col-span-2">
        <div className="space-y-1">
          <div className="text-sm text-gray-500">Línea de tiempos</div>
          {timeSlots.map(slot => {
            const timeBlock = currentTimeBlocks.find(block => block.hour === slot.hour);
            return (
              <div
                key={slot.hour}
                className={`h-12 rounded-md border border-gray-200 relative cursor-pointer transition-all ${timeBlock
                    ? 'bg-opacity-50'
                    : slot.color
                  }`}
                onClick={() => setSelectedHour(slot.hour)}
                style={{
                  backgroundColor: timeBlock ? timeBlock.userColor : undefined,
                }}
              >
                <div className="flex justify-between items-center px-2 h-full">
                  <span className="text-xs text-gray-600">
                    {String(slot.hour).padStart(2, '0')}:00
                  </span>
                  {timeBlock && (
                    <span className="text-xs font-medium truncate">
                      {timeBlock.userName}
                    </span>
                  )}
                </div>
                {selectedHour === slot.hour && (
                  <div className="absolute inset-0 border-2 border-blue-500 rounded-md"></div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main content */}
      <div className="col-span-6">
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Users className="w-5 h-5" />
              Lista de usuarios
            </h2>
            <div className="flex gap-2">
              {['name', 'phone', 'email'].map(filter => (
                <button
                  key={filter}
                  onClick={() => toggleFilter(filter)}
                  className={`px-3 py-1 rounded-md text-sm flex items-center gap-1 ${selectedFilters.includes(filter)
                      ? 'bg-pink-500 text-white'
                      : 'bg-pink-100 text-pink-600'
                    }`}
                >
                  {filter}
                  {selectedFilters.includes(filter) && (
                    <X className="w-3 h-3" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                placeholder={`Buscar por ${selectedFilters.length > 0 ? selectedFilters.join(', ') : 'todos los campos'}`}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            {filteredUsers.map(user => (
              <div
                key={user.id}
                className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: user.color }}
                  >
                    <Users className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="font-medium">{user.name}</div>
                    <div className="text-sm text-gray-500">{user.phone}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div>
                    <div className="text-sm text-gray-600">{user.email}</div>
                    <div className="text-sm text-gray-500">{user.location}</div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingUser(user)}
                      className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                      title="Editar usuario"
                    >
                      <Pencil className="w-4 h-4 text-blue-500" />
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                      title="Eliminar usuario"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right sidebar */}
      <div className="col-span-4 space-y-6">
        {/* New/Edit user form */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            {editingUser ? 'Editar usuario' : 'Nuevo usuario'}
          </h3>
          <form onSubmit={editingUser ? handleEditUser : handleAddUser} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Nombre</label>
              <input
                type="text"
                className="w-full p-2 border border-gray-200 rounded-md"
                value={editingUser ? editingUser.name : newUser.name || ''}
                onChange={e => editingUser
                  ? setEditingUser({ ...editingUser, name: e.target.value })
                  : setNewUser({ ...newUser, name: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Telefono</label>
              <input
                type="text"
                className="w-full p-2 border border-gray-200 rounded-md"
                value={editingUser ? editingUser.phone : newUser.phone || ''}
                onChange={e => editingUser
                  ? setEditingUser({ ...editingUser, phone: e.target.value })
                  : setNewUser({ ...newUser, phone: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Correo</label>
              <input
                type="email"
                className="w-full p-2 border border-gray-200 rounded-md"
                value={editingUser ? editingUser.email : newUser.email || ''}
                onChange={e => editingUser
                  ? setEditingUser({ ...editingUser, email: e.target.value })
                  : setNewUser({ ...newUser, email: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Direccion</label>
              <input
                type="text"
                className="w-full p-2 border border-gray-200 rounded-md"
                value={editingUser ? editingUser.location : newUser.location || ''}
                onChange={e => editingUser
                  ? setEditingUser({ ...editingUser, location: e.target.value })
                  : setNewUser({ ...newUser, location: e.target.value })
                }
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
              >
                {editingUser ? 'Actualizar' : 'Guardar'}
              </button>
              {editingUser && (
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Time block creation */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Crear Bloque de tiempo
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Usuario</label>
              <select
                className="w-full p-2 border border-gray-200 rounded-md"
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
              >
                <option value="">Seleccionar usuario</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>{user.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Fecha</label>
              <input
                type="date"
                className="w-full p-2 border border-gray-200 rounded-md"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={tomorrowStr}
                max={tomorrowStr}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Hora seleccionada</label>
              <div className="text-lg font-medium">
                {selectedHour !== null ? `${String(selectedHour).padStart(2, '0')}:00` : 'Ninguna'}
              </div>
              <div className="text-sm text-gray-500">
                Haga clic en un bloque de tiempo para seleccionarlo
              </div>
            </div>
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                {error}
              </div>
            )}
            <button
              type="button"
              onClick={handleAddTimeBlock}
              className="w-full py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
            >
              Guardar
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}