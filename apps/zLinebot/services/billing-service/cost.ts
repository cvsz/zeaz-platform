export function calcCost(tokens: number): number {
  const pricePer1k = Number(process.env.LLM_PRICE_PER_1K_TOKENS ?? '0.00015')
  return (tokens / 1000) * pricePer1k
}
