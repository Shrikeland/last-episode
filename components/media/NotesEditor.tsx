'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { updateNotes } from '@/app/actions/progress'

interface NotesEditorProps {
  mediaItemId: string
  initialNotes: string | null
}

const DEBOUNCE_MS = 1500

export function NotesEditor({ mediaItemId, initialNotes }: NotesEditorProps) {
  const [value, setValue] = useState(initialNotes ?? '')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pendingValueRef = useRef<string | null>(null)

  const save = useCallback(
    async (text: string) => {
      const notes = text.trim() === '' ? null : text
      await updateNotes(mediaItemId, notes)
    },
    [mediaItemId]
  )

  useEffect(() => {
    return () => {
      // Flush pending save on unmount
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current)
        if (pendingValueRef.current !== null) {
          save(pendingValueRef.current)
        }
      }
    }
  }, [save])

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const text = e.target.value
    setValue(text)
    pendingValueRef.current = text

    if (timerRef.current !== null) {
      clearTimeout(timerRef.current)
    }
    timerRef.current = setTimeout(() => {
      timerRef.current = null
      pendingValueRef.current = null
      save(text)
    }, DEBOUNCE_MS)
  }

  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-muted-foreground">Заметки</label>
      <Textarea
        value={value}
        onChange={handleChange}
        placeholder="Личные заметки о тайтле..."
        className="resize-none min-h-[100px]"
        data-testid="notes-editor"
      />
    </div>
  )
}