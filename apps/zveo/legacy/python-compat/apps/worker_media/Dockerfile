FROM nvidia/cuda:12.5.1-runtime-ubuntu24.04

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    SERVICE_NAME=zveo-media-worker

RUN apt-get update \
    && apt-get install -y --no-install-recommends python3 python3-pip ffmpeg ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY requirements.txt ./
RUN pip3 install --break-system-packages --no-cache-dir -r requirements.txt
COPY packages ./packages
COPY apps ./apps

EXPOSE 9100
CMD ["python3", "-m", "apps.worker_render.main"]
