$ErrorActionPreference = 'Stop'

$StateDir = Join-Path $env:LOCALAPPDATA 'Edon'
$ReceiptPath = Join-Path $StateDir 'production-receipt.json'
$SecretsPath = Join-Path $StateDir 'production-secrets.json'
$BridgePath = Join-Path $PSScriptRoot 'camera-bridge.mjs'

if (-not (Test-Path -LiteralPath $ReceiptPath)) { throw "Missing production receipt: $ReceiptPath. Run START-PRODUCTION-BOOTSTRAP.cmd first." }
if (-not (Test-Path -LiteralPath $SecretsPath)) { throw "Missing production secrets: $SecretsPath. Run START-PRODUCTION-BOOTSTRAP.cmd first." }
if (-not (Test-Path -LiteralPath $BridgePath)) { throw "Missing camera bridge: $BridgePath" }
if (-not (Get-Command node.exe -ErrorAction SilentlyContinue)) { throw 'Node.js 22+ is required for the camera bridge.' }
if (-not (Get-Command ffmpeg.exe -ErrorAction SilentlyContinue)) { throw 'ffmpeg.exe is required for the Night Owl bridge. Install FFmpeg and rerun this launcher.' }

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
  node $BridgePath
  exit $LASTEXITCODE
} finally {
  Remove-Item Env:EDON_BACKEND_URL,Env:EDON_PC_DEVICE_TOKEN,Env:EDON_DVR_IP,Env:EDON_DVR_USERNAME,Env:EDON_DVR_PASSWORD,Env:EDON_DVR_CHANNELS,Env:EDON_DVR_RTSP_PORT -ErrorAction SilentlyContinue
}
