export interface DndSpellSearchResult {
  index: string
  name: string
  url: string
}

export interface DndSpellSearchPage {
  items: DndSpellSearchResult[]
  total: number
  page: number
  pageSize: number
  totalPages: number
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
  classes: string[]
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
  classes?: Array<{ name?: string }>
}

interface DndSpellCatalogEntry {
  index: string
  name: string
  url: string
  classes: string[]
}

let spellCatalogPromise: Promise<DndSpellCatalogEntry[]> | null = null

async function getSpellCatalog(): Promise<DndSpellCatalogEntry[]> {
  if (!spellCatalogPromise) {
    spellCatalogPromise = (async () => {
      const response = await fetch(`${DND_API_BASE_URL}/api/spells`, {
        next: { revalidate: 3600 },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch spells from D&D API.')
      }

      const data = (await response.json()) as DndSpellListResponse
      const summaries = data.results ?? []

      const detailedSpells = await Promise.all(
        summaries.map(async (spell) => {
          const detail = await getDndSpellByIndex(spell.index)
          return {
            index: detail.index,
            name: detail.name,
            url: detail.url ?? spell.url,
            classes: detail.classes,
          }
        })
      )

      return detailedSpells
    })()
  }

  return spellCatalogPromise
}

export async function searchDndSpells(
  query: string,
  page = 1,
  pageSize = 10
): Promise<DndSpellSearchPage> {
  const cleaned = query.trim().toLowerCase()
  if (!cleaned) {
    return { items: [], total: 0, page, pageSize, totalPages: 0 }
  }

  const catalog = await getSpellCatalog()

  const matchingSpells = catalog
    .filter((spell) => {
      const nameMatches = spell.name.toLowerCase().includes(cleaned)
      const classMatches = spell.classes.some((className) =>
        className.toLowerCase().includes(cleaned)
      )

      return nameMatches || classMatches
    })

  const total = matchingSpells.length
  const totalPages = total === 0 ? 0 : Math.ceil(total / pageSize)
  const safePage = Math.min(Math.max(page, 1), Math.max(totalPages, 1))
  const startIndex = (safePage - 1) * pageSize

  return {
    items: matchingSpells.slice(startIndex, startIndex + pageSize),
    total,
    page: safePage,
    pageSize,
    totalPages,
  }
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
    classes: (data.classes ?? [])
      .map((spellClass) => spellClass.name)
      .filter((name): name is string => Boolean(name)),
  }
}
