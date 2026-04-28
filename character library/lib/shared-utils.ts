/**
 * Shared utility functions used across server actions, workers, and PDF generation
 */

export const STAT_BOUNDS = {
  MIN: 1,
  MAX: 30,
  DEFAULT: 10,
} as const

/**
 * Parse a stat value from FormData or other input, clamping to valid bounds
 */
export function parseStat(value: FormDataEntryValue | string | null, defaultValue = STAT_BOUNDS.DEFAULT): number {
  if (typeof value !== 'string') return defaultValue
  const parsed = Number.parseInt(value, 10)
  if (Number.isNaN(parsed)) return defaultValue
  return Math.min(STAT_BOUNDS.MAX, Math.max(STAT_BOUNDS.MIN, parsed))
}

/**
 * Parse a string field from FormData, trimming whitespace
 */
export function parseField(value: FormDataEntryValue | null): string {
  return String(value ?? '').trim()
}

/**
 * Escape HTML special characters to prevent XSS
 */
export function escapeHtml(value: string | null | undefined): string {
  if (!value) return ''
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

/**
 * Convert spell level to a human-readable label
 */
export function spellLevelLabel(level: number): string {
  return level === 0 ? 'Cantrips' : `Level ${level}`
}

/**
 * Deduplicate a comma-separated list (e.g., tags)
 */
export function parseDeduplicatedList(raw: string, separator = ','): string[] {
  const seen = new Set<string>()

  return raw
    .split(separator)
    .map((item) => item.trim().toLowerCase())
    .filter((item) => item.length > 0)
    .filter((item) => {
      if (seen.has(item)) return false
      seen.add(item)
      return true
    })
}

/**
 * Deduplicate a newline-separated list (e.g., URLs)
 */
export function parseDeduplicatedUrlList(raw: string): string[] {
  const seen = new Set<string>()

  return raw
    .split('\n')
    .map((url) => url.trim())
    .filter((url) => url.length > 0)
    .filter((url) => {
      if (seen.has(url)) return false
      seen.add(url)
      return true
    })
}
