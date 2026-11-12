# PLUVSTATS - local demonstration only (no backend, no credentials).
# Usage: powershell -ExecutionPolicy Bypass -File scripts/start-demo.ps1

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$frontend = Join-Path $root "frontend"

Write-Host ""
Write-Host "PLUVSTATS - demonstrativo local" -ForegroundColor Cyan
Write-Host "Dados simulados, sem backend e sem credenciais." -ForegroundColor DarkGray
Write-Host ""

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "Node.js nao encontrado. Instale Node.js 20+ e tente novamente." -ForegroundColor Red
    exit 1
}

$nodeVersion = (node --version).TrimStart("v")
$nodeMajor = [int]($nodeVersion.Split(".")[0])
if ($nodeMajor -lt 20) {
    Write-Host "Node.js $nodeVersion encontrado; o projeto pede Node.js 20+." -ForegroundColor Yellow
}

if (-not (Test-Path (Join-Path $frontend "node_modules"))) {
    Write-Host "Instalando dependencias do frontend..." -ForegroundColor Yellow
    Push-Location $frontend
    try {
        npm install
        if ($LASTEXITCODE -ne 0) { throw "npm install falhou." }
    }
    finally {
        Pop-Location
    }
}

Write-Host "Abrindo o servidor em http://127.0.0.1:5173" -ForegroundColor Green
Write-Host "Pressione Ctrl+C para encerrar." -ForegroundColor DarkGray
Write-Host ""

Push-Location $frontend
try {
    npm run dev -- --host 127.0.0.1 --port 5173
}
finally {
    Pop-Location
}
