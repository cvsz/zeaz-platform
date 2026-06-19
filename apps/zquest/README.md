# Codex Quest — Master Omega Advanced Professional Final Release

เวอร์ชันอัปเกรดเต็มระบบของเกม Pixel Platformer แบบ single-file HTML5 Canvas

## Final Release Features

- 4K Canvas render: `3840×2160`
- Pixel-perfect scaling จาก logical game size `960×540`
- Realistic pixel-human hero shading
- 3 worlds:
  - Neon Meadow
  - Crystal Ruins
  - Sky Fortress
- Omega Dragon boss fight
- Coin objectives per world
- Gate unlock system
- Dash Core power-up
- Checkpoints
- Spikes / hazards
- Slime and bat enemies
- Boss fireball projectiles
- Sword combo attack
- Double jump + coyote time + jump buffer
- Particles, floating text, screen shake
- Procedural WebAudio SFX
- Mute toggle
- Difficulty selection: Easy / Normal / Hard
- Mobile touch controls
- High score saved in localStorage
- Local player database with register, users, points, VIP status, leaderboard, export/import, and delete
- Optional backend sync through the platform API
- Achievements/toasts
- Fullscreen support
- No external libraries
- No API keys, secrets, tokens, or `.env`

## Controls

| Action | Key |
|---|---|
| Move | `A/D` or arrow keys |
| Jump | `Space`, `W`, or up arrow |
| Attack | `J` |
| Dash | `K` |
| Pause | `P` |
| Restart current world | `R` |
| Mute | `M` |
| Fullscreen | `F` |
| Difficulty | `1`, `2`, `3` on title screen |

## Run Locally

Open `index.html` directly in a browser.

Optional local server:

```bash
python3 -m http.server 8080
```

Then open:

```text
http://localhost:8080
```

## Player Database

Use the on-page database panel to register a player name, switch active users, export or import a database snapshot, delete an individual user, and view the leaderboard.

- The browser keeps a local cache in `localStorage`
- When the platform API is available, the database syncs to SQLite through `/api/runtime/zquest/database`
- Points accumulate from run score progression
- VIP status unlocks automatically after enough points
- Resetting the database clears users, points, and leaderboard entries in the active browser and backend snapshot

## Deploy

### GitHub Pages

1. Create a repository.
2. Upload `index.html`.
3. Go to **Settings → Pages**.
4. Deploy from branch.

### Vercel / Netlify

Use default static deployment settings.

### itch.io

1. Zip `index.html`.
2. Create a new HTML game project.
3. Upload the zip.
4. Use viewport `960 × 540` or responsive embed.

## Security / Privacy

This game is self-contained and safe for public static hosting.

- No external libraries
- No required network requests in offline mode
- No telemetry
- No login
- Optional backend sync only when the platform API is available
- No API key
- No secret
- No token
- No `.env`
