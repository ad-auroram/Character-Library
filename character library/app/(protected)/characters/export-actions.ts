'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getPdfExportQueue } from '@/lib/queue/pdf-export'

export type CharacterExportStatus = 'queued' | 'processing' | 'completed' | 'failed'

const EXPORT_RETENTION_SECONDS = 24 * 60 * 60
const EXPORT_RETENTION_MS = EXPORT_RETENTION_SECONDS * 1000

interface ExportActionResult {
  success: boolean
  exportId?: string
  status?: CharacterExportStatus
  error?: string
  downloadUrl?: string
}

async function requireOwnedCharacter(characterId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  const { data: character } = await supabase
    .from('characters')
    .select('id')
    .eq('id', characterId)
    .eq('user_id', user.id)
    .single()

  if (!character) {
    throw new Error('Character not found or not editable.')
  }

  return { supabase, userId: user.id }
}

export async function requestCharacterPdfExportAction(characterId: string): Promise<ExportActionResult> {
  try {
    const { supabase, userId } = await requireOwnedCharacter(characterId)

    const { data: exportRow, error: insertError } = await supabase
      .from('character_exports')
      .insert({
        character_id: characterId,
        user_id: userId,
        status: 'queued',
      })
      .select('id')
      .single()

    if (insertError || !exportRow) {
      throw new Error(insertError?.message ?? 'Failed to create export job.')
    }

    const queue = getPdfExportQueue()
    await queue.add(
      'generate-character-pdf',
      {
        exportId: exportRow.id,
        characterId,
        userId,
      },
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
        removeOnComplete: 100,
        removeOnFail: 200,
      }
    )

    revalidatePath(`/characters/${characterId}`)
    return { success: true, exportId: exportRow.id, status: 'queued' }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to queue export.',
    }
  }
}

export async function getCharacterPdfExportStatusAction(exportId: string): Promise<ExportActionResult> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error('Unauthorized')
    }

    const { data: exportRow, error } = await supabase
      .from('character_exports')
      .select('id, status, storage_path, created_at')
      .eq('id', exportId)
      .eq('user_id', user.id)
      .single()

    if (error || !exportRow) {
      throw new Error(error?.message ?? 'Export job not found.')
    }

    let downloadUrl: string | undefined
    if (exportRow.status === 'completed' && exportRow.storage_path) {
      const createdAt = new Date(exportRow.created_at).getTime()
      const isExpired = Number.isFinite(createdAt) && Date.now() - createdAt > EXPORT_RETENTION_MS

      if (isExpired) {
        const admin = createAdminClient()
        await admin.storage.from('character-exports').remove([exportRow.storage_path])
        await admin
          .from('character_exports')
          .delete()
          .eq('id', exportId)
          .eq('user_id', user.id)

        return {
          success: false,
          error: 'This PDF expired after 24 hours. Please generate a new export.',
        }
      }

      const admin = createAdminClient()
      const { data: signedUrlData, error: signedUrlError } = await admin
        .storage
        .from('character-exports')
        .createSignedUrl(exportRow.storage_path, 300)

      if (!signedUrlError) {
        downloadUrl = signedUrlData?.signedUrl
      }
    }

    return {
      success: true,
      exportId: exportRow.id,
      status: exportRow.status as CharacterExportStatus,
      downloadUrl,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to load export status.',
    }
  }
}
