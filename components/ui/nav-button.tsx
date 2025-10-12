'use client'

import * as React from 'react'
import { Button } from './button'

interface NavButtonProps {
  href: string
  variant?: React.ComponentProps<typeof Button>['variant']
  className?: string
  children: React.ReactNode
}

export function NavButton({ href, variant = 'default', className, children }: NavButtonProps) {
  return (
    <Button
      asChild={false}
      variant={variant}
      className={className}
      onClick={() => {
        // Fallback navigation which forces a full page load to avoid client-side routing
        // issues that can be caused by third-party scripts capturing clicks.
        console.debug('[NavButton] navigating to', href)
        window.location.href = href
      }}
    >
      {children}
    </Button>
  )
}
