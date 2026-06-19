FROM python:3.12-slim

WORKDIR /app

# Install dependencies
RUN pip install --no-cache-dir websockets

# Copy application files
COPY . .

# Create data directory
RUN mkdir -p /data

# Default environment
ENV VO_STATUS_DIR=/data \
    VO_OPENCLAW_PATH=/openclaw \
    VO_PORT=18090 \
    VO_WS_PORT=18091

EXPOSE 18090 18091

RUN groupadd -r appgroup && useradd -r -g appgroup appuser && chown -R appuser:appgroup /app /data
RUN chmod +x entrypoint.sh

USER appuser
HEALTHCHECK --interval=30s --timeout=10s --retries=3 CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:18090/')" || exit 1

CMD ["sh", "entrypoint.sh"]
