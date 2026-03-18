import type { MediaType, TmdbSearchResult, TmdbDetails, TmdbSeason, TmdbEpisode } from '@/types'

const TMDB_BASE_URL = 'https://api.themoviedb.org/3'
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500'
const LANG = 'ru-RU'

function getApiKey(): string {
  const key = process.env.TMDB_API_KEY
  if (!key) throw new Error('TMDB_API_KEY is not set')
  return key
}

function buildUrl(path: string, params: Record<string, string> = {}): string {
  const url = new URL(`${TMDB_BASE_URL}${path}`)
  url.searchParams.set('api_key', getApiKey())
  url.searchParams.set('language', LANG)
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v)
  }
  return url.toString()
}

export function buildPosterUrl(posterPath: string | null): string | null {
  if (!posterPath) return null
  return `${TMDB_IMAGE_BASE}${posterPath}`
}

export function normalizeType(
  mediaType: 'movie' | 'tv',
  genreIds: number[],
  originCountries: string[]
): MediaType {
  if (mediaType === 'movie') return 'movie'
  if (genreIds.includes(16) && originCountries.includes('JP')) return 'anime'
  return 'tv'
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractYear(dateStr: string | null | undefined): number | null {
  if (!dateStr) return null
  const year = parseInt(dateStr.slice(0, 4), 10)
  return isNaN(year) ? null : year
}

export async function search(query: string): Promise<TmdbSearchResult[]> {
  if (!query.trim()) return []

  const url = buildUrl('/search/multi', { query, include_adult: 'false' })
  const res = await fetch(url, { next: { revalidate: 0 } })

  if (!res.ok) throw new Error(`TMDB search failed: ${res.status}`)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: any = await res.json()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data.results as any[])
    .filter((r) => r.media_type === 'movie' || r.media_type === 'tv')
    .slice(0, 20)
    .map((r) => ({
      tmdb_id: r.id,
      type: normalizeType(r.media_type, r.genre_ids ?? [], r.origin_country ?? []),
      title: r.title ?? r.name ?? '',
      original_title: r.original_title ?? r.original_name ?? '',
      poster_path: r.poster_path ?? null,
      release_year: extractYear(r.release_date ?? r.first_air_date),
      overview: r.overview ?? '',
    }))
}

export async function getMovieDetails(tmdbId: number): Promise<TmdbDetails> {
  const url = buildUrl(`/movie/${tmdbId}`)
  const res = await fetch(url, { next: { revalidate: 0 } })
  if (!res.ok) throw new Error(`TMDB movie details failed: ${res.status}`)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const r: any = await res.json()

  return {
    tmdb_id: r.id,
    type: 'movie',
    title: r.title ?? '',
    original_title: r.original_title ?? '',
    poster_path: r.poster_path ?? null,
    release_year: extractYear(r.release_date),
    overview: r.overview ?? '',
    genres: (r.genres ?? []).map((g: { name: string }) => g.name),
    runtime_minutes: r.runtime ?? null,
  }
}

export async function getTVDetails(tmdbId: number, type: MediaType): Promise<TmdbDetails> {
  const url = buildUrl(`/tv/${tmdbId}`)
  const res = await fetch(url, { next: { revalidate: 0 } })
  if (!res.ok) throw new Error(`TMDB tv details failed: ${res.status}`)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const r: any = await res.json()

  const seasons: TmdbSeason[] = []
  for (const s of (r.seasons ?? []) as { season_number: number; id: number; name: string; episode_count: number }[]) {
    if (s.season_number === 0) continue // пропускаем "Specials"

    const episodesUrl = buildUrl(`/tv/${tmdbId}/season/${s.season_number}`)
    const epRes = await fetch(episodesUrl, { next: { revalidate: 0 } })
    if (!epRes.ok) continue

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const epData: any = await epRes.json()
    const episodes: TmdbEpisode[] = (epData.episodes ?? []).map(
      (e: { id: number; episode_number: number; name: string; runtime: number | null }) => ({
        tmdb_episode_id: e.id,
        episode_number: e.episode_number,
        name: e.name ?? '',
        runtime_minutes: e.runtime ?? null,
      })
    )

    seasons.push({
      tmdb_season_id: s.id,
      season_number: s.season_number,
      name: s.name ?? `Сезон ${s.season_number}`,
      episodes,
    })
  }

  return {
    tmdb_id: r.id,
    type,
    title: r.name ?? '',
    original_title: r.original_name ?? '',
    poster_path: r.poster_path ?? null,
    release_year: extractYear(r.first_air_date),
    overview: r.overview ?? '',
    genres: (r.genres ?? []).map((g: { name: string }) => g.name),
    runtime_minutes: r.episode_run_time?.[0] ?? null,
    seasons,
  }
}
