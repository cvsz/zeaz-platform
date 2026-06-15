export type EmbeddingProvider = 'openai' | 'instructor' | 'bge'

const MAX_EMBEDDING_INPUT = 5000

function getProvider(): EmbeddingProvider {
  const provider = process.env.EMBEDDING_PROVIDER ?? 'openai'
  if (provider === 'openai' || provider === 'instructor' || provider === 'bge') {
    return provider
  }

  throw new Error(`Unsupported EMBEDDING_PROVIDER: ${provider}`)
}

function validateText(text: string): void {
  if (!text || text.length > MAX_EMBEDDING_INPUT) {
    throw new Error('Invalid embedding input')
  }
}

async function parseEmbedding(res: Response): Promise<number[]> {
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Embedding failed with ${res.status}: ${body}`)
  }

  const json = (await res.json()) as {
    data?: Array<{ embedding?: number[] }>
    embedding?: number[]
  }

  const embedding = json.data?.[0]?.embedding ?? json.embedding
  if (!embedding) {
    throw new Error('Embedding response missing vector')
  }

  return embedding
}

export async function embed(text: string): Promise<number[]> {
  validateText(text)

  const provider = getProvider()

  if (provider === 'openai' || provider === 'instructor') {
    const baseUrl = provider === 'openai'
      ? 'https://api.openai.com/v1'
      : (process.env.INSTRUCTOR_BASE_URL ?? 'https://api.openai.com/v1')

    const apiKey = provider === 'openai'
      ? process.env.OPENAI_API_KEY
      : (process.env.INSTRUCTOR_API_KEY ?? process.env.OPENAI_API_KEY)

    if (!apiKey) {
      throw new Error(`${provider.toUpperCase()} API key is required`)
    }

    const model = process.env.EMBEDDING_MODEL ?? 'text-embedding-3-small'

    const res = await fetch(`${baseUrl}/embeddings`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ model, input: text })
    })

    return parseEmbedding(res)
  }

  const bgeUrl = process.env.BGE_URL
  if (!bgeUrl) {
    throw new Error('BGE_URL is required when EMBEDDING_PROVIDER=bge')
  }

  const res = await fetch(`${bgeUrl}/embed`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  })

  return parseEmbedding(res)
}
