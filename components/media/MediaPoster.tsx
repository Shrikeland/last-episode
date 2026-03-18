'use client'

import Image from 'next/image'
import { Film } from 'lucide-react'
import type { MediaType } from '@/types'

interface MediaPosterProps {
  posterUrl: string | null
  title: string
  type: MediaType
}

export function MediaPoster({ posterUrl, title }: MediaPosterProps) {
  return (
    <div className="relative" data-testid="media-poster">
      {/* Amber glow effect */}
      <div
        className="absolute -inset-2 rounded-2xl opacity-30 blur-xl"
        style={{
          background:
            'radial-gradient(ellipse at center, #E67E22 0%, transparent 70%)',
        }}
        aria-hidden="true"
      />
      <div className="relative w-[240px] h-[360px] rounded-xl overflow-hidden border border-border/50">
        {posterUrl ? (
          <Image
            src={posterUrl}
            alt={title}
            fill
            className="object-cover"
            sizes="240px"
            priority
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <Film className="h-16 w-16 text-muted-foreground" />
          </div>
        )}
      </div>
    </div>
  )
}