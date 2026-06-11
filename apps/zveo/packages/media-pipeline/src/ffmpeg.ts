import { createHash } from "node:crypto";
import type { ExportProfile } from "./contracts.js";
import type { TimelineClip } from "./synchronization.js";

function escapeFilterPath(path: string): string {
  return path.replace(/\\/g, "\\\\").replace(/'/g, "\\'").replace(/:/g, "\\:");
}

export function profileHash(profile: ExportProfile): string {
  return createHash("sha256").update(JSON.stringify(profile, Object.keys(profile).sort())).digest("hex");
}

export function buildFfmpegFilterGraph(clips: readonly TimelineClip[], subtitleObjectKey?: string): string {
  if (clips.length === 0) throw new Error("cannot build ffmpeg filter graph without clips");
  const videoLabels = clips.map((clip, index) => `[${index}:v]trim=duration=${clip.durationSeconds.toFixed(3)},setpts=PTS-STARTPTS[v${index}]`);
  const audioLabels = clips.map((clip, index) => `[${index}:a]atrim=duration=${clip.durationSeconds.toFixed(3)},asetpts=PTS-STARTPTS[a${index}]`);
  const concatInputs = clips.map((_, index) => `[v${index}][a${index}]`).join("");
  const subtitle = subtitleObjectKey ? `[vout]subtitles='${escapeFilterPath(subtitleObjectKey)}'[vsub]` : "";
  return [...videoLabels, ...audioLabels, `${concatInputs}concat=n=${clips.length}:v=1:a=1[vout][aout]`, subtitle].filter(Boolean).join(";");
}

export function buildFfmpegArgs(inputUris: readonly string[], filterGraph: string, profile: ExportProfile, outputPath: string, subtitleEnabled: boolean): string[] {
  const inputArgs = inputUris.flatMap((uri) => ["-i", uri]);
  const videoMap = subtitleEnabled ? "[vsub]" : "[vout]";
  return [
    "-hide_banner", "-y", ...inputArgs,
    "-filter_complex", filterGraph,
    "-map", videoMap, "-map", "[aout]",
    "-c:v", profile.videoCodec === "h264" ? "libx264" : profile.videoCodec === "h265" ? "libx265" : profile.videoCodec,
    "-b:v", `${profile.videoBitrateKbps}k`,
    "-r", String(profile.fps),
    "-s", `${profile.width}x${profile.height}`,
    "-colorspace", profile.colorSpace,
    "-c:a", profile.audioCodec, "-b:a", `${profile.audioBitrateKbps}k`,
    "-movflags", "+faststart",
    outputPath,
  ];
}
