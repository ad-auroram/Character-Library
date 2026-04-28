'use client'

import { useActionState, useEffect, useState } from 'react'
import { generateCharacterSummaryAction, type GenerateResult } from '@/app/(protected)/characters/ai-actions'

type CharacterSummaryFieldProps = {
  initialSummary: string
  showGenerateSummary: boolean
}

export function CharacterSummaryField({ initialSummary, showGenerateSummary }: CharacterSummaryFieldProps) {
  const [summary, setSummary] = useState(initialSummary)
  const [message, setMessage] = useState<string | null>(null)

  const initialResult: GenerateResult = { success: true, text: initialSummary }

  const [result, generateSummaryAction, isGenerating] = useActionState(
    generateCharacterSummaryAction,
    initialResult
  )

  useEffect(() => {
    if (!result) return

    // server action returns a structured GenerateResult
    const maybe = result as GenerateResult
    if (maybe && typeof maybe === 'object' && 'text' in maybe) {
      setSummary(maybe.text)
      setMessage(maybe.error ?? (maybe.rateLimited ? 'Rate limit reached' : null))
    } else if (typeof result === 'string') {
      setSummary(result)
      setMessage(null)
    }
  }, [result])

  return (
    <div>
      <label htmlFor="summary" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        Summary
      </label>
      <textarea
        id="summary"
        name="summary"
        rows={3}
        value={summary}
        onChange={(event) => setSummary(event.target.value)}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
      />
      {showGenerateSummary && (
        <div className="mt-2 flex justify-end">
          <button
            type="submit"
            formAction={generateSummaryAction}
            formNoValidate
            disabled={isGenerating}
            className="inline-flex items-center rounded-md border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-70 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300 dark:hover:bg-emerald-500/20"
          >
            {isGenerating ? 'Generating…' : 'Generate'}
          </button>
        </div>
      )}
      {message && <p className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">{message}</p>}
    </div>
  )
}