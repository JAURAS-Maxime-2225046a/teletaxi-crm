#Requires -Version 5.1
# Build du sidecar Python pour Windows x64
# Fonctionne en local (venv) et en CI (Python système)
#
# Usage : .\build_sidecar.ps1 [--clean]
$ErrorActionPreference = "Stop"

$ScriptDir = $PSScriptRoot

Write-Host "═══════════════════════════════════════════════════════════════"
Write-Host " Build sidecar Python — TELETAXI CRM (Windows x64)"
Write-Host "═══════════════════════════════════════════════════════════════"

# ── 1. Activer le venv si disponible (dev local), sinon mode CI ───────────────
$venvPath = "$ScriptDir\..\teletaxi_import\.venv\Scripts\activate.ps1"
if (Test-Path $venvPath) {
    Write-Host "✓ Activation du venv local..."
    . $venvPath
} else {
    Write-Host "ℹ Pas de venv local détecté — mode CI (Python système)"
}
Write-Host "  Python : $(python --version)"

# ── 2. S'assurer que PyInstaller est disponible ───────────────────────────────
pip install --quiet --upgrade pyinstaller
Write-Host "✓ PyInstaller $(pyinstaller --version)"

# ── 3. Nettoyer les builds précédents ────────────────────────────────────────
if ($args -contains "--clean" -or $args -contains "-clean") {
    Write-Host "→ Nettoyage des builds précédents..."
    Remove-Item -Recurse -Force "$ScriptDir\build", "$ScriptDir\dist" -ErrorAction SilentlyContinue
}

# ── 4. Build PyInstaller (depuis le dossier du .spec) ────────────────────────
Set-Location $ScriptDir
Write-Host "→ Build PyInstaller..."
pyinstaller --clean --noconfirm teletaxi-import.spec
if ($LASTEXITCODE -ne 0) {
    Write-Error "PyInstaller a échoué (code $LASTEXITCODE)"
    exit 1
}

# ── 5. Vérifier le binaire produit ───────────────────────────────────────────
$exeName = "teletaxi-import-x86_64-pc-windows-msvc.exe"
$src = "$ScriptDir\dist\$exeName"
if (-not (Test-Path $src)) {
    Write-Error "Binaire introuvable après build : $src"
    Write-Host "Contenu de dist\ :"
    Get-ChildItem "$ScriptDir\dist" -ErrorAction SilentlyContinue | ForEach-Object { Write-Host "  $_" }
    exit 1
}

# ── 6. Copier dans src-tauri/binaries/ (convention Tauri sidecar) ─────────────
$dest = "$ScriptDir\..\src-tauri\binaries\$exeName"
New-Item -ItemType Directory -Force -Path (Split-Path $dest) | Out-Null
Copy-Item $src $dest -Force

$sizeMb = ((Get-Item $dest).Length / 1MB).ToString("F1")
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════"
Write-Host "✓ Sidecar installé : $dest ($sizeMb Mo)"
Write-Host ""
Write-Host "Test de validation :"
Write-Host "  echo '{\"id\":\"1\",\"method\":\"ping\",\"params\":{}}' | $dest"
Write-Host "═══════════════════════════════════════════════════════════════"
