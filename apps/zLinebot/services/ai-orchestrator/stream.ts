import { sanitizePrompt } from './safety.js'

export type LlmStreamChunk = {
  type: 'token' | 'done' | 'error'
  data: string
}

const decoder = new TextDecoder()

export async function* streamLLM(
  tenantId: string,
  userId: string,
  input: string
): AsyncGenerator<LlmStreamChunk> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is required')
  }

  const safeInput = sanitizePrompt(input)

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'X-Tenant-ID': tenantId,
      'X-User-ID': userId
    },
    body: JSON.stringify({
      model: process.env.CHAT_MODEL ?? 'gpt-4o-mini',
      stream: true,
      messages: [{ role: 'user', content: safeInput }],
      max_tokens: Number(process.env.MAX_TOKENS_PER_REQUEST ?? 400)
    })
  })

  if (!res.ok || !res.body) {
    const body = await res.text()
    throw new Error(`OpenAI streaming failed (${res.status}): ${body}`)
  }

  const reader = res.body.getReader()
  let buffer = ''

  while (true) {
    const { value, done } = await reader.read()
    if (done) {
      break
    }

    buffer += decoder.decode(value, { stream: true })

    const segments = buffer.split('\n\n')
    buffer = segments.pop() ?? ''

    for (const segment of segments) {
      if (!segment.startsWith('data:')) {
        continue
      }

      const payload = segment.replace(/^data:\s*/, '').trim()
      if (payload === '[DONE]') {
        yield { type: 'done', data: '' }
        return
      }

      try {
        const json = JSON.parse(payload) as {
          choices?: Array<{ delta?: { content?: string } }>
        }
        const token = json.choices?.[0]?.delta?.content
        if (token) {
          yield { type: 'token', data: token }
        }
      } catch {
        yield { type: 'error', data: 'Malformed streaming chunk' }
      }
    }
  }

  yield { type: 'done', data: '' }
}
