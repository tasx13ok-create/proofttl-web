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

# cmd.exe can hand PowerShell a trailing quote when a quoted argument ends in a
# backslash (for example "%~dp0"). Normalize that legacy form before resolving
# the directory. This keeps existing Edon folders self-updatable without another ZIP.
$candidate = [string]$Root
$candidate = $candidate.Trim()
$candidate = $candidate.Trim('"').Trim("'")
if ($candidate.Length -gt 3) {
  $candidate = $candidate.TrimEnd([char[]]'\\/')
}
if ([string]::IsNullOrWhiteSpace($candidate)) { throw 'Edon root path is empty.' }
if ($candidate.IndexOfAny([IO.Path]::GetInvalidPathChars()) -ge 0) {
  throw "Edon root contains invalid path characters after normalization: $candidate"
}

$Root = [IO.Path]::GetFullPath($candidate)
if (-not (Test-Path -LiteralPath $Root -PathType Container)) { throw "Edon root does not exist: $Root" }

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

  Write-Host "Edon bootstrap scripts are current: $Root" -ForegroundColor Green
  exit 0
} finally {
  Remove-Item -Recurse -Force -ErrorAction SilentlyContinue $Temp
}
