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

$replacementLiteral = $replacement
$patched = [regex]::Replace($text, $pattern, [System.Text.RegularExpressions.MatchEvaluator]{ param($match) $replacementLiteral }, 1)

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

  Write-Step 'Normalizing Vercel project routing/build settings'
  & npx --yes vercel@latest project update $VercelProject --framework nextjs --auto-detect build-command --auto-detect install-command --auto-detect output-directory --scope $VercelScope
  Assert-LastExit 'Vercel project settings normalization'

  $webUrl = Deploy-Vercel $workerUrl $secrets
  $stableWebUrl = "https://$VercelProject.vercel.app"

  Write-Step 'Verifying public Vercel routes'
  $routeOk = $false
  $lastStatus = $null
  for ($attempt = 1; $attempt -le 8; $attempt++) {
    try {
      $probe = Invoke-WebRequest -Uri "$stableWebUrl/login" -Method Get -UseBasicParsing -MaximumRedirection 5 -TimeoutSec 30
      $lastStatus = [int]$probe.StatusCode
      if ($lastStatus -ge 200 -and $lastStatus -lt 400) { $routeOk = $true; break }
    } catch {
      try { $lastStatus = [int]$_.Exception.Response.StatusCode.value__ } catch { $lastStatus = $null }
    }
    Start-Sleep -Seconds 2
  }

  if (-not $routeOk) {
    Write-Host "Stable alias did not answer yet (status: $lastStatus). Re-attaching production alias..." -ForegroundColor Yellow
    & npx --yes vercel@latest alias set $webUrl "$VercelProject.vercel.app" --scope $VercelScope
    Assert-LastExit 'Vercel production alias repair'
    Start-Sleep -Seconds 2
    try {
      $probe = Invoke-WebRequest -Uri "$stableWebUrl/login" -Method Get -UseBasicParsing -MaximumRedirection 5 -TimeoutSec 30
      $lastStatus = [int]$probe.StatusCode
      $routeOk = $lastStatus -ge 200 -and $lastStatus -lt 400
    } catch {
      try { $lastStatus = [int]$_.Exception.Response.StatusCode.value__ } catch { $lastStatus = $null }
    }
  }

  if (-not $routeOk) {
    throw "Vercel deployment exists but the production /login route is not live (HTTP $lastStatus). Refusing to report success."
  }

  Write-Host "Verified live web route: $stableWebUrl/login" -ForegroundColor Green
  $webUrl = $stableWebUrl

  Write-Step 'Enabling Git-backed live web updates'
  try {
    $liveRoot = Join-Path $RepoRoot 'runtime-live'
    $liveWeb = Join-Path $liveRoot 'web'
    if (Test-Path -LiteralPath $liveWeb) { Remove-Item -Recurse -Force $liveWeb }
    New-Item -ItemType Directory -Force -Path $liveRoot | Out-Null
    Copy-Item -LiteralPath (Join-Path $SourceDir 'web') -Destination $liveWeb -Recurse -Force
    $vercelJson = '{"$schema":"https://openapi.vercel.sh/vercel.json","framework":"nextjs"}'
    [IO.File]::WriteAllText((Join-Path $liveWeb 'vercel.json'), $vercelJson, $Utf8NoBom)

    $git = Get-Command git.exe -ErrorAction SilentlyContinue
    if ($git) {
      if (-not (Test-Path -LiteralPath (Join-Path $RepoRoot '.git'))) {
        & $git.Source -C $RepoRoot init | Out-Null
      }
      & $git.Source -C $RepoRoot remote get-url origin *> $null
      if ($LASTEXITCODE -ne 0) {
        & $git.Source -C $RepoRoot remote add origin 'https://github.com/tasx13ok-create/Edon.git'
      } else {
        & $git.Source -C $RepoRoot remote set-url origin 'https://github.com/tasx13ok-create/Edon.git'
      }

      Push-Location $liveWeb
      try {
        & npx --yes vercel@latest link --yes --project $VercelProject --scope $VercelScope
        Assert-LastExit 'Vercel live-source link'
        & npx --yes vercel@latest git connect --yes --scope $VercelScope
        if ($LASTEXITCODE -eq 0) {
          Write-Host 'Git-backed Vercel updates enabled: future runtime-live/web commits can deploy automatically.' -ForegroundColor Green
        } else {
          Write-Warning 'The web app is live, but Vercel Git auto-deploy could not be connected automatically. The local self-updating launcher will still work.'
        }
      } finally { Pop-Location }
    } else {
      Write-Warning 'Git is not installed, so Vercel Git auto-deploy was skipped. The local self-updating launcher will still work.'
    }
  } catch {
    Write-Warning "Live Git update setup did not complete: $($_.Exception.Message)"
  }
} finally {
  $ErrorActionPreference = $previousErrorActionPreference
}
'@

$vercelReplacementLiteral = $vercelReplacement
$patched = [regex]::Replace($patched, $vercelPattern, [System.Text.RegularExpressions.MatchEvaluator]{ param($match) $vercelReplacementLiteral }, 1)

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

  Write-Host 'Windows compatibility patch active: XZ extraction is Windows-safe, Cloudflare config formatting is preserved, Vercel npm warnings are tolerated, Vercel routes are verified, and Git live-update setup is attempted.' -ForegroundColor Green
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
