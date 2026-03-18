'use client'

import { useOptimistic, useTransition } from 'react'
import { toast } from 'sonner'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { EpisodeRow } from './EpisodeRow'
import { toggleEpisode, markSeason } from '@/app/actions/progress'
import type { SeasonWithEpisodes, Episode } from '@/types'

interface SeasonAccordionProps {
  seasons: SeasonWithEpisodes[]
  mediaItemId: string
}

type EpisodeMap = Record<string, Episode>

function buildEpisodeMap(seasons: SeasonWithEpisodes[]): EpisodeMap {
  const map: EpisodeMap = {}
  for (const season of seasons) {
    for (const ep of season.episodes) {
      map[ep.id] = ep
    }
  }
  return map
}

async function withRetry<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn()
  } catch {
    // retry once
    return await fn()
  }
}

export function SeasonAccordion({ seasons, mediaItemId: _mediaItemId }: SeasonAccordionProps) {
  const [optimisticEpisodes, applyOptimistic] = useOptimistic(
    buildEpisodeMap(seasons),
    (state: EpisodeMap, action: { id: string; isWatched: boolean }) => ({
      ...state,
      [action.id]: {
        ...state[action.id],
        is_watched: action.isWatched,
        watched_at: action.isWatched ? new Date().toISOString() : null,
      },
    })
  )
  const [, startTransition] = useTransition()

  function handleToggleEpisode(episodeId: string, isWatched: boolean) {
    const previous = optimisticEpisodes[episodeId]
    startTransition(async () => {
      applyOptimistic({ id: episodeId, isWatched })
      try {
        await withRetry(() => toggleEpisode(episodeId, isWatched))
      } catch {
        // rollback
        applyOptimistic({ id: episodeId, isWatched: previous.is_watched })
        toast.error('Ошибка сохранения')
      }
    })
  }

  function handleMarkSeason(season: SeasonWithEpisodes) {
    const allWatched = season.episodes.every((e) => optimisticEpisodes[e.id]?.is_watched)
    const targetWatched = !allWatched

    startTransition(async () => {
      // optimistic: toggle all episodes in season
      for (const ep of season.episodes) {
        applyOptimistic({ id: ep.id, isWatched: targetWatched })
      }
      try {
        await withRetry(() => markSeason(season.id, targetWatched))
      } catch {
        // rollback
        for (const ep of season.episodes) {
          applyOptimistic({ id: ep.id, isWatched: !targetWatched })
        }
        toast.error('Ошибка сохранения')
      }
    })
  }

  return (
    <div className="space-y-2" data-testid="season-accordion">
      <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
        Прогресс
      </h3>
      <Accordion type="multiple" className="space-y-2">
        {seasons.map((season) => {
          const episodes = season.episodes.map((ep) => optimisticEpisodes[ep.id] ?? ep)
          const watchedCount = episodes.filter((e) => e.is_watched).length
          const totalCount = season.episode_count
          const allWatched = watchedCount === totalCount && totalCount > 0

          return (
            <AccordionItem
              key={season.id}
              value={season.id}
              className="border border-border/50 rounded-lg px-4"
            >
              <AccordionTrigger className="hover:no-underline py-3">
                <div className="flex items-center justify-between w-full pr-2">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">{season.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {watchedCount}/{totalCount} эп.
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleMarkSeason(season)
                    }}
                  >
                    {allWatched ? 'Снять отметку' : 'Отметить всё'}
                  </Button>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-3">
                <div className="space-y-0.5">
                  {episodes.map((ep) => (
                    <EpisodeRow
                      key={ep.id}
                      episode={ep}
                      onToggle={handleToggleEpisode}
                    />
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          )
        })}
      </Accordion>
    </div>
  )
}