const BLOCKLIST = [
  'ignore previous instructions',
  'reveal system prompt',
  'developer message',
  'override policy'
]

export function sanitizePrompt(input: string): string {
  let out = input
  for (const token of BLOCKLIST) {
    const pattern = new RegExp(token, 'ig')
    out = out.replace(pattern, '[redacted]')
  }
  return out
}
