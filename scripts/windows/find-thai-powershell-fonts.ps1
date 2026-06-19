#requires -Version 5.1
<#
.SYNOPSIS
  Find installed Windows fonts that are suitable for Thai text in PowerShell and Windows Terminal.

.DESCRIPTION
  This script reads per-machine and per-user Windows font registry entries and reports
  candidate Thai-capable fonts. It does not install, download, or modify anything.

.EXAMPLE
  powershell -ExecutionPolicy Bypass -File scripts/windows/find-thai-powershell-fonts.ps1

.EXAMPLE
  powershell -ExecutionPolicy Bypass -File scripts/windows/find-thai-powershell-fonts.ps1 -Json
#>
[CmdletBinding()]
param(
  [switch]$Json,
  [switch]$VerboseList
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$candidates = @(
  'Leelawadee UI',
  'Tahoma',
  'Segoe UI',
  'Noto Sans Thai',
  'Sarabun',
  'TH Sarabun New',
  'Angsana New',
  'Cordia New',
  'Browallia New',
  'DilleniaUPC',
  'EucrosiaUPC',
  'FreesiaUPC',
  'IrisUPC',
  'JasmineUPC',
  'KodchiangUPC',
  'LilyUPC'
)

$registryRoots = @(
  @{ Scope = 'Machine'; Path = 'HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Fonts' },
  @{ Scope = 'User'; Path = 'HKCU:\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Fonts' }
)

function Get-FontRegistryEntries {
  $entries = New-Object System.Collections.Generic.List[object]

  foreach ($root in $registryRoots) {
    if (-not (Test-Path -LiteralPath $root.Path)) {
      continue
    }

    $item = Get-ItemProperty -LiteralPath $root.Path
    foreach ($property in $item.PSObject.Properties) {
      if ($property.Name -like 'PS*') {
        continue
      }

      $entries.Add([pscustomobject]@{
        Scope = $root.Scope
        Name = [string]$property.Name
        File = [string]$property.Value
      }) | Out-Null
    }
  }

  $entries
}

$entries = @(Get-FontRegistryEntries)
$results = foreach ($candidate in $candidates) {
  $matches = @($entries | Where-Object { $_.Name -like "*$candidate*" -or $_.File -like "*$candidate*" })
  [pscustomobject]@{
    Font = $candidate
    Installed = [bool]($matches.Count -gt 0)
    Scope = (($matches | Select-Object -ExpandProperty Scope -Unique) -join ',')
    Files = (($matches | Select-Object -ExpandProperty File -Unique) -join ',')
  }
}

if ($Json) {
  $results | ConvertTo-Json -Depth 5
  exit 0
}

$installed = @($results | Where-Object Installed)
if ($installed.Count -eq 0) {
  Write-Warning 'No preferred Thai-capable fonts were found from the candidate list.'
  Write-Host 'Install a Thai-capable font, or use install-thai-powershell-font.ps1 with -FontSourceDir.'
  exit 1
}

Write-Host 'Thai-capable font candidates found:'
$installed | Format-Table -AutoSize

if ($VerboseList) {
  Write-Host ''
  Write-Host 'All scanned candidates:'
  $results | Format-Table -AutoSize
}
