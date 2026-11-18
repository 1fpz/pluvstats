# PLUVSTATS - build the delivery ZIPs.
# Usage: powershell -ExecutionPolicy Bypass -File deliverables/build_zips.ps1
#
# Each ZIP carries exactly what the discipline asks for, plus at most one
# supporting item. Nothing else.
#
# Output:
#   deliverables/zips/pluvstats-python.zip       app.py, prompt.md, readme.md, tests
#   deliverables/zips/pluvstats-aplicacao.zip    frontend, backend, shared, scripts, docs
#   deliverables/zips/pluvstats-matematica.zip   model, shared config, report PDF
#   deliverables/zips/pluvstats-experience.zip   deck PDF + editable HTML
#   deliverables/zips/pluvstats-edge.zip         firmware, generated config, Wokwi files
#   deliverables/zips/pluvstats-pitch.zip        e-mail, branding, deck PDF

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$outDir = Join-Path $PSScriptRoot "zips"
$stage = Join-Path $env:TEMP ("pluvstats-zips-" + [guid]::NewGuid().ToString("N"))

function Copy-Tree {
    param(
        [Parameter(Mandatory = $true)][string]$Source,
        [Parameter(Mandatory = $true)][string]$Destination,
        [string[]]$ExcludeDirs = @(),
        [string[]]$ExcludeFiles = @()
    )

    $arguments = @($Source, $Destination, "/E")
    if ($ExcludeDirs.Count -gt 0) { $arguments += @("/XD") + $ExcludeDirs }
    if ($ExcludeFiles.Count -gt 0) { $arguments += @("/XF") + $ExcludeFiles }
    $arguments += @("/NFL", "/NDL", "/NJH", "/NJS", "/NP")

    & robocopy @arguments | Out-Null
    if ($LASTEXITCODE -ge 8) {
        throw "robocopy falhou com o codigo $LASTEXITCODE em $Source."
    }
}

function New-DeliveryZip {
    param(
        [Parameter(Mandatory = $true)][string]$Name,
        [Parameter(Mandatory = $true)][string]$StageDir
    )

    $zipPath = Join-Path $outDir $Name
    Compress-Archive -Path (Join-Path $StageDir "*") -DestinationPath $zipPath -CompressionLevel Optimal
    Write-Host "OK  $Name" -ForegroundColor Green
}

Write-Host ""
Write-Host "PLUVSTATS - gerando ZIPs de entrega" -ForegroundColor Cyan
Write-Host ""

if (Test-Path $outDir) {
    Remove-Item $outDir -Recurse -Force
}
New-Item -ItemType Directory -Path $outDir | Out-Null
New-Item -ItemType Directory -Path $stage | Out-Null

# --- 1. Python -------------------------------------------------------------
# Pedido: .py + prompt.md + readme.md em um unico ZIP. Extra: os testes.
$pythonStage = Join-Path $stage "python"
New-Item -ItemType Directory -Path $pythonStage | Out-Null
Copy-Item (Join-Path $root "python-app\app.py") $pythonStage
Copy-Item (Join-Path $root "python-app\prompt.md") $pythonStage
Copy-Item (Join-Path $root "python-app\readme.md") $pythonStage
New-Item -ItemType Directory -Path (Join-Path $pythonStage "tests") | Out-Null
Copy-Item (Join-Path $root "python-app\tests\test_app.py") (Join-Path $pythonStage "tests")

New-DeliveryZip -Name "pluvstats-python.zip" -StageDir $pythonStage

# --- 2. Aplicacao web (Front-end e Web Development) ------------------------
# Pedido: ZIP do projeto com o necessario para analisar e executar a aplicacao.
$appStage = Join-Path $stage "aplicacao"
New-Item -ItemType Directory -Path $appStage | Out-Null

Copy-Tree -Source (Join-Path $root "frontend") -Destination (Join-Path $appStage "frontend") `
    -ExcludeDirs @("node_modules", "dist", "dist-ssr", "coverage", ".vite") `
    -ExcludeFiles @("*.log")

Copy-Tree -Source (Join-Path $root "backend") -Destination (Join-Path $appStage "backend") `
    -ExcludeDirs @(".venv", "__pycache__", ".pytest_cache", "data") `
    -ExcludeFiles @("*.db", "*.db-journal", "*.sqlite", "*.sqlite3", "*.log")

Copy-Tree -Source (Join-Path $root "shared") -Destination (Join-Path $appStage "shared") `
    -ExcludeFiles @("*.log")
Copy-Tree -Source (Join-Path $root "scripts") -Destination (Join-Path $appStage "scripts") `
    -ExcludeFiles @("*.log")
Copy-Tree -Source (Join-Path $root "documentation") -Destination (Join-Path $appStage "documentation") `
    -ExcludeFiles @("*.log")

Copy-Item (Join-Path $root "README.md") $appStage
Copy-Item (Join-Path $root "AI.md") $appStage
Copy-Item (Join-Path $root "TEAM.md") $appStage
Copy-Item (Join-Path $root ".env.example") $appStage

New-DeliveryZip -Name "pluvstats-aplicacao.zip" -StageDir $appStage

# --- 3. Matematica ---------------------------------------------------------
# Pedido: .py + relatorio em PDF. Extra: a configuracao unica que o modelo le.
$mathStage = Join-Path $stage "matematica"
New-Item -ItemType Directory -Path (Join-Path $mathStage "mathematics\model") -Force | Out-Null
New-Item -ItemType Directory -Path (Join-Path $mathStage "mathematics\report") -Force | Out-Null
New-Item -ItemType Directory -Path (Join-Path $mathStage "shared") -Force | Out-Null

Copy-Item (Join-Path $root "mathematics\model\pluvstats_model.py") (Join-Path $mathStage "mathematics\model")
Copy-Item (Join-Path $root "mathematics\report\relatorio-tecnico.pdf") (Join-Path $mathStage "mathematics\report")
Copy-Item (Join-Path $root "shared\pluvstats.config.json") (Join-Path $mathStage "shared")

New-DeliveryZip -Name "pluvstats-matematica.zip" -StageDir $mathStage

# --- 4. Experience ---------------------------------------------------------
# Pedido: slides. Extra: o HTML editavel que gera o PDF.
$expStage = Join-Path $stage "experience"
New-Item -ItemType Directory -Path $expStage | Out-Null
Copy-Item (Join-Path $root "design\presentation\apresentacao.pdf") $expStage
Copy-Item (Join-Path $root "design\presentation\apresentacao.html") $expStage

New-DeliveryZip -Name "pluvstats-experience.zip" -StageDir $expStage

# --- 5. Edge ---------------------------------------------------------------
# Pedido: link do Wokwi + link do YouTube. Extra: o codigo para conferencia.
$edgeStage = Join-Path $stage "edge"
New-Item -ItemType Directory -Path (Join-Path $edgeStage "esp32\pluvstats_sensor") -Force | Out-Null
New-Item -ItemType Directory -Path (Join-Path $edgeStage "wokwi") -Force | Out-Null
New-Item -ItemType Directory -Path (Join-Path $edgeStage "shared") -Force | Out-Null

Copy-Item (Join-Path $root "edge\esp32\pluvstats_sensor\pluvstats_sensor.ino") (Join-Path $edgeStage "esp32\pluvstats_sensor")
Copy-Item (Join-Path $root "edge\esp32\pluvstats_sensor\generated_config.h") (Join-Path $edgeStage "esp32\pluvstats_sensor")
Copy-Item (Join-Path $root "edge\wokwi\diagram.json") (Join-Path $edgeStage "wokwi")
Copy-Item (Join-Path $root "edge\wokwi\wokwi.toml") (Join-Path $edgeStage "wokwi")
Copy-Item (Join-Path $root "edge\README.md") $edgeStage
Copy-Item (Join-Path $root "shared\pluvstats.config.json") (Join-Path $edgeStage "shared")

New-DeliveryZip -Name "pluvstats-edge.zip" -StageDir $edgeStage

# --- 6. Pitch --------------------------------------------------------------
# Pedido: um documento com o e-mail e o link do video. Enquanto o video nao
# existe, o ZIP leva as fontes que compoem esse documento.
$pitchStage = Join-Path $stage "pitch"
New-Item -ItemType Directory -Path $pitchStage | Out-Null
Copy-Item (Join-Path $root "pitch\email-investidor.md") $pitchStage
Copy-Item (Join-Path $root "pitch\branding.md") $pitchStage
Copy-Item (Join-Path $root "pitch\apresentacao-pitch.pdf") $pitchStage
$pitchDoc = Join-Path $root "pitch\entrega-pitch.pdf"
if (Test-Path $pitchDoc) {
    Copy-Item $pitchDoc $pitchStage
}

New-DeliveryZip -Name "pluvstats-pitch.zip" -StageDir $pitchStage

Remove-Item $stage -Recurse -Force

Write-Host ""
Get-ChildItem $outDir | Sort-Object Name | Select-Object Name, @{Name = "MB"; Expression = { [math]::Round($_.Length / 1MB, 2) } }
Write-Host ""
Write-Host "ZIPs em $outDir" -ForegroundColor Cyan
