import {  Calendar } from 'lucide-react'

export const Header = () => {
  return (
    <header>
      <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <Calendar className="w-6 h-6" />
        Reservas
      </h1>
    </header>
  )
}