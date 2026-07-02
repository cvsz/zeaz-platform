import os
from celery import Celery
from shorts_generator.pipeline import run_pipeline

# Initialize Celery app, assuming Redis is running on localhost or REDIS_URL
redis_url = os.environ.get('REDIS_URL', 'redis://localhost:6379/0')
app = Celery('clipper-worker', broker=redis_url, backend=redis_url)

@app.task(name='generate_shorts_from_youtube')
def generate_shorts(youtube_url: str, output_dir: str):
    """
    Background task to generate YouTube shorts
    1. Downloads video
    2. Transcribes video using Whisper
    3. Finds viral highlights using LLM
    4. Clips and crops the video to 9:16
    """
    try:
        results = run_pipeline(youtube_url, output_dir)
        return {"status": "completed", "results": results}
    except Exception as e:
        return {"status": "failed", "error": str(e)}
