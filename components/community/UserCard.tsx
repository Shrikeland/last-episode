import Link from 'next/link'
import { UserCircle2 } from 'lucide-react'
import type { Profile } from '@/types'

interface UserCardProps {
  profile: Profile
}

export function UserCard({ profile }: UserCardProps) {
  return (
    <Link
      href={`/profile/${profile.username}`}
      className="flex items-center gap-3 p-4 rounded-lg bg-card border border-border hover:border-primary/40 transition-colors"
    >
      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
        <UserCircle2 className="h-6 w-6 text-muted-foreground" />
      </div>
      <div>
        <p className="font-medium text-sm">@{profile.username}</p>
        <p className="text-xs text-muted-foreground">
          {profile.is_library_public ? 'Библиотека открыта' : 'Библиотека скрыта'}
        </p>
      </div>
    </Link>
  )
}