'use client'

import { useUserProfile } from './user-profile-provider'
import { useUserType } from './user-type-provider'
import { Button } from './ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { Badge } from './ui/badge'
import { ChevronDown, User, Sprout, TrendingUp, Users } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const ROLE_CONFIG = {
  PUBLIC: {
    label: 'Public',
    icon: User,
    color: 'bg-gray-500',
    description: 'View markets',
  },
  FARMER: {
    label: 'Farmer',
    icon: Sprout,
    color: 'bg-green-500',
    description: 'List commodities & get advances',
  },
  TRADER: {
    label: 'Trader',
    icon: TrendingUp,
    color: 'bg-blue-500',
    description: 'Trade markets',
  },
  COOPERATIVE: {
    label: 'Cooperative',
    icon: Users,
    color: 'bg-purple-500',
    description: 'Manage networks',
  },
}

export function RoleSwitcher() {
  const { profile, loading } = useUserProfile()
  const { userType, setUserType } = useUserType()
  const [switching, setSwitching] = useState(false)
  const router = useRouter()

  // Map userType to role format
  const getRoleFromUserType = (type: string | null) => {
    if (!type) return 'PUBLIC'
    if (type === 'farmer') return 'FARMER'
    if (type === 'trader') return 'TRADER'
    if (type === 'coop') return 'COOPERATIVE'
    return 'PUBLIC'
  }

  const getUserTypeFromRole = (role: string) => {
    if (role === 'FARMER') return 'farmer'
    if (role === 'TRADER') return 'trader'
    if (role === 'COOPERATIVE') return 'coop'
    return null
  }

  const currentRole = getRoleFromUserType(userType)
  const availableRoles = ['PUBLIC', 'FARMER', 'TRADER', 'COOPERATIVE']

  const handleSwitchRole = async (role: any) => {
    try {
      setSwitching(true)
      const newUserType = getUserTypeFromRole(role)
      setUserType(newUserType)
      
      // Navigate to role-specific dashboard
      switch (role) {
        case 'FARMER':
          router.push('/dashboard')
          break
        case 'TRADER':
          router.push('/dashboard')
          break
        case 'COOPERATIVE':
          router.push('/dashboard')
          break
        default:
          router.push('/')
      }
    } catch (error) {
      console.error('Failed to switch role:', error)
    } finally {
      setSwitching(false)
    }
  }

  if (loading) return null

  const ActiveRoleIcon = ROLE_CONFIG[currentRole as keyof typeof ROLE_CONFIG]?.icon || User
  const activeConfig = ROLE_CONFIG[currentRole as keyof typeof ROLE_CONFIG]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2" disabled={switching}>
          <ActiveRoleIcon className="h-4 w-4" />
          <span className="hidden sm:inline">{activeConfig?.label || 'Role'}</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Switch Role</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {availableRoles.map((role) => {
          const config = ROLE_CONFIG[role as keyof typeof ROLE_CONFIG]
          const RoleIcon = config?.icon || User
          const isActive = role === currentRole
          
          return (
            <DropdownMenuItem
              key={role}
              onClick={() => !isActive && handleSwitchRole(role)}
              disabled={isActive || switching}
              className="flex items-start gap-3 py-3 cursor-pointer"
            >
              <div className={`p-1.5 rounded ${config?.color || 'bg-gray-500'} text-white`}>
                <RoleIcon className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium">{config?.label || role}</span>
                  {isActive && (
                    <Badge variant="default" className="text-xs">
                      Active
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {config?.description || ''}
                </p>
              </div>
            </DropdownMenuItem>
          )
        })}
        
        {currentRole === 'PUBLIC' && (
          <>
            <DropdownMenuSeparator />
            <div className="px-2 py-2 text-xs text-muted-foreground">
              Select a role to unlock features
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
