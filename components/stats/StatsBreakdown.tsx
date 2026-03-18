import type { WatchStats } from '@/types'
import { MEDIA_STATUS_LABELS } from '@/types'

interface StatsBreakdownProps {
  stats: WatchStats
}

const STATUS_COLORS: Record<string, string> = {
  watching: 'bg-blue-400',
  completed: 'bg-green-400',
  planned: 'bg-muted-foreground/50',
  dropped: 'bg-red-400',
  on_hold: 'bg-yellow-400',
}

export function StatsBreakdown({ stats }: StatsBreakdownProps) {
  const statusEntries = (
    ['watching', 'completed', 'planned', 'on_hold', 'dropped'] as const
  ).map((status) => ({
    status,
    label: MEDIA_STATUS_LABELS[status],
    count: stats.byStatus[status],
  }))

  const total = statusEntries.reduce((sum, e) => sum + e.count, 0)

  return (
    <div className="rounded-xl border border-border/50 bg-card p-6 space-y-4">
      <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
        По статусу
      </h3>

      {total === 0 ? (
        <p className="text-sm text-muted-foreground">Нет добавленных тайтлов</p>
      ) : (
        <div className="space-y-3">
          {statusEntries.map(({ status, label, count }) => (
            <div key={status} className="flex items-center gap-3">
              <div
                className={`h-2 w-2 rounded-full shrink-0 ${STATUS_COLORS[status]}`}
              />
              <span className="text-sm flex-1">{label}</span>
              <span className="text-sm font-medium tabular-nums">{count}</span>
              <span className="text-xs text-muted-foreground w-10 text-right tabular-nums">
                {total > 0 ? `${Math.round((count / total) * 100)}%` : ''}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}