export interface DndSpellSearchResult {
  index: string
  name: string
  url: string
}

export interface DndSpellDetail {
  index: string
  name: string
  level: number
  school: string | null
  casting_time: string | null
  range: string | null
  duration: string | null
  ritual: boolean
  concentration: boolean
  desc: string[]
  url: string | null
}

const DND_API_BASE_URL = 'https://www.dnd5eapi.co'

interface DndSpellListResponse {
  results?: DndSpellSearchResult[]
}

interface DndSpellDetailResponse {
  index?: string
  name?: string
  level?: number
  school?: { name?: string }
  casting_time?: string
  range?: string
  duration?: string
  ritual?: boolean
  concentration?: boolean
  desc?: string[]
  url?: string
}

export async function searchDndSpells(query: string, limit = 12): Promise<DndSpellSearchResult[]> {
  const cleaned = query.trim().toLowerCase()
  if (!cleaned) return []

  const response = await fetch(`${DND_API_BASE_URL}/api/spells`, {
    next: { revalidate: 3600 },
  })

  if (!response.ok) {
    throw new Error('Failed to fetch spells from D&D API.')
  }

  const data = (await response.json()) as DndSpellListResponse
  const results = data.results ?? []

  return results
    .filter((spell) => spell.name.toLowerCase().includes(cleaned))
    .slice(0, limit)
}

export async function getDndSpellByIndex(spellIndex: string): Promise<DndSpellDetail> {
  const response = await fetch(`${DND_API_BASE_URL}/api/spells/${encodeURIComponent(spellIndex)}`, {
    next: { revalidate: 86400 },
  })

  if (!response.ok) {
    throw new Error('Failed to fetch spell details from D&D API.')
  }

  const data = (await response.json()) as DndSpellDetailResponse
  if (!data.index || !data.name) {
    throw new Error('Spell details are missing required fields.')
  }

  return {
    index: data.index,
    name: data.name,
    level: data.level ?? 0,
    school: data.school?.name ?? null,
    casting_time: data.casting_time ?? null,
    range: data.range ?? null,
    duration: data.duration ?? null,
    ritual: Boolean(data.ritual),
    concentration: Boolean(data.concentration),
    desc: data.desc ?? [],
    url: data.url ?? null,
  }
}
