export const PROMPT_STYLES = [
  { id: "professional", name: "Professional / Standard", emoji: "💼", promptPart: "expertly structured, precise constraints, professional context, and clear target outputs" },
  { id: "creative", name: "Creative / Narrative", emoji: "🎨", promptPart: "richly descriptive, immersive storytelling setups, fluid narrative guidance, and high imaginative leeway" },
  { id: "academic", name: "Academic / Analytical", emoji: "📚", promptPart: "highly analytical, logical structured breakdowns, academic rigorous requirements, and citation guidance" },
  { id: "technical", name: "Technical / Coding", emoji: "💻", promptPart: "strict markdown formatting, coding clean-code best practices, debugging constraints, and structured API boundaries" },
];

/**
 * Middleware function for Zaiz to intercept user prompts and optimize them
 * before sending to expensive AI models (e.g., Claude 3.5 Sonnet).
 */
export async function optimizePrompt(userPrompt: string, styleId: string = "professional"): Promise<string> {
  const style = PROMPT_STYLES.find(s => s.id === styleId) || PROMPT_STYLES[0];
  
  // In production, this would call a cheaper/faster model like Haiku or Gemini Flash
  // to rewrite the prompt using the architectural framework from ShipGenAI.
  const systemInstruction = `
    You are an expert Prompt Architect. Your job is to rewrite the user's raw prompt into a highly optimized version.
    The optimized prompt must be: ${style.promptPart}.
  `;

  // For migration purposes, we return a mock optimized string.
  // Real implementation will do fetch() to AI endpoint.
  return `[Optimized for ${style.name}]\n\n${userPrompt}`;
}
