$ErrorActionPreference = 'Stop'

$StateDir = Join-Path $env:LOCALAPPDATA 'Edon'
$ReceiptPath = Join-Path $StateDir 'production-receipt.json'
$SecretsPath = Join-Path $StateDir 'production-secrets.json'
$AgentPath = Join-Path $PSScriptRoot 'EDON-PC-AGENT.ps1'

if (-not (Test-Path -LiteralPath $ReceiptPath)) { throw "Missing production receipt: $ReceiptPath. Run START-PRODUCTION-BOOTSTRAP.cmd first." }
if (-not (Test-Path -LiteralPath $SecretsPath)) { throw "Missing production secrets: $SecretsPath. Run START-PRODUCTION-BOOTSTRAP.cmd first." }
if (-not (Test-Path -LiteralPath $AgentPath)) { throw "Missing Edon PC agent: $AgentPath" }

$receipt = Get-Content -Raw -LiteralPath $ReceiptPath | ConvertFrom-Json
$secrets = Get-Content -Raw -LiteralPath $SecretsPath | ConvertFrom-Json
$backend = [string]$receipt.worker_url
$token = [string]$secrets.EDON_PC_DEVICE_TOKEN
if ([string]::IsNullOrWhiteSpace($backend)) { throw 'Production receipt does not contain worker_url.' }
if ([string]::IsNullOrWhiteSpace($token)) { throw 'Local secret store does not contain EDON_PC_DEVICE_TOKEN.' }

Write-Host 'Edon PC Control' -ForegroundColor Cyan
Write-Host "Backend: $backend"
Write-Host "Computer: $env:COMPUTERNAME"
Write-Host ''
Write-Host 'This opens an outbound-only Edon device agent. It can run PowerShell commands that Edon queues while Computer Control is enabled in the private console.'
Write-Host 'It does not install a hidden service, elevate itself, bypass UAC, or open an inbound listener.' -ForegroundColor DarkGray
Write-Host 'Close this window or press Ctrl+C at any time to disconnect the PC.' -ForegroundColor DarkGray
$confirm = Read-Host 'Type YES to enable Edon PowerShell control for this window'
if ($confirm -cne 'YES') { Write-Host 'PC control was not enabled.'; exit 0 }

$env:EDON_BACKEND_URL = $backend.TrimEnd('/')
$env:EDON_PC_DEVICE_TOKEN = $token
$env:EDON_PC_DEVICE_ID = 'primary-pc'
$env:EDON_PC_ALLOW_POWERSHELL = '1'
try {
  & powershell.exe -NoProfile -ExecutionPolicy Bypass -File $AgentPath
  exit $LASTEXITCODE
} finally {
  Remove-Item Env:EDON_BACKEND_URL,Env:EDON_PC_DEVICE_TOKEN,Env:EDON_PC_DEVICE_ID,Env:EDON_PC_ALLOW_POWERSHELL -ErrorAction SilentlyContinue
}
