import { Roles } from '@/types/globals'
import { auth } from '@clerk/nextjs/server'

export const checkRole = async (role: Roles) => {
  const { sessionClaims } = await auth()
  return sessionClaims?.metadata?.role === role
}

export const getUserRole = async (): Promise<Roles | undefined> => {
  const { sessionClaims } = await auth()
  return sessionClaims?.metadata?.role
}

export const hasRole = async (roles: Roles[]): Promise<boolean> => {
  const { sessionClaims } = await auth()
  const userRole = sessionClaims?.metadata?.role
  return userRole ? roles.includes(userRole) : false
}
