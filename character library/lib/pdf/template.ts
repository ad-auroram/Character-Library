interface PdfCharacterSpell {
  name: string
  level: number
  school: string | null
  casting_time: string | null
  range: string | null
  duration: string | null
  ritual: boolean
  concentration: boolean
  description: string | null
}

interface PdfCharacterData {
  name: string
  role: string | null
  summary: string | null
  notes: string | null
  strength: number
  dexterity: number
  constitution: number
  intelligence: number
  wisdom: number
  charisma: number
  spells: PdfCharacterSpell[]
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function levelLabel(level: number): string {
  return level === 0 ? 'Cantrips' : `Level ${level}`
}

export function buildCharacterPdfHtml(character: PdfCharacterData): string {
  const groupedSpells = new Map<number, PdfCharacterSpell[]>()
  for (const spell of character.spells) {
    const current = groupedSpells.get(spell.level) ?? []
    current.push(spell)
    groupedSpells.set(spell.level, current)
  }

  const spellLevels = Array.from(groupedSpells.keys()).sort((a, b) => a - b)

  const spellsMarkup = spellLevels.length
    ? spellLevels
        .map((level) => {
          const spells = groupedSpells.get(level) ?? []
          const spellCards = spells
            .map((spell) => {
              const flags = [
                spell.concentration ? 'Concentration' : null,
                spell.ritual ? 'Ritual' : null,
              ]
                .filter(Boolean)
                .join(' • ')

              return `
                <article class="spell-card">
                  <h4>${escapeHtml(spell.name)}</h4>
                  <p class="meta">${escapeHtml(spell.school ?? 'Unknown School')}</p>
                  <p><strong>Cast Time:</strong> ${escapeHtml(spell.casting_time ?? 'N/A')}</p>
                  <p><strong>Range:</strong> ${escapeHtml(spell.range ?? 'N/A')}</p>
                  <p><strong>Duration:</strong> ${escapeHtml(spell.duration ?? 'N/A')}</p>
                  ${flags ? `<p><strong>Flags:</strong> ${escapeHtml(flags)}</p>` : ''}
                  ${spell.description ? `<p class="description">${escapeHtml(spell.description)}</p>` : ''}
                </article>
              `
            })
            .join('')

          return `
            <section class="spell-group">
              <h3>${levelLabel(level)}</h3>
              <div class="spell-grid">${spellCards}</div>
            </section>
          `
        })
        .join('')
    : '<p>No spells attached.</p>'

  return `
  <!doctype html>
  <html>
    <head>
      <meta charset="utf-8" />
      <style>
        @page { size: letter; margin: 24px; }
        body { font-family: Arial, sans-serif; color: #111827; }
        .page { page-break-after: always; }
        .page:last-child { page-break-after: auto; }
        h1 { font-size: 28px; margin: 0; }
        h2 { font-size: 20px; margin: 20px 0 8px; }
        h3 { font-size: 16px; margin: 12px 0 8px; }
        h4 { margin: 0 0 6px; font-size: 14px; }
        p { margin: 4px 0; line-height: 1.4; }
        .muted { color: #4b5563; }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 8px;
          margin-top: 10px;
        }
        .stat-card {
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          padding: 8px;
        }
        .spell-group { margin-bottom: 18px; }
        .spell-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 8px;
        }
        .spell-card {
          border: 1px solid #d1d5db;
          border-radius: 6px;
          padding: 8px;
          break-inside: avoid;
        }
        .meta { font-size: 12px; color: #6b7280; }
        .description { white-space: pre-wrap; font-size: 12px; margin-top: 6px; }
      </style>
    </head>
    <body>
      <section class="page">
        <h1>${escapeHtml(character.name)}</h1>
        <p class="muted">${escapeHtml(character.role ?? 'No role set')}</p>

        <h2>Summary</h2>
        <p>${escapeHtml(character.summary ?? 'No summary yet.')}</p>

        <h2>Core Stats</h2>
        <div class="stats-grid">
          <div class="stat-card"><strong>STR</strong>: ${character.strength}</div>
          <div class="stat-card"><strong>DEX</strong>: ${character.dexterity}</div>
          <div class="stat-card"><strong>CON</strong>: ${character.constitution}</div>
          <div class="stat-card"><strong>INT</strong>: ${character.intelligence}</div>
          <div class="stat-card"><strong>WIS</strong>: ${character.wisdom}</div>
          <div class="stat-card"><strong>CHA</strong>: ${character.charisma}</div>
        </div>

        <h2>Notes</h2>
        <p>${escapeHtml(character.notes ?? 'No notes yet.')}</p>
      </section>

      <section class="page">
        <h2>Spells</h2>
        ${spellsMarkup}
      </section>
    </body>
  </html>
  `
}
