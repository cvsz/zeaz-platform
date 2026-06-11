"""FFmpeg command builders and executors for production media pipelines."""

from __future__ import annotations

import json
import subprocess
from dataclasses import dataclass
from pathlib import Path
from shlex import quote

from packages.logger import get_logger
from packages.telemetry.metrics import FFMPEG_DURATION, observe_latency

logger = get_logger(__name__)


@dataclass(frozen=True)
class TranscodeTier:
    name: str
    width: int
    height: int
    video_bitrate: str
    audio_bitrate: str = "192k"


YOUTUBE_1080P = TranscodeTier("youtube_1080p", 1920, 1080, "8000k")
SOCIAL_VERTICAL = TranscodeTier("social_vertical", 1080, 1920, "6500k")
ARCHIVE_4K = TranscodeTier("archive_4k", 3840, 2160, "35000k", "320k")


def build_compose_command(input_video: str, audio_track: str, subtitles: str, output: str) -> list[str]:
    """Build an FFmpeg command for muxing audio and burning subtitles."""

    escaped_subtitles = quote(subtitles)
    return [
        "ffmpeg", "-y", "-i", input_video, "-i", audio_track, "-vf", f"subtitles={escaped_subtitles}",
        "-c:v", "libx264", "-preset", "slow", "-crf", "18", "-c:a", "aac", "-shortest", output,
    ]


def build_transcode_command(input_video: str, output: str, tier: TranscodeTier) -> list[str]:
    scale = f"scale={tier.width}:{tier.height}:force_original_aspect_ratio=decrease,pad={tier.width}:{tier.height}:(ow-iw)/2:(oh-ih)/2"
    return [
        "ffmpeg", "-y", "-i", input_video, "-vf", scale, "-c:v", "libx264", "-preset", "medium",
        "-b:v", tier.video_bitrate, "-maxrate", tier.video_bitrate, "-bufsize", tier.video_bitrate,
        "-c:a", "aac", "-b:a", tier.audio_bitrate, "-movflags", "+faststart", output,
    ]


def build_thumbnail_command(input_video: str, output_image: str, timestamp: str = "00:00:01") -> list[str]:
    return ["ffmpeg", "-y", "-ss", timestamp, "-i", input_video, "-frames:v", "1", "-q:v", "2", output_image]


def build_beat_sync_filter(beats_seconds: list[float]) -> str:
    """Build an FFmpeg select expression for beat-aligned cut points."""

    if not beats_seconds:
        raise ValueError("at least one beat timestamp is required")
    terms = "+".join(f"eq(t,{beat:.3f})" for beat in beats_seconds)
    return f"select='{terms}',setpts=N/FRAME_RATE/TB"


def run_ffmpeg(cmd: list[str], operation: str = "ffmpeg") -> None:
    logger.info("ffmpeg starting", extra={"queue": operation})
    with observe_latency(FFMPEG_DURATION, operation):
        completed = subprocess.run(cmd, check=False, capture_output=True, text=True)
    if completed.returncode != 0:
        logger.error("ffmpeg failed", extra={"queue": operation})
        raise RuntimeError(completed.stderr[-4000:])


def compose_video(input_video: str, audio_track: str, subtitles: str, output: str) -> Path:
    cmd = build_compose_command(input_video, audio_track, subtitles, output)
    run_ffmpeg(cmd, "compose")
    return Path(output)


def probe_media(path: str) -> dict:
    cmd = ["ffprobe", "-v", "error", "-print_format", "json", "-show_streams", "-show_format", path]
    completed = subprocess.run(cmd, check=False, capture_output=True, text=True)
    if completed.returncode != 0:
        raise RuntimeError(completed.stderr[-4000:])
    return json.loads(completed.stdout)
