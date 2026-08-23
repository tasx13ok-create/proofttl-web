[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)]
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

$Root = [IO.Path]::GetFullPath($Root)
if (-not (Test-Path -LiteralPath $Root)) { throw "Edon root does not exist: $Root" }

$Temp = Join-Path $env:TEMP "edon-bootstrap-update-$PID"
try {
  New-Item -ItemType Directory -Force -Path $Temp | Out-Null
  foreach ($name in $Files) {
    $uri = "$Base/$name"
    $download = Join-Path $Temp $name
    Invoke-WebRequest -Uri $uri -OutFile $download -UseBasicParsing
    if (-not (Test-Path -LiteralPath $download)) { throw "Update download missing: $name" }
    if ((Get-Item -LiteralPath $download).Length -lt 32) { throw "Update download is unexpectedly small: $name" }
  }

  foreach ($name in $Files) {
    $source = Join-Path $Temp $name
    $target = Join-Path $Root $name
    Copy-Item -LiteralPath $source -Destination $target -Force
  }

  Write-Host 'Edon bootstrap scripts are current.' -ForegroundColor Green
  exit 0
} finally {
  Remove-Item -Recurse -Force -ErrorAction SilentlyContinue $Temp
}
