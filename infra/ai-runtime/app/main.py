# Updated with LiteLLM integration example
import litellm

def call_llm(model: str, messages: list, **kwargs):
    response = litellm.completion(
        model=model,
        messages=messages,
        api_base="http://litellm:4000"
    )
    return response

# Existing code...