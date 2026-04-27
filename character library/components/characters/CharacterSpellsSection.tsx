'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  addCharacterSpellAction,
  removeCharacterSpellAction,
  searchSpellsAction,
  type CharacterSpell,
} from '@/app/(protected)/characters/spell-actions'
import type { DndSpellSearchResult } from '@/lib/dnd/spells'

const SPELL_SEARCH_PAGE_SIZE = 8

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
  const [resultTotal, setResultTotal] = useState(0)
  const [resultPage, setResultPage] = useState(1)
  const [resultTotalPages, setResultTotalPages] = useState(0)
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

  useEffect(() => {
    const trimmedQuery = query.trim()
    let cancelled = false

    if (trimmedQuery.length < 2) {
      setResults([])
      setResultTotal(0)
      setResultTotalPages(0)
      setSearchError(null)
      setIsSearching(false)
      return
    }

    setSearchError(null)
    setActionError(null)
    setIsSearching(true)

    const timeoutId = window.setTimeout(async () => {
      try {
        const data = await searchSpellsAction(
          trimmedQuery,
          resultPage,
          SPELL_SEARCH_PAGE_SIZE
        )
        if (cancelled) return
        setResults(data.items)
        setResultTotal(data.total)
        setResultPage(data.page)
        setResultTotalPages(data.totalPages)
      } catch (error) {
        if (cancelled) return
        setResults([])
        setResultTotal(0)
        setResultTotalPages(0)
        setSearchError(error instanceof Error ? error.message : 'Failed to search spells.')
      } finally {
        if (cancelled) return
        setIsSearching(false)
      }
    }, 300)

    return () => {
      cancelled = true
      window.clearTimeout(timeoutId)
    }
  }, [query, resultPage])

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
          <div className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value)
                setResultPage(1)
              }}
              placeholder="Search spells from D&D API..."
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400">
            Search updates automatically after you pause typing.
          </p>

          {searchError && (
            <p className="text-sm text-red-600 dark:text-red-400">{searchError}</p>
          )}

          {results.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>
                  Showing {results.length} of {resultTotal} result{resultTotal === 1 ? '' : 's'}
                </span>
                <span>
                  Page {resultPage} of {resultTotalPages}
                </span>
              </div>

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
                      className="px-3 py-1.5 text-sm rounded-md bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {alreadyAttached ? 'Added' : isAdding ? 'Adding...' : 'Add'}
                    </button>
                  </div>
                )
              })}

              {resultTotalPages > 1 && (
                <div className="flex items-center justify-between gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setResultPage((current) => Math.max(1, current - 1))}
                    disabled={isSearching || resultPage <= 1}
                    className="px-3 py-1.5 text-sm rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>

                  <button
                    type="button"
                    onClick={() => setResultPage((current) => current + 1)}
                    disabled={isSearching || resultPage >= resultTotalPages}
                    className="px-3 py-1.5 text-sm rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              )}
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
