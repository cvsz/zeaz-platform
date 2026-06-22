/**
 * Media types — client-safe.
 *
 * No SDK imports. Server logic lives in media.ts.
 */

export type ImageSize =
  | "1024x1024"
  | "768x1344"
  | "864x1152"
  | "1344x768"
  | "1152x864"
  | "1440x720"
  | "720x1440";

export type VideoSize = "1920x1080" | "1080x1920" | "1280x720" | "720x1280";
export type VideoQuality = "speed" | "quality";

export const IMAGE_SIZES: { id: ImageSize; label: string; ratio: string }[] = [
  { id: "1024x1024", label: "Square", ratio: "1:1" },
  { id: "768x1344", label: "Portrait", ratio: "9:16" },
  { id: "864x1152", label: "Tall", ratio: "3:4" },
  { id: "1344x768", label: "Landscape", ratio: "16:9" },
  { id: "1152x864", label: "Wide", ratio: "4:3" },
  { id: "1440x720", label: "Cinema", ratio: "2:1" },
  { id: "720x1440", label: "Slim", ratio: "1:2" },
];

export const VIDEO_SIZES: { id: VideoSize; label: string; ratio: string }[] = [
  { id: "1920x1080", label: "Landscape HD", ratio: "16:9" },
  { id: "1080x1920", label: "Portrait HD", ratio: "9:16" },
  { id: "1280x720", label: "Landscape", ratio: "16:9" },
  { id: "720x1280", label: "Portrait", ratio: "9:16" },
];
