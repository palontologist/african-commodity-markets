'use client'

import { usePathname, useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Search } from 'lucide-react'

export const SearchUsers = () => {
  const router = useRouter()
  const pathname = usePathname()

  return (
    <div className="mb-8">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          const form = e.currentTarget
          const formData = new FormData(form)
          const queryTerm = formData.get('search') as string
          router.push(pathname + '?search=' + queryTerm)
        }}
        className="flex gap-2"
      >
        <div className="flex-1">
          <Label htmlFor="search" className="sr-only">
            Search for users
          </Label>
          <Input
            id="search"
            name="search"
            type="text"
            placeholder="Search by name or email..."
            className="w-full"
          />
        </div>
        <Button type="submit">
          <Search className="w-4 h-4 mr-2" />
          Search
        </Button>
      </form>
    </div>
  )
}
