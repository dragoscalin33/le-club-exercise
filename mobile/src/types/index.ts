export interface User {
  id: number
  email: string
  role: 'admin' | 'user'
  createdAt: string
  updatedAt: string
}

export interface Restaurant {
  id: number
  name: string
  address: string
  description: string | null
  photoUrl: string | null
  createdBy: Pick<User, 'id' | 'email' | 'role'> | null
  createdAt: string
  updatedAt: string
}

export type RootStackParamList = {
  Login: undefined
  Register: undefined
  RestaurantList: undefined
  RestaurantDetail: { id: number }
}
