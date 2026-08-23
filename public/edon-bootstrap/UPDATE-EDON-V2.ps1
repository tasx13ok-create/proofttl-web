[CmdletBinding()]
param(
  [switch]$InstallLauncher
)

$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'

$Root = (Get-Location).ProviderPath
if ([string]::IsNullOrWhiteSpace($Root) -or -not (Test-Path -LiteralPath $Root -PathType Container)) {
  throw 'Could not resolve the Edon working directory.'
}

$bootstrapMarker = Join-Path $Root 'BOOTSTRAP-PRODUCTION.ps1'
if (-not (Test-Path -LiteralPath $bootstrapMarker -PathType Leaf)) {
  throw "Updater v2 must be launched from the Edon bootstrap folder. Current directory: $Root"
}

$Headers = @{
  'Accept' = 'application/vnd.github+json'
  'X-GitHub-Api-Version' = '2022-11-28'
  'User-Agent' = 'EdonBootstrapUpdater/2.3'
  'Cache-Control' = 'no-cache'
}

$Files = @(
  'RUN-PRODUCTION-BOOTSTRAP.ps1',
  'ENSURE-XZ.ps1',
  'PATCH-CLOUDFLARE-COMPAT.ps1',
  'APPLY-LIVE-PRODUCT.ps1',
  'EDON-PC-AGENT.ps1',
  'START-EDON-PC.ps1',
  'START-EDON-PC.cmd',
  'camera-bridge.mjs',
  'START-NIGHTOWL-BRIDGE.ps1',
  'START-NIGHTOWL-BRIDGE.cmd'
)
if ($InstallLauncher) {
  $Files += 'START-PRODUCTION-BOOTSTRAP.cmd'
}

$Temp = Join-Path $env:TEMP "edon-bootstrap-v2-$PID"
New-Item -ItemType Directory -Force -Path $Temp | Out-Null

function Download-GitHubContentFile {
  param(
    [Parameter(Mandatory = $true)][string]$Name,
    [Parameter(Mandatory = $true)][string]$Destination
  )

  $escapedName = [uri]::EscapeDataString($Name)
  $uri = 'https://api.github.com/repos/tasx13ok-create/proofttl-web/contents/public/edon-bootstrap/{0}?ref=main' -f $escapedName
  $response = Invoke-RestMethod -Method Get -Uri $uri -Headers $Headers -UseBasicParsing
  if (-not $response -or $response.type -ne 'file' -or $response.encoding -ne 'base64' -or [string]::IsNullOrWhiteSpace([string]$response.content)) {
    throw "GitHub update payload was invalid for $Name"
  }

  $clean = ([string]$response.content) -replace '\s',''
  $bytes = [Convert]::FromBase64String($clean)
  if ($bytes.Length -lt 32) { throw "GitHub update payload was unexpectedly small for $Name" }
  [IO.File]::WriteAllBytes($Destination, $bytes)

  $actual = (Get-FileHash -LiteralPath $Destination -Algorithm SHA256).Hash.ToLowerInvariant()
  if ([string]::IsNullOrWhiteSpace($actual)) { throw "Could not hash downloaded update: $Name" }
  Write-Host "  fetched $Name ($($response.sha.Substring(0,8)))"
}

try {
  foreach ($name in $Files) {
    Download-GitHubContentFile -Name $name -Destination (Join-Path $Temp $name)
  }

  foreach ($name in $Files) {
    $source = Join-Path $Temp $name
    $target = Join-Path $Root $name
    if ($name -like '*.ps1') {
      $tokens = $null
      $errors = $null
      [void][System.Management.Automation.Language.Parser]::ParseFile($source,[ref]$tokens,[ref]$errors)
      if ($errors.Count -gt 0) { throw "Downloaded $name does not parse: $($errors[0].Message)" }
    }
    Copy-Item -LiteralPath $source -Destination $target -Force
  }

  Write-Host "Edon bootstrap, live product overlay, and device launchers are current via update channel v2: $Root" -ForegroundColor Green
  exit 0
} finally {
  Remove-Item -Recurse -Force -ErrorAction SilentlyContinue $Temp
}
