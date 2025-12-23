export {}

// Create a type for the Roles
export type Roles = 'admin' | 'moderator' | 'farmer' | 'trader' | 'cooperative'

declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      role?: Roles
    }
  }
}
