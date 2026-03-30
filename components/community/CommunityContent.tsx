'use client'

import { useState } from 'react'
import { UserSearchInput } from '@/components/community/UserSearchInput'
import { FriendsList } from '@/components/community/FriendsList'
import { IncomingRequests } from '@/components/community/IncomingRequests'
import {
  sendFriendRequest,
  cancelFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  removeFriend,
} from '@/app/actions/friends'
import type { Profile } from '@/types'

interface CommunityContentProps {
  recentUsers: Profile[]
  initialFriends: Profile[]
  initialPendingRequests: { requestId: string; profile: Profile }[]
  initialPendingOutgoingIds: string[]
  currentUserId: string
}

export function CommunityContent({
  recentUsers,
  initialFriends,
  initialPendingRequests,
  initialPendingOutgoingIds,
  currentUserId,
}: CommunityContentProps) {
  const [friends, setFriends] = useState<Profile[]>(initialFriends)
  const [pendingRequests, setPendingRequests] = useState(initialPendingRequests)
  const [pendingOutgoingIds, setPendingOutgoingIds] = useState<Set<string>>(
    new Set(initialPendingOutgoingIds)
  )

  const friendIds = new Set(friends.map((f) => f.id))

  const handleSendRequest = (profile: Profile) => {
    setPendingOutgoingIds((prev) => new Set([...prev, profile.id]))
    sendFriendRequest(profile.id)
  }

  const handleCancelRequest = (profileId: string) => {
    setPendingOutgoingIds((prev) => {
      const next = new Set(prev)
      next.delete(profileId)
      return next
    })
    cancelFriendRequest(profileId)
  }

  const handleAccept = (requestId: string, profile: Profile) => {
    setPendingRequests((prev) => prev.filter((r) => r.requestId !== requestId))
    setFriends((prev) => [profile, ...prev])
    acceptFriendRequest(requestId)
  }

  const handleDecline = (requestId: string) => {
    setPendingRequests((prev) => prev.filter((r) => r.requestId !== requestId))
    declineFriendRequest(requestId)
  }

  const handleRemoveFriend = (profileId: string) => {
    setFriends((prev) => prev.filter((f) => f.id !== profileId))
    removeFriend(profileId)
  }

  return (
    <div className="space-y-8">
      {pendingRequests.length > 0 && (
        <IncomingRequests
          requests={pendingRequests}
          onAccept={handleAccept}
          onDecline={handleDecline}
        />
      )}

      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-3">Поиск</p>
        <UserSearchInput
          recentUsers={recentUsers}
          friendIds={friendIds}
          pendingOutgoingIds={pendingOutgoingIds}
          currentUserId={currentUserId}
          onSendRequest={handleSendRequest}
          onCancelRequest={handleCancelRequest}
          onRemoveFriend={handleRemoveFriend}
        />
      </div>

      <div className="border-t border-border pt-6">
        <FriendsList friends={friends} onRemoveFriend={handleRemoveFriend} />
      </div>
    </div>
  )
}
