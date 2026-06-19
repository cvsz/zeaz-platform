import type { BeatMarker, RenderArtifact, SubtitleCue } from "./contracts.js";

export interface TimelineClip {
  sceneId: string;
  sourceObjectKey: string;
  startSeconds: number;
  endSeconds: number;
  durationSeconds: number;
  nearestBeatSeconds?: number;
}

export function stitchTimeline(artifacts: readonly RenderArtifact[], beats: readonly BeatMarker[] = []): TimelineClip[] {
  const sorted = [...artifacts].sort((a, b) => a.startSeconds - b.startSeconds || a.sceneId.localeCompare(b.sceneId));
  let cursor = 0;
  return sorted.map((artifact) => {
    const nearestBeat = beats.reduce<BeatMarker | undefined>((best, beat) => {
      if (!best) return beat;
      return Math.abs(beat.atSeconds - cursor) < Math.abs(best.atSeconds - cursor) ? beat : best;
    }, undefined);
    const alignedStart = nearestBeat && Math.abs(nearestBeat.atSeconds - cursor) <= 0.12 ? nearestBeat.atSeconds : cursor;
    const clip = {
      sceneId: artifact.sceneId,
      sourceObjectKey: artifact.asset.objectKey,
      startSeconds: alignedStart,
      endSeconds: alignedStart + artifact.durationSeconds,
      durationSeconds: artifact.durationSeconds,
      ...(nearestBeat ? { nearestBeatSeconds: nearestBeat.atSeconds } : {}),
    };
    cursor = clip.endSeconds;
    return clip;
  });
}

export function validateSubtitleTimeline(cues: readonly SubtitleCue[], totalDurationSeconds: number): void {
  const sorted = [...cues].sort((a, b) => a.startSeconds - b.startSeconds || a.endSeconds - b.endSeconds);
  sorted.forEach((cue, index) => {
    if (cue.endSeconds > totalDurationSeconds + 0.001) throw new Error(`subtitle cue ${cue.id} exceeds program duration`);
    const previous = sorted[index - 1];
    if (previous && cue.startSeconds < previous.endSeconds) throw new Error(`subtitle cue ${cue.id} overlaps previous cue ${previous.id}`);
  });
}

export function toSrtTimestamp(seconds: number): string {
  const msTotal = Math.round(seconds * 1000);
  const hours = Math.floor(msTotal / 3_600_000);
  const minutes = Math.floor((msTotal % 3_600_000) / 60_000);
  const secs = Math.floor((msTotal % 60_000) / 1000);
  const millis = msTotal % 1000;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")},${String(millis).padStart(3, "0")}`;
}

export function renderSrt(cues: readonly SubtitleCue[]): string {
  return cues.map((cue, index) => `${index + 1}\n${toSrtTimestamp(cue.startSeconds)} --> ${toSrtTimestamp(cue.endSeconds)}\n${cue.speaker ? `${cue.speaker}: ` : ""}${cue.text}\n`).join("\n");
}
