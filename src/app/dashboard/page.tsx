import { createServerSupabase } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import DashboardStats from '@/components/DashboardStats'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function Dashboard() {
  const supabase = createServerSupabase({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user.email?.split('@')[0]}!
        </h1>
        <p className="text-gray-600 mt-2">
          Keep up your learning momentum
        </p>
      </div>

      <DashboardStats />

      <div className="grid md:grid-cols-2 gap-6 mt-8">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Quick Actions</h2>
          <div className="space-y-2">
            <Button asChild className="w-full justify-start">
              <Link href="/review">
                📚 Start Reviewing
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/flashcards/create">
                ➕ Create Flashcard
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/upload">
                📄 Upload PDF
              </Link>
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Recent Activity</h2>
          <div className="text-gray-600">
            Your recent study sessions will appear here
          </div>
        </div>
      </div>
    </div>
  )
}
