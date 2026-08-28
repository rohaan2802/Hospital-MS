param(
    [string]$CaCertificatePath = ''
)

<##
Imports Hospital MS demo schema into an existing Aiven MySQL database.
The script prompts locally for all connection values and never writes them to disk.
##>

$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $PSScriptRoot
$schemaPath = Join-Path $projectRoot 'sql\mysql_schema.sql'
$certificateDirectory = Join-Path $projectRoot 'certs'
$certificatePath = Join-Path $certificateDirectory 'aiven-ca.pem'
$mysqlCandidates = @(
    (Get-Command mysql -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Source -ErrorAction SilentlyContinue),
    'C:\xampp\mysql\bin\mysql.exe'
) | Where-Object { $_ -and (Test-Path -LiteralPath $_) }

if (-not (Test-Path -LiteralPath $schemaPath)) { throw "Schema file not found: $schemaPath" }
if (-not $mysqlCandidates) { throw 'MySQL client not found. Install MySQL client or XAMPP first.' }

$dbHost = Read-Host 'Aiven MySQL host'
$dbPort = Read-Host 'Aiven MySQL port'
$dbUser = Read-Host 'Aiven MySQL username'
$dbPassword = Read-Host 'Aiven MySQL password' -AsSecureString
if ([string]::IsNullOrWhiteSpace($dbHost) -or [string]::IsNullOrWhiteSpace($dbPort) -or [string]::IsNullOrWhiteSpace($dbUser)) {
    throw 'Host, port, and username are required.'
}

if ($CaCertificatePath -ne '') {
    if (-not (Test-Path -LiteralPath $CaCertificatePath)) { throw "CA certificate not found: $CaCertificatePath" }
    $certificatePath = (Resolve-Path -LiteralPath $CaCertificatePath).Path
} elseif (Test-Path -LiteralPath $certificatePath) {
    Write-Host "Using cached Aiven CA certificate: $certificatePath"
} else {
    New-Item -ItemType Directory -Force -Path $certificateDirectory | Out-Null
    try {
        Invoke-WebRequest -Uri 'https://cdn.aiven.io/ca.pem' -OutFile $certificatePath
    } catch {
        throw 'Could not download Aiven CA certificate. Download it from Aiven Console > your MySQL service > Connection information, then rerun this script with -CaCertificatePath "C:\path\to\ca.pem".'
    }
}

$passwordPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($dbPassword)
try {
    $env:MYSQL_PWD = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($passwordPointer)
    Get-Content -Raw $schemaPath | & $mysqlCandidates[0] --host=$dbHost --port=$dbPort --user=$dbUser --ssl-ca=$certificatePath --ssl-verify-server-cert hospitalms
    if ($LASTEXITCODE -ne 0) { throw "MySQL import failed with exit code $LASTEXITCODE." }
} finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($passwordPointer)
    Remove-Item Env:MYSQL_PWD -ErrorAction SilentlyContinue
}

Write-Host 'Hospital MS schema and demo data imported successfully.' -ForegroundColor Green
