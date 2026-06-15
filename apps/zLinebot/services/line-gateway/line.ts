import type { FastifyInstance } from 'fastify'
import { config } from '../core/config.js'
import { lineSignature, timingSafeEqual } from '../core/security.js'
import { handleLineMessageEvent } from '../services/line.service.js'
import { asObject } from '../utils/validator.js'

export async function lineRoutes(app: FastifyInstance): Promise<void> {
  app.post('/', async (req, reply) => {
    const signature = String(req.headers['x-line-signature'] ?? '')
    const rawBody = JSON.stringify(req.body)
    const expected = lineSignature(config.lineChannelSecret, rawBody)

    if (!timingSafeEqual(expected, signature)) {
      return reply.status(401).send({ error: 'Invalid signature' })
    }

    const body = asObject(req.body)
    const events = Array.isArray(body.events) ? body.events : []

    for (const event of events) {
      await handleLineMessageEvent(asObject(event))
    }

    return { status: 'ok' }
  })
}
