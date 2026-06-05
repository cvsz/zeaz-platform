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

RUN chmod +x entrypoint.sh

CMD ["sh", "entrypoint.sh"]
