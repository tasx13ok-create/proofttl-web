[CmdletBinding()]
param(
  [Parameter(Mandatory = $false)]
  [string]$Root
)

$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'
$Base = 'https://raw.githubusercontent.com/tasx13ok-create/proofttl-web/main/public/edon-bootstrap'
$Files = @(
  'RUN-PRODUCTION-BOOTSTRAP.ps1',
  'ENSURE-XZ.ps1',
  'PATCH-CLOUDFLARE-COMPAT.ps1'
)

# START-PRODUCTION-BOOTSTRAP.cmd always cd's into its own directory before
# launching this updater. Use that inherited working directory as the source of
# truth instead of parsing a quoted Windows path argument. This is intentionally
# independent of -Root so legacy launchers with a malformed trailing quote still
# recover themselves.
$workingRoot = (Get-Location).ProviderPath
if ([string]::IsNullOrWhiteSpace($workingRoot)) { throw 'Could not resolve the Edon working directory.' }
if (-not (Test-Path -LiteralPath $workingRoot -PathType Container)) { throw "Edon working directory does not exist: $workingRoot" }

# Fail closed if this was somehow launched from the wrong folder.
$bootstrapMarker = Join-Path $workingRoot 'BOOTSTRAP-PRODUCTION.ps1'
$launcherMarker = Join-Path $workingRoot 'START-PRODUCTION-BOOTSTRAP.cmd'
if (-not (Test-Path -LiteralPath $bootstrapMarker -PathType Leaf) -or
    -not (Test-Path -LiteralPath $launcherMarker -PathType Leaf)) {
  throw "Updater was not launched from an Edon bootstrap folder: $workingRoot"
}

$Root = $workingRoot
$Temp = Join-Path $env:TEMP "edon-bootstrap-update-$PID"
try {
  New-Item -ItemType Directory -Force -Path $Temp | Out-Null
  foreach ($name in $Files) {
    $uri = "$Base/$name"
    $download = Join-Path $Temp $name
    Invoke-WebRequest -Uri $uri -OutFile $download -UseBasicParsing -Headers @{ 'Cache-Control' = 'no-cache' }
    if (-not (Test-Path -LiteralPath $download)) { throw "Update download missing: $name" }
    if ((Get-Item -LiteralPath $download).Length -lt 32) { throw "Update download is unexpectedly small: $name" }
  }

  foreach ($name in $Files) {
    $source = Join-Path $Temp $name
    $target = Join-Path $Root $name
    Copy-Item -LiteralPath $source -Destination $target -Force
  }

  Write-Host "Edon bootstrap scripts are current: $Root" -ForegroundColor Green
  exit 0
} finally {
  Remove-Item -Recurse -Force -ErrorAction SilentlyContinue $Temp
}
