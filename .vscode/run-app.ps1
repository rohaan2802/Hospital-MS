$ErrorActionPreference = "Stop"

$workspace = Resolve-Path "$PSScriptRoot\.."
$phpCandidates = @(
  $env:PHP_PATH,
  "C:\xampp\php\php.exe",
  "php"
) | Where-Object { $_ -and $_.Trim() -ne "" }

function Get-PhpExecutable {
  param([string[]]$Candidates)
  foreach ($candidate in $Candidates) {
    if ($candidate -eq "php") {
      try {
        $cmd = Get-Command php -ErrorAction Stop
        return $cmd.Source
      } catch {
        continue
      }
    }
    if (Test-Path $candidate) {
      return $candidate
    }
  }
  return $null
}

function Get-FreePort {
  param([int]$Start = 8080, [int]$End = 8100)
  for ($p = $Start; $p -le $End; $p++) {
    $inUse = Get-NetTCPConnection -LocalPort $p -State Listen -ErrorAction SilentlyContinue
    if (-not $inUse) {
      return $p
    }
  }
  throw "No free port found between $Start and $End."
}

$phpExe = Get-PhpExecutable -Candidates $phpCandidates
if (-not $phpExe) {
  throw "PHP executable not found. Set PHP_PATH env var or install PHP/XAMPP."
}

$port = Get-FreePort
$url = "http://localhost:$port/index.html"

Write-Host "Starting app from: $workspace"
Write-Host "Using PHP: $phpExe"
Write-Host "URL: $url"

Start-Process $url
& $phpExe -S "localhost:$port" -t "$workspace"
