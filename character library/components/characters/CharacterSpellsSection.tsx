'use client'

import { useMemo, useState } from 'react'
import {
  addCharacterSpellAction,
  removeCharacterSpellAction,
  searchSpellsAction,
  type CharacterSpell,
} from '@/app/(protected)/characters/spell-actions'
import type { DndSpellSearchResult } from '@/lib/dnd/spells'

interface CharacterSpellsSectionProps {
  characterId: string
  isOwner: boolean
  initialSpells: CharacterSpell[]
}

function levelLabel(level: number): string {
  return level === 0 ? 'Cantrip' : `Level ${level}`
}

export function CharacterSpellsSection({
  characterId,
  isOwner,
  initialSpells,
}: CharacterSpellsSectionProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<DndSpellSearchResult[]>([])
  const [spells, setSpells] = useState<CharacterSpell[]>(initialSpells)
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [addingSpellIndex, setAddingSpellIndex] = useState<string | null>(null)
  const [removingSpellIndex, setRemovingSpellIndex] = useState<string | null>(null)

  const attachedSpellIndexes = useMemo(
    () => new Set(spells.map((spell) => spell.spell_index)),
    [spells]
  )

  const handleSearch = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSearchError(null)
    setActionError(null)

    if (query.trim().length < 2) {
      setResults([])
      setSearchError('Type at least 2 characters to search spells.')
      return
    }

    setIsSearching(true)
    try {
      const data = await searchSpellsAction(query)
      setResults(data)
    } catch (error) {
      setResults([])
      setSearchError(error instanceof Error ? error.message : 'Failed to search spells.')
    } finally {
      setIsSearching(false)
    }
  }

  const handleAddSpell = async (spellIndex: string) => {
    setActionError(null)
    setAddingSpellIndex(spellIndex)
    try {
      const result = await addCharacterSpellAction(characterId, spellIndex)
      if (!result.success || !result.spell) {
        setActionError(result.error ?? 'Failed to add spell.')
        return
      }

      setSpells((previous) => {
        if (previous.some((spell) => spell.spell_index === result.spell?.spell_index)) {
          return previous
        }
        return [result.spell as CharacterSpell, ...previous]
      })
    } finally {
      setAddingSpellIndex(null)
    }
  }

  const handleRemoveSpell = async (spellIndex: string) => {
    setActionError(null)
    setRemovingSpellIndex(spellIndex)
    const previous = spells

    setSpells((current) => current.filter((spell) => spell.spell_index !== spellIndex))

    const result = await removeCharacterSpellAction(characterId, spellIndex)
    if (!result.success) {
      setSpells(previous)
      setActionError(result.error ?? 'Failed to remove spell.')
    }

    setRemovingSpellIndex(null)
  }

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Spells</h2>

      {isOwner && (
        <div className="rounded-md border border-gray-200 dark:border-gray-700 p-4 space-y-3">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search spells from D&D API..."
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <button
              type="submit"
              disabled={isSearching}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSearching ? 'Searching...' : 'Search'}
            </button>
          </form>

          {searchError && (
            <p className="text-sm text-red-600 dark:text-red-400">{searchError}</p>
          )}

          {results.length > 0 && (
            <div className="space-y-2">
              {results.map((spell) => {
                const alreadyAttached = attachedSpellIndexes.has(spell.index)
                const isAdding = addingSpellIndex === spell.index

                return (
                  <div
                    key={spell.index}
                    className="flex items-center justify-between rounded-md bg-gray-50 dark:bg-gray-900 px-3 py-2"
                  >
                    <div className="font-medium text-gray-900 dark:text-white">{spell.name}</div>
                    <button
                      type="button"
                      onClick={() => handleAddSpell(spell.index)}
                      disabled={alreadyAttached || isAdding}
                      className="px-3 py-1.5 text-sm rounded-md bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {alreadyAttached ? 'Added' : isAdding ? 'Adding...' : 'Add'}
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {actionError && <p className="text-sm text-red-600 dark:text-red-400">{actionError}</p>}

      {spells.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-400">No spells attached yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {spells.map((spell) => (
            <article
              key={spell.id}
              className="rounded-md border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-900"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{spell.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {levelLabel(spell.level)}{spell.school ? ` • ${spell.school}` : ''}
                  </p>
                </div>

                {isOwner && (
                  <button
                    type="button"
                    onClick={() => handleRemoveSpell(spell.spell_index)}
                    disabled={removingSpellIndex === spell.spell_index}
                    className="text-sm px-2 py-1 rounded-md bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {removingSpellIndex === spell.spell_index ? 'Removing...' : 'Remove'}
                  </button>
                )}
              </div>

              <dl className="mt-3 grid grid-cols-1 gap-1 text-sm text-gray-700 dark:text-gray-300">
                <div>Cast Time: {spell.casting_time || 'N/A'}</div>
                <div>Range: {spell.range || 'N/A'}</div>
                <div>Duration: {spell.duration || 'N/A'}</div>
                <div>
                  Flags: {spell.concentration ? 'Concentration' : 'No Concentration'}
                  {spell.ritual ? ' • Ritual' : ''}
                </div>
              </dl>

              {spell.description && (
                <p className="mt-3 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {spell.description}
                </p>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
