param(
  [string]$BackendUrl = $env:EDON_BACKEND_URL,
  [string]$DeviceToken = $env:EDON_PC_DEVICE_TOKEN,
  [string]$DeviceId = $(if ($env:EDON_PC_DEVICE_ID) { $env:EDON_PC_DEVICE_ID } else { 'primary-pc' }),
  [int]$PollSeconds = 2
)

$ErrorActionPreference = 'Stop'
$AgentVersion = '1.1.0'

function Fail([string]$Message) {
  Write-Error "[Edon PC Agent] $Message"
  exit 1
}

if ([string]::IsNullOrWhiteSpace($BackendUrl)) { Fail 'EDON_BACKEND_URL is required.' }
if ([string]::IsNullOrWhiteSpace($DeviceToken)) { Fail 'EDON_PC_DEVICE_TOKEN is required.' }
try { $BackendUri = [Uri]$BackendUrl } catch { Fail 'EDON_BACKEND_URL is not a valid URL.' }
$IsLoopbackHttp = ($BackendUri.Scheme -eq 'http' -and @('127.0.0.1','localhost') -contains $BackendUri.Host.ToLowerInvariant())
if ($BackendUri.Scheme -ne 'https' -and -not $IsLoopbackHttp) { Fail 'Backend URL must use HTTPS. Plain HTTP is allowed only for 127.0.0.1/localhost on the same PC.' }
if ($env:EDON_PC_ALLOW_POWERSHELL -ne '1') { Fail 'Set EDON_PC_ALLOW_POWERSHELL=1 locally to enable PowerShell execution.' }

$BackendUrl = $BackendUrl.TrimEnd('/')
$Headers = @{ Authorization = "Bearer $DeviceToken"; 'User-Agent' = "Edon-PC-Agent/$AgentVersion" }
$IsElevated = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

function Send-Heartbeat {
  $body = @{
    hostname = $env:COMPUTERNAME
    username = [Environment]::UserName
    platform = 'windows'
    agentVersion = $AgentVersion
    elevated = $IsElevated
    powershellEnabled = $true
  } | ConvertTo-Json -Compress
  Invoke-RestMethod -Method Post -Uri "$BackendUrl/api/device/heartbeat?deviceId=$([uri]::EscapeDataString($DeviceId))" -Headers $Headers -ContentType 'application/json' -Body $body | Out-Null
}

function Invoke-EdonPowerShell([hashtable]$Command) {
  $timeoutMs = [Math]::Max(1000, [Math]::Min(300000, [int]$Command.timeoutMs))
  $psi = New-Object System.Diagnostics.ProcessStartInfo
  $psi.FileName = 'powershell.exe'
  $psi.Arguments = '-NoLogo -NoProfile -NonInteractive -Command -'
  $psi.UseShellExecute = $false
  $psi.RedirectStandardInput = $true
  $psi.RedirectStandardOutput = $true
  $psi.RedirectStandardError = $true
  $psi.CreateNoWindow = $false
  if ($Command.cwd -and (Test-Path -LiteralPath $Command.cwd -PathType Container)) { $psi.WorkingDirectory = $Command.cwd }

  $process = New-Object System.Diagnostics.Process
  $process.StartInfo = $psi
  [void]$process.Start()
  $process.StandardInput.WriteLine([string]$Command.script)
  $process.StandardInput.Close()

  $timedOut = -not $process.WaitForExit($timeoutMs)
  if ($timedOut) {
    try { $process.Kill() } catch {}
    try { $process.WaitForExit() } catch {}
  }
  $stdout = $process.StandardOutput.ReadToEnd()
  $stderr = $process.StandardError.ReadToEnd()
  $exitCode = if ($timedOut) { -1 } else { $process.ExitCode }
  return @{
    commandId = [string]$Command.id
    ok = (-not $timedOut -and $exitCode -eq 0)
    exitCode = $exitCode
    stdout = if ($stdout.Length -gt 200000) { $stdout.Substring(0,200000) } else { $stdout }
    stderr = if ($stderr.Length -gt 100000) { $stderr.Substring(0,100000) } else { $stderr }
    timedOut = $timedOut
  }
}

Write-Host "Edon PC Agent $AgentVersion" -ForegroundColor Cyan
Write-Host "Device: $DeviceId | Host: $env:COMPUTERNAME | Elevated: $IsElevated"
Write-Host $(if ($IsLoopbackHttp) { 'Outbound loopback HTTP only for this local session. Ctrl+C stops the agent.' } else { 'Outbound HTTPS only. Ctrl+C stops the agent.' })

$lastHeartbeat = [DateTime]::MinValue
while ($true) {
  try {
    if (((Get-Date) - $lastHeartbeat).TotalSeconds -ge 30) {
      Send-Heartbeat
      $lastHeartbeat = Get-Date
    }
    $response = Invoke-RestMethod -Method Get -Uri "$BackendUrl/api/device/commands?deviceId=$([uri]::EscapeDataString($DeviceId))" -Headers $Headers
    if ($response.command) {
      Write-Host "[$(Get-Date -Format o)] Executing $($response.command.id)"
      $result = Invoke-EdonPowerShell -Command ([hashtable]$response.command)
      $json = $result | ConvertTo-Json -Compress
      Invoke-RestMethod -Method Post -Uri "$BackendUrl/api/device/results?deviceId=$([uri]::EscapeDataString($DeviceId))" -Headers $Headers -ContentType 'application/json' -Body $json | Out-Null
      Write-Host "[$(Get-Date -Format o)] Completed $($response.command.id) exit=$($result.exitCode)"
    }
  } catch {
    $detail = $_.Exception.Message
    try {
      $response = $_.Exception.Response
      if ($response) {
        $status = try { [int]$response.StatusCode } catch { $null }
        $reader = New-Object IO.StreamReader($response.GetResponseStream())
        try { $body = $reader.ReadToEnd() } finally { $reader.Dispose() }
        if ($body.Length -gt 600) { $body = $body.Substring(0,600) }
        if ($status) { $detail += " | HTTP $status" }
        if (-not [string]::IsNullOrWhiteSpace($body)) { $detail += " | $body" }
      }
    } catch {}
    Write-Warning "Edon PC Agent connection/action error: $detail"
  }
  Start-Sleep -Seconds ([Math]::Max(1,[Math]::Min(30,$PollSeconds)))
}
