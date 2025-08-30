import { redirect } from 'next/navigation'
import { getUser, getProfile, signOut } from '@/lib/auth/actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, FileText, Camera, TrendingUp } from 'lucide-react'
import Link from 'next/link'

export default async function DashboardPage() {
  const user = await getUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  const profile = await getProfile()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">R</span>
              </div>
              <div>
                <h1 className="font-bold text-xl">RestoreDoc</h1>
                <p className="text-sm text-gray-600">Welcome back, {profile?.full_name || 'Contractor'}</p>
              </div>
            </div>
            <form action={signOut}>
              <Button type="submit" variant="outline">
                Sign Out
              </Button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
          <div className="grid md:grid-cols-4 gap-4">
            <Link href="/estimates/new">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-2">
                    <Plus className="w-6 h-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-lg">New Estimate</CardTitle>
                  <CardDescription>Create a new damage estimate</CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-2">
                  <Camera className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle className="text-lg">Upload Photos</CardTitle>
                <CardDescription>Add damage photos for analysis</CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-2">
                  <FileText className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle className="text-lg">View Reports</CardTitle>
                <CardDescription>Access generated reports</CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-2">
                  <TrendingUp className="w-6 h-6 text-orange-600" />
                </div>
                <CardTitle className="text-lg">Analytics</CardTitle>
                <CardDescription>View business insights</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">This Month</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Estimates</CardDescription>
                <CardTitle className="text-3xl">0</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-gray-500">Start creating estimates to see stats</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Value</CardDescription>
                <CardTitle className="text-3xl">$0</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-gray-500">Combined estimate value</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Approval Rate</CardDescription>
                <CardTitle className="text-3xl">-</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-gray-500">Approved estimates percentage</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Estimates */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Recent Estimates</h2>
          <Card>
            <CardContent className="py-8">
              <div className="text-center text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-lg font-medium">No estimates yet</p>
                <p className="text-sm mt-1">Create your first estimate to get started</p>
                <Link href="/estimates/new">
                  <Button className="mt-4">
                    Create First Estimate
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}