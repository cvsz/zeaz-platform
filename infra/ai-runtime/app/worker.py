# LiteLLM worker integration example
import os
from litellm import completion

LITELLM_BASE_URL = os.getenv('LITELLM_BASE_URL', 'http://litellm:4000')

async def process_ai_task(task_data):
    response = completion(
        model="gpt-4o",
        messages=[{"role": "user", "content": task_data['prompt']}],
        api_base=LITELLM_BASE_URL
    )
    # Process response...