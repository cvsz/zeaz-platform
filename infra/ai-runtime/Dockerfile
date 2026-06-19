FROM python:3.11-slim
WORKDIR /app
RUN groupadd -r appgroup && useradd -r -g appgroup appuser
RUN pip install --no-cache-dir fastapi uvicorn langgraph langchain-openai psycopg2-binary redis pydantic
COPY app /app
RUN chown -R appuser:appgroup /app
USER appuser
HEALTHCHECK --interval=30s --timeout=10s --retries=3 CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/')" || exit 1
