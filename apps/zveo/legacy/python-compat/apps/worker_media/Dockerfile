FROM nvidia/cuda:12.5.1-runtime-ubuntu24.04

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    SERVICE_NAME=zveo-media-worker

RUN apt-get update \
    && apt-get install -y --no-install-recommends python3 python3-pip ffmpeg ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY requirements.txt ./
RUN python3 -m venv /venv
ENV PATH="/venv/bin:$PATH"
RUN pip3 install --no-cache-dir -r requirements.txt
COPY packages ./packages
COPY apps ./apps
RUN groupadd -r appgroup && useradd -r -g appgroup appuser && chown -R appuser:appgroup /app /venv

EXPOSE 9100
USER appuser
HEALTHCHECK --interval=30s --timeout=10s --retries=3 CMD python3 -c "import urllib.request; urllib.request.urlopen('http://localhost:9100/')" || exit 1

CMD ["python3", "-m", "apps.worker_render.main"]
