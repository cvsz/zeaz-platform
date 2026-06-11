"""Scene graph, visual memory, and continuity planning domain model."""

from __future__ import annotations

from enum import StrEnum
from typing import Annotated, Literal
from uuid import UUID, uuid4

from pydantic import BaseModel, Field, field_validator, model_validator


class TransitionKind(StrEnum):
    CUT = "cut"
    MATCH_CUT = "match_cut"
    DISSOLVE = "dissolve"
    WHIP_PAN = "whip_pan"
    J_CUT = "j_cut"
    L_CUT = "l_cut"


class CameraSpec(BaseModel):
    movement: str = Field(..., min_length=2, max_length=120)
    lens_mm: int = Field(default=35, ge=8, le=300)
    aperture: str = Field(default="f/2.8", max_length=32)
    framing: str = Field(default="medium shot", max_length=120)


class LightingSpec(BaseModel):
    setup: str = Field(..., min_length=2, max_length=160)
    color_temperature: str = Field(default="5600K", max_length=32)
    contrast: str = Field(default="cinematic", max_length=80)


class CharacterReference(BaseModel):
    id: str = Field(..., pattern=r"^[a-zA-Z0-9_-]{2,64}$")
    name: str = Field(..., min_length=1, max_length=120)
    appearance: str = Field(..., min_length=10, max_length=1200)
    wardrobe: str = Field(..., min_length=3, max_length=800)
    voice: str | None = Field(default=None, max_length=500)
    reference_asset_ids: list[UUID] = Field(default_factory=list)


class ContinuityMetadata(BaseModel):
    location: str = Field(..., min_length=2, max_length=240)
    time_of_day: str = Field(..., min_length=2, max_length=120)
    weather: str = Field(default="unchanged", max_length=120)
    persistent_props: list[str] = Field(default_factory=list, max_length=40)
    character_states: dict[str, str] = Field(default_factory=dict)
    visual_memory_ids: list[UUID] = Field(default_factory=list)


class SceneNode(BaseModel):
    id: str = Field(default_factory=lambda: f"scene-{uuid4().hex[:10]}", pattern=r"^[a-zA-Z0-9_-]{3,80}$")
    title: str = Field(..., min_length=1, max_length=180)
    description: str = Field(..., min_length=10, max_length=3000)
    duration_seconds: int = Field(..., ge=1, le=600)
    camera: CameraSpec
    lighting: LightingSpec
    continuity: ContinuityMetadata
    character_ids: list[str] = Field(default_factory=list)
    previous_scene_ids: list[str] = Field(default_factory=list)
    transition_in: TransitionKind = TransitionKind.CUT
    priority: int = Field(default=50, ge=0, le=100)


class VisualMemory(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    description: str = Field(..., min_length=10, max_length=2000)
    embedding_ref: str | None = Field(default=None, max_length=512)
    asset_ids: list[UUID] = Field(default_factory=list)
    tags: list[str] = Field(default_factory=list, max_length=40)


class CinematicWorkflow(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    name: str = Field(..., min_length=1, max_length=180)
    target_platforms: list[Literal["youtube", "tiktok", "instagram", "x", "broadcast", "archive"]] = Field(default_factory=lambda: ["youtube"])
    style_guide: str = Field(..., min_length=5, max_length=2000)
    characters: list[CharacterReference] = Field(default_factory=list)
    visual_memory: list[VisualMemory] = Field(default_factory=list)
    scenes: Annotated[list[SceneNode], Field(min_length=1, max_length=200)]

    @field_validator("scenes")
    @classmethod
    def scene_ids_must_be_unique(cls, scenes: list[SceneNode]) -> list[SceneNode]:
        ids = [scene.id for scene in scenes]
        if len(ids) != len(set(ids)):
            raise ValueError("scene ids must be unique")
        return scenes

    @model_validator(mode="after")
    def references_must_exist(self) -> "CinematicWorkflow":
        scene_ids = {scene.id for scene in self.scenes}
        character_ids = {character.id for character in self.characters}
        for scene in self.scenes:
            missing_parents = set(scene.previous_scene_ids) - scene_ids
            if missing_parents:
                raise ValueError(f"scene {scene.id} references missing parents: {sorted(missing_parents)}")
            missing_characters = set(scene.character_ids) - character_ids
            if missing_characters:
                raise ValueError(f"scene {scene.id} references missing characters: {sorted(missing_characters)}")
        return self


def topological_scenes(workflow: CinematicWorkflow) -> list[SceneNode]:
    """Return scenes in dependency order and reject cyclic graphs."""

    by_id = {scene.id: scene for scene in workflow.scenes}
    temporary: set[str] = set()
    permanent: set[str] = set()
    ordered: list[SceneNode] = []

    def visit(scene_id: str) -> None:
        if scene_id in permanent:
            return
        if scene_id in temporary:
            raise ValueError(f"cycle detected at scene {scene_id}")
        temporary.add(scene_id)
        for parent_id in by_id[scene_id].previous_scene_ids:
            visit(parent_id)
        temporary.remove(scene_id)
        permanent.add(scene_id)
        ordered.append(by_id[scene_id])

    for scene in workflow.scenes:
        visit(scene.id)
    return ordered


def continuity_injection(workflow: CinematicWorkflow, scene: SceneNode) -> str:
    """Build continuity text from memory, prior scenes, and character references."""

    characters = {character.id: character for character in workflow.characters}
    selected = [characters[character_id] for character_id in scene.character_ids]
    character_lines = [
        f"{character.name}: appearance={character.appearance}; wardrobe={character.wardrobe}"
        for character in selected
    ]
    memory_by_id = {memory.id: memory for memory in workflow.visual_memory}
    memory_lines = [
        memory_by_id[memory_id].description
        for memory_id in scene.continuity.visual_memory_ids
        if memory_id in memory_by_id
    ]
    props = ", ".join(scene.continuity.persistent_props) or "no persistent props"
    return "\n".join(
        [
            f"Continuity location: {scene.continuity.location}",
            f"Time/weather: {scene.continuity.time_of_day}, {scene.continuity.weather}",
            f"Persistent props: {props}",
            *character_lines,
            *memory_lines,
        ]
    )
