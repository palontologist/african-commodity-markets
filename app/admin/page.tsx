import { redirect } from 'next/navigation'
import { checkRole } from '@/utils/roles'
import { SearchUsers } from './SearchUsers'
import { clerkClient } from '@clerk/nextjs/server'
import { removeRole, setRole } from './_actions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AppHeader } from '@/components/app-header'
import { Users, Shield, UserCog } from 'lucide-react'

export default async function AdminDashboard(props: {
  searchParams: Promise<{ search?: string }>
}) {
  if (!(await checkRole('admin'))) {
    redirect('/')
  }

  const searchParams = await props.searchParams
  const query = searchParams.search

  const client = await clerkClient()

  const users = query ? (await client.users.getUserList({ query })).data : []

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'destructive'
      case 'moderator':
        return 'default'
      case 'farmer':
        return 'secondary'
      case 'trader':
        return 'outline'
      case 'cooperative':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-red-100 rounded-lg">
              <Shield className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-gray-600">
                Manage user roles and permissions across the platform
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold mt-1">
                    {users.length > 0 ? users.length : '-'}
                  </p>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Admins</p>
                  <p className="text-2xl font-bold mt-1">
                    {users.filter((u) => u.publicMetadata.role === 'admin').length || '-'}
                  </p>
                </div>
                <Shield className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Moderators</p>
                  <p className="text-2xl font-bold mt-1">
                    {users.filter((u) => u.publicMetadata.role === 'moderator').length || '-'}
                  </p>
                </div>
                <UserCog className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>User Management</CardTitle>
            <CardDescription>Search and manage user roles</CardDescription>
          </CardHeader>
          <CardContent>
            <SearchUsers />

            {query && users.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <p>No users found matching &quot;{query}&quot;</p>
              </div>
            )}

            {users.length > 0 && (
              <div className="space-y-4">
                {users.map((user) => {
                  const role = user.publicMetadata.role as string
                  return (
                    <Card key={user.id} className="border-l-4 border-l-primary">
                      <CardContent className="pt-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="font-semibold text-lg">
                                {user.firstName} {user.lastName}
                              </div>
                              {role && (
                                <Badge variant={getRoleBadgeVariant(role)}>
                                  {role.toUpperCase()}
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm text-gray-600">
                              {
                                user.emailAddresses.find(
                                  (email) => email.id === user.primaryEmailAddressId
                                )?.emailAddress
                              }
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              User ID: {user.id}
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <form action={setRole}>
                              <input type="hidden" value={user.id} name="id" />
                              <input type="hidden" value="admin" name="role" />
                              <Button
                                type="submit"
                                variant="destructive"
                                size="sm"
                                disabled={role === 'admin'}
                              >
                                Make Admin
                              </Button>
                            </form>

                            <form action={setRole}>
                              <input type="hidden" value={user.id} name="id" />
                              <input type="hidden" value="moderator" name="role" />
                              <Button
                                type="submit"
                                variant="default"
                                size="sm"
                                disabled={role === 'moderator'}
                              >
                                Make Moderator
                              </Button>
                            </form>

                            <form action={setRole}>
                              <input type="hidden" value={user.id} name="id" />
                              <input type="hidden" value="farmer" name="role" />
                              <Button
                                type="submit"
                                variant="secondary"
                                size="sm"
                                disabled={role === 'farmer'}
                              >
                                Make Farmer
                              </Button>
                            </form>

                            <form action={setRole}>
                              <input type="hidden" value={user.id} name="id" />
                              <input type="hidden" value="trader" name="role" />
                              <Button
                                type="submit"
                                variant="outline"
                                size="sm"
                                disabled={role === 'trader'}
                              >
                                Make Trader
                              </Button>
                            </form>

                            <form action={setRole}>
                              <input type="hidden" value={user.id} name="id" />
                              <input type="hidden" value="cooperative" name="role" />
                              <Button
                                type="submit"
                                variant="secondary"
                                size="sm"
                                disabled={role === 'cooperative'}
                              >
                                Make Coop
                              </Button>
                            </form>

                            {role && (
                              <form action={removeRole}>
                                <input type="hidden" value={user.id} name="id" />
                                <Button type="submit" variant="ghost" size="sm">
                                  Remove Role
                                </Button>
                              </form>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Instructions Card */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">Setup Instructions</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-blue-800 space-y-4">
            <div>
              <p className="font-semibold mb-2">1. Configure Session Token in Clerk Dashboard:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Navigate to: Sessions → Customize session token</li>
                <li>Add to Claims editor:</li>
              </ul>
              <pre className="bg-blue-100 p-3 rounded mt-2 text-xs overflow-x-auto">
                {`{
  "metadata": "{{user.public_metadata}}"
}`}
              </pre>
            </div>

            <div>
              <p className="font-semibold mb-2">2. Set Your Admin Role:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Navigate to: Users → [Your User]</li>
                <li>Scroll to &quot;User metadata&quot; → Public → Edit</li>
                <li>Add:</li>
              </ul>
              <pre className="bg-blue-100 p-3 rounded mt-2 text-xs overflow-x-auto">
                {`{
  "role": "admin"
}`}
              </pre>
            </div>

            <div>
              <p className="font-semibold mb-2">3. Integration with Turso:</p>
              <ul className="list-disc list-inside ml-4 space-y-1 text-xs">
                <li>Turso stores multiple roles per user in <code>userProfiles</code> table</li>
                <li>Users can switch between roles (PUBLIC, FARMER, TRADER, COOPERATIVE)</li>
                <li>Active role from Turso is synced to Clerk for route protection</li>
                <li>Clerk role is used by middleware to protect /admin, /farmer, /trader routes</li>
              </ul>
            </div>

            <div>
              <p className="font-semibold mb-2">4. Available Roles:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li><Badge variant="destructive" className="text-xs">ADMIN</Badge> - Full system access (Clerk only)</li>
                <li><Badge variant="default" className="text-xs">MODERATOR</Badge> - Content moderation (Clerk only)</li>
                <li><Badge variant="secondary" className="text-xs">FARMER</Badge> - Farmer dashboard access</li>
                <li><Badge variant="outline" className="text-xs">TRADER</Badge> - Trader dashboard access</li>
                <li><Badge variant="secondary" className="text-xs">COOPERATIVE</Badge> - Cooperative management</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
