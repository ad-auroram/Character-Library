'use client'

import { useEffect, useState } from 'react'
import {
  getCharacterPdfExportStatusAction,
  requestCharacterPdfExportAction,
  type CharacterExportStatus,
} from '@/app/(protected)/characters/export-actions'

interface CharacterExportSectionProps {
  characterId: string
}

export function CharacterExportSection({ characterId }: CharacterExportSectionProps) {
  const [exportId, setExportId] = useState<string | null>(null)
  const [status, setStatus] = useState<CharacterExportStatus | null>(null)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!exportId || (status !== 'queued' && status !== 'processing')) {
      return
    }

    let cancelled = false
    const interval = window.setInterval(async () => {
      const result = await getCharacterPdfExportStatusAction(exportId)
      if (cancelled || !result.success) {
        if (!cancelled && !result.success) {
          setError(result.error ?? 'Failed to poll export status.')
        }
        return
      }

      setStatus(result.status ?? null)
      if (result.downloadUrl) {
        setDownloadUrl(result.downloadUrl)
      }

      if (result.status === 'failed') {
        setError('Export failed. Please try again.')
      }
    }, 3000)

    return () => {
      cancelled = true
      window.clearInterval(interval)
    }
  }, [exportId, status])

  const handleExport = async () => {
    setError(null)
    setDownloadUrl(null)
    setIsSubmitting(true)

    const result = await requestCharacterPdfExportAction(characterId)
    if (!result.success || !result.exportId) {
      setError(result.error ?? 'Failed to start export.')
      setIsSubmitting(false)
      return
    }

    setExportId(result.exportId)
    setStatus(result.status ?? 'queued')
    setIsSubmitting(false)
  }

  const isWorking = isSubmitting || status === 'queued' || status === 'processing'

  return (
    <section className="rounded-md border border-gray-200 dark:border-gray-700 p-4 space-y-3">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">PDF Export</h2>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Page 1 includes character name, role, summary, notes, and core stats. Page 2 groups spells by level, with cantrips first.
      </p>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        Generated PDFs are kept for 24 hours.
      </p>

      <button
        type="button"
        onClick={handleExport}
        disabled={isWorking}
        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isWorking ? 'Exporting PDF...' : 'Export Character PDF'}
      </button>

      {status && (
        <p className="text-sm text-gray-700 dark:text-gray-300">
          Status: <span className="font-medium capitalize">{status}</span>
        </p>
      )}

      {downloadUrl && (
        <a
          href={downloadUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-block text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
        >
          Download PDF
        </a>
      )}

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
    </section>
  )
}
