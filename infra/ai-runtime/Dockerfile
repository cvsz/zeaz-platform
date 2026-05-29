FROM python:3.11-slim
WORKDIR /app
RUN pip install --no-cache-dir fastapi uvicorn langgraph langchain-openai psycopg2-binary redis pydantic
COPY app /app
