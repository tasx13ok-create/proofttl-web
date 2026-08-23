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
  'User-Agent'='EdonLiveProductOverlay/1.1'
  'Cache-Control'='no-cache'
}
$files=@(
  'app/layout.tsx',
  'app/components/CommandDock.tsx',
  'app/components/CommandDock.module.css',
  'app/systems/page.tsx',
  'app/systems/systems.module.css',
  'app/memory/page.tsx',
  'app/memory/memory.module.css',
  'app/tasks/page.tsx',
  'app/tasks/tasks.module.css',
  'app/evolution/page.tsx',
  'app/evolution/evolution.module.css'
)

function Fetch-LiveFile([string]$relative){
  $segments=$relative -split '/'
  $escaped=($segments|ForEach-Object{[uri]::EscapeDataString($_)}) -join '/'
  $uri="https://api.github.com/repos/tasx13ok-create/proofttl-web/contents/public/edon-live/web/$escaped`?ref=main"
  $response=Invoke-RestMethod -Method Get -Uri $uri -Headers $headers -UseBasicParsing
  if(-not $response -or $response.type -ne 'file' -or $response.encoding -ne 'base64' -or [string]::IsNullOrWhiteSpace([string]$response.content)){
    throw "Invalid live product payload for $relative"
  }
  $bytes=[Convert]::FromBase64String((([string]$response.content)-replace '\s',''))
  if($bytes.Length -lt 16){throw "Live product payload is unexpectedly small for $relative"}
  return @{Bytes=$bytes;Sha=[string]$response.sha}
}

foreach($relative in $files){
  $payload=Fetch-LiveFile $relative
  foreach($root in @($sourceWeb,$liveWeb)){
    $target=Join-Path $root ($relative -replace '/', [IO.Path]::DirectorySeparatorChar)
    $parent=Split-Path -Parent $target
    if(-not (Test-Path -LiteralPath $parent)){New-Item -ItemType Directory -Force -Path $parent | Out-Null}
    [IO.File]::WriteAllBytes($target,$payload.Bytes)
  }
  Write-Host "  live overlay $relative ($($payload.Sha.Substring(0,8)))"
}

$vercelJson='{"$schema":"https://openapi.vercel.sh/vercel.json","framework":"nextjs"}'
[IO.File]::WriteAllText((Join-Path $liveWeb 'vercel.json'),$vercelJson,$Utf8NoBom)

foreach($required in @('app\page.tsx','app\login\page.tsx','app\systems\page.tsx','app\memory\page.tsx','app\tasks\page.tsx','app\evolution\page.tsx','app\components\CommandDock.tsx')){
  if(-not (Test-Path -LiteralPath (Join-Path $sourceWeb $required) -PathType Leaf)){throw "Live product overlay missing required route/source: $required"}
}
Write-Host 'Authoritative live product overlay applied to reconstructed and runtime-live web sources.' -ForegroundColor Green
