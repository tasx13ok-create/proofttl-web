[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version 2.0

$RepoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$ToolDir = Join-Path $RepoRoot '.tools\xz'
$Target = Join-Path $ToolDir 'xz.exe'
$Version = '5.8.3'
$DownloadUrl = "https://github.com/tukaani-project/xz/releases/download/v$Version/xz-$Version-windows.zip"

if (Test-Path -LiteralPath $Target) {
  & $Target --version *> $null
  if ($LASTEXITCODE -eq 0) {
    Write-Host "XZ support already available: $Target" -ForegroundColor Green
    exit 0
  }
  Remove-Item -Recurse -Force -ErrorAction SilentlyContinue $ToolDir
}

Write-Host "Windows XZ support is missing. Downloading official XZ Utils $Version..." -ForegroundColor Yellow
Write-Host 'Source: Tukaani Project official GitHub release'

$TempZip = Join-Path $env:TEMP "edon-xz-$PID.zip"
$TempExtract = Join-Path $env:TEMP "edon-xz-$PID"

try {
  Remove-Item -Force -ErrorAction SilentlyContinue $TempZip
  Remove-Item -Recurse -Force -ErrorAction SilentlyContinue $TempExtract

  Invoke-WebRequest -Uri $DownloadUrl -OutFile $TempZip -UseBasicParsing
  Expand-Archive -LiteralPath $TempZip -DestinationPath $TempExtract -Force

  $Candidates = @(Get-ChildItem -LiteralPath $TempExtract -Filter 'xz.exe' -File -Recurse)
  if ($Candidates.Count -lt 1) {
    throw 'The official XZ Windows package downloaded, but xz.exe was not found inside it.'
  }

  $Preferred = $Candidates | Where-Object { $_.FullName -match '(?i)(x86_64|x64|amd64|64-bit|64bit)' } | Select-Object -First 1
  if (-not $Preferred) { $Preferred = $Candidates | Select-Object -First 1 }

  if (Test-Path -LiteralPath $ToolDir) { Remove-Item -Recurse -Force $ToolDir }
  New-Item -ItemType Directory -Force -Path $ToolDir | Out-Null

  Copy-Item -Path (Join-Path $Preferred.Directory.FullName '*') -Destination $ToolDir -Recurse -Force

  if (-not (Test-Path -LiteralPath $Target)) {
    throw 'XZ installation finished, but the local xz.exe target is missing.'
  }

  & $Target --version
  if ($LASTEXITCODE -ne 0) {
    throw "Downloaded xz.exe could not run (exit code $LASTEXITCODE)."
  }

  Write-Host "XZ support installed locally for Edon: $Target" -ForegroundColor Green
  exit 0
} finally {
  Remove-Item -Force -ErrorAction SilentlyContinue $TempZip
  Remove-Item -Recurse -Force -ErrorAction SilentlyContinue $TempExtract
}
