import os
import logging
from typing import AsyncGenerator, Dict, Any, List, Optional
from google import genai
from google.genai import types
from runtime.llm.base import BaseLLMProvider

logger = logging.getLogger("VertexAdapter")

class VertexAIProvider(BaseLLMProvider):
    def __init__(self, provider_id: str, config: Dict[str, Any]):
        super().__init__(provider_id, config)
        self.project = config.get("project", os.environ.get("GOOGLE_CLOUD_PROJECT"))
        self.location = config.get("location", "us-central1")
        self.model_name = config.get("model", "gemini-2.0-flash")
        
        # Initialize the GenAI client
        self.client = genai.Client(
            vertexai=True,
            project=self.project,
            location=self.location
        )

    async def complete(self, prompt: str, **kwargs) -> Dict[str, Any]:
        try:
            response = await self.client.models.generate_content(
                model=self.model_name,
                contents=prompt,
                config=types.GenerateContentConfig(
                    **kwargs
                )
            )
            self.state_machine.report_success()
            return {
                "text": response.text,
                "usage": {
                    "prompt_tokens": response.usage_metadata.prompt_token_count,
                    "candidates_tokens": response.usage_metadata.candidates_token_count,
                    "total_tokens": response.usage_metadata.total_token_count
                },
                "provider": self.provider_id,
                "model": self.model_name
            }
        except Exception as e:
            logger.error(f"Vertex AI completion error: {e}")
            self.state_machine.report_failure()
            raise

    async def stream(self, prompt: str, **kwargs) -> AsyncGenerator[Dict[str, Any], None]:
        try:
            stream = await self.client.models.generate_content_stream(
                model=self.model_name,
                contents=prompt,
                config=types.GenerateContentConfig(
                    **kwargs
                )
            )
            async for chunk in stream:
                yield {
                    "text": chunk.text,
                    "is_final": False, # Simplified for example
                    "provider": self.provider_id
                }
            self.state_machine.report_success()
        except Exception as e:
            logger.error(f"Vertex AI stream error: {e}")
            self.state_machine.report_failure()
            raise

    async def get_token_count(self, text: str) -> int:
        try:
            response = await self.client.models.count_tokens(
                model=self.model_name,
                contents=text
            )
            return response.total_tokens
        except Exception as e:
            logger.error(f"Error counting tokens: {e}")
            return len(text) // 4 # Fallback estimation
