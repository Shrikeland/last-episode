import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/Navbar'
import { getPendingCount } from '@/app/actions/friends'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const [profileResult, pendingCount] = await Promise.all([
    supabase.from('profiles').select('username').eq('id', user.id).single(),
    getPendingCount(),
  ])

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar
        username={profileResult.data?.username ?? user.email ?? ''}
        pendingRequestsCount={pendingCount}
      />
      <main className="flex-1 container max-w-7xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}