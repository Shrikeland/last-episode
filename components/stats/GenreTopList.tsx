import type { WatchStats } from '@/types'

interface GenreTopListProps {
  topGenres: WatchStats['topGenres']
}

export function GenreTopList({ topGenres }: GenreTopListProps) {
  const max = topGenres[0]?.count ?? 1

  return (
    <div className="rounded-xl border border-border/50 bg-card p-6 space-y-4">
      <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
        Топ жанры
      </h3>

      {topGenres.length === 0 ? (
        <p className="text-sm text-muted-foreground">Нет данных</p>
      ) : (
        <div className="space-y-3">
          {topGenres.map(({ genre, count }, index) => (
            <div key={genre} className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground tabular-nums w-4">
                    {index + 1}
                  </span>
                  <span className="text-sm">{genre}</span>
                </div>
                <span className="text-sm font-medium tabular-nums">{count}</span>
              </div>
              <div className="h-1.5 rounded-full bg-border/50 overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${(count / max) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}