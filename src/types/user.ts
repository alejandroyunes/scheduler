export interface User {
  id: string
  name: string
  phone: string
  email: string
  location: string
  color: string
}

export interface TimeBlock {
  id: string
  userId: string
  date: string
  hour: number
  userName: string
  userColor: string
}