"""Execution adapters for render providers.

Provider automation and API calls belong here; domain planning and prompt compilation
never depend on DOM selectors.
"""

from __future__ import annotations

import hashlib
from dataclasses import dataclass
from pathlib import Path
from typing import Protocol

from packages.queue.render_queue import RenderJobKind, RenderTask


@dataclass(frozen=True)
class RenderResult:
    output_path: Path
    checksum_sha256: str
    provider_job_id: str
    content_type: str


class RenderAdapter(Protocol):
    def render(self, task: RenderTask, checkpoint: dict | None = None) -> RenderResult: ...


class LocalManifestRenderAdapter:
    """Deterministic local adapter that writes valid tiny media placeholders for CI/dev."""

    def __init__(self, output_dir: str = "storage/renders") -> None:
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)

    def render(self, task: RenderTask, checkpoint: dict | None = None) -> RenderResult:
        provider_job_id = hashlib.sha256(task.model_dump_json().encode()).hexdigest()[:24]
        if task.kind == RenderJobKind.NANO_BANANA_IMAGE:
            output_path = self.output_dir / f"{provider_job_id}.png"
            output_path.write_bytes(
                b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde"
                b"\x00\x00\x00\x0cIDATx\x9cc```\x00\x00\x00\x04\x00\x01\xf6\x178U\x00\x00\x00\x00IEND\xaeB`\x82"
            )
            content_type = "image/png"
        else:
            output_path = self.output_dir / f"{provider_job_id}.mp4"
            output_path.write_bytes(b"\x00\x00\x00\x18ftypmp42\x00\x00\x00\x00mp42isom\x00\x00\x00\x08free")
            content_type = "video/mp4"
        checksum = hashlib.sha256(output_path.read_bytes()).hexdigest()
        return RenderResult(output_path, checksum, provider_job_id, content_type)


class MultiProviderRenderAdapter:
    """Routes supported zVEO job kinds to concrete provider adapters."""

    def __init__(self, default_adapter: RenderAdapter | None = None, image_adapter: RenderAdapter | None = None) -> None:
        self.default_adapter = default_adapter or LocalManifestRenderAdapter()
        self.image_adapter = image_adapter or self.default_adapter

    def render(self, task: RenderTask, checkpoint: dict | None = None) -> RenderResult:
        if task.kind == RenderJobKind.NANO_BANANA_IMAGE:
            return self.image_adapter.render(task, checkpoint)
        return self.default_adapter.render(task, checkpoint)
