export function optimizePrompt(input: string, maxTokens: number): string {
  const tokens = input.trim().split(/\s+/)

  if (tokens.length <= maxTokens) {
    return input
  }

  const windowSize = Math.floor(maxTokens / 2)
  const head = tokens.slice(0, windowSize)
  const tail = tokens.slice(-windowSize)

  return [...head, '...', ...tail].join(' ')
}
