const { Worker } = require('bullmq')
const IORedis = require('ioredis')
const puppeteer = require('puppeteer')
const { createClient } = require('@supabase/supabase-js')

const PDF_EXPORT_QUEUE_NAME = 'character-pdf-export'

const redisUrl = process.env.REDIS_URL
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!redisUrl || !supabaseUrl || !serviceRoleKey) {
  throw new Error('REDIS_URL, NEXT_PUBLIC_SUPABASE_URL, and SUPABASE_SERVICE_ROLE_KEY are required.')
}

const connection = new IORedis(redisUrl, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
})

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
})

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function levelLabel(level) {
  return level === 0 ? 'Cantrips' : `Level ${level}`
}

function buildCharacterPdfHtml(character, spells) {
  const grouped = new Map()
  for (const spell of spells) {
    if (!grouped.has(spell.level)) grouped.set(spell.level, [])
    grouped.get(spell.level).push(spell)
  }

  const levels = Array.from(grouped.keys()).sort((a, b) => a - b)
  const spellsMarkup = levels.length
    ? levels
        .map((level) => {
          const cards = grouped
            .get(level)
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
                  <p class="meta">${escapeHtml(spell.school || 'Unknown School')}</p>
                  <p><strong>Cast Time:</strong> ${escapeHtml(spell.casting_time || 'N/A')}</p>
                  <p><strong>Range:</strong> ${escapeHtml(spell.range || 'N/A')}</p>
                  <p><strong>Duration:</strong> ${escapeHtml(spell.duration || 'N/A')}</p>
                  ${flags ? `<p><strong>Flags:</strong> ${escapeHtml(flags)}</p>` : ''}
                  ${spell.description ? `<p class="description">${escapeHtml(spell.description)}</p>` : ''}
                </article>
              `
            })
            .join('')

          return `
            <section class="spell-group">
              <h3>${levelLabel(level)}</h3>
              <div class="spell-grid">${cards}</div>
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
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }
        .spell-card {
          border: 1px solid #d1d5db;
          border-radius: 6px;
          padding: 10px;
          break-inside: avoid;
          font-size: 11px;
        }
        .meta { font-size: 12px; color: #6b7280; }
        .description { white-space: pre-wrap; font-size: 12px; margin-top: 6px; }
      </style>
    </head>
    <body>
      <section class="page">
        <h1>${escapeHtml(character.name)}</h1>
        <p class="muted">${escapeHtml(character.role || 'No role set')}</p>

        <h2>Summary</h2>
        <p>${escapeHtml(character.summary || 'No summary yet.')}</p>

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
        <p>${escapeHtml(character.notes || 'No notes yet.')}</p>
      </section>

      <section class="page">
        <h2>Spells</h2>
        ${spellsMarkup}
      </section>
    </body>
  </html>
  `
}

const worker = new Worker(
  PDF_EXPORT_QUEUE_NAME,
  async (job) => {
    const { exportId, characterId, userId } = job.data

    await supabase
      .from('character_exports')
      .update({ status: 'processing', error_message: null })
      .eq('id', exportId)

    try {
      const { data: character, error: characterError } = await supabase
        .from('characters')
        .select(
          'id, user_id, name, role, summary, notes, strength, dexterity, constitution, intelligence, wisdom, charisma'
        )
        .eq('id', characterId)
        .single()

      if (characterError || !character) {
        throw new Error(characterError?.message || 'Character not found.')
      }

      if (character.user_id !== userId) {
        throw new Error('User does not own the character for this export.')
      }

      const { data: spells, error: spellsError } = await supabase
        .from('character_spells')
        .select('name, level, school, casting_time, range, duration, ritual, concentration, description')
        .eq('character_id', characterId)
        .order('level', { ascending: true })
        .order('name', { ascending: true })

      if (spellsError) {
        throw new Error(spellsError.message)
      }

      const html = buildCharacterPdfHtml(character, spells || [])

      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      })

      const page = await browser.newPage()
      await page.setContent(html, { waitUntil: 'networkidle0' })
      const pdfBuffer = await page.pdf({
        format: 'Letter',
        printBackground: true,
      })

      await browser.close()

      const storagePath = `${userId}/${characterId}/${exportId}.pdf`
      const { error: uploadError } = await supabase.storage
        .from('character-exports')
        .upload(storagePath, pdfBuffer, {
          contentType: 'application/pdf',
          upsert: true,
        })

      if (uploadError) {
        throw new Error(uploadError.message)
      }

      await supabase
        .from('character_exports')
        .update({
          status: 'completed',
          storage_path: storagePath,
          error_message: null,
        })
        .eq('id', exportId)

      return { exportId, storagePath }
    } catch (error) {
      await supabase
        .from('character_exports')
        .update({
          status: 'failed',
          error_message: error instanceof Error ? error.message : 'Export failed.',
        })
        .eq('id', exportId)

      throw error
    }
  },
  {
    connection,
    settings: {
      lockDuration: 30000,
      lockRenewTime: 15000,
      maxStalledCount: 2,
      stalledInterval: 30000,
      retryProcessDelay: 5000,
      guardInterval: 30000,
      pollInterval: 30000,
    },
  }
)

worker.on('completed', (job) => {
  console.log(`[pdf-worker] completed job ${job.id}`)
})

worker.on('failed', (job, err) => {
  console.error(`[pdf-worker] failed job ${job?.id}:`, err.message)
})

console.log('[pdf-worker] running and waiting for jobs...')
