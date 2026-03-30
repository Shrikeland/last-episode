'use client'

import Link from 'next/link'
import { UserCircle2, UserPlus, UserCheck, UserX, Clock } from 'lucide-react'
import type { Profile } from '@/types'

export type FriendStatus = 'none' | 'friend' | 'pending_outgoing'

interface UserCardProps {
  profile: Profile
  friendStatus?: FriendStatus
  isCurrentUser?: boolean
  onSendRequest?: (profile: Profile) => void
  onCancelRequest?: (profileId: string) => void
  onRemoveFriend?: (profileId: string) => void
}

export function UserCard({
  profile,
  friendStatus = 'none',
  isCurrentUser,
  onSendRequest,
  onCancelRequest,
  onRemoveFriend,
}: UserCardProps) {
  const showButton = !isCurrentUser

  return (
    <div className="flex items-center gap-3 p-4 rounded-lg bg-card border border-border hover:border-primary/40 transition-colors">
      <Link
        href={`/profile/${profile.username}`}
        className="flex items-center gap-3 flex-1 min-w-0"
      >
        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
          <UserCircle2 className="h-6 w-6 text-muted-foreground" />
        </div>
        <div className="min-w-0">
          <p className="font-medium text-sm">@{profile.username}</p>
          <p className="text-xs text-muted-foreground">
            {profile.is_library_public ? 'Библиотека открыта' : 'Библиотека скрыта'}
          </p>
        </div>
      </Link>

      {showButton && (
        <>
          {friendStatus === 'none' && onSendRequest && (
            <button
              onClick={() => onSendRequest(profile)}
              className="flex-shrink-0 flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors px-2 py-1 rounded"
            >
              <UserPlus className="h-4 w-4" />
              <span className="hidden sm:inline">Добавить</span>
            </button>
          )}

          {friendStatus === 'pending_outgoing' && (
            <button
              onClick={() => onCancelRequest?.(profile.id)}
              className="group flex-shrink-0 flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors px-2 py-1 rounded"
              title="Отменить заявку"
            >
              <Clock className="h-4 w-4 group-hover:hidden" />
              <UserX className="h-4 w-4 hidden group-hover:block" />
              <span className="hidden sm:inline group-hover:hidden">Отправлено</span>
              <span className="hidden sm:group-hover:inline">Отменить</span>
            </button>
          )}

          {friendStatus === 'friend' && (
            <button
              onClick={() => onRemoveFriend?.(profile.id)}
              className="group flex-shrink-0 flex items-center gap-1 text-xs text-primary hover:text-destructive transition-colors px-2 py-1 rounded"
              title="Удалить из друзей"
            >
              <UserCheck className="h-4 w-4 group-hover:hidden" />
              <UserX className="h-4 w-4 hidden group-hover:block" />
              <span className="hidden sm:inline group-hover:hidden">В друзьях</span>
              <span className="hidden sm:group-hover:inline">Удалить</span>
            </button>
          )}
        </>
      )}
    </div>
  )
}
