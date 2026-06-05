# Google Drive Strategy Loader - Quick Reference

## Overview

The Google Drive Strategy Loader allows you to download and load TradingView strategy configurations from a shared Google Drive folder.

## Quick Usage

### Using the CLI Tool

```bash
# Load strategies from Google Drive folder
./tools/load_gdrive_strategies.py "https://drive.google.com/drive/folders/YOUR_FOLDER_ID"

# With custom output directory
./tools/load_gdrive_strategies.py \
  "https://drive.google.com/drive/folders/YOUR_FOLDER_ID" \
  --output /path/to/configs

# Clear cache before downloading
./tools/load_gdrive_strategies.py \
  "https://drive.google.com/drive/folders/YOUR_FOLDER_ID" \
  --clear-cache

# Verbose output
./tools/load_gdrive_strategies.py \
  "https://drive.google.com/drive/folders/YOUR_FOLDER_ID" \
  --verbose
```

### Using the Python API

```python
from apps.backend.src.services.gdrive_loader import load_tradingview_strategies_from_gdrive

# Load all strategies from folder
strategies = load_tradingview_strategies_from_gdrive(
    "https://drive.google.com/drive/folders/1YlCnoQSP8MlfJO6c1GySn32joXIzgz3G"
)

# Process each strategy
for strategy in strategies:
    print(f"Name: {strategy['name']}")
    print(f"Type: {strategy['type']}")
    print(f"Symbols: {strategy['symbols']}")
    print(f"Parameters: {strategy['parameters']}")
```

## Folder Structure

Your Google Drive folder should contain YAML or JSON configuration files:

```
TradingView Strategies/
├── rsi_strategy.yaml
├── macd_strategy.yaml
├── bollinger_bands.json
└── custom_strategy.yaml
```

## Configuration File Format

Each configuration file should follow this structure:

```yaml
name: "Strategy Name"
description: "Strategy description"
type: "TRADINGVIEW"

parameters:
  min_confidence: 0.7
  risk_per_trade: 1.0
  stop_loss_percent: 2.0
  take_profit_percent: 4.0

symbols:
  - "BTC/USDT"
  - "ETH/USDT"

timeframes:
  - "15m"
  - "1h"

webhook:
  auto_trade: false
  validate_price: true
  price_deviation_threshold: 5.0
```

## Sharing Your Google Drive Folder

1. Go to your Google Drive folder
2. Right-click and select "Share"
3. Change permissions to "Anyone with the link can view"
4. Copy the shareable link
5. Use the link with the loader tools

## Example: Loading from Issue Folder

The issue mentions this folder:
```
https://drive.google.com/drive/u/0/folders/1YlCnoQSP8MlfJO6c1GySn32joXIzgz3G
```

To load strategies from it:

```bash
./tools/load_gdrive_strategies.py \
  "https://drive.google.com/drive/u/0/folders/1YlCnoQSP8MlfJO6c1GySn32joXIzgz3G"
```

Or in Python:

```python
from apps.backend.src.services.gdrive_loader import load_tradingview_strategies_from_gdrive

strategies = load_tradingview_strategies_from_gdrive(
    "https://drive.google.com/drive/u/0/folders/1YlCnoQSP8MlfJO6c1GySn32joXIzgz3G"
)
```

## Troubleshooting

### Permission Denied

Ensure the folder is publicly shared or accessible with your credentials.

### Download Failed

- Check your internet connection
- Verify the folder URL is correct
- Make sure `gdown` package is installed: `pip install gdown`

### Invalid Configuration

- Ensure YAML/JSON files are properly formatted
- Check that required fields (name, type) are present
- Use a YAML/JSON validator to check syntax

## Advanced Usage

### Custom Cache Directory

```python
from apps.backend.src.services.gdrive_loader import GoogleDriveLoader

loader = GoogleDriveLoader(cache_dir="/custom/cache/path")
folder_path = loader.download_folder(folder_url)
configs = loader.load_all_configs(folder_path)
```

### Clear Cache

```python
loader = GoogleDriveLoader()
loader.clear_cache()
```

### Download Single File

```python
loader = GoogleDriveLoader()
file_path = loader.download_file(
    "https://drive.google.com/file/d/FILE_ID/view"
)
config = loader.load_strategy_config(file_path)
```

## See Also

- [TradingView Integration Guide](../integrations/TRADINGVIEW_INTEGRATION.md)
- [Strategy Development Guide](../strategy/STRATEGY_GUIDE.md)
- [Main README](../../README.md)
