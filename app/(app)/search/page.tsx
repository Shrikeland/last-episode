import { SearchInput } from '@/components/search/SearchInput'

export const dynamic = 'force-dynamic'

export default function SearchPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Поиск</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Найдите фильм, сериал или аниме и добавьте в коллекцию
        </p>
      </div>
      <SearchInput />
    </div>
  )
}