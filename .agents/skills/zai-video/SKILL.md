---
name: zai-video
description: Professional AI-assisted video editing workflows, covering cutting, auto-captions, and generative video tools.
---

# Video Editing AI Skill

## ZeaZ Platform & apps/* Monorepo Rules
When implementing tasks on the `zeaz-platform` repository, you MUST strictly enforce these architecture and workflow rules:
1. **Monorepo Architecture (apps/*)**: The platform is a unified monorepo. ALL applications, microservices, frontends, and AI toolings (e.g., zLinebot, zwallet, zdash) reside inside the `apps/` directory. Do not create top-level directories for apps. When refactoring or adding features, always scope your work to the specific `apps/<app-name>/` folder.
2. **Environment Variables**: Avoid scattering `.env` files. Consolidate environment variables into a central `.env.example` inside the respective app folder. Canonical Cloudflare variables (e.g. `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ZONE_ID`) MUST be used instead of legacy `CF_` variants.
3. **Commit Workflow**: NEVER use `git commit` or `git push` directly. ALWAYS stage your intended files with `git add` and commit using `make gpg-finalize COMMIT_MSG="..."` from the repository root to ensure all GitOps and DevSecOps checks pass.
4. **Security**: NEVER commit or generate real secrets. Unsafe placeholders like `replace-me`, `changeme`, `dummy-secret` are FORBIDDEN.
5. **Language**: Code, documentation, and technical definitions MUST be in English.

## 1. Overview
AI video editing drastically reduces manual tasks like transcription, rough cutting, and color grading, allowing editors to focus on pacing, storytelling, and visual impact.

## 2. Core AI Video Workflows
* **Text-Based Editing**: Using AI to transcribe footage, allowing the editor to cut video by simply deleting text (e.g., Descript, Premiere Pro Text-Based Editing).
* **Auto-Captions & B-Roll**: Generating dynamic, stylized captions and automatically inserting relevant B-roll based on context.
* **Generative Video & Audio**: Using models like Runway, Sora, or Midjourney for visual assets, and ElevenLabs for voiceovers.
* **Audio Cleanup**: Removing background noise and enhancing vocal presence using AI audio isolation (e.g., Adobe Podcast AI).

## 3. Best Practices
* **Hook the Viewer Early**: The first 3 seconds are critical. Use high-energy cuts or an intriguing visual/audio hook.
* **Pacing is King**: Use AI to remove "ums", "ahs", and dead space, but retain natural breathing to avoid a robotic feel.
* **Human-in-the-Loop**: Never blindly trust auto-edits. Always review generated captions for spelling errors and ensure generated visuals make contextual sense.

## 4. AI Video Toolkit
* **Editing Software**: Premiere Pro (AI features), DaVinci Resolve (Neural Engine), CapCut (AutoCut)
* **AI Utilities**: Descript, Opus Clip (for shorts), Topaz Video AI (upscaling)


## Sub-skill: video-editing

# Video Editing

AI-assisted editing for real footage. Not generation from prompts. Editing existing video fast.

## When to Activate

- User wants to edit, cut, or structure video footage
- Turning long recordings into short-form content
- Building vlogs, tutorials, or demo videos from raw capture
- Adding overlays, subtitles, music, or voiceover to existing video
- Reframing video for different platforms (YouTube, TikTok, Instagram)
- User says "edit video", "cut this footage", "make a vlog", or "video workflow"

## Core Thesis

AI video editing is useful when you stop asking it to create the whole video and start using it to compress, structure, and augment real footage. The value is not generation. The value is compression.

## The Pipeline

```
Screen Studio / raw footage
  → Claude / Codex
  → FFmpeg
  → Remotion
  → ElevenLabs / fal.ai
  → Descript or CapCut
```

Each layer has a specific job. Do not skip layers. Do not try to make one tool do everything.

## Layer 1: Capture (Screen Studio / Raw Footage)

Collect the source material:
- **Screen Studio**: polished screen recordings for app demos, coding sessions, browser workflows
- **Raw camera footage**: vlog footage, interviews, event recordings
- **Desktop capture via VideoDB**: session recording with real-time context (see `videodb` skill)

Output: raw files ready for organization.

## Layer 2: Organization (Claude / Codex)

Use Claude Code or Codex to:
- **Transcribe and label**: generate transcript, identify topics and themes
- **Plan structure**: decide what stays, what gets cut, what order works
- **Identify dead sections**: find pauses, tangents, repeated takes
- **Generate edit decision list**: timestamps for cuts, segments to keep
- **Scaffold FFmpeg and Remotion code**: generate the commands and compositions

```
Example prompt:
"Here's the transcript of a 4-hour recording. Identify the 8 strongest segments
for a 24-minute vlog. Give me FFmpeg cut commands for each segment."
```

This layer is about structure, not final creative taste.

## Layer 3: Deterministic Cuts (FFmpeg)

FFmpeg handles the boring but critical work: splitting, trimming, concatenating, and preprocessing.

### Extract segment by timestamp

```bash
ffmpeg -i raw.mp4 -ss 00:12:30 -to 00:15:45 -c copy segment_01.mp4
```

### Batch cut from edit decision list

```bash
#!/bin/bash
# cuts.txt: start,end,label
while IFS=, read -r start end label; do
  ffmpeg -i raw.mp4 -ss "$start" -to "$end" -c copy "segments/${label}.mp4"
done < cuts.txt
```

### Concatenate segments

```bash
# Create file list
for f in segments/*.mp4; do echo "file '$f'"; done > concat.txt
ffmpeg -f concat -safe 0 -i concat.txt -c copy assembled.mp4
```

### Create proxy for faster editing

```bash
ffmpeg -i raw.mp4 -vf "scale=960:-2" -c:v libx264 -preset ultrafast -crf 28 proxy.mp4
```

### Extract audio for transcription

```bash
ffmpeg -i raw.mp4 -vn -acodec pcm_s16le -ar 16000 audio.wav
```

### Normalize audio levels

```bash
ffmpeg -i segment.mp4 -af loudnorm=I=-16:TP=-1.5:LRA=11 -c:v copy normalized.mp4
```

## Layer 4: Programmable Composition (Remotion)

Remotion turns editing problems into composable code. Use it for things that traditional editors make painful:

### When to use Remotion

- Overlays: text, images, branding, lower thirds
- Data visualizations: charts, stats, animated numbers
- Motion graphics: transitions, explainer animations
- Composable scenes: reusable templates across videos
- Product demos: annotated screenshots, UI highlights

### Basic Remotion composition

```tsx
import { AbsoluteFill, Sequence, Video, useCurrentFrame } from "remotion";

export const VlogComposition: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill>
      {/* Main footage */}
      <Sequence from={0} durationInFrames={300}>
        <Video src="/segments/intro.mp4" />
      </Sequence>

      {/* Title overlay */}
      <Sequence from={30} durationInFrames={90}>
        <AbsoluteFill style={{
          justifyContent: "center",
          alignItems: "center",
        }}>
          <h1 style={{
            fontSize: 72,
            color: "white",
            textShadow: "2px 2px 8px rgba(0,0,0,0.8)",
          }}>
            The AI Editing Stack
          </h1>
        </AbsoluteFill>
      </Sequence>

      {/* Next segment */}
      <Sequence from={300} durationInFrames={450}>
        <Video src="/segments/demo.mp4" />
      </Sequence>
    </AbsoluteFill>
  );
};
```

### Render output

```bash
npx remotion render src/index.ts VlogComposition output.mp4
```

See the [Remotion docs](https://www.remotion.dev/docs) for detailed patterns and API reference.

## Layer 5: Generated Assets (ElevenLabs / fal.ai)

Generate only what you need. Do not generate the whole video.

### Voiceover with ElevenLabs

```python
import os
import requests

resp = requests.post(
    f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}",
    headers={
        "xi-api-key": os.environ["ELEVENLABS_API_KEY"],
        "Content-Type": "application/json"
    },
    json={
        "text": "Your narration text here",
        "model_id": "eleven_turbo_v2_5",
        "voice_settings": {"stability": 0.5, "similarity_boost": 0.75}
    }
)
with open("voiceover.mp3", "wb") as f:
    f.write(resp.content)
```

### Music and SFX with fal.ai

Use the `fal-ai-media` skill for:
- Background music generation
- Sound effects (ThinkSound model for video-to-audio)
- Transition sounds

### Generated visuals with fal.ai

Use for insert shots, thumbnails, or b-roll that doesn't exist:
```
generate(model_name: "fal-ai/nano-banana-pro", input: {
  "prompt": "professional thumbnail for tech vlog, dark background, code on screen",
  "image_size": "landscape_16_9"
})
```

### VideoDB generative audio

If VideoDB is configured:
```python
voiceover = coll.generate_voice(text="Narration here", voice="alloy")
music = coll.generate_music(prompt="lo-fi background for coding vlog", duration=120)
sfx = coll.generate_sound_effect(prompt="subtle whoosh transition")
```

## Layer 6: Final Polish (Descript / CapCut)

The last layer is human. Use a traditional editor for:
- **Pacing**: adjust cuts that feel too fast or slow
- **Captions**: auto-generated, then manually cleaned
- **Color grading**: basic correction and mood
- **Final audio mix**: balance voice, music, and SFX levels
- **Export**: platform-specific formats and quality settings

This is where taste lives. AI clears the repetitive work. You make the final calls.

## Social Media Reframing

Different platforms need different aspect ratios:

| Platform | Aspect Ratio | Resolution |
|----------|-------------|------------|
| YouTube | 16:9 | 1920x1080 |
| TikTok / Reels | 9:16 | 1080x1920 |
| Instagram Feed | 1:1 | 1080x1080 |
| X / Twitter | 16:9 or 1:1 | 1280x720 or 720x720 |

### Reframe with FFmpeg

```bash
# 16:9 to 9:16 (center crop)
ffmpeg -i input.mp4 -vf "crop=ih*9/16:ih,scale=1080:1920" vertical.mp4

# 16:9 to 1:1 (center crop)
ffmpeg -i input.mp4 -vf "crop=ih:ih,scale=1080:1080" square.mp4
```

### Reframe with VideoDB

```python
# Smart reframe (AI-guided subject tracking)
reframed = video.reframe(start=0, end=60, target="vertical", mode=ReframeMode.smart)
```

## Scene Detection and Auto-Cut

### FFmpeg scene detection

```bash
# Detect scene changes (threshold 0.3 = moderate sensitivity)
ffmpeg -i input.mp4 -vf "select='gt(scene,0.3)',showinfo" -vsync vfr -f null - 2>&1 | grep showinfo
```

### Silence detection for auto-cut

```bash
# Find silent segments (useful for cutting dead air)
ffmpeg -i input.mp4 -af silencedetect=noise=-30dB:d=2 -f null - 2>&1 | grep silence
```

### Highlight extraction

Use Claude to analyze transcript + scene timestamps:
```
"Given this transcript with timestamps and these scene change points,
identify the 5 most engaging 30-second clips for social media."
```

## What Each Tool Does Best

| Tool | Strength | Weakness |
|------|----------|----------|
| Claude / Codex | Organization, planning, code generation | Not the creative taste layer |
| FFmpeg | Deterministic cuts, batch processing, format conversion | No visual editing UI |
| Remotion | Programmable overlays, composable scenes, reusable templates | Learning curve for non-devs |
| Screen Studio | Polished screen recordings immediately | Only screen capture |
| ElevenLabs | Voice, narration, music, SFX | Not the center of the workflow |
| Descript / CapCut | Final pacing, captions, polish | Manual, not automatable |

## Key Principles

1. **Edit, don't generate.** This workflow is for cutting real footage, not creating from prompts.
2. **Structure before style.** Get the story right in Layer 2 before touching anything visual.
3. **FFmpeg is the backbone.** Boring but critical. Where long footage becomes manageable.
4. **Remotion for repeatability.** If you'll do it more than once, make it a Remotion component.
5. **Generate selectively.** Only use AI generation for assets that don't exist, not for everything.
6. **Taste is the last layer.** AI clears repetitive work. You make the final creative calls.

## Related Skills

- `fal-ai-media` — AI image, video, and audio generation
- `videodb` — Server-side video processing, indexing, and streaming
- `content-engine` — Platform-native content distribution


## Sub-skill: fal-ai-media

# fal.ai Media Generation

Generate images, videos, and audio using fal.ai models via MCP.

## When to Activate

- User wants to generate images from text prompts
- Creating videos from text or images
- Generating speech, music, or sound effects
- Any media generation task
- User says "generate image", "create video", "text to speech", "make a thumbnail", or similar

## MCP Requirement

fal.ai MCP server must be configured. Add to `~/.claude.json`:

```json
"fal-ai": {
  "command": "npx",
  "args": ["-y", "fal-ai-mcp-server"],
  "env": { "FAL_KEY": "YOUR_FAL_KEY_HERE" }
}
```

Get an API key at [fal.ai](https://fal.ai).

## MCP Tools

The fal.ai MCP provides these tools:
- `search` — Find available models by keyword
- `find` — Get model details and parameters
- `generate` — Run a model with parameters
- `result` — Check async generation status
- `status` — Check job status
- `cancel` — Cancel a running job
- `estimate_cost` — Estimate generation cost
- `models` — List popular models
- `upload` — Upload files for use as inputs

---

## Image Generation

### Nano Banana 2 (Fast)
Best for: quick iterations, drafts, text-to-image, image editing.

```
generate(
  model_name: "fal-ai/nano-banana-2",
  input: {
    "prompt": "a futuristic cityscape at sunset, cyberpunk style",
    "image_size": "landscape_16_9",
    "num_images": 1,
    "seed": 42
  }
)
```

### Nano Banana Pro (High Fidelity)
Best for: production images, realism, typography, detailed prompts.

```
generate(
  model_name: "fal-ai/nano-banana-pro",
  input: {
    "prompt": "professional product photo of wireless headphones on marble surface, studio lighting",
    "image_size": "square",
    "num_images": 1,
    "guidance_scale": 7.5
  }
)
```

### Common Image Parameters

| Param | Type | Options | Notes |
|-------|------|---------|-------|
| `prompt` | string | required | Describe what you want |
| `image_size` | string | `square`, `portrait_4_3`, `landscape_16_9`, `portrait_16_9`, `landscape_4_3` | Aspect ratio |
| `num_images` | number | 1-4 | How many to generate |
| `seed` | number | any integer | Reproducibility |
| `guidance_scale` | number | 1-20 | How closely to follow the prompt (higher = more literal) |

### Image Editing
Use Nano Banana 2 with an input image for inpainting, outpainting, or style transfer:

```
# First upload the source image
upload(file_path: "/path/to/image.png")

# Then generate with image input
generate(
  model_name: "fal-ai/nano-banana-2",
  input: {
    "prompt": "same scene but in watercolor style",
    "image_url": "<uploaded_url>",
    "image_size": "landscape_16_9"
  }
)
```

---

## Video Generation

### Seedance 1.0 Pro (ByteDance)
Best for: text-to-video, image-to-video with high motion quality.

```
generate(
  model_name: "fal-ai/seedance-1-0-pro",
  input: {
    "prompt": "a drone flyover of a mountain lake at golden hour, cinematic",
    "duration": "5s",
    "aspect_ratio": "16:9",
    "seed": 42
  }
)
```

### Kling Video v3 Pro
Best for: text/image-to-video with native audio generation.

```
generate(
  model_name: "fal-ai/kling-video/v3/pro",
  input: {
    "prompt": "ocean waves crashing on a rocky coast, dramatic clouds",
    "duration": "5s",
    "aspect_ratio": "16:9"
  }
)
```

### Veo 3 (Google DeepMind)
Best for: video with generated sound, high visual quality.

```
generate(
  model_name: "fal-ai/veo-3",
  input: {
    "prompt": "a bustling Tokyo street market at night, neon signs, crowd noise",
    "aspect_ratio": "16:9"
  }
)
```

### Image-to-Video
Start from an existing image:

```
generate(
  model_name: "fal-ai/seedance-1-0-pro",
  input: {
    "prompt": "camera slowly zooms out, gentle wind moves the trees",
    "image_url": "<uploaded_image_url>",
    "duration": "5s"
  }
)
```

### Video Parameters

| Param | Type | Options | Notes |
|-------|------|---------|-------|
| `prompt` | string | required | Describe the video |
| `duration` | string | `"5s"`, `"10s"` | Video length |
| `aspect_ratio` | string | `"16:9"`, `"9:16"`, `"1:1"` | Frame ratio |
| `seed` | number | any integer | Reproducibility |
| `image_url` | string | URL | Source image for image-to-video |

---

## Audio Generation

### CSM-1B (Conversational Speech)
Text-to-speech with natural, conversational quality.

```
generate(
  model_name: "fal-ai/csm-1b",
  input: {
    "text": "Hello, welcome to the demo. Let me show you how this works.",
    "speaker_id": 0
  }
)
```

### ThinkSound (Video-to-Audio)
Generate matching audio from video content.

```
generate(
  model_name: "fal-ai/thinksound",
  input: {
    "video_url": "<video_url>",
    "prompt": "ambient forest sounds with birds chirping"
  }
)
```

### ElevenLabs (via API, no MCP)
For professional voice synthesis, use ElevenLabs directly:

```python
import os
import requests

resp = requests.post(
    "https://api.elevenlabs.io/v1/text-to-speech/<voice_id>",
    headers={
        "xi-api-key": os.environ["ELEVENLABS_API_KEY"],
        "Content-Type": "application/json"
    },
    json={
        "text": "Your text here",
        "model_id": "eleven_turbo_v2_5",
        "voice_settings": {"stability": 0.5, "similarity_boost": 0.75}
    }
)
with open("output.mp3", "wb") as f:
    f.write(resp.content)
```

### VideoDB Generative Audio
If VideoDB is configured, use its generative audio:

```python
# Voice generation
audio = coll.generate_voice(text="Your narration here", voice="alloy")

# Music generation
music = coll.generate_music(prompt="upbeat electronic background music", duration=30)

# Sound effects
sfx = coll.generate_sound_effect(prompt="thunder crack followed by rain")
```

---

## Cost Estimation

Before generating, check estimated cost:

```
estimate_cost(model_name: "fal-ai/nano-banana-pro", input: {...})
```

## Model Discovery

Find models for specific tasks:

```
search(query: "text to video")
find(model_name: "fal-ai/seedance-1-0-pro")
models()
```

## Tips

- Use `seed` for reproducible results when iterating on prompts
- Start with lower-cost models (Nano Banana 2) for prompt iteration, then switch to Pro for finals
- For video, keep prompts descriptive but concise — focus on motion and scene
- Image-to-video produces more controlled results than pure text-to-video
- Check `estimate_cost` before running expensive video generations

## Related Skills

- `videodb` — Video processing, editing, and streaming
- `video-editing` — AI-powered video editing workflows
- `content-engine` — Content creation for social platforms
