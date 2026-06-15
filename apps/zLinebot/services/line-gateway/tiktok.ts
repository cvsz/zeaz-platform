import type { FastifyInstance } from 'fastify'
import { config } from '../core/config.js'
import { handleTikTokEvent } from '../services/tiktok.service.js'
import { asObject } from '../utils/validator.js'

export async function tiktokRoutes(app: FastifyInstance): Promise<void> {
  app.post('/', async (req, reply) => {
    const token = String(req.headers['x-tiktok-token'] ?? '')

    if (token !== config.tiktokVerifyToken) {
      return reply.status(401).send({ error: 'Unauthorized' })
    }

    await handleTikTokEvent(asObject(req.body))
    app.log.info({ event: req.body }, 'TikTok event received')

    return { status: 'received' }
  })
}
