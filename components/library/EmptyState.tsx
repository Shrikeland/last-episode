import Link from 'next/link'
import { Film, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface EmptyStateProps {
  hasFilters: boolean
}

export function EmptyState({ hasFilters }: EmptyStateProps) {
  if (hasFilters) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <Search className="h-12 w-12 text-muted-foreground/40 mb-4" />
        <h2 className="text-lg font-medium mb-1">Ничего не найдено</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Попробуйте изменить фильтры или сбросить поиск
        </p>
        <Button variant="outline" asChild>
          <Link href="/library">Сбросить фильтры</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <Film className="h-12 w-12 text-muted-foreground/40 mb-4" />
      <h2 className="text-lg font-medium mb-1">Коллекция пуста</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Добавьте первый фильм или сериал
      </p>
      <Button asChild>
        <Link href="/search">Найти тайтл</Link>
      </Button>
    </div>
  )
}