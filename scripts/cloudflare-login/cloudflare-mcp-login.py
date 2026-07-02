#!/usr/bin/env python3

"""
Cloudflare MCP Automated Login Script
Handles authentication for Cloudflare MCP servers with retry logic and detailed reporting
"""

import subprocess
import sys
import time
import logging
from typing import List, Tuple
from datetime import datetime

# Configuration
CLOUDFLARE_SERVERS = [
    "cloudflare",
    "cloudflare-bindings",
    "cloudflare-builds",
    "cloudflare-observability",
]

MAX_RETRIES = 3
RETRY_DELAY = 2
LOG_FILE = "cloudflare-mcp-login.log"

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    handlers=[
        logging.FileHandler(LOG_FILE),
        logging.StreamHandler(sys.stdout)
    ]
)

logger = logging.getLogger(__name__)

# ANSI color codes
class Colors:
    RED = '\033[0;31m'
    GREEN = '\033[0;32m'
    YELLOW = '\033[1;33m'
    BLUE = '\033[0;34m'
    RESET = '\033[0m'

def colorize(text: str, color: str) -> str:
    """Add color to text if terminal supports it"""
    if sys.stdout.isatty():
        return f"{color}{text}{Colors.RESET}"
    return text

def login_to_server(server: str) -> bool:
    """
    Attempt to login to a Cloudflare MCP server
    
    Args:
        server: The MCP server name
        
    Returns:
        True if login successful, False otherwise
    """
    try:
        result = subprocess.run(
            ["codex", "mcp", "login", server],
            capture_output=True,
            text=True,
            timeout=30
        )
        return result.returncode == 0
    except subprocess.TimeoutExpired:
        logger.error(f"Timeout while logging in to {server}")
        return False
    except FileNotFoundError:
        logger.error("'codex' command not found. Please ensure it's installed and in PATH")
        return False
    except Exception as e:
        logger.error(f"Unexpected error during login to {server}: {str(e)}")
        return False

def retry_login(server: str, max_retries: int = MAX_RETRIES) -> bool:
    """
    Attempt to login with retries
    
    Args:
        server: The MCP server name
        max_retries: Maximum number of attempts
        
    Returns:
        True if login successful, False otherwise
    """
    for attempt in range(1, max_retries + 1):
        logger.info(f"Login attempt {attempt}/{max_retries} for {server}")
        
        if login_to_server(server):
            logger.info(f"Successfully logged in to {server}")
            return True
        
        if attempt < max_retries:
            logger.warning(f"Attempt {attempt} failed for {server}. Retrying in {RETRY_DELAY}s...")
            time.sleep(RETRY_DELAY)
    
    logger.error(f"Failed to login to {server} after {max_retries} attempts")
    return False

def check_environment() -> None:
    """Check if required environment variables are set"""
    import os
    
    if not os.getenv("CLOUDFLARE_API_TOKEN") and not os.getenv("CLOUDFLARE_API_KEY"):
        logger.warning("No Cloudflare credentials found in environment variables")
        logger.info("Set CLOUDFLARE_API_TOKEN or CLOUDFLARE_API_KEY to streamline login")

def main() -> int:
    """Main function"""
    print()
    print(colorize("🔐 Cloudflare MCP Server Login", Colors.BLUE))
    print(colorize("================================", Colors.BLUE))
    print()
    
    logger.info("Starting Cloudflare MCP Server Automated Login")
    logger.info(f"Processing {len(CLOUDFLARE_SERVERS)} servers")
    
    check_environment()
    
    succeeded: List[str] = []
    failed: List[str] = []
    
    for server in CLOUDFLARE_SERVERS:
        print(colorize(f"⏳ Processing {server}...", Colors.YELLOW))
        
        if retry_login(server):
            succeeded.append(server)
            print(colorize(f"✅ Successfully authenticated: {server}", Colors.GREEN))
        else:
            failed.append(server)
            print(colorize(f"❌ Failed to authenticate: {server}", Colors.RED))
        
        print()
    
    # Print summary
    print()
    print(colorize("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", Colors.BLUE))
    print(colorize("📊 Authentication Summary", Colors.BLUE))
    print(colorize("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", Colors.BLUE))
    print()
    
    if succeeded:
        print(colorize(f"✅ Succeeded ({len(succeeded)}):", Colors.GREEN))
        for server in succeeded:
            print(colorize(f"   ✓ {server}", Colors.GREEN))
        print()
    
    if failed:
        print(colorize(f"❌ Failed ({len(failed)}):", Colors.RED))
        for server in failed:
            print(colorize(f"   ✗ {server}", Colors.RED))
        print()
        print(colorize(f"⚠️  Some servers failed. Check {LOG_FILE} for details.", Colors.YELLOW))
        logger.error("Login process completed with errors")
        return 1
    
    print(colorize("🎉 All Cloudflare MCP servers successfully authenticated!", Colors.GREEN))
    logger.info("All servers authenticated successfully")
    return 0

if __name__ == "__main__":
    sys.exit(main())
