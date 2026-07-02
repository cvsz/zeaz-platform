# Cloudflare MCP Automated Login Scripts

A collection of scripts to automate authentication for Cloudflare MCP servers.

## Available Scripts

### 1. **Basic Script** (`cloudflare-mcp-login.sh`)
Simple, straightforward implementation with minimal dependencies.

**Features:**
- Sequential login attempts
- Basic error handling
- Success/failure summary
- No external dependencies

**Usage:**
```bash
bash cloudflare-mcp-login.sh
```

### 2. **Advanced Script** (`cloudflare-mcp-login-advanced.sh`)
Production-ready with robust error handling and logging.

**Features:**
- Automatic retry logic (3 attempts by default)
- Comprehensive logging to file
- Color-coded output
- Environment variable support
- Detailed error reporting
- Configurable retry parameters

**Usage:**
```bash
bash cloudflare-mcp-login-advanced.sh
```

**Configuration:**
```bash
# Set custom log file location
LOG_FILE=/var/log/cloudflare-login.log bash cloudflare-mcp-login-advanced.sh

# Customize retry behavior
MAX_RETRIES=5 bash cloudflare-mcp-login-advanced.sh
```

### 3. **Python Script** (`cloudflare-mcp-login.py`)
Cross-platform implementation with Python for better portability.

**Features:**
- Automatic retry mechanism
- File and console logging
- Detailed error messages
- Environment variable checking
- Works on Windows, macOS, and Linux
- CI/CD friendly

**Usage:**
```bash
python3 cloudflare-mcp-login.py
```

**Requirements:**
- Python 3.6+
- `codex` command in PATH

### 4. **Parallel Script** (`cloudflare-mcp-login-parallel.sh`)
High-performance implementation for faster authentication.

**Features:**
- Parallel login attempts (up to 4 concurrent)
- Uses GNU Parallel if available, falls back to bash jobs
- Faster overall execution time
- Individual status reporting
- Temporary file cleanup

**Usage:**
```bash
bash cloudflare-mcp-login-parallel.sh
```

## Setup

### Make Scripts Executable

```bash
chmod +x cloudflare-mcp-login*.sh cloudflare-mcp-login.py
```

### Install in System Path (Optional)

```bash
sudo mv cloudflare-mcp-login*.sh cloudflare-mcp-login.py /usr/local/bin/
```

Then use directly:
```bash
cloudflare-mcp-login.sh
```

## Environment Variables

Set these before running any script to streamline authentication:

```bash
export CLOUDFLARE_API_TOKEN="your-token-here"
# OR
export CLOUDFLARE_API_KEY="your-key-here"
```

## Logging

### Advanced Script
Logs saved to `cloudflare-mcp-login.log` (configurable via `LOG_FILE` environment variable)

### Python Script
Logs saved to `cloudflare-mcp-login.log` in the current directory

### View Logs
```bash
# View real-time
tail -f cloudflare-mcp-login.log

# View last 20 entries
tail -20 cloudflare-mcp-login.log

# Full log
cat cloudflare-mcp-login.log
```

## Exit Codes

All scripts follow standard exit code conventions:

- `0` - All servers authenticated successfully
- `1` - One or more servers failed authentication

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Login to Cloudflare MCP

on: [push]

jobs:
  login:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Login to Cloudflare MCP
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
        run: |
          bash cloudflare-mcp-login-advanced.sh
```

### GitLab CI Example

```yaml
cloudflare_login:
  script:
    - bash cloudflare-mcp-login-advanced.sh
  variables:
    CLOUDFLARE_API_TOKEN: $CLOUDFLARE_API_TOKEN
```

## Troubleshooting

### `codex: command not found`
Ensure `codex` is installed and in your PATH:
```bash
which codex
```

### Authentication fails
1. Check credentials in environment variables
2. Review log file for detailed error messages
3. Ensure you have valid Cloudflare API credentials
4. Try running individual login manually:
   ```bash
   codex mcp login cloudflare
   ```

### Permission denied
Make scripts executable:
```bash
chmod +x cloudflare-mcp-login*.sh cloudflare-mcp-login.py
```

### Parallel script not working
Install GNU Parallel for optimal performance:
```bash
# Ubuntu/Debian
sudo apt-get install parallel

# macOS
brew install parallel

# Falls back to bash jobs if not installed
```

## Script Comparison

| Feature | Basic | Advanced | Python | Parallel |
|---------|-------|----------|--------|----------|
| Retry Logic | ❌ | ✅ | ✅ | ❌ |
| File Logging | ❌ | ✅ | ✅ | ❌ |
| Color Output | ✅ | ✅ | ✅ | ✅ |
| Parallel Execution | ❌ | ❌ | ❌ | ✅ |
| Cross-Platform | ✅ | ✅ | ✅ | ❌ (bash) |
| Error Handling | Basic | Robust | Robust | Good |
| Dependencies | bash | bash | Python 3.6+ | bash |
| Speed | Fast | Fast | Fast | Fastest |

## Recommended Usage

- **Quick one-time login:** Use `cloudflare-mcp-login.sh`
- **Production/CI-CD:** Use `cloudflare-mcp-login-advanced.sh`
- **Windows environment:** Use `cloudflare-mcp-login.py`
- **Speed-critical:** Use `cloudflare-mcp-login-parallel.sh`

## Security Notes

1. **Never commit credentials** to version control
2. Use CI/CD secrets management for credentials
3. Restrict script permissions if sensitive
4. Review log files for sensitive information
5. Consider using service accounts for automation

## License

These scripts are provided as-is for automating Cloudflare MCP authentication.
