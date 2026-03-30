'use client'

import { Users } from 'lucide-react'
import { UserCard } from '@/components/community/UserCard'
import type { Profile } from '@/types'

interface FriendsListProps {
  friends: Profile[]
  onRemoveFriend: (profileId: string) => void
}

export function FriendsList({ friends, onRemoveFriend }: FriendsListProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Users className="h-4 w-4 text-muted-foreground" />
        <p className="text-xs text-muted-foreground uppercase tracking-wide">
          Мои друзья {friends.length > 0 && `(${friends.length})`}
        </p>
      </div>

      {friends.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">
          Вы ещё никого не добавили в друзья
        </p>
      ) : (
        <div className="space-y-2">
          {friends.map((profile) => (
            <UserCard
              key={profile.id}
              profile={profile}
              friendStatus="friend"
              onRemoveFriend={onRemoveFriend}
            />
          ))}
        </div>
      )}
    </div>
  )
}
