import { CommunityContent } from '@/components/community/CommunityContent'
import { getRecentUsers } from '@/app/actions/users'
import { getMyFriends, getPendingRequests, getPendingOutgoingIds } from '@/app/actions/friends'
import { createServerClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function CommunityPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [recentUsers, friends, pendingRequests, pendingOutgoingIds] = await Promise.all([
    getRecentUsers(5),
    getMyFriends(),
    getPendingRequests(),
    getPendingOutgoingIds(),
  ])

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Сообщество</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Найдите пользователей и добавьте их в друзья
        </p>
      </div>

      <CommunityContent
        recentUsers={recentUsers}
        initialFriends={friends}
        initialPendingRequests={pendingRequests}
        initialPendingOutgoingIds={pendingOutgoingIds}
        currentUserId={user?.id ?? ''}
      />
    </div>
  )
}
