# PLUVSTATS - full local stack (FastAPI + frontend).
# Usage: powershell -ExecutionPolicy Bypass -File scripts/start-full.ps1
# Optional: -ApiPort 8000 -FrontendPort 5173

param(
    [int]$ApiPort = 8000,
    [int]$FrontendPort = 5173
)

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$frontend = Join-Path $root "frontend"
$backend = Join-Path $root "backend"
$venvPython = Join-Path $backend ".venv\Scripts\python.exe"

Write-Host ""
Write-Host "PLUVSTATS - stack local completa" -ForegroundColor Cyan
Write-Host "API em http://127.0.0.1:$ApiPort | Frontend em http://127.0.0.1:$FrontendPort" -ForegroundColor DarkGray
Write-Host ""

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "Node.js nao encontrado. Instale Node.js 20+ e tente novamente." -ForegroundColor Red
    exit 1
}

if (-not (Get-Command python -ErrorAction SilentlyContinue)) {
    Write-Host "Python nao encontrado. Instale Python 3.11+ e tente novamente." -ForegroundColor Red
    exit 1
}

# --- Backend ---------------------------------------------------------------
if (-not (Test-Path $venvPython)) {
    Write-Host "Criando a venv do backend..." -ForegroundColor Yellow
    Push-Location $backend
    try {
        python -m venv .venv
        if ($LASTEXITCODE -ne 0) { throw "Falha ao criar a venv." }
    }
    finally {
        Pop-Location
    }
}

Write-Host "Instalando dependencias do backend..." -ForegroundColor Yellow
& $venvPython -m pip install --quiet --upgrade pip
& $venvPython -m pip install --quiet -r (Join-Path $backend "requirements.txt")
if ($LASTEXITCODE -ne 0) { throw "Falha ao instalar as dependencias do backend." }

if (-not (Test-Path (Join-Path $backend ".env"))) {
    Copy-Item (Join-Path $backend ".env.example") (Join-Path $backend ".env")
    Write-Host "Criado backend/.env a partir de .env.example." -ForegroundColor DarkGray
}

$apiCommand = "Set-Location '$backend'; & '$venvPython' -m uvicorn app.main:create_app --factory --host 127.0.0.1 --port $ApiPort"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $apiCommand

# --- Frontend --------------------------------------------------------------
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

$envFile = Join-Path $frontend ".env"
$envLine = "VITE_API_BASE_URL=http://127.0.0.1:$ApiPort"
if (-not (Test-Path $envFile)) {
    Set-Content -Path $envFile -Value $envLine -Encoding ASCII
    Write-Host "Criado frontend/.env com VITE_API_BASE_URL=$envLine" -ForegroundColor DarkGray
}
elseif (-not (Select-String -Path $envFile -Pattern "VITE_API_BASE_URL" -Quiet)) {
    Add-Content -Path $envFile -Value $envLine -Encoding ASCII
}

Write-Host ""
Write-Host "Abrindo o frontend em http://127.0.0.1:$FrontendPort" -ForegroundColor Green
Write-Host "A API roda em outra janela. Feche as duas para encerrar." -ForegroundColor DarkGray
Write-Host ""

$frontendCommand = "Set-Location '$frontend'; npm run dev -- --host 127.0.0.1 --port $FrontendPort"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendCommand

Start-Sleep -Seconds 2
Write-Host "Janelas abertas. Se a API ainda estiver iniciando, aguarde alguns segundos." -ForegroundColor Cyan
