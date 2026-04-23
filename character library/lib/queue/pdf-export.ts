import IORedis from 'ioredis'
import { Queue } from 'bullmq'

export const PDF_EXPORT_QUEUE_NAME = 'character-pdf-export'

let redisConnection: IORedis | null = null
let pdfExportQueue: Queue | null = null

function requireRedisUrl(): string {
  const redisUrl = process.env.REDIS_URL
  if (!redisUrl) {
    throw new Error('REDIS_URL is required to enqueue PDF export jobs.')
  }
  return redisUrl
}

export function getQueueConnection(): IORedis {
  if (!redisConnection) {
    redisConnection = new IORedis(requireRedisUrl(), {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    })
  }

  return redisConnection
}

export function getPdfExportQueue(): Queue {
  if (!pdfExportQueue) {
    pdfExportQueue = new Queue(PDF_EXPORT_QUEUE_NAME, {
      connection: getQueueConnection(),
    })
  }

  return pdfExportQueue
}
