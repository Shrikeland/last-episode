import { MediaCard } from './MediaCard'
import { EmptyState } from './EmptyState'
import type { MediaItem } from '@/types'

interface MediaGridProps {
  items: MediaItem[]
  hasFilters: boolean
}

export function MediaGrid({ items, hasFilters }: MediaGridProps) {
  if (items.length === 0) {
    return <EmptyState hasFilters={hasFilters} />
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {items.map((item) => (
        <MediaCard key={item.id} item={item} />
      ))}
    </div>
  )
}