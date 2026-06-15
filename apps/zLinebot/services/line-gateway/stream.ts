import type { FastifyInstance } from 'fastify'
import type { SocketStream } from '@fastify/websocket'
import { streamLLM } from '../llm/stream.js'

function getQueryParam(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

export async function streamRoutes(app: FastifyInstance): Promise<void> {
  app.get('/sse', async (req, reply) => {
    reply.raw.setHeader('Content-Type', 'text/event-stream')
    reply.raw.setHeader('Cache-Control', 'no-cache')
    reply.raw.setHeader('Connection', 'keep-alive')

    const query = req.query as Record<string, unknown>
    const tenantId = getQueryParam(query.tenant_id)
    const userId = getQueryParam(query.user_id)
    const input = getQueryParam(query.input)

    for await (const chunk of streamLLM(tenantId, userId, input)) {
      reply.raw.write(`data: ${JSON.stringify(chunk)}\n\n`)
    }

    reply.raw.end()
  })

  app.get('/ws', { websocket: true }, async (socket: SocketStream) => {
    socket.socket.on('message', async (rawInput: Buffer) => {
      const input = rawInput.toString('utf8')
      for await (const chunk of streamLLM('unknown', 'unknown', input)) {
        socket.socket.send(JSON.stringify(chunk))
      }
    })
  })
}
