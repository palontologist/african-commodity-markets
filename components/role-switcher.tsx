'use client'

import { useUserProfile } from './user-profile-provider'
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
    description: 'View and stake on markets',
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
    description: 'Create prediction markets',
  },
  COOPERATIVE: {
    label: 'Cooperative',
    icon: Users,
    color: 'bg-purple-500',
    description: 'Manage farmer networks',
  },
}

export function RoleSwitcher() {
  const { profile, loading, switchRole } = useUserProfile()
  const [switching, setSwitching] = useState(false)
  const router = useRouter()

  if (loading || !profile) return null

  const handleSwitchRole = async (role: any) => {
    try {
      setSwitching(true)
      await switchRole(role)
      
      // Navigate to role-specific dashboard
      switch (role) {
        case 'FARMER':
          router.push('/farmer')
          break
        case 'TRADER':
          router.push('/trader')
          break
        case 'COOPERATIVE':
          router.push('/cooperative')
          break
        default:
          router.push('/marketplace')
      }
    } catch (error) {
      console.error('Failed to switch role:', error)
    } finally {
      setSwitching(false)
    }
  }

  const ActiveRoleIcon = ROLE_CONFIG[profile.activeRole as keyof typeof ROLE_CONFIG]?.icon || User
  const activeConfig = ROLE_CONFIG[profile.activeRole as keyof typeof ROLE_CONFIG]

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
          {profile.dvcScore > 0 && (
            <Badge variant="secondary" className="text-xs">
              DVC: {profile.dvcScore}
            </Badge>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {profile.roles.map((role) => {
          const config = ROLE_CONFIG[role as keyof typeof ROLE_CONFIG]
          const RoleIcon = config?.icon || User
          const isActive = role === profile.activeRole
          
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
        
        {profile.roles.length === 1 && profile.roles[0] === 'PUBLIC' && (
          <>
            <DropdownMenuSeparator />
            <div className="px-2 py-2 text-xs text-muted-foreground">
              Want to unlock more roles? Connect with our team or complete verification.
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
