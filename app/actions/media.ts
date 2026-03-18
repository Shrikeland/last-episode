'use server'

import * as MediaService from '@/lib/supabase/media'
import { createServerClient } from '@/lib/supabase/server'

export async function deleteMediaItem(id: string): Promise<{ error?: string }> {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Не авторизован' }

  try {
    await MediaService.deleteMediaItem(supabase, id, user.id)
    return {}
  } catch {
    return { error: 'Не удалось удалить' }
  }
}