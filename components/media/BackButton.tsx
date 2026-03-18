'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export function BackButton() {
  const router = useRouter()

  return (
    <div className="flex items-center gap-3 mb-6">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.back()}
        data-testid="back-button"
        className="gap-1.5"
      >
        <ArrowLeft className="h-4 w-4" />
        Назад
      </Button>
      <Link
        href="/library"
        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        Библиотека
      </Link>
    </div>
  )
}