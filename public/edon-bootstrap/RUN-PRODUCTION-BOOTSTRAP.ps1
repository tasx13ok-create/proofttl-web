[CmdletBinding()]
param(
  [switch]$PatchOnly
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version 2.0

$RepoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$Original = Join-Path $RepoRoot 'BOOTSTRAP-PRODUCTION.ps1'
$Runtime = Join-Path $RepoRoot '.BOOTSTRAP-PRODUCTION.runtime.ps1'
$LogDir = Join-Path $env:LOCALAPPDATA 'Edon'
$LogPath = Join-Path $LogDir 'bootstrap-last.log'
$Utf8NoBom = New-Object System.Text.UTF8Encoding($false)

if (-not (Test-Path -LiteralPath $Original)) { throw "Missing production bootstrap: $Original" }
if (-not (Test-Path -LiteralPath $LogDir)) { New-Item -ItemType Directory -Force -Path $LogDir | Out-Null }

$text = [IO.File]::ReadAllText($Original)
$pattern = '(?ms)^\s*& tar\.exe -xJf \$tempArchive -C \$SourceDir\r?\n\s*Assert-LastExit ''Source extraction'''
if (-not [regex]::IsMatch($text, $pattern)) {
  throw 'Could not locate the legacy tar -xJ extraction block. The bootstrap changed unexpectedly; refusing to guess.'
}

$replacement = @'
    $tempTar = $tempArchive.Substring(0, $tempArchive.Length - 3)
    $xzExe = Join-Path $RepoRoot '.tools\xz\xz.exe'
    if (-not (Test-Path -LiteralPath $xzExe)) {
      $xzCommand = Get-Command xz.exe -ErrorAction SilentlyContinue
      if ($xzCommand) { $xzExe = $xzCommand.Source }
    }
    if (-not (Test-Path -LiteralPath $xzExe)) {
      throw 'XZ support is unavailable. Run START-PRODUCTION-BOOTSTRAP.cmd so it can provision XZ automatically.'
    }
    try {
      Remove-Item -Force -ErrorAction SilentlyContinue $tempTar
      Write-Host 'Decompressing verified source archive with Edon local XZ...'
      & $xzExe --decompress --keep --force -- $tempArchive
      Assert-LastExit 'Source decompression'
      if (-not (Test-Path -LiteralPath $tempTar)) { throw 'XZ completed but the plain TAR file was not created.' }
      Write-Host 'Extracting plain TAR with Windows tar.exe...'
      & tar.exe -xf $tempTar -C $SourceDir
      Assert-LastExit 'Source extraction'

      $wranglerPath = Join-Path $SourceDir 'wrangler.jsonc'
      $compatPatch = Join-Path $RepoRoot 'PATCH-CLOUDFLARE-COMPAT.ps1'
      if (-not (Test-Path -LiteralPath $compatPatch)) {
        throw 'Missing PATCH-CLOUDFLARE-COMPAT.ps1 beside the production launcher.'
      }
      & powershell.exe -NoProfile -ExecutionPolicy Bypass -File $compatPatch -WranglerPath $wranglerPath
      Assert-LastExit 'Cloudflare compatibility patch'
    } finally {
      Remove-Item -Force -ErrorAction SilentlyContinue $tempTar
    }
'@

$patched = [regex]::Replace($text, $pattern, $replacement, 1)

$vercelPattern = '(?ms)^Ensure-VercelLogin\r?\nEnsure-VercelProject\r?\n\$webUrl = Deploy-Vercel \$workerUrl \$secrets'
if (-not [regex]::IsMatch($patched, $vercelPattern)) {
  throw 'Could not locate the Vercel bootstrap stage. The bootstrap changed unexpectedly; refusing to guess.'
}
$vercelReplacement = @'
$previousErrorActionPreference = $ErrorActionPreference
$ErrorActionPreference = 'Continue'
try {
  Ensure-VercelLogin
  Ensure-VercelProject
  $webUrl = Deploy-Vercel $workerUrl $secrets
} finally {
  $ErrorActionPreference = $previousErrorActionPreference
}
'@
$patched = [regex]::Replace($patched, $vercelPattern, $vercelReplacement, 1)

[IO.File]::WriteAllText($Runtime, $patched, $Utf8NoBom)

$tokens = $null
$errors = $null
[void][System.Management.Automation.Language.Parser]::ParseFile($Runtime, [ref]$tokens, [ref]$errors)
if ($errors.Count -gt 0) {
  $message = ($errors | ForEach-Object { $_.Message }) -join '; '
  throw "Generated runtime bootstrap did not parse: $message"
}

if ($PatchOnly) {
  Write-Host "Runtime bootstrap patch prepared and parsed: $Runtime" -ForegroundColor Green
  exit 0
}

$transcriptStarted = $false
try {
  try {
    Start-Transcript -Path $LogPath -Force | Out-Null
    $transcriptStarted = $true
  } catch {
    Write-Warning "Could not start transcript logging at $LogPath"
  }

  Write-Host 'Windows compatibility patch active: XZ extraction is Windows-safe, Cloudflare config formatting is preserved, and Vercel npm warnings cannot abort successful CLI commands.' -ForegroundColor Green
  & powershell.exe -NoProfile -ExecutionPolicy Bypass -File $Runtime
  $code = $LASTEXITCODE
  if ($code -ne 0) { throw "Production bootstrap failed with exit code $code." }

  Write-Host 'Production bootstrap returned success.' -ForegroundColor Green
  exit 0
} catch {
  Write-Error $_
  Write-Host "Diagnostic log: $LogPath" -ForegroundColor Yellow
  exit 1
} finally {
  if ($transcriptStarted) {
    try { Stop-Transcript | Out-Null } catch {}
  }
  Remove-Item -Force -ErrorAction SilentlyContinue $Runtime
}
