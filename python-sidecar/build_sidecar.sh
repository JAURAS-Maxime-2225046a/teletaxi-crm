#!/usr/bin/env bash
# Build du sidecar Python pour Mac (arm64 ou x86_64)
# Usage : bash build_sidecar.sh [--clean]
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "${SCRIPT_DIR}"

echo "═══════════════════════════════════════════════════════════════"
echo " Build sidecar Python — TELETAXI CRM"
echo "═══════════════════════════════════════════════════════════════"

# 1. Activer le venv de teletaxi_import
PYTHON_VENV="${SCRIPT_DIR}/../../teletaxi_import/.venv"
if [ ! -d "${PYTHON_VENV}" ]; then
    echo "✗ Venv introuvable : ${PYTHON_VENV}"
    echo "  Crée-le avec : cd ../../teletaxi_import && python3.12 -m venv .venv && pip install -r requirements.txt"
    exit 1
fi
source "${PYTHON_VENV}/bin/activate"
echo "✓ Venv activé : $(python3 --version)"

# 2. S'assurer que PyInstaller est dans le venv
pip install --quiet --upgrade pyinstaller
echo "✓ PyInstaller : $(pyinstaller --version)"

# 3. Nettoyer les builds précédents si --clean
if [[ "${1:-}" == "--clean" ]]; then
    echo "→ Nettoyage des builds précédents..."
    rm -rf build/ dist/
fi

# 4. Lancer PyInstaller
echo "→ Build PyInstaller..."
pyinstaller --clean --noconfirm teletaxi-import.spec 2>&1

# 5. Identifier l'architecture et le binaire produit
ARCH=$(uname -m)
if [ "${ARCH}" = "arm64" ]; then
    TARGET="aarch64-apple-darwin"
else
    TARGET="x86_64-apple-darwin"
fi
EXE_NAME="teletaxi-import-${TARGET}"
SRC="${SCRIPT_DIR}/dist/${EXE_NAME}"

if [ ! -f "${SRC}" ]; then
    echo "✗ Binaire introuvable après build : ${SRC}"
    echo "  Vérifier les logs PyInstaller ci-dessus."
    exit 1
fi

echo "✓ Binaire produit : ${SRC} ($(du -sh "${SRC}" | cut -f1))"

# 6. Copier dans src-tauri/binaries/ (convention Tauri sidecar)
TAURI_BINARIES="${SCRIPT_DIR}/../src-tauri/binaries"
mkdir -p "${TAURI_BINARIES}"
cp "${SRC}" "${TAURI_BINARIES}/${EXE_NAME}"
chmod +x "${TAURI_BINARIES}/${EXE_NAME}"

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "✓ Sidecar installé : ${TAURI_BINARIES}/${EXE_NAME}"
echo ""
echo "Test de validation :"
echo "  echo '{\"id\":\"1\",\"method\":\"ping\",\"params\":{}}' | ${TAURI_BINARIES}/${EXE_NAME}"
echo "═══════════════════════════════════════════════════════════════"
