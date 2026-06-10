import json
from src.utils.logger import get_logger

logger = get_logger(__name__)

class StickerDesignAgent:
    """
    An AI Agent responsible for brainstorming and designing the optimal 
    sticker background prompt based on product details.
    """
    def __init__(self, openai_client):
        self.client = openai_client

    def design_sticker_prompt(self, product_name: str, price: str, promo: str) -> str:
        """
        Agentic Workflow:
        1. Analyze product and target audience.
        2. Brainstorm visual concepts.
        3. Output the best DALL-E prompt.
        """
        logger.info(f"🕵️ Agent is analyzing product: {product_name}")
        
        system_prompt = """
        You are an expert LINE Creators Market Sticker Design Agent. 
        Your goal is to create the PERFECT background image prompt for an online shop sticker, strictly following LINE guidelines.
        
        Follow this reasoning process:
        1. Analyze the product, price, and promo.
        2. Determine the target emotion or action (e.g., Hello, Thanks, OK, Wow, Excited) that fits the promo.
        3. Formulate a highly descriptive DALL-E 3 prompt that focuses ONLY on the background art (NO TEXT).
        
        CRITICAL LINE GUIDELINE RULES FOR THE PROMPT:
        - Must include: "cute chibi style, vector art, 2D flat color, thick clean white outline around the character, solid pure white background, isolated on white background, line sticker art style, --no typography, text, words"
        - The character must have clear emotions and be easy to see when downscaled.
        - The image must have a central or side clear area where text will be overlaid later.
        
        Return the result as a JSON object with this schema:
        {
            "analysis": "Brief analysis of the product vibe and emotion",
            "emotion": "The chosen sticker emotion",
            "final_dalle_prompt": "The actual English prompt for DALL-E 3 incorporating the mandatory style rules"
        }
        """
        
        user_prompt = f"Product: {product_name}\nPrice: {price}\nPromo: {promo}"
        
        try:
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                response_format={"type": "json_object"},
                temperature=0.7
            )
            
            result_text = response.choices[0].message.content.strip()
            result_json = json.loads(result_text)
            
            logger.info(f"🧠 Agent Analysis: {result_json.get('analysis')}")
            logger.info(f"😊 Agent Emotion: {result_json.get('emotion')}")
            
            final_prompt = result_json.get('final_dalle_prompt', f"A beautiful promotional background for {product_name}")
            return final_prompt
            
        except Exception as e:
            logger.error(f"Agent failed to design prompt: {e}")
            # Fallback prompt
            return f"A clean, beautiful, textless e-commerce promotional background for {product_name}, high quality, 8k"
