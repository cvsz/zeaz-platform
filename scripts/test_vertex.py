import vertexai
from vertexai.generative_models import GenerativeModel

vertexai.init(
    project="zeaz-meta-os",
    location="us-central1",
)

model = GenerativeModel("gemini-2.0-flash")

response = model.generate_content(
    "ZEAZ META OS online"
)

print(response.text)
