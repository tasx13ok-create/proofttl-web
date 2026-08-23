[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)]
  [string]$WranglerPath
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version 2.0
$Utf8NoBom = New-Object System.Text.UTF8Encoding($false)

if (-not (Test-Path -LiteralPath $WranglerPath)) {
  throw "Missing wrangler config: $WranglerPath"
}

$projectRoot = Split-Path -Parent $WranglerPath
$packagePath = Join-Path $projectRoot 'package.json'
if (-not (Test-Path -LiteralPath $packagePath)) {
  throw "Missing package.json beside wrangler config: $packagePath"
}

$package = Get-Content -Raw -LiteralPath $packagePath | ConvertFrom-Json
$versionMarker = '"EDON_VERSION": "' + [string]$package.version + '"'
$text = [IO.File]::ReadAllText($WranglerPath)

if (-not $text.Contains($versionMarker)) {
  throw "Wrangler release identity marker is missing before compatibility patch: $versionMarker"
}

if (-not $text.Contains('"global_fetch_strictly_public"')) {
  $pattern = '(?ms)("compatibility_flags"\s*:\s*\[\s*"nodejs_compat")(\s*\])'
  $regex = New-Object System.Text.RegularExpressions.Regex($pattern)
  if (-not $regex.IsMatch($text)) {
    throw 'Could not locate nodejs_compat in compatibility_flags; refusing to rewrite wrangler.jsonc broadly.'
  }

  $replacement = '$1,' + [Environment]::NewLine + '    "global_fetch_strictly_public"$2'
  $text = $regex.Replace($text, $replacement, 1)
  [IO.File]::WriteAllText($WranglerPath, $text, $Utf8NoBom)
}

$verified = [IO.File]::ReadAllText($WranglerPath)
if (-not $verified.Contains($versionMarker)) {
  throw 'Cloudflare compatibility patch changed the exact EDON_VERSION release marker.'
}
if (-not $verified.Contains('"global_fetch_strictly_public"')) {
  throw 'Cloudflare global_fetch_strictly_public compatibility patch did not apply.'
}

Write-Host 'Cloudflare same-zone fetch compatibility enabled without reformatting wrangler.jsonc.' -ForegroundColor Green

$liveOverlay = Join-Path $PSScriptRoot 'APPLY-LIVE-PRODUCT.ps1'
if (-not (Test-Path -LiteralPath $liveOverlay -PathType Leaf)) {
  throw 'Missing APPLY-LIVE-PRODUCT.ps1 beside the production launcher.'
}
& powershell.exe -NoProfile -ExecutionPolicy Bypass -File $liveOverlay -SourceDir $projectRoot -RepoRoot $PSScriptRoot
if ($LASTEXITCODE -ne 0) {
  throw "Authoritative live product overlay failed with exit code $LASTEXITCODE."
}
