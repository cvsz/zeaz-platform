import { observeReward, selectArm, type Arm } from './bandit.js'

type LlmResult = {
  output: string
  arm: Arm
}

async function callOpenAI(input: string, model: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is required')
  }

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: input }],
      max_tokens: Number(process.env.MAX_TOKENS_PER_REQUEST ?? 400)
    })
  })

  if (!res.ok) {
    throw new Error(`Completion failed (${res.status})`)
  }

  const json = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>
  }

  return json.choices?.[0]?.message?.content ?? ''
}

export async function routeLLM(input: string): Promise<LlmResult> {
  const arm = selectArm()

  try {
    if (arm === 'cheap') {
      const cheapModel = process.env.CHEAP_MODEL ?? 'gpt-4o-mini'
      return { output: await callOpenAI(input, cheapModel), arm }
    }

    const smartModel = process.env.SMART_MODEL ?? 'gpt-4.1'
    return { output: await callOpenAI(input, smartModel), arm }
  } catch {
    const fallbackModel = process.env.FALLBACK_MODEL ?? 'gpt-4o-mini'
    return { output: await callOpenAI(input, fallbackModel), arm }
  }
}

export function recordOutcome(arm: Arm, accepted: boolean): void {
  observeReward(arm, accepted ? 1 : 0)
}
