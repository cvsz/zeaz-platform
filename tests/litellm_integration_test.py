import pytest
from litellm import completion

def test_litellm_proxy():
    response = completion(model="gpt-4o", messages=[{"role": "user", "content": "test"}])
    assert response is not None