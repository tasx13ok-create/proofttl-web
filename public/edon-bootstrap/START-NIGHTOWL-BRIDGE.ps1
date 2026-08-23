$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'

$StateDir = Join-Path $env:LOCALAPPDATA 'Edon'
$ReceiptPath = Join-Path $StateDir 'production-receipt.json'
$SecretsPath = Join-Path $StateDir 'production-secrets.json'
$BridgePath = Join-Path $PSScriptRoot 'camera-bridge.mjs'
$ToolsDir = Join-Path $PSScriptRoot '.tools\ffmpeg'

if (-not (Test-Path -LiteralPath $ReceiptPath)) { throw "Missing production receipt: $ReceiptPath. Run START-PRODUCTION-BOOTSTRAP.cmd first." }
if (-not (Test-Path -LiteralPath $SecretsPath)) { throw "Missing production secrets: $SecretsPath. Run START-PRODUCTION-BOOTSTRAP.cmd first." }
if (-not (Test-Path -LiteralPath $BridgePath)) { throw "Missing camera bridge: $BridgePath" }
if (-not (Get-Command node.exe -ErrorAction SilentlyContinue)) { throw 'Node.js 22+ is required for the camera bridge.' }

function Resolve-FFmpeg {
  $existing = Get-Command ffmpeg.exe -ErrorAction SilentlyContinue
  if ($existing) { return $existing.Source }

  $local = Join-Path $ToolsDir 'ffmpeg.exe'
  if (Test-Path -LiteralPath $local -PathType Leaf) { return $local }

  $winget = Get-Command winget.exe -ErrorAction SilentlyContinue
  if ($winget) {
    Write-Host 'FFmpeg is missing. Installing the verified WinGet Gyan.FFmpeg package automatically...' -ForegroundColor Yellow
    try {
      & $winget.Source install --id Gyan.FFmpeg --exact --silent --accept-package-agreements --accept-source-agreements --disable-interactivity
      if ($LASTEXITCODE -eq 0) {
        $existing = Get-Command ffmpeg.exe -ErrorAction SilentlyContinue
        if ($existing) { return $existing.Source }
        $packages = Join-Path $env:LOCALAPPDATA 'Microsoft\WinGet\Packages'
        if (Test-Path -LiteralPath $packages) {
          $found = Get-ChildItem -LiteralPath $packages -Filter ffmpeg.exe -File -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1
          if ($found) { return $found.FullName }
        }
      }
    } catch {
      Write-Warning "WinGet FFmpeg installation did not complete: $($_.Exception.Message)"
    }
  }

  # Pinned fallback from the current Microsoft WinGet manifest for Gyan.FFmpeg 8.1.2.
  $url = 'https://github.com/GyanD/codexffmpeg/releases/download/8.1.2/ffmpeg-8.1.2-full_build.zip'
  $expectedSha = 'b8cdefab5f50590a076c27c2b56b0294a0e6154faded28ba1ba05ebc4f801f57'
  $zip = Join-Path $env:TEMP "edon-ffmpeg-$PID.zip"
  $extract = Join-Path $env:TEMP "edon-ffmpeg-$PID"
  try {
    Write-Host 'Using Edon local FFmpeg fallback...' -ForegroundColor Yellow
    Invoke-WebRequest -UseBasicParsing -Uri $url -OutFile $zip
    $actual = (Get-FileHash -LiteralPath $zip -Algorithm SHA256).Hash.ToLowerInvariant()
    if ($actual -ne $expectedSha) { throw "FFmpeg archive SHA-256 mismatch: $actual" }
    if (Test-Path -LiteralPath $extract) { Remove-Item -Recurse -Force $extract }
    Expand-Archive -LiteralPath $zip -DestinationPath $extract -Force
    $bin = Get-ChildItem -LiteralPath $extract -Filter ffmpeg.exe -File -Recurse | Select-Object -First 1
    if (-not $bin) { throw 'Verified FFmpeg archive did not contain ffmpeg.exe.' }
    New-Item -ItemType Directory -Force -Path $ToolsDir | Out-Null
    $sourceBin = $bin.Directory.FullName
    foreach ($name in @('ffmpeg.exe','ffprobe.exe','ffplay.exe')) {
      $candidate = Join-Path $sourceBin $name
      if (Test-Path -LiteralPath $candidate) { Copy-Item -LiteralPath $candidate -Destination (Join-Path $ToolsDir $name) -Force }
    }
    if (-not (Test-Path -LiteralPath $local -PathType Leaf)) { throw 'Local FFmpeg provisioning did not produce ffmpeg.exe.' }
    return $local
  } finally {
    Remove-Item -Force -ErrorAction SilentlyContinue $zip
    Remove-Item -Recurse -Force -ErrorAction SilentlyContinue $extract
  }
}

$ffmpeg = Resolve-FFmpeg
& $ffmpeg -version | Select-Object -First 1
if ($LASTEXITCODE -ne 0) { throw 'FFmpeg was found but could not start.' }

$receipt = Get-Content -Raw -LiteralPath $ReceiptPath | ConvertFrom-Json
$secrets = Get-Content -Raw -LiteralPath $SecretsPath | ConvertFrom-Json
$backend = [string]$receipt.worker_url
$token = [string]$secrets.EDON_PC_DEVICE_TOKEN
if ([string]::IsNullOrWhiteSpace($backend)) { throw 'Production receipt does not contain worker_url.' }
if ([string]::IsNullOrWhiteSpace($token)) { throw 'Local secret store does not contain EDON_PC_DEVICE_TOKEN.' }

Write-Host 'Edon Night Owl Camera Bridge' -ForegroundColor Cyan
Write-Host 'The DVR stays LAN-only. Do not port-forward RTSP.' -ForegroundColor DarkGray
$dvr = Read-Host 'Night Owl DVR local IP (example 192.168.1.50)'
if ([string]::IsNullOrWhiteSpace($dvr)) { throw 'DVR IP is required.' }
$user = Read-Host 'DVR username [admin]'; if ([string]::IsNullOrWhiteSpace($user)) { $user='admin' }
$passSecure = Read-Host 'DVR password' -AsSecureString
$channels = Read-Host 'Number of DVR channels [8]'; if ([string]::IsNullOrWhiteSpace($channels)) { $channels='8' }
$port = Read-Host 'RTSP port [554]'; if ([string]::IsNullOrWhiteSpace($port)) { $port='554' }

function Plain([Security.SecureString]$s) {
  $p=[Runtime.InteropServices.Marshal]::SecureStringToBSTR($s)
  try { return [Runtime.InteropServices.Marshal]::PtrToStringBSTR($p) }
  finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($p) }
}

try {
  $env:EDON_BACKEND_URL=$backend.TrimEnd('/')
  $env:EDON_PC_DEVICE_TOKEN=$token
  $env:EDON_DVR_IP=$dvr.Trim()
  $env:EDON_DVR_USERNAME=$user.Trim()
  $env:EDON_DVR_PASSWORD=Plain $passSecure
  $env:EDON_DVR_CHANNELS=$channels.Trim()
  $env:EDON_DVR_RTSP_PORT=$port.Trim()
  $env:EDON_FFMPEG=$ffmpeg
  node $BridgePath
  exit $LASTEXITCODE
} finally {
  Remove-Item Env:EDON_BACKEND_URL,Env:EDON_PC_DEVICE_TOKEN,Env:EDON_DVR_IP,Env:EDON_DVR_USERNAME,Env:EDON_DVR_PASSWORD,Env:EDON_DVR_CHANNELS,Env:EDON_DVR_RTSP_PORT,Env:EDON_FFMPEG -ErrorAction SilentlyContinue
}
