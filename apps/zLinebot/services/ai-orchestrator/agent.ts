import { runTool } from './tool-runner.js'
import { tools } from './tools.js'

export async function agent(input: string): Promise<unknown> {
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
      model: process.env.CHAT_MODEL ?? 'gpt-4o-mini',
      messages: [{ role: 'user', content: input }],
      tool_choice: 'auto',
      tools: Object.values(tools).map((tool) => ({
        type: 'function',
        function: {
          name: tool.name,
          description: tool.description,
          parameters: tool.schema
        }
      }))
    })
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Agent call failed (${res.status}): ${body}`)
  }

  const json = (await res.json()) as {
    choices?: Array<{
      message?: {
        content?: string
        tool_calls?: Array<{ function?: { name?: string; arguments?: string } }>
      }
    }>
  }

  const toolCall = json.choices?.[0]?.message?.tool_calls?.[0]

  if (toolCall?.function?.name && toolCall.function.arguments) {
    const args = JSON.parse(toolCall.function.arguments) as Record<string, unknown>
    return runTool(toolCall.function.name, args)
  }

  return json.choices?.[0]?.message?.content ?? ''
}
