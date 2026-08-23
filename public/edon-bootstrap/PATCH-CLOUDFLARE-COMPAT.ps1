[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)]
  [string]$WranglerPath
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version 2.0
$Utf8NoBom = New-Object System.Text.UTF8Encoding($false)

if (-not (Test-Path -LiteralPath $WranglerPath)) { throw "Missing wrangler config: $WranglerPath" }
$projectRoot = Split-Path -Parent $WranglerPath
$packagePath = Join-Path $projectRoot 'package.json'
if (-not (Test-Path -LiteralPath $packagePath)) { throw "Missing package.json beside wrangler config: $packagePath" }

$package = Get-Content -Raw -LiteralPath $packagePath | ConvertFrom-Json
$versionMarker = '"EDON_VERSION": "' + [string]$package.version + '"'
$text = [IO.File]::ReadAllText($WranglerPath)
if (-not $text.Contains($versionMarker)) { throw "Wrangler release identity marker is missing before compatibility patch: $versionMarker" }

if (-not $text.Contains('"global_fetch_strictly_public"')) {
  $pattern = '(?ms)("compatibility_flags"\s*:\s*\[\s*"nodejs_compat")(\s*\])'
  $regex = New-Object System.Text.RegularExpressions.Regex($pattern)
  if (-not $regex.IsMatch($text)) { throw 'Could not locate nodejs_compat in compatibility_flags; refusing to rewrite wrangler.jsonc broadly.' }
  $replacement = '$1,' + [Environment]::NewLine + '    "global_fetch_strictly_public"$2'
  $text = $regex.Replace($text, $replacement, 1)
  [IO.File]::WriteAllText($WranglerPath, $text, $Utf8NoBom)
}

$verified = [IO.File]::ReadAllText($WranglerPath)
if (-not $verified.Contains($versionMarker)) { throw 'Cloudflare compatibility patch changed the exact EDON_VERSION release marker.' }
if (-not $verified.Contains('"global_fetch_strictly_public"')) { throw 'Cloudflare global_fetch_strictly_public compatibility patch did not apply.' }
Write-Host 'Cloudflare same-zone fetch compatibility enabled without reformatting wrangler.jsonc.' -ForegroundColor Green

$liveOverlay = Join-Path $PSScriptRoot 'APPLY-LIVE-PRODUCT.ps1'
if (-not (Test-Path -LiteralPath $liveOverlay -PathType Leaf)) { throw 'Missing APPLY-LIVE-PRODUCT.ps1 beside the production launcher.' }
& powershell.exe -NoProfile -ExecutionPolicy Bypass -File $liveOverlay -SourceDir $projectRoot -RepoRoot $PSScriptRoot
if ($LASTEXITCODE -ne 0) { throw "Authoritative live product overlay failed with exit code $LASTEXITCODE." }

# Bridge machines already on updater 2.x to the atomic self-updating 3.x updater without
# another manual migration command. Failure here must not invalidate an otherwise safe
# deployment because the current run already has the new overlay and deployment helpers.
try {
  $nonce=[guid]::NewGuid().ToString('N')
  $headers=@{'Accept'='application/vnd.github+json';'X-GitHub-Api-Version'='2022-11-28';'User-Agent'='EdonUpdaterBridge/1.0';'Cache-Control'='no-cache'}
  $bundle=$null
  try {
    $uri="https://api.github.com/repos/tasx13ok-create/proofttl-web/contents/public/edon-bootstrap/EDON-BOOTSTRAP-BUNDLE.json?ref=main&cb=$nonce"
    $response=Invoke-RestMethod -Method Get -Uri $uri -Headers $headers -UseBasicParsing
    if($response.type -ne 'file' -or $response.encoding -ne 'base64'){throw 'Invalid bootstrap bundle response.'}
    $json=[Text.Encoding]::UTF8.GetString([Convert]::FromBase64String((([string]$response.content)-replace '\s','')))
    $bundle=$json|ConvertFrom-Json
  } catch {
    $mirror="https://proofttl-web.vercel.app/edon-bootstrap/EDON-BOOTSTRAP-BUNDLE.json?cb=$nonce"
    $bundle=Invoke-RestMethod -Method Get -Uri $mirror -Headers @{'Cache-Control'='no-cache';'User-Agent'='EdonUpdaterBridge/1.0'} -UseBasicParsing
  }
  if([string]$bundle.schema -ne 'edon-update-bundle-v1' -or [string]$bundle.kind -ne 'bootstrap'){throw 'Bootstrap bridge bundle schema/kind is invalid.'}
  $item=$bundle.files.'UPDATE-EDON-V2.ps1'
  if(-not $item){throw 'Bootstrap bridge bundle is missing UPDATE-EDON-V2.ps1.'}
  $bytes=[Convert]::FromBase64String([string]$item.contentBase64)
  if($bytes.Length -ne [int]$item.size){throw 'Updater bridge size mismatch.'}
  $sha=[Security.Cryptography.SHA256]::Create()
  try{$actual=([BitConverter]::ToString($sha.ComputeHash($bytes))).Replace('-','').ToLowerInvariant()}finally{$sha.Dispose()}
  if($actual -ne ([string]$item.sha256).ToLowerInvariant()){throw 'Updater bridge SHA-256 mismatch.'}
  $tempUpdater=Join-Path $env:TEMP "edon-updater-bridge-$PID.ps1"
  [IO.File]::WriteAllBytes($tempUpdater,$bytes)
  $tokens=$null;$errors=$null
  [void][System.Management.Automation.Language.Parser]::ParseFile($tempUpdater,[ref]$tokens,[ref]$errors)
  if($errors.Count -gt 0){throw "Updater bridge script does not parse: $($errors[0].Message)"}
  Copy-Item -LiteralPath $tempUpdater -Destination (Join-Path $PSScriptRoot 'UPDATE-EDON-V2.ps1') -Force
  Remove-Item -Force -ErrorAction SilentlyContinue $tempUpdater
  Write-Host 'Local Edon updater advanced to the atomic self-updating channel.' -ForegroundColor Green
} catch {
  Write-Warning "Updater self-heal could not complete on this run: $($_.Exception.Message)"
}
