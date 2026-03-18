'use client'

import { useState, useTransition } from 'react'
import { updateRating } from '@/app/actions/progress'

interface RatingInputProps {
  mediaItemId: string
  currentRating: number | null
}

function StarIcon({ fill }: { fill: 'full' | 'half' | 'empty' }) {
  return (
    <svg viewBox="0 0 20 20" className="w-5 h-5" aria-hidden="true">
      <defs>
        <linearGradient id={`half-${fill}`}>
          <stop offset="50%" stopColor={fill === 'empty' ? 'transparent' : '#E67E22'} />
          <stop offset="50%" stopColor="transparent" />
        </linearGradient>
      </defs>
      {/* background star */}
      <path
        d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
        fill={fill === 'full' ? '#E67E22' : fill === 'half' ? 'url(#half-half)' : '#2D3F55'}
      />
    </svg>
  )
}

function getStarFill(starIndex: number, rating: number | null): 'full' | 'half' | 'empty' {
  if (rating === null) return 'empty'
  const full = Math.floor(rating)
  const half = rating % 1 >= 0.5
  if (starIndex < full) return 'full'
  if (starIndex === full && half) return 'half'
  return 'empty'
}

export function RatingInput({ mediaItemId, currentRating }: RatingInputProps) {
  const [rating, setRating] = useState<number | null>(currentRating)
  const [hoverRating, setHoverRating] = useState<number | null>(null)
  const [, startTransition] = useTransition()

  const displayRating = hoverRating ?? rating

  function handleClick(value: number) {
    const newRating = value === rating ? null : value
    setRating(newRating)
    startTransition(async () => {
      await updateRating(mediaItemId, newRating)
    })
  }

  return (
    <div className="flex items-center gap-2" data-testid="rating-input">
      <div
        className="flex"
        onMouseLeave={() => setHoverRating(null)}
      >
        {Array.from({ length: 10 }, (_, i) => i).map((starIndex) => (
          <div key={starIndex} className="flex">
            {/* Left half = starIndex + 0.5 */}
            <button
              type="button"
              className="w-2.5 overflow-hidden hover:scale-110 transition-transform cursor-pointer"
              onMouseEnter={() => setHoverRating(starIndex + 0.5)}
              onClick={() => handleClick(starIndex + 0.5)}
              aria-label={`Оценка ${starIndex + 0.5}`}
            >
              <div className="w-5">
                <StarIcon fill={getStarFill(starIndex, displayRating)} />
              </div>
            </button>
            {/* Right half = starIndex + 1.0 */}
            <button
              type="button"
              className="w-2.5 overflow-hidden -ml-0 hover:scale-110 transition-transform cursor-pointer"
              style={{ clipPath: 'inset(0 0 0 50%)' }}
              onMouseEnter={() => setHoverRating(starIndex + 1)}
              onClick={() => handleClick(starIndex + 1)}
              aria-label={`Оценка ${starIndex + 1}`}
            >
              <div className="w-5 -ml-2.5">
                <StarIcon fill={getStarFill(starIndex, displayRating)} />
              </div>
            </button>
          </div>
        ))}
      </div>
      <span className="text-sm text-muted-foreground min-w-[52px]">
        {displayRating !== null ? `${displayRating} / 10` : '—'}
      </span>
    </div>
  )
}