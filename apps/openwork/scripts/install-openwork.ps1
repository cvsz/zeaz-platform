# =============================================================================
# OpenWork one-shot installer (Windows PowerShell 5+)
# -----------------------------------------------------------------------------
# Native Windows counterpart to scripts/install-openwork.sh. Same flags,
# same idempotent behavior, same MCP/agent/command/skill config.
#
# Usage:
#   powershell -ExecutionPolicy Bypass -File .\install-openwork.ps1
#   powershell -ExecutionPolicy Bypass -File .\install-openwork.ps1 -Minimal
#   powershell -ExecutionPolicy Bypass -File .\install-openwork.ps1 -Verify
#   powershell -ExecutionPolicy Bypass -File .\install-openwork.ps1 -DryRun
#   powershell -ExecutionPolicy Bypass -File .\install-openwork.ps1 -Uninstall
#
# Env:
#   $env:OPENWORK_NONINTERACTIVE = "1"   skip all prompts
#   $env:OPENCODE_VERSION         = "1.16.1"
# =============================================================================

[CmdletBinding()]
param(
  [switch]$Minimal,
  [switch]$Verify,
  [switch]$DryRun,
  [switch]$Uninstall,
  [switch]$ConfigOnly,
  [switch]$SkipSystem,
  [switch]$SkipCli,
  [switch]$SkipPlugin,
  [switch]$SkipHarness,
  [switch]$SkipDesktop,
  [switch]$SkipProject,
  [switch]$NonInteractive,
  [string]$HarnessSource = "",
  [string]$OpencodeVersion = $env:OPENCODE_VERSION
)

$ErrorActionPreference = "Stop"
if (-not $OpencodeVersion) { $OpencodeVersion = "1.16.1" }

# ---- paths -------------------------------------------------------------------
$ScriptDir   = Split-Path -Parent $MyInvocation.MyCommand.Path
$RepoRoot    = (Resolve-Path (Join-Path $ScriptDir "..")).Path
$XdgConfig   = if ($env:XDG_CONFIG_HOME) { $env:XDG_CONFIG_HOME } else { Join-Path $env:USERPROFILE ".config" }
$OpencodeDir = Join-Path $XdgConfig "opencode"
$OpencodeJson= Join-Path $OpencodeDir "opencode.jsonc"
$AgentsDir   = Join-Path $OpencodeDir "agents"
$CommandsDir = Join-Path $OpencodeDir "commands"
$HarnessStamp= Join-Path $OpencodeDir ".openwork-harness-stamp"
$StateLog    = Join-Path $OpencodeDir ".openwork-install.log"

# ---- colors ------------------------------------------------------------------
function C($code) { return "`e[$code`m" }
$R  = "`e[0m"; $B  = "`e[1m"; $D  = "`e[2m"
$RD = "`e[31m"; $G  = "`e[32m"; $Y  = "`e[33m"
$BL = "`e[34m"; $M  = "`e[35m"; $CY = "`e[36m"

# ---- helpers -----------------------------------------------------------------
function Log($m) { $ts = (Get-Date -Format "o"); "[$ts] $m" | Out-File -Append -FilePath $StateLog -Encoding utf8; Write-Host $m }
function Info($m){ Log "$CY▸$R $m" }
function Ok($m)  { Log "$G✓$R $m" }
function Warn($m){ Log "$Y⚠$R $m" }
function Err($m) { Log "$RD✗$R $m" }
function Hdr($m) { Log ""; Log "$B$M═══ $m ═══$R" }
function Step($m){ Log "$BL───$R $B$m$R" }
function Dim($m) { Log "$D  $m$R" }

if (-not (Test-Path $OpencodeDir)) { New-Item -ItemType Directory -Path $OpencodeDir -Force | Out-Null }
if (-not (Test-Path $StateLog)) { New-Item -ItemType File -Path $StateLog -Force | Out-Null }

# ---- OS detection ------------------------------------------------------------
$OS = "windows"; $ARCH = $env:PROCESSOR_ARCHITECTURE
if ($ARCH -eq "AMD64") { $ARCH = "x64" } elseif ($ARCH -eq "ARM64") { $ARCH = "arm64" }

$NonInteractive = $NonInteractive -or ($env:OPENWORK_NONINTERACTIVE -eq "1")

function Ask($prompt, $default = "n") {
  if ($NonInteractive) { return ($default -eq "y") }
  $yn = if ($default -eq "y") { "Y/n" } else { "y/N" }
  $r = Read-Host "$CY?$R $prompt [$yn]"
  if ([string]::IsNullOrEmpty($r)) { $r = $default }
  return ($r -match "^[Yy]$")
}

function Run([scriptblock]$cmd) {
  if ($DryRun) { Dim "[dry-run] $cmd" } else { & $cmd }
}

function Have($name) { $null -ne (Get-Command $name -ErrorAction SilentlyContinue) }

# ---- report ------------------------------------------------------------------
function Report-Installed {
  Hdr "Current state"
  $items = @(
    @{ n = "opencode CLI";       ok = { Have opencode };                 val = { (opencode --version 2>$null) } },
    @{ n = "node";               ok = { Have node };                     val = { (node --version 2>$null) } },
    @{ n = "pnpm";               ok = { Have pnpm };                     val = { (pnpm --version 2>$null) } },
    @{ n = "uvx";                ok = { Have uv };                       val = { (& uv --version 2>$null) } },
    @{ n = "opencode config";    ok = { Test-Path $OpencodeJson };       val = { if (Test-Path $OpencodeJson) { (Select-String -Path $OpencodeJson -Pattern '"[a-z\-]+":\s*\{' -AllMatches).Matches.Count } else { 0 } } },
    @{ n = "agent files";        ok = { Test-Path $AgentsDir };         val = { if (Test-Path $AgentsDir) { (Get-ChildItem -Path $AgentsDir -Filter '*.md' -ErrorAction SilentlyContinue).Count } else { 0 } } },
    @{ n = "command files";      ok = { Test-Path $CommandsDir };       val = { if (Test-Path $CommandsDir) { (Get-ChildItem -Path $CommandsDir -Filter '*.md' -ErrorAction SilentlyContinue).Count } else { 0 } } }
  )
  foreach ($i in $items) {
    $present = & $i.ok
    $val = & $i.val
    $line = "{0,-26} " -f $i.n
    if ($present) { Ok "$line$val" } else { Err "$linemissing" }
  }
}

# ---- write config (JSONC) ----------------------------------------------------
$CONFIG_TEMPLATE = @'
{
  "$schema": "https://opencode.ai/config.json",
  "skills": {
    "paths": [
      "../../ecc/skills"
    ,
      "/home/zeazdev/ecc/skills",
      "/home/zeazdev/.agents/skills",
      "/home/zeazdev/.claude/skills"]
  },
  "mcp": {
    "jira": {
      "type": "local",
      "command": ["uvx", "mcp-atlassian==0.21.0"],
      "environment": {
        "JIRA_URL": "${JIRA_URL}",
        "JIRA_EMAIL": "${JIRA_EMAIL}",
        "JIRA_API_TOKEN": "${JIRA_API_TOKEN}"
      },
      "enabled": true
    },
    "github": {
      "type": "local",
      "command": ["npx", "-y", "@modelcontextprotocol/server-github"],
      "environment": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_PERSONAL_ACCESS_TOKEN}"
      },
      "enabled": true
    },
    "firecrawl": {
      "type": "local",
      "command": ["npx", "-y", "firecrawl-mcp"],
      "environment": {
        "FIRECRAWL_API_KEY": "${FIRECRAWL_API_KEY}"
      },
      "enabled": true
    },
    "supabase": {
      "type": "local",
      "command": ["npx", "-y", "@supabase/mcp-server-supabase@latest"],
      "enabled": true
    },
    "memory": {
      "type": "local",
      "command": ["npx", "-y", "@modelcontextprotocol/server-memory"],
      "enabled": true
    },
    "omega-memory": {
      "type": "local",
      "command": ["uvx", "omega-memory", "serve"],
      "enabled": true
    },
    "longhand": {
      "type": "local",
      "command": ["longhand", "mcp-server"],
      "enabled": true
    },
    "sequential-thinking": {
      "type": "local",
      "command": ["npx", "-y", "@modelcontextprotocol/server-sequential-thinking"],
      "enabled": true
    },
    "vercel": {
      "type": "remote",
      "url": "https://mcp.vercel.com",
      "enabled": true
    },
    "railway": {
      "type": "local",
      "command": ["npx", "-y", "@railway/mcp-server"],
      "enabled": true
    },
    "cloudflare-docs": {
      "type": "remote",
      "url": "https://docs.mcp.cloudflare.com/mcp",
      "enabled": true
    },
    "cloudflare-workers-builds": {
      "type": "remote",
      "url": "https://builds.mcp.cloudflare.com/mcp",
      "enabled": true
    },
    "cloudflare-workers-bindings": {
      "type": "remote",
      "url": "https://bindings.mcp.cloudflare.com/mcp",
      "enabled": true
    },
    "cloudflare-observability": {
      "type": "remote",
      "url": "https://observability.mcp.cloudflare.com/mcp",
      "enabled": true
    },
    "clickhouse": {
      "type": "remote",
      "url": "https://mcp.clickhouse.cloud/mcp",
      "enabled": true
    },
    "exa-web-search": {
      "type": "local",
      "command": ["npx", "-y", "exa-mcp-server"],
      "environment": {
        "EXA_API_KEY": "${EXA_API_KEY}"
      },
      "enabled": true
    },
    "context7": {
      "type": "local",
      "command": ["npx", "-y", "@upstash/context7-mcp@latest"],
      "enabled": true
    },
    "magic": {
      "type": "local",
      "command": ["npx", "-y", "@magicuidesign/mcp@latest"],
      "enabled": true
    },
    "filesystem": {
      "type": "local",
      "command": ["npx", "-y", "@modelcontextprotocol/server-filesystem"],
      "enabled": true
    },
    "playwright": {
      "type": "local",
      "command": ["npx", "-y", "@playwright/mcp", "--browser", "chrome"],
      "enabled": true
    },
    "fal-ai": {
      "type": "local",
      "command": ["npx", "-y", "fal-ai-mcp-server"],
      "environment": {
        "FAL_KEY": "${FAL_KEY}"
      },
      "enabled": true
    },
    "browserbase": {
      "type": "local",
      "command": ["npx", "-y", "@browserbasehq/mcp-server-browserbase"],
      "environment": {
        "BROWSERBASE_API_KEY": "${BROWSERBASE_API_KEY}"
      },
      "enabled": true
    },
    "browser-use": {
      "type": "remote",
      "url": "https://api.browser-use.com/mcp",
      "enabled": true
    },
    "devfleet": {
      "type": "remote",
      "url": "http://localhost:18801/mcp",
      "enabled": true
    },
    "token-optimizer": {
      "type": "local",
      "command": ["npx", "-y", "token-optimizer-mcp"],
      "enabled": true
    },
    "laraplugins": {
      "type": "remote",
      "url": "https://laraplugins.io/mcp/plugins",
      "enabled": true
    },
    "confluence": {
      "type": "local",
      "command": ["npx", "-y", "confluence-mcp-server"],
      "environment": {
        "CONFLUENCE_BASE_URL": "${CONFLUENCE_BASE_URL}",
        "CONFLUENCE_EMAIL": "${CONFLUENCE_EMAIL}",
        "CONFLUENCE_API_TOKEN": "${CONFLUENCE_API_TOKEN}"
      },
      "enabled": true
    },
    "evalview": {
      "type": "local",
      "command": ["python3", "-m", "evalview", "mcp", "serve"],
      "enabled": true
    },
    "squish": {
      "type": "local",
      "command": ["npx", "-y", "squish-memory"],
      "enabled": true
    },
    "git": {
      "type": "local",
      "command": ["npx", "-y", "mcp-server-git"],
      "enabled": true
    },
    "fetch": {
      "type": "local",
      "command": ["npx", "-y", "mcp-server-fetch"],
      "enabled": true
    },
    "time": {
      "type": "local",
      "command": ["npx", "-y", "time-mcp"],
      "enabled": true
    },
    "mcp-everything": {
      "type": "local",
      "command": ["npx", "-y", "@modelcontextprotocol/server-everything"],
      "enabled": true
    },
    "docker": {
      "type": "local",
      "command": ["npx", "-y", "mcp-server-docker"],
      "enabled": true
    },
    "sqlite": {
      "type": "local",
      "command": ["npx", "-y", "mcp-sqlite"],
      "enabled": true
    },
    "postgres": {
      "type": "local",
      "command": ["npx", "-y", "@modelcontextprotocol/server-postgres"],
      "environment": {
        "POSTGRES_CONNECTION_STRING": "${POSTGRES_CONNECTION_STRING}"
      },
      "enabled": true
    },
    "puppeteer": {
      "type": "local",
      "command": ["npx", "-y", "@modelcontextprotocol/server-puppeteer"],
      "enabled": true
    },
    "duckduckgo": {
      "type": "local",
      "command": ["npx", "-y", "duckduckgo-mcp-server"],
      "enabled": true
    },
    "weather": {
      "type": "local",
      "command": ["npx", "-y", "@dangahagan/weather-mcp"],
      "enabled": true
    },
    "omnisearch": {
      "type": "local",
      "command": ["npx", "-y", "mcp-omnisearch"],
      "enabled": true
    },
    "aws-knowledge": {
      "type": "remote",
      "url": "https://knowledge-mcp.global.api.aws",
      "enabled": true
    },
    "aws-documentation": {
      "type": "local",
      "command": ["uvx", "awslabs.aws-documentation-mcp-server@latest"],
      "environment": {
        "FASTMCP_LOG_LEVEL": "ERROR",
        "AWS_DOCUMENTATION_PARTITION": "aws"
      },
      "enabled": true
    },
    "cloudflare": {
      "type": "remote",
      "url": "https://mcp.cloudflare.com/mcp",
      "enabled": true
    },
    "pubmed": {
      "type": "local",
      "command": ["npx", "-y", "pubmed-mcp"],
      "enabled": true
    },
    "biomcp": {
      "type": "local",
      "command": ["npx", "-y", "biomcp"],
      "enabled": true
    },
    "wikipedia": {
      "type": "local",
      "command": ["npx", "-y", "@mikechao/wikipedia-mcp"],
      "enabled": true
    }
  }
}
'@

function Write-OpencodeJsonc {
  Step "opencode.jsonc (user-level config with skills + MCPs)"
  if ((Test-Path $OpencodeJson) -and -not (Ask "$OpencodeJson exists. Overwrite?" "n")) {
    Warn "kept existing opencode.jsonc"
    return
  }
  Run { Set-Content -Path $OpencodeJson -Value $CONFIG_TEMPLATE -Encoding utf8 }
  Ok "wrote $OpencodeJson"
}

# ---- system pre-reqs (winget) ------------------------------------------------
function Install-System {
  if ($SkipSystem -or $Verify) { return }
  Step "system pre-reqs (winget)"
  if (-not (Have winget)) { Warn "winget not present; you'll need Node 22+, pnpm, and uv installed manually"; return }
  if (-not (Have node)) {
    if (Ask "install Node 22 LTS via winget?" "y") {
      Run { winget install --silent --accept-source-agreements --accept-package-agreements OpenJS.NodeJS.LTS }
    }
  } else { Ok "node $(node --version)" }
  if (-not (Have pnpm)) {
    if (Ask "install pnpm via winget?" "y") {
      Run { winget install --silent --accept-source-agreements --accept-package-agreements pnpm.pnpm }
    }
  } else { Ok "pnpm v$(pnpm --version)" }
  if (-not (Have uv)) {
    if (Ask "install uv (needed for aws-documentation MCP)?" "y") {
      Run { winget install --silent --accept-source-agreements --accept-package-agreements astral-sh.uv }
    }
  } else { Ok "uv $(uv --version)" }
  if (-not (Have git)) {
    if (Ask "install git via winget?" "y") {
      Run { winget install --silent --accept-source-agreements --accept-package-agreements Git.Git }
    }
  } else { Ok "git present" }
}

# ---- opencode CLI ------------------------------------------------------------
function Install-OpencodeCli {
  if ($SkipCli -or $Verify) { return }
  Step "opencode CLI (target v$OpencodeVersion)"
  if (Have opencode) {
    $v = (opencode --version 2>$null)
    if ($v -eq $OpencodeVersion) { Ok "already at v$v"; return }
    Info "upgrading $v -> v$OpencodeVersion"
  }
  if (-not (Ask "install/upgrade opencode CLI globally?" "y")) { Warn "skipped CLI"; return }
  Run { npm install -g "opencode-ai@$OpencodeVersion" }
  # refresh PATH for this session
  $env:Path = [System.Environment]::GetEnvironmentVariable("Path","User") + ";" + [System.Environment]::GetEnvironmentVariable("Path","Machine")
  if (Have opencode) { Ok "opencode v$(opencode --version)" } else { Err "opencode not on PATH after install" }
}

# ---- harness -----------------------------------------------------------------
function Resolve-HarnessSource {
  Step "harness source"
  $dirs = @()
  if ($HarnessSource) { $dirs += $HarnessSource }
  $dirs += (Join-Path $RepoRoot "harness")
  $dirs += (Join-Path $RepoRoot "dist\harness")
  $dirs += (Join-Path $env:USERPROFILE "ecc")
  $dirs += (Join-Path $env:USERPROFILE "ecc\harness")
  $dirs += $OpencodeDir
  foreach ($d in $dirs) {
    if ((Test-Path (Join-Path $d "agents")) -and (Test-Path (Join-Path $d "commands"))) {
      Ok "$d (auto)"
      return $d
    }
  }
  Err "no harness source found. Pass -HarnessSource DIR"
  exit 1
}

function Install-Harness {
  if ($SkipHarness -or $Verify) { return }
  Step "harness (agents + commands)"
  $src = Resolve-HarnessSource
  if (-not (Test-Path $AgentsDir))   { New-Item -ItemType Directory -Path $AgentsDir -Force   | Out-Null }
  if (-not (Test-Path $CommandsDir)) { New-Item -ItemType Directory -Path $CommandsDir -Force | Out-Null }
  $a = 0; $c = 0
  $agentSrc = Join-Path $src "agents"
  $cmdSrc   = Join-Path $src "commands"
  if (Test-Path $agentSrc) {
    Get-ChildItem -Path $agentSrc -Filter '*.md' | ForEach-Object {
      $dest = Join-Path $AgentsDir $_.Name
      if (-not (Test-Path $dest)) { Run { Copy-Item $_.FullName $dest }; $a++ } else { $a++ }
    }
  }
  if (Test-Path $cmdSrc) {
    Get-ChildItem -Path $cmdSrc -Filter '*.md' | ForEach-Object {
      $dest = Join-Path $CommandsDir $_.Name
      if (-not (Test-Path $dest)) { Run { Copy-Item $_.FullName $dest }; $c++ } else { $c++ }
    }
  }
  Set-Content -Path $HarnessStamp -Value (Get-Date -Format "o")
  Ok "agents: $a | commands: $c"
}

# ---- chrome devtools plugin --------------------------------------------------
function Install-ChromePlugin {
  if ($SkipPlugin -or $Verify) { return }
  Step "opencode-chrome-devtools plugin (project-local)"
  $localNodeModules = Join-Path $RepoRoot ".opencode\node_modules\opencode-chrome-devtools"
  if (Test-Path $localNodeModules) { Ok "already installed"; return }
  $projPkg = Join-Path $RepoRoot ".opencode\package.json"
  if (-not (Test-Path $projPkg)) { Dim "no .opencode/package.json in repo; skipping"; return }
  if (-not (Ask "install opencode-chrome-devtools plugin in $RepoRoot\.opencode?" "y")) { Warn "skipped"; return }
  if (Have pnpm) {
    Run { pnpm --dir (Join-Path $RepoRoot ".opencode") add -D opencode-chrome-devtools@latest }
  } else {
    Run { npm install --prefix (Join-Path $RepoRoot ".opencode") --save-dev opencode-chrome-devtools@latest }
  }
  Ok "installed"
}

# ---- project deps ------------------------------------------------------------
function Install-ProjectDeps {
  if ($SkipProject -or $Minimal -or $Verify) { return }
  Step "openwork repo deps"
  if (-not (Test-Path (Join-Path $RepoRoot "package.json"))) { Dim "no package.json; skipping"; return }
  if (Test-Path (Join-Path $RepoRoot "node_modules")) { Ok "node_modules present"; return }
  if (-not (Have pnpm)) { Err "pnpm missing"; return }
  if (-not (Ask "run pnpm install in $RepoRoot?" "y")) { Warn "skipped"; return }
  Run { pnpm install --dir $RepoRoot }
  Ok "pnpm install complete"
}

# ---- desktop app -------------------------------------------------------------
function Install-DesktopApp {
  if ($SkipDesktop -or $Minimal -or $Verify) { return }
  Step "OpenWork desktop app"
  if (Have openwork) { Ok "already in PATH"; return }
  if (-not (Ask "OpenWork desktop app install instructions?" "y")) { return }
  Info "Grab the Windows installer (.exe or .msi) from the repo's Releases page."
  Info "Or build locally: pnpm --filter @opencode-ai/desktop package"
}

# ---- warmup ------------------------------------------------------------------
function Warm-McpCache {
  if ($Verify -or $DryRun) { return }
  Step "MCP cold-start warmup"
  if (-not (Ask "pre-warm npx cache for the 14 npx-based MCPs? (3-5 min, prevents 30s+ first connect)" "n")) { Dim "skipped"; return }
  $pkgs = @(
    "mcp-server-git","mcp-server-fetch","@modelcontextprotocol/server-everything",
    "mcp-server-docker","mcp-sqlite","@modelcontextprotocol/server-puppeteer",
    "duckduckgo-mcp-server","@dangahagan/weather-mcp","mcp-omnisearch",
    "pubmed-mcp","biomcp","@mikechao/wikipedia-mcp","time-mcp"
  )
  foreach ($p in $pkgs) {
    $line = "{0,-55} " -f $p
    $ok = $false
    try { & npx -yq $p --help *> $null; $ok = $true } catch { try { & npx -yq $p *> $null; $ok = $true } catch { $ok = $false } }
    if ($ok) { Ok "$line$($G)cached$($R)" } else { Warn "$lineskipped" }
  }
}

# ---- uninstall ---------------------------------------------------------------
function Do-Uninstall {
  Hdr "Uninstalling"
  if (Test-Path $AgentsDir)   { Run { Remove-Item -Recurse -Force $AgentsDir };   Ok "removed agents" }
  if (Test-Path $CommandsDir) { Run { Remove-Item -Recurse -Force $CommandsDir }; Ok "removed commands" }
  if (Test-Path $HarnessStamp){ Run { Remove-Item -Force $HarnessStamp };         Ok "removed stamp" }
  if ((Test-Path $OpencodeJson) -and (Ask "remove $OpencodeJson? (loses MCP + skill config)" "n")) {
    Run { Remove-Item -Force $OpencodeJson }
    Ok "removed"
  }
  if ((Have npm) -and (Ask "uninstall opencode-ai CLI globally?" "n")) { Run { npm uninstall -g opencode-ai } }
  $localPlugin = Join-Path $RepoRoot ".opencode\node_modules\opencode-chrome-devtools"
  if ((Test-Path $localPlugin) -and (Ask "uninstall opencode-chrome-devtools plugin?" "n")) {
    if (Have pnpm) { Run { pnpm --dir (Join-Path $RepoRoot ".opencode") remove opencode-chrome-devtools } }
    else           { Run { npm uninstall --prefix (Join-Path $RepoRoot ".opencode") opencode-chrome-devtools } }
  }
}

# ---- main --------------------------------------------------------------------
Hdr "OpenWork installer (Windows)"
Log "  ${D}os=$OS  arch=$ARCH  dry=$DryRun  verify=$Verify$R"

if ($Uninstall) { Do-Uninstall; exit 0 }
if ($Verify)    { Report-Installed; exit 0 }

if ($ConfigOnly) { $SkipSystem = $SkipCli = $SkipPlugin = $SkipDesktop = $SkipProject = $true }

Install-System
Install-OpencodeCli
Write-OpencodeJsonc
Install-Harness
Install-ChromePlugin
Install-ProjectDeps
Install-DesktopApp
Warm-McpCache

Hdr "Done"
Report-Installed
Log ""
Log "${B}Next steps:${R}"
Log "  ${D}cd $RepoRoot && pnpm dev:ui${R}     # start the Vite dev UI on :5173"
Log "  ${D}cd $RepoRoot && pnpm dev:server${R}  # start the OpenWork server"
Log "  ${D}cd $RepoRoot && pnpm dev${R}         # both"
Log "  ${D}openwork${R}                          # launch the desktop app (if installed)"
Log "  ${D}opencode${R}                          # launch the opencode CLI"
Log ""
Log "${D}log: $StateLog${R}"
