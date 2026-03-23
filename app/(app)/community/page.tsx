import { UserSearchInput } from '@/components/community/UserSearchInput'

export const dynamic = 'force-dynamic'

export default function CommunityPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Сообщество</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Найдите других пользователей по логину
        </p>
      </div>

      <UserSearchInput />
    </div>
  )
}