# Thai PowerShell Font Setup

This runbook configures a Thai-capable font for PowerShell in Windows Terminal.

## Files

- `scripts/windows/find-thai-powershell-fonts.ps1` — read-only font finder.
- `scripts/windows/install-thai-powershell-font.ps1` — Windows Terminal font and PowerShell UTF-8 profile configurator.

## Recommended Fonts

Start with built-in Windows fonts:

- `Leelawadee UI`
- `Tahoma`
- `Segoe UI`

Optional Thai-capable fonts, when already installed locally:

- `Noto Sans Thai`
- `Sarabun`
- `TH Sarabun New`

The scripts do not download or bundle font files.

## Find Installed Thai Fonts

```powershell
cd C:\path\to\zeaz-platform
powershell -ExecutionPolicy Bypass -File scripts\windows\find-thai-powershell-fonts.ps1
```

JSON output:

```powershell
powershell -ExecutionPolicy Bypass -File scripts\windows\find-thai-powershell-fonts.ps1 -Json
```

## Configure Windows Terminal + PowerShell UTF-8

```powershell
cd C:\path\to\zeaz-platform
powershell -ExecutionPolicy Bypass -File scripts\windows\install-thai-powershell-font.ps1 -ConfigureWindowsTerminal -ConfigurePowerShellProfile
```

Use a specific font:

```powershell
powershell -ExecutionPolicy Bypass -File scripts\windows\install-thai-powershell-font.ps1 -FontName "Leelawadee UI" -ConfigureWindowsTerminal -ConfigurePowerShellProfile
```

Dry-run using PowerShell common `-WhatIf`:

```powershell
powershell -ExecutionPolicy Bypass -File scripts\windows\install-thai-powershell-font.ps1 -ConfigureWindowsTerminal -ConfigurePowerShellProfile -WhatIf
```

## Install Local Font Files for Current User

Place `.ttf` or `.otf` files in a local folder, then run:

```powershell
powershell -ExecutionPolicy Bypass -File scripts\windows\install-thai-powershell-font.ps1 -FontSourceDir C:\Fonts\Thai -InstallFontsFromSource -ConfigureWindowsTerminal
```

Restart Windows Terminal after installing new font files.

## Safety Behavior

- No font files are bundled.
- No network download is performed.
- Windows Terminal settings are backed up before editing.
- Default font selection prefers installed fonts only.
- PowerShell profile changes are wrapped in ZeaZ start/end markers.
- The default flow does not require administrator privileges.

## Verify Thai Rendering

```powershell
Write-Host "ทดสอบภาษาไทย PowerShell สำเร็จ"
```
