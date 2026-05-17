#!/usr/bin/env bash
# Build complet TELETAXI CRM pour macOS — produit un .dmg
#
# Usage :
#   bash scripts/build_all_mac.sh              # build arm64 natif
#   bash scripts/build_all_mac.sh --universal  # build universal (arm64 + x86_64)
#
# Prérequis :
#   - Rust (rustup) installé
#   - pnpm installé
#   - Le venv teletaxi_import configuré (../../teletaxi_import/.venv)
#   - Pour --universal : sidecar x86_64 déjà buildé (voir note ci-dessous)
#
# Build sidecar x86_64 sur Apple Silicon (Rosetta) :
#   arch -x86_64 bash python-sidecar/build_sidecar.sh
#   (nécessite Python x86_64 installé via `arch -x86_64 brew install python`)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="${SCRIPT_DIR}/.."
BINARIES_DIR="${PROJECT_ROOT}/src-tauri/binaries"
JRE_DIR="${PROJECT_ROOT}/src-tauri/resources/jre"

UNIVERSAL=false
SKIP_JRE=false
for arg in "$@"; do
    case "${arg}" in
        --universal) UNIVERSAL=true ;;
        --skip-jre)  SKIP_JRE=true ;;
    esac
done

CURRENT_ARCH=$(uname -m)
if [ "${CURRENT_ARCH}" = "arm64" ]; then
    NATIVE_TRIPLE="aarch64-apple-darwin"
else
    NATIVE_TRIPLE="x86_64-apple-darwin"
fi

# ─── Couleurs ─────────────────────────────────────────────────────────────────
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

ok()   { echo -e "  ${GREEN}✓${NC} $*"; }
warn() { echo -e "  ${YELLOW}⚠${NC} $*"; }
fail() { echo -e "  ${RED}✗${NC} $*"; exit 1; }

# ═══════════════════════════════════════════════════════════════════════════════
echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║         TELETAXI CRM — Build Mac (.dmg)                      ║"
if $UNIVERSAL; then
echo "║         Mode : universal binary (arm64 + x86_64)             ║"
else
echo "║         Mode : natif (${NATIVE_TRIPLE})           ║"
fi
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# ─── Étape 1 : Rust targets ───────────────────────────────────────────────────
echo "── [1/5] Rust targets"
rustup target add aarch64-apple-darwin 2>&1 | grep -v "^info:" || true
ok "aarch64-apple-darwin"
if $UNIVERSAL; then
    rustup target add x86_64-apple-darwin 2>&1 | grep -v "^info:" || true
    ok "x86_64-apple-darwin"
fi

# ─── Étape 2 : Sidecar Python ─────────────────────────────────────────────────
echo ""
echo "── [2/5] Sidecar Python"

NATIVE_BIN="${BINARIES_DIR}/teletaxi-import-${NATIVE_TRIPLE}"
if [ ! -f "${NATIVE_BIN}" ]; then
    echo "  → Build sidecar ${NATIVE_TRIPLE}..."
    cd "${PROJECT_ROOT}/python-sidecar"
    bash build_sidecar.sh
    cd "${PROJECT_ROOT}"
fi
ok "teletaxi-import-${NATIVE_TRIPLE} ($(du -sh "${NATIVE_BIN}" | cut -f1))"

if $UNIVERSAL; then
    if [ "${CURRENT_ARCH}" = "arm64" ]; then
        X86_BIN="${BINARIES_DIR}/teletaxi-import-x86_64-apple-darwin"
        if [ ! -f "${X86_BIN}" ]; then
            warn "Sidecar x86_64 manquant → passage en mode natif arm64 uniquement."
            warn "Pour builder x86_64 (Rosetta) :"
            warn "  arch -x86_64 bash python-sidecar/build_sidecar.sh"
            UNIVERSAL=false
        else
            ok "teletaxi-import-x86_64-apple-darwin ($(du -sh "${X86_BIN}" | cut -f1))"
        fi
    fi
fi

# ─── Étape 3 : JRE Temurin ────────────────────────────────────────────────────
echo ""
echo "── [3/5] JRE Temurin 17"

if $SKIP_JRE; then
    warn "JRE ignoré (--skip-jre). L'app utilisera le Java système ou l'env JAVA_HOME."
else
    JRE_NEEDED=false
    if $UNIVERSAL; then
        [ ! -d "${JRE_DIR}/mac-aarch64" ] || [ ! -d "${JRE_DIR}/mac-x86_64" ] && JRE_NEEDED=true
    else
        if [ "${NATIVE_TRIPLE}" = "aarch64-apple-darwin" ]; then
            [ ! -d "${JRE_DIR}/mac-aarch64" ] && JRE_NEEDED=true
        else
            [ ! -d "${JRE_DIR}/mac-x86_64" ] && JRE_NEEDED=true
        fi
    fi

    if $JRE_NEEDED; then
        echo "  → JRE absent, téléchargement..."
        if $UNIVERSAL; then
            bash "${SCRIPT_DIR}/download_jre.sh" all
        elif [ "${NATIVE_TRIPLE}" = "aarch64-apple-darwin" ]; then
            bash "${SCRIPT_DIR}/download_jre.sh" arm64
        else
            bash "${SCRIPT_DIR}/download_jre.sh" x86_64
        fi
    fi

    [ -d "${JRE_DIR}/mac-aarch64" ] && ok "JRE mac-aarch64 ($(du -sh "${JRE_DIR}/mac-aarch64" | cut -f1))"
    [ -d "${JRE_DIR}/mac-x86_64"  ] && ok "JRE mac-x86_64 ($(du -sh "${JRE_DIR}/mac-x86_64" | cut -f1))"
fi

# ─── Étape 4 : Dépendances Node ───────────────────────────────────────────────
echo ""
echo "── [4/5] Dépendances Node"
cd "${PROJECT_ROOT}"
pnpm install --frozen-lockfile 2>&1 | tail -3
ok "pnpm install"

# ─── Étape 5 : Build Tauri ────────────────────────────────────────────────────
echo ""
echo "── [5/5] Build Tauri"
echo ""

if $UNIVERSAL; then
    echo "  → pnpm tauri build --target universal-apple-darwin"
    pnpm tauri build --target universal-apple-darwin
    DMG_PATTERN="${PROJECT_ROOT}/src-tauri/target/universal-apple-darwin/release/bundle/dmg/*.dmg"
else
    echo "  → pnpm tauri build"
    pnpm tauri build
    DMG_PATTERN="${PROJECT_ROOT}/src-tauri/target/release/bundle/dmg/*.dmg"
fi

# ─── Résultat ─────────────────────────────────────────────────────────────────
echo ""
DMG=$(ls ${DMG_PATTERN} 2>/dev/null | head -1)
if [ -n "${DMG}" ]; then
    SIZE=$(du -sh "${DMG}" | cut -f1)
    echo -e "${GREEN}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║  ✓ BUILD RÉUSSI                                              ║"
    echo "╠══════════════════════════════════════════════════════════════╣"
    printf "║  %-60s║\n" "Fichier : $(basename "${DMG}")"
    printf "║  %-60s║\n" "Taille  : ${SIZE}"
    printf "║  %-60s║\n" "Chemin  : ${DMG}"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"

    # Ouvrir le dossier dans Finder
    if command -v open &>/dev/null; then
        open -R "${DMG}"
    fi
else
    fail "DMG introuvable après build — vérifier les logs Tauri ci-dessus."
fi
