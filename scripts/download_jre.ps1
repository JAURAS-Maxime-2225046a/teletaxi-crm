#Requires -Version 5.1
# Télécharge Eclipse Temurin 17 JRE pour Windows x64
# Usage : .\scripts\download_jre.ps1
$ErrorActionPreference = "Stop"

$ScriptDir  = $PSScriptRoot
$DestDir    = "$ScriptDir\..\src-tauri\resources\jre\win-x86_64"

$TemurinVersion    = "17.0.13+11"
$TemurinVersionUrl = "17.0.13_11"

# ── Vérifier si déjà présent ─────────────────────────────────────────────────
if (Test-Path "$DestDir\bin\java.exe") {
    $sizeMb = ((Get-ChildItem $DestDir -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB).ToString("F0")
    Write-Host "✓ JRE Windows déjà présent : $DestDir ($sizeMb Mo)"
    exit 0
}

Write-Host "═══════════════════════════════════════════════════════════════"
Write-Host " Téléchargement JRE Temurin $TemurinVersion (Windows x64)"
Write-Host "═══════════════════════════════════════════════════════════════"

$encodedVersion = [System.Uri]::EscapeDataString($TemurinVersion)
$url = "https://github.com/adoptium/temurin17-binaries/releases/download/jdk-$encodedVersion/OpenJDK17U-jre_x64_windows_hotspot_${TemurinVersionUrl}.zip"

# ── Téléchargement ───────────────────────────────────────────────────────────
$tmpZip     = "$env:TEMP\jre-teletaxi-windows.zip"
$tmpExtract = "$env:TEMP\jre-teletaxi-extract"

Write-Host "→ URL : $url"
Write-Host "→ Téléchargement..."
Invoke-WebRequest -Uri $url -OutFile $tmpZip -UseBasicParsing

# ── Extraction ───────────────────────────────────────────────────────────────
Write-Host "→ Extraction..."
Remove-Item -Recurse -Force $tmpExtract -ErrorAction SilentlyContinue
Expand-Archive -Path $tmpZip -DestinationPath $tmpExtract -Force

# Temurin Windows : le zip contient un dossier racine jdk-17.0.13+11-jre\
$innerDir = Get-ChildItem $tmpExtract -Directory | Select-Object -First 1
if (-not $innerDir) {
    Write-Error "Structure d'archive inattendue — aucun sous-dossier trouvé dans $tmpExtract"
    exit 1
}

# ── Déplacement vers la destination finale ────────────────────────────────────
New-Item -ItemType Directory -Force -Path $DestDir | Out-Null
# Move-Item ne fonctionne pas bien entre volumes temporaires ; on copie puis supprime
Copy-Item -Path "$($innerDir.FullName)\*" -Destination $DestDir -Recurse -Force

# ── Vérification ─────────────────────────────────────────────────────────────
if (-not (Test-Path "$DestDir\bin\java.exe")) {
    Write-Error "java.exe introuvable après extraction dans $DestDir\bin\"
    exit 1
}

# ── Nettoyage ────────────────────────────────────────────────────────────────
Remove-Item -Recurse -Force $tmpZip, $tmpExtract -ErrorAction SilentlyContinue

$sizeMb = ((Get-ChildItem $DestDir -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB).ToString("F0")
Write-Host ""
Write-Host "✓ JRE Windows prêt : $DestDir ($sizeMb Mo)"
Write-Host "  JAVA_HOME sera défini sur ce chemin par Tauri au runtime."
