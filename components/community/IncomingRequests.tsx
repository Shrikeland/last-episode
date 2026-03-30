'use client'

import Link from 'next/link'
import { UserCircle2, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Profile } from '@/types'

interface IncomingRequestsProps {
  requests: { requestId: string; profile: Profile }[]
  onAccept: (requestId: string, profile: Profile) => void
  onDecline: (requestId: string) => void
}

export function IncomingRequests({ requests, onAccept, onDecline }: IncomingRequestsProps) {
  if (requests.length === 0) return null

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground uppercase tracking-wide">
        Заявки в друзья ({requests.length})
      </p>
      <div className="space-y-2">
        {requests.map(({ requestId, profile }) => (
          <div
            key={requestId}
            className="flex items-center gap-3 p-4 rounded-lg bg-card border border-primary/30"
          >
            <Link
              href={`/profile/${profile.username}`}
              className="flex items-center gap-3 flex-1 min-w-0"
            >
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
                <UserCircle2 className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <p className="font-medium text-sm">@{profile.username}</p>
                <p className="text-xs text-muted-foreground">хочет добавить вас в друзья</p>
              </div>
            </Link>
            <div className="flex-shrink-0 flex items-center gap-1">
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 text-primary hover:text-primary hover:bg-primary/10"
                onClick={() => onAccept(requestId, profile)}
                title="Принять"
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                onClick={() => onDecline(requestId)}
                title="Отклонить"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
