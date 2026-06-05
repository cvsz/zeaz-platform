# Google Drive Integration for ABTPi18n

This guide explains how to pull assets (strategies, locales, configs) from a Google Drive folder and integrate them into the repository.

## Prerequisites
- Python 3.9+
- pip
- Install dependencies:
  - `pip install gdown pyyaml`

Alternatively, add these to your project’s requirements.

## 1) Download assets from Google Drive

You can pass either the folder URL or the folder ID.

```bash
python tools/drive_sync.py --folder-id "https://drive.google.com/drive/folders/<FOLDER_ID>?usp=drive_link"
# or
python tools/drive_sync.py --folder-id "<FOLDER_ID>"
```

Assets will be placed under `external/drive_assets/`.

## 2) Map and integrate assets into the repo

Edit `configs/drive_assets.map.yaml` to reflect the structure of your Drive folder (glob patterns on the left, target paths on the right), then run:

```bash
python tools/integrate_drive_assets.py --assets-dir external/drive_assets --map configs/drive_assets.map.yaml
```

Use `--dry-run` first to preview actions.

## 3) Auto-load external strategies

If your Drive contains Python strategies under `strategies/`, they will be copied into `strategies/external/`. During application initialization, call:

```python
from core.strategy_autoload import load_external_strategies
loaded = load_external_strategies()
print("Loaded external strategies:", loaded)
```

Ensure each external strategy either:
- Calls `StrategyRegistry.register(MyStrategy)` at import time, or
- Defines a `Strategy` subclass (`name` + `execute`) so the autoloader can register it.

## 4) Safety and Review

- Treat Drive-originated code as untrusted. Review before enabling in production.
- Consider running external strategies in a sandbox process with resource limits.
- Enable logging of only non-sensitive metadata.

## Troubleshooting

- If `gdown` fails, ensure the folder is shared as "Anyone with the link can view".
- If integration copies nothing, verify your glob patterns in `configs/drive_assets.map.yaml`.
