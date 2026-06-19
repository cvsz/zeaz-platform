#requires -Version 5.1
<#
.SYNOPSIS
  Configure a Thai-capable font for PowerShell in Windows Terminal.

.DESCRIPTION
  The script finds an installed Thai-capable font, optionally installs local .ttf/.otf
  files for the current user, updates Windows Terminal settings with a backup, and
  configures PowerShell UTF-8 output in the current user's profile.

  It does not download fonts and does not require admin rights for the default flow.

.EXAMPLE
  powershell -ExecutionPolicy Bypass -File scripts/windows/install-thai-powershell-font.ps1 -ListOnly

.EXAMPLE
  powershell -ExecutionPolicy Bypass -File scripts/windows/install-thai-powershell-font.ps1 -ConfigureWindowsTerminal -ConfigurePowerShellProfile

.EXAMPLE
  powershell -ExecutionPolicy Bypass -File scripts/windows/install-thai-powershell-font.ps1 -FontName "Leelawadee UI" -ConfigureWindowsTerminal -ConfigurePowerShellProfile

.EXAMPLE
  powershell -ExecutionPolicy Bypass -File scripts/windows/install-thai-powershell-font.ps1 -FontSourceDir C:\Fonts\Thai -InstallFontsFromSource -ConfigureWindowsTerminal
#>
[CmdletBinding(SupportsShouldProcess = $true)]
param(
  [string]$FontName,
  [string[]]$PreferredFonts = @(
    'Leelawadee UI',
    'Tahoma',
    'Segoe UI',
    'Noto Sans Thai',
    'Sarabun',
    'TH Sarabun New'
  ),
  [string]$FontSourceDir,
  [switch]$InstallFontsFromSource,
  [switch]$ConfigureWindowsTerminal,
  [switch]$ConfigurePowerShellProfile,
  [switch]$ListOnly
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Write-Step {
  param([string]$Message)
  Write-Host "==> $Message"
}

function Get-FontRegistryEntries {
  $roots = @(
    @{ Scope = 'Machine'; Path = 'HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Fonts' },
    @{ Scope = 'User'; Path = 'HKCU:\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Fonts' }
  )

  foreach ($root in $roots) {
    if (-not (Test-Path -LiteralPath $root.Path)) {
      continue
    }

    $item = Get-ItemProperty -LiteralPath $root.Path
    foreach ($property in $item.PSObject.Properties) {
      if ($property.Name -like 'PS*') {
        continue
      }

      [pscustomobject]@{
        Scope = $root.Scope
        Name = [string]$property.Name
        File = [string]$property.Value
      }
    }
  }
}

function Test-FontInstalled {
  param([Parameter(Mandatory = $true)][string]$Name)
  @(Get-FontRegistryEntries | Where-Object { $_.Name -like "*$Name*" -or $_.File -like "*$Name*" }).Count -gt 0
}

function Select-ThaiFont {
  if ($FontName) {
    if (Test-FontInstalled -Name $FontName) {
      return $FontName
    }
    throw "Requested font is not installed: $FontName"
  }

  foreach ($candidate in $PreferredFonts) {
    if (Test-FontInstalled -Name $candidate) {
      return $candidate
    }
  }

  throw "No preferred Thai-capable font found. Try -FontSourceDir with -InstallFontsFromSource, or install one of: $($PreferredFonts -join ', ')"
}

function Install-UserFontFiles {
  param([Parameter(Mandatory = $true)][string]$SourceDir)

  if (-not (Test-Path -LiteralPath $SourceDir -PathType Container)) {
    throw "FontSourceDir not found: $SourceDir"
  }

  $fontFiles = @(Get-ChildItem -LiteralPath $SourceDir -File -Include '*.ttf','*.otf' -Recurse)
  if ($fontFiles.Count -eq 0) {
    throw "No .ttf or .otf font files found under: $SourceDir"
  }

  $targetDir = Join-Path $env:LOCALAPPDATA 'Microsoft\Windows\Fonts'
  $fontRegPath = 'HKCU:\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Fonts'

  if ($PSCmdlet.ShouldProcess($targetDir, 'Install local font files for current user')) {
    New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
    New-Item -Path $fontRegPath -Force | Out-Null

    foreach ($fontFile in $fontFiles) {
      $target = Join-Path $targetDir $fontFile.Name
      Copy-Item -LiteralPath $fontFile.FullName -Destination $target -Force

      $extension = $fontFile.Extension.ToLowerInvariant()
      $kind = if ($extension -eq '.otf') { 'OpenType' } else { 'TrueType' }
      $registryName = "$($fontFile.BaseName) ($kind)"
      New-ItemProperty -Path $fontRegPath -Name $registryName -Value $fontFile.Name -PropertyType String -Force | Out-Null
      Write-Host "Installed font file: $($fontFile.Name)"
    }
  }

  Write-Warning 'You may need to restart Windows Terminal or sign out/in before newly installed fonts appear by family name.'
}

function Get-WindowsTerminalSettingsPath {
  $paths = @(
    Join-Path $env:LOCALAPPDATA 'Packages\Microsoft.WindowsTerminal_8wekyb3d8bbwe\LocalState\settings.json',
    Join-Path $env:LOCALAPPDATA 'Packages\Microsoft.WindowsTerminalPreview_8wekyb3d8bbwe\LocalState\settings.json',
    Join-Path $env:LOCALAPPDATA 'Microsoft\Windows Terminal\settings.json'
  )

  foreach ($path in $paths) {
    if (Test-Path -LiteralPath $path -PathType Leaf) {
      return $path
    }
  }

  return $paths[0]
}

function Remove-JsonComments {
  param([Parameter(Mandatory = $true)][string]$Text)

  # Conservative JSONC cleanup for Windows Terminal settings. A backup is always kept.
  $withoutBlockComments = [regex]::Replace($Text, '/\*.*?\*/', '', 'Singleline')
  $lines = $withoutBlockComments -split "`r?`n"
  $clean = foreach ($line in $lines) {
    if ($line -match '^\s*//') {
      continue
    }
    $line
  }
  ($clean -join "`n") -replace ',(\s*[}\]])', '$1'
}

function Add-OrSetNoteProperty {
  param(
    [Parameter(Mandatory = $true)][object]$Object,
    [Parameter(Mandatory = $true)][string]$Name,
    [Parameter(Mandatory = $true)]$Value
  )

  if ($Object.PSObject.Properties.Name -contains $Name) {
    $Object.$Name = $Value
  } else {
    $Object | Add-Member -NotePropertyName $Name -NotePropertyValue $Value
  }
}

function Set-WindowsTerminalFont {
  param([Parameter(Mandatory = $true)][string]$Name)

  $settingsPath = Get-WindowsTerminalSettingsPath
  $settingsDir = Split-Path -Parent $settingsPath
  New-Item -ItemType Directory -Path $settingsDir -Force | Out-Null

  if (Test-Path -LiteralPath $settingsPath -PathType Leaf) {
    $timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'
    $backupPath = "$settingsPath.backup-$timestamp"
    Copy-Item -LiteralPath $settingsPath -Destination $backupPath -Force
    Write-Host "Backup created: $backupPath"
    $raw = Get-Content -LiteralPath $settingsPath -Raw -Encoding UTF8
    $jsonText = Remove-JsonComments -Text $raw
    try {
      $settings = $jsonText | ConvertFrom-Json -Depth 100
    } catch {
      throw "Failed to parse Windows Terminal settings after backup. Backup: $backupPath. Error: $($_.Exception.Message)"
    }
  } else {
    $settings = [pscustomobject]@{
      '$schema' = 'https://aka.ms/terminal-profiles-schema'
      profiles = [pscustomobject]@{
        defaults = [pscustomobject]@{}
        list = @()
      }
    }
  }

  if (-not ($settings.PSObject.Properties.Name -contains 'profiles') -or $null -eq $settings.profiles) {
    Add-OrSetNoteProperty -Object $settings -Name 'profiles' -Value ([pscustomobject]@{})
  }

  if (-not ($settings.profiles.PSObject.Properties.Name -contains 'defaults') -or $null -eq $settings.profiles.defaults) {
    Add-OrSetNoteProperty -Object $settings.profiles -Name 'defaults' -Value ([pscustomobject]@{})
  }

  if (-not ($settings.profiles.defaults.PSObject.Properties.Name -contains 'font') -or $null -eq $settings.profiles.defaults.font) {
    Add-OrSetNoteProperty -Object $settings.profiles.defaults -Name 'font' -Value ([pscustomobject]@{})
  }
  Add-OrSetNoteProperty -Object $settings.profiles.defaults.font -Name 'face' -Value $Name

  if ($settings.profiles.PSObject.Properties.Name -contains 'list' -and $null -ne $settings.profiles.list) {
    foreach ($profile in @($settings.profiles.list)) {
      $profileName = if ($profile.PSObject.Properties.Name -contains 'name') { [string]$profile.name } else { '' }
      if ($profileName -match 'PowerShell') {
        if (-not ($profile.PSObject.Properties.Name -contains 'font') -or $null -eq $profile.font) {
          Add-OrSetNoteProperty -Object $profile -Name 'font' -Value ([pscustomobject]@{})
        }
        Add-OrSetNoteProperty -Object $profile.font -Name 'face' -Value $Name
      }
    }
  }

  if ($PSCmdlet.ShouldProcess($settingsPath, "Set Windows Terminal font to $Name")) {
    $json = $settings | ConvertTo-Json -Depth 100
    Set-Content -LiteralPath $settingsPath -Value $json -Encoding UTF8
    Write-Host "Windows Terminal font configured: $Name"
    Write-Host "Settings path: $settingsPath"
  }
}

function Set-PowerShellUtf8Profile {
  $profilePath = $PROFILE.CurrentUserAllHosts
  $profileDir = Split-Path -Parent $profilePath
  New-Item -ItemType Directory -Path $profileDir -Force | Out-Null

  $markerStart = '# ZEAZ_THAI_TERMINAL_ENCODING_START'
  $markerEnd = '# ZEAZ_THAI_TERMINAL_ENCODING_END'
  $block = @"
$markerStart
try { chcp 65001 | Out-Null } catch { }
[Console]::InputEncoding = [System.Text.UTF8Encoding]::new()
[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new()
`$OutputEncoding = [System.Text.UTF8Encoding]::new()
$markerEnd
"@

  $existing = if (Test-Path -LiteralPath $profilePath) { Get-Content -LiteralPath $profilePath -Raw -Encoding UTF8 } else { '' }
  if ($existing -match [regex]::Escape($markerStart)) {
    Write-Host "PowerShell profile already contains ZeaZ Thai UTF-8 block: $profilePath"
    return
  }

  if ($PSCmdlet.ShouldProcess($profilePath, 'Append UTF-8 encoding profile block')) {
    Add-Content -LiteralPath $profilePath -Value "`n$block" -Encoding UTF8
    Write-Host "PowerShell UTF-8 profile configured: $profilePath"
  }
}

if ($InstallFontsFromSource) {
  if (-not $FontSourceDir) {
    throw '-FontSourceDir is required with -InstallFontsFromSource.'
  }
  Write-Step "Installing local font files from $FontSourceDir"
  Install-UserFontFiles -SourceDir $FontSourceDir
}

$selectedFont = Select-ThaiFont
Write-Host "Selected Thai-capable font: $selectedFont"

if ($ListOnly) {
  Write-Host 'ListOnly requested; no settings were changed.'
  exit 0
}

if (-not $ConfigureWindowsTerminal -and -not $ConfigurePowerShellProfile) {
  Write-Warning 'No configuration switch selected. Use -ConfigureWindowsTerminal and/or -ConfigurePowerShellProfile.'
  exit 0
}

if ($ConfigureWindowsTerminal) {
  Write-Step 'Configuring Windows Terminal font'
  Set-WindowsTerminalFont -Name $selectedFont
}

if ($ConfigurePowerShellProfile) {
  Write-Step 'Configuring PowerShell UTF-8 profile'
  Set-PowerShellUtf8Profile
}

Write-Host 'Done. Restart Windows Terminal to apply font changes.'
