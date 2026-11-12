# PLUVSTATS - build the delivery ZIPs.
# Usage: powershell -ExecutionPolicy Bypass -File deliverables/build_zips.ps1
#
# Output:
#   deliverables/zips/pluvstats-python.zip   (app.py, prompt.md, readme.md, tests, data)
#   deliverables/zips/pluvstats-projeto.zip  (whole project, without caches/builds)

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$outDir = Join-Path $PSScriptRoot "zips"
$pythonSrc = Join-Path $root "python-app"
$stage = Join-Path $env:TEMP ("pluvstats-zips-" + [guid]::NewGuid().ToString("N"))

function Invoke-Robocopy {
    param([string[]]$Arguments)
    & robocopy @Arguments | Out-Null
    $code = $LASTEXITCODE
    if ($code -ge 8) {
        throw "robocopy falhou com o codigo $code."
    }
}

Write-Host ""
Write-Host "PLUVSTATS - gerando ZIPs de entrega" -ForegroundColor Cyan
Write-Host ""

if (Test-Path $outDir) {
    Remove-Item $outDir -Recurse -Force
}
New-Item -ItemType Directory -Path $outDir | Out-Null
New-Item -ItemType Directory -Path $stage | Out-Null

# --- Python package --------------------------------------------------------
$pythonStage = Join-Path $stage "python"
New-Item -ItemType Directory -Path $pythonStage | Out-Null

Copy-Item (Join-Path $pythonSrc "app.py") $pythonStage
Copy-Item (Join-Path $pythonSrc "prompt.md") $pythonStage
Copy-Item (Join-Path $pythonSrc "readme.md") $pythonStage
Copy-Item (Join-Path $pythonSrc "tests") $pythonStage -Recurse
Copy-Item (Join-Path $pythonSrc "data") $pythonStage -Recurse

# Do not ship local runtime state.
Get-ChildItem $pythonStage -Recurse -Filter "estado.json" -File -ErrorAction SilentlyContinue |
    Remove-Item -Force
Get-ChildItem $pythonStage -Recurse -Directory -Filter "__pycache__" -ErrorAction SilentlyContinue |
    Remove-Item -Recurse -Force

$pythonZip = Join-Path $outDir "pluvstats-python.zip"
Compress-Archive -Path (Join-Path $pythonStage "*") -DestinationPath $pythonZip -CompressionLevel Optimal
Write-Host "OK  pluvstats-python.zip" -ForegroundColor Green

# --- Full project ----------------------------------------------------------
$projectStage = Join-Path $stage "project"
New-Item -ItemType Directory -Path $projectStage | Out-Null

Invoke-Robocopy @(
    $root, $projectStage,
    "/E",
    "/XD", "node_modules", ".venv", "__pycache__", ".git", "dist", "coverage", ".pytest_cache", ".wokwi-cache", "zips",
    "/XF", "*.db", "*.db-journal", "*.sqlite", "*.sqlite3", "estado.json", "*.log",
    "/NFL", "/NDL", "/NJH", "/NJS", "/NP"
)

# Keep the zips folder itself out of the project ZIP.
$projectZips = Join-Path $projectStage "deliverables\zips"
if (Test-Path $projectZips) {
    Remove-Item $projectZips -Recurse -Force
}

$projectZip = Join-Path $outDir "pluvstats-projeto.zip"
Compress-Archive -Path (Join-Path $projectStage "*") -DestinationPath $projectZip -CompressionLevel Optimal
Write-Host "OK  pluvstats-projeto.zip" -ForegroundColor Green

Remove-Item $stage -Recurse -Force

Write-Host ""
Get-ChildItem $outDir | Select-Object Name, @{Name = "MB"; Expression = { [math]::Round($_.Length / 1MB, 2) } }
Write-Host ""
Write-Host "ZIPs em $outDir" -ForegroundColor Cyan
