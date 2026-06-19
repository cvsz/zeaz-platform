"""Prompt compiler for structured cinematic zVEO workflows."""

from __future__ import annotations

from enum import StrEnum
from typing import Any

from pydantic import BaseModel, Field

from packages.scene import CinematicWorkflow, SceneNode, continuity_injection, topological_scenes

PROMPT_TEMPLATE = """
{subject}

Style:
{style}

Lighting:
cinematic volumetric lighting

Camera:
35mm lens
shallow depth of field

Mood:
high detail
ultra realistic
""".strip()


class TargetModel(StrEnum):
    VEO = "veo"
    NANO_BANANA = "nano_banana"


class CompiledPrompt(BaseModel):
    workflow_id: str
    scene_id: str
    target_model: TargetModel
    prompt: str = Field(..., min_length=20)
    negative_prompt: str
    duration_seconds: int
    priority: int
    metadata: dict[str, Any]


def build_prompt(subject: str, style: str) -> str:
    """Build a normalized generation prompt from a subject and style."""

    return PROMPT_TEMPLATE.format(subject=subject.strip(), style=style.strip())


def _model_directives(target_model: TargetModel) -> str:
    if target_model is TargetModel.NANO_BANANA:
        return (
            "Generate a consistent high-fidelity image frame suitable for video interpolation. "
            "Preserve exact identity, wardrobe, environment geometry, and lighting continuity."
        )
    return (
        "Generate production-grade cinematic video with temporal consistency, natural motion, "
        "stable identity, realistic physics, and no visible UI artifacts."
    )


def compile_scene_prompt(workflow: CinematicWorkflow, scene: SceneNode, target_model: TargetModel = TargetModel.VEO) -> CompiledPrompt:
    """Compile a scene node into a Veo/Nano Banana prompt with continuity injection."""

    continuity = continuity_injection(workflow, scene)
    prompt = "\n".join(
        [
            _model_directives(target_model),
            f"Project style guide: {workflow.style_guide}",
            f"Scene title: {scene.title}",
            f"Scene action: {scene.description}",
            continuity,
            (
                "Camera plan: "
                f"{scene.camera.framing}, {scene.camera.movement}, "
                f"{scene.camera.lens_mm}mm lens, aperture {scene.camera.aperture}."
            ),
            (
                "Lighting plan: "
                f"{scene.lighting.setup}, {scene.lighting.color_temperature}, "
                f"{scene.lighting.contrast} contrast."
            ),
            f"Transition in: {scene.transition_in.value}; maintain environment persistence across cuts.",
            "Quality bar: cinematic composition, clean anatomy, no text overlays unless requested, no watermarks.",
        ]
    )
    return CompiledPrompt(
        workflow_id=str(workflow.id),
        scene_id=scene.id,
        target_model=target_model,
        prompt=prompt,
        negative_prompt="watermark, logo, malformed hands, broken anatomy, flicker, jump cut, subtitles burned in, UI chrome",
        duration_seconds=scene.duration_seconds,
        priority=scene.priority,
        metadata={
            "target_platforms": workflow.target_platforms,
            "location": scene.continuity.location,
            "character_ids": scene.character_ids,
            "previous_scene_ids": scene.previous_scene_ids,
        },
    )


def compile_workflow(workflow: CinematicWorkflow, target_model: TargetModel = TargetModel.VEO) -> list[CompiledPrompt]:
    """Compile every workflow scene in dependency order."""

    return [compile_scene_prompt(workflow, scene, target_model) for scene in topological_scenes(workflow)]
