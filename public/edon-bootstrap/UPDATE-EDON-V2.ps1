[CmdletBinding()]
param(
  [switch]$InstallLauncher
)

$ErrorActionPreference='Stop'
$ProgressPreference='SilentlyContinue'
$Root=(Get-Location).ProviderPath
if([string]::IsNullOrWhiteSpace($Root) -or -not (Test-Path -LiteralPath $Root -PathType Container)){throw 'Could not resolve the Edon working directory.'}
$bootstrapMarker=Join-Path $Root 'BOOTSTRAP-PRODUCTION.ps1'
if(-not (Test-Path -LiteralPath $bootstrapMarker -PathType Leaf)){throw "Updater v2 must be launched from the Edon bootstrap folder. Current directory: $Root"}

$Headers=@{
  'Accept'='application/vnd.github+json'
  'X-GitHub-Api-Version'='2022-11-28'
  'User-Agent'='EdonBootstrapUpdater/3.0'
  'Cache-Control'='no-cache'
}
$Temp=Join-Path $env:TEMP "edon-bootstrap-v3-$PID"
New-Item -ItemType Directory -Force -Path $Temp | Out-Null

function Hex-Sha256([byte[]]$bytes){
  $sha=[Security.Cryptography.SHA256]::Create()
  try{return ([BitConverter]::ToString($sha.ComputeHash($bytes))).Replace('-','').ToLowerInvariant()}
  finally{$sha.Dispose()}
}

function Get-BootstrapBundle {
  $nonce=[guid]::NewGuid().ToString('N')
  $api="https://api.github.com/repos/tasx13ok-create/proofttl-web/contents/public/edon-bootstrap/EDON-BOOTSTRAP-BUNDLE.json?ref=main&cb=$nonce"
  try{
    $response=Invoke-RestMethod -Method Get -Uri $api -Headers $Headers -UseBasicParsing
    if($response.type -ne 'file' -or $response.encoding -ne 'base64' -or [string]::IsNullOrWhiteSpace([string]$response.content)){throw 'GitHub bootstrap bundle metadata is invalid.'}
    $json=[Text.Encoding]::UTF8.GetString([Convert]::FromBase64String((([string]$response.content)-replace '\s','')))
    return $json | ConvertFrom-Json
  }catch{
    Write-Warning "GitHub bootstrap bundle API was unavailable; using the deployed static update mirror. $($_.Exception.Message)"
    $mirror="https://proofttl-web.vercel.app/edon-bootstrap/EDON-BOOTSTRAP-BUNDLE.json?cb=$nonce"
    return Invoke-RestMethod -Method Get -Uri $mirror -Headers @{'Cache-Control'='no-cache';'User-Agent'='EdonBootstrapUpdater/3.0'} -UseBasicParsing
  }
}

try{
  $bundle=Get-BootstrapBundle
  if(-not $bundle -or [string]$bundle.schema -ne 'edon-update-bundle-v1' -or [string]$bundle.kind -ne 'bootstrap'){throw 'Bootstrap update bundle schema/kind is invalid.'}
  $entries=@($bundle.files.PSObject.Properties)
  if($entries.Count -lt 10 -or $entries.Count -gt 40){throw "Bootstrap bundle has an unexpected file count: $($entries.Count)"}

  $staged=@{}
  foreach($entry in $entries){
    $name=[string]$entry.Name;$item=$entry.Value
    if([string]::IsNullOrWhiteSpace($name) -or $name.Contains('..') -or $name.Contains('/') -or $name.Contains('\') -or $name -notmatch '^[A-Za-z0-9._-]+$'){throw "Unsafe bootstrap bundle file name: $name"}
    try{$bytes=[Convert]::FromBase64String([string]$item.contentBase64)}catch{throw "Invalid base64 in bootstrap bundle: $name"}
    if($bytes.Length -ne [int]$item.size){throw "Bootstrap bundle size mismatch: $name"}
    $actual=Hex-Sha256 $bytes
    if($actual -ne ([string]$item.sha256).ToLowerInvariant()){throw "Bootstrap bundle SHA-256 mismatch: $name"}
    $destination=Join-Path $Temp $name
    [IO.File]::WriteAllBytes($destination,$bytes)
    if($name -like '*.ps1'){
      $tokens=$null;$errors=$null
      [void][System.Management.Automation.Language.Parser]::ParseFile($destination,[ref]$tokens,[ref]$errors)
      if($errors.Count -gt 0){throw "Bundled $name does not parse: $($errors[0].Message)"}
    }
    $staged[$name]=$destination
    Write-Host "  verified $name ($($actual.Substring(0,8)))"
  }

  foreach($required in @('UPDATE-EDON-V2.ps1','RUN-PRODUCTION-BOOTSTRAP.ps1','ENSURE-XZ.ps1','PATCH-CLOUDFLARE-COMPAT.ps1','APPLY-LIVE-PRODUCT.ps1','EDON-PC-AGENT.ps1','START-EDON-PC.ps1','START-EDON-PC.cmd','camera-bridge.mjs','START-NIGHTOWL-BRIDGE.ps1','START-NIGHTOWL-BRIDGE.cmd','START-PRODUCTION-BOOTSTRAP.cmd')){
    if(-not $staged.ContainsKey($required)){throw "Bootstrap bundle is missing required file: $required"}
  }

  # Replace the currently executing updater last. PowerShell has already parsed this
  # process, so the new file becomes authoritative for the next launcher invocation.
  $copyOrder=@($staged.Keys | Where-Object {$_ -ne 'UPDATE-EDON-V2.ps1'} | Sort-Object)+@('UPDATE-EDON-V2.ps1')
  foreach($name in $copyOrder){Copy-Item -LiteralPath $staged[$name] -Destination (Join-Path $Root $name) -Force}

  Write-Host "Edon updater, bootstrap, live overlay, and device launchers are current from one verified bundle: $Root" -ForegroundColor Green
  exit 0
}finally{
  Remove-Item -Recurse -Force -ErrorAction SilentlyContinue $Temp
}
