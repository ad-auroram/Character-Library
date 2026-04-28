'use server'

import {
  buildCharacterSummaryDraft,
  buildCharacterSummaryPrompt,
  canGenerateCharacterSummary,
  type CharacterSummaryContext,
} from './ai-utils'
import { createClient } from '@/lib/supabase/server'

function readField(formData: FormData, name: string): string {
  return String(formData.get(name) ?? '').trim()
}

function readStat(formData: FormData, name: string): number {
  const value = Number.parseInt(String(formData.get(name) ?? '10'), 10)
  if (Number.isNaN(value)) {
    return 10
  }

  return Math.min(30, Math.max(1, value))
}

export type GenerateResult = {
  success: boolean
  text: string
  error?: string
  rateLimited?: boolean
}

export async function generateCharacterSummaryAction(
  previousSummary: string | GenerateResult,
  formData: FormData
): Promise<GenerateResult> {
  const previousText = typeof previousSummary === 'string' ? previousSummary : previousSummary?.text ?? ''
  const context: CharacterSummaryContext = {
    name: readField(formData, 'name'),
    role: readField(formData, 'role'),
    summary: readField(formData, 'summary'),
    notes: readField(formData, 'notes'),
    strength: readStat(formData, 'strength'),
    dexterity: readStat(formData, 'dexterity'),
    constitution: readStat(formData, 'constitution'),
    intelligence: readStat(formData, 'intelligence'),
    wisdom: readStat(formData, 'wisdom'),
    charisma: readStat(formData, 'charisma'),
  }

  const prompt = buildCharacterSummaryPrompt(context)

  if (!canGenerateCharacterSummary()) {
    return { success: false, text: previousText, error: 'AI key not configured' }
  }

  console.log('[ai-summary] prompt prepared')

  // Require a signed-in user for rate-limiting and auditing
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    console.warn('[ai-summary] unauthenticated request')
    return { success: false, text: previousText, error: 'Authentication required' }
  }

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return { success: false, text: buildCharacterSummaryDraft(context), error: 'OpenAI key missing' }
  }

  // Call OpenAI with a small retry/backoff on 429
  const maxRetries = 3
  let attempt = 0
  let lastError: unknown = null

  const model = process.env.OPENAI_MODEL ?? 'gpt-4o-mini'

  while (attempt <= maxRetries) {
    attempt += 1
    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: 'You are a helpful assistant that writes short fantasy RPG character summaries.' },
            { role: 'user', content: prompt },
          ],
          max_tokens: 300,
          temperature: 1,
        }),
      })

      if (res.status === 429) {
        lastError = `rate_limited_status_${res.status}`
        const backoff = 500 * attempt
        console.warn(`[ai-summary] rate limited, retrying in ${backoff}ms (attempt ${attempt})`)
        await new Promise((r) => setTimeout(r, backoff))
        continue
      }

      if (!res.ok) {
        const text = await res.text().catch(() => '')
        console.error('[ai-summary] OpenAI error', res.status, text)
        return { success: false, text: buildCharacterSummaryDraft(context), error: `OpenAI error ${res.status}` }
      }

      const data = await res.json()
      const content = data?.choices?.[0]?.message?.content
      if (content.length > 0) {
        return { success: true, text: typeof content === 'string' ? content.trim() : String(content).trim() }
      }

      console.error('[ai-summary] empty OpenAI response', data)
      return { success: false, text: buildCharacterSummaryDraft(context), error: 'Empty response from OpenAI' }
    } catch (err) {
      lastError = err
      console.error('[ai-summary] request failed', err)
      const backoff = 500 * attempt
      await new Promise((r) => setTimeout(r, backoff))
      continue
    }
  }

  console.error('[ai-summary] all retries failed', lastError)
  return { success: false, text: buildCharacterSummaryDraft(context), error: 'All retries failed' }
}