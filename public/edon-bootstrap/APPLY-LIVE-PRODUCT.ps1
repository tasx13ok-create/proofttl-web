[CmdletBinding()]
param(
  [Parameter(Mandatory=$true)][string]$SourceDir,
  [Parameter(Mandatory=$true)][string]$RepoRoot
)

$ErrorActionPreference='Stop'
$ProgressPreference='SilentlyContinue'
$Utf8NoBom=New-Object System.Text.UTF8Encoding($false)

$sourceWeb=Join-Path $SourceDir 'web'
if(-not (Test-Path -LiteralPath $sourceWeb -PathType Container)){throw "Missing reconstructed web source: $sourceWeb"}
$liveWeb=Join-Path (Join-Path $RepoRoot 'runtime-live') 'web'
New-Item -ItemType Directory -Force -Path $liveWeb | Out-Null

$headers=@{
  'Accept'='application/vnd.github+json'
  'X-GitHub-Api-Version'='2022-11-28'
  'User-Agent'='EdonLiveProductOverlay/2.0'
  'Cache-Control'='no-cache'
}

function Hex-Sha256([byte[]]$bytes){
  $sha=[Security.Cryptography.SHA256]::Create()
  try{return ([BitConverter]::ToString($sha.ComputeHash($bytes))).Replace('-','').ToLowerInvariant()}
  finally{$sha.Dispose()}
}

function Get-LiveBundle {
  $nonce=[guid]::NewGuid().ToString('N')
  $api="https://api.github.com/repos/tasx13ok-create/proofttl-web/contents/public/edon-bootstrap/LIVE-PRODUCT-BUNDLE.json?ref=main&cb=$nonce"
  try{
    $response=Invoke-RestMethod -Method Get -Uri $api -Headers $headers -UseBasicParsing
    if($response.type -ne 'file' -or $response.encoding -ne 'base64' -or [string]::IsNullOrWhiteSpace([string]$response.content)){throw 'GitHub bundle payload metadata is invalid.'}
    $json=[Text.Encoding]::UTF8.GetString([Convert]::FromBase64String((([string]$response.content)-replace '\s','')))
    return $json | ConvertFrom-Json
  }catch{
    Write-Warning "GitHub bundle API was unavailable; using the deployed static update mirror. $($_.Exception.Message)"
    $mirror="https://proofttl-web.vercel.app/edon-bootstrap/LIVE-PRODUCT-BUNDLE.json?cb=$nonce"
    return Invoke-RestMethod -Method Get -Uri $mirror -Headers @{'Cache-Control'='no-cache';'User-Agent'='EdonLiveProductOverlay/2.0'} -UseBasicParsing
  }
}

$bundle=Get-LiveBundle
if(-not $bundle -or [string]$bundle.schema -ne 'edon-update-bundle-v1' -or [string]$bundle.kind -ne 'live-product'){throw 'Live product bundle schema/kind is invalid.'}
$entries=@($bundle.files.PSObject.Properties)
if($entries.Count -lt 10 -or $entries.Count -gt 100){throw "Live product bundle has an unexpected file count: $($entries.Count)"}

foreach($entry in $entries){
  $relative=[string]$entry.Name
  $item=$entry.Value
  if([string]::IsNullOrWhiteSpace($relative) -or $relative.Contains('..') -or [IO.Path]::IsPathRooted($relative) -or $relative -notmatch '^[A-Za-z0-9._/-]+$'){throw "Unsafe live product path in bundle: $relative"}
  try{$bytes=[Convert]::FromBase64String([string]$item.contentBase64)}catch{throw "Invalid base64 in live product bundle: $relative"}
  if($bytes.Length -ne [int]$item.size){throw "Live product bundle size mismatch: $relative"}
  $actual=Hex-Sha256 $bytes
  if($actual -ne ([string]$item.sha256).ToLowerInvariant()){throw "Live product bundle SHA-256 mismatch: $relative"}
  foreach($root in @($sourceWeb,$liveWeb)){
    $target=Join-Path $root ($relative -replace '/', [IO.Path]::DirectorySeparatorChar)
    $parent=Split-Path -Parent $target
    if(-not (Test-Path -LiteralPath $parent)){New-Item -ItemType Directory -Force -Path $parent | Out-Null}
    [IO.File]::WriteAllBytes($target,$bytes)
  }
  Write-Host "  live overlay $relative ($($actual.Substring(0,8)))"
}

$vercelJson='{"$schema":"https://openapi.vercel.sh/vercel.json","framework":"nextjs"}'
[IO.File]::WriteAllText((Join-Path $liveWeb 'vercel.json'),$vercelJson,$Utf8NoBom)

foreach($required in @('next.config.ts','app\page.tsx','app\login\page.tsx','app\systems\page.tsx','app\cognition\page.tsx','app\memory\page.tsx','app\tasks\page.tsx','app\evolution\page.tsx','app\ar\page.tsx','app\components\CommandDock.tsx')){
  if(-not (Test-Path -LiteralPath (Join-Path $sourceWeb $required) -PathType Leaf)){throw "Live product overlay missing required route/source: $required"}
}
Write-Host "Authoritative live product bundle applied ($($entries.Count) files, source $([string]$bundle.sourceCommit).Substring(0,[Math]::Min(8,([string]$bundle.sourceCommit).Length)))." -ForegroundColor Green
