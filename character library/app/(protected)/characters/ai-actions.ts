'use server'

import {
  buildCharacterSummaryDraft,
  buildCharacterSummaryPrompt,
  canGenerateCharacterSummary,
  type CharacterSummaryContext,
} from './ai-utils'

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

export async function generateCharacterSummaryAction(
  previousSummary: string,
  formData: FormData
): Promise<string> {
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
    return previousSummary
  }

  // OpenAI integration will be added next. For now, this action is wired and
  // the prompt is built from the existing character form data.
  console.log('[ai-summary] prompt prepared', prompt)

  return buildCharacterSummaryDraft(context)
}