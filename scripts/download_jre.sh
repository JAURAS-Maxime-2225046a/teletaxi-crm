#!/usr/bin/env bash
# Télécharge Eclipse Temurin 17 JRE (headless) pour Mac arm64 + x86_64
# Usage : bash scripts/download_jre.sh [arm64|x86_64|all]
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RESOURCES_DIR="${SCRIPT_DIR}/../src-tauri/resources/jre"

TEMURIN_VERSION="17.0.13+11"
TEMURIN_VERSION_URL="17.0.13_11"

ARCH_ARG="${1:-all}"

download_jre() {
    local platform="$1"
    local url="$2"
    local dest_dir="${RESOURCES_DIR}/${platform}"

    if [ -d "${dest_dir}" ] && [ -f "${dest_dir}/bin/java" ]; then
        echo "  ✓ JRE ${platform} déjà présent ($(du -sh "${dest_dir}" | cut -f1))"
        return
    fi

    echo "  → Téléchargement JRE ${platform}..."
    local tmp_archive="/tmp/jre-teletaxi-${platform}.tar.gz"
    curl -sSLfo "${tmp_archive}" "${url}" \
        --progress-bar \
        || { echo "✗ Échec téléchargement ${platform}" ; exit 1; }

    rm -rf "${dest_dir}"
    mkdir -p "${dest_dir}"

    # Temurin macOS : l'archive extrait jdk-VERSION/bin, lib, etc. à la racine
    # (Contents/Home est un symlink vers le parent — JAVA_HOME = dest_dir fonctionne)
    tar -xzf "${tmp_archive}" -C "${dest_dir}" --strip-components=1
    rm "${tmp_archive}"

    if [ ! -f "${dest_dir}/bin/java" ]; then
        # Certaines archives Temurin sur macOS ont Contents/Home comme répertoire réel
        # Dans ce cas on remonte le contenu
        if [ -f "${dest_dir}/Contents/Home/bin/java" ]; then
            echo "  → Structure macOS bundle détectée, réorganisation..."
            local tmp_home="/tmp/jre-home-$$"
            mv "${dest_dir}/Contents/Home" "${tmp_home}"
            rm -rf "${dest_dir}"
            mv "${tmp_home}" "${dest_dir}"
        else
            echo "✗ bin/java introuvable après extraction dans ${dest_dir}"
            exit 1
        fi
    fi

    echo "  ✓ JRE ${platform} prêt ($(du -sh "${dest_dir}" | cut -f1))"
}

mkdir -p "${RESOURCES_DIR}"

echo "═══════════════════════════════════════════════════════════════"
echo " Téléchargement JRE Temurin ${TEMURIN_VERSION}"
echo "═══════════════════════════════════════════════════════════════"

URL_AARCH64="https://github.com/adoptium/temurin17-binaries/releases/download/jdk-${TEMURIN_VERSION}/OpenJDK17U-jre_aarch64_mac_hotspot_${TEMURIN_VERSION_URL}.tar.gz"
URL_X86_64="https://github.com/adoptium/temurin17-binaries/releases/download/jdk-${TEMURIN_VERSION}/OpenJDK17U-jre_x64_mac_hotspot_${TEMURIN_VERSION_URL}.tar.gz"

case "${ARCH_ARG}" in
    arm64|aarch64)
        download_jre "mac-aarch64" "${URL_AARCH64}"
        ;;
    x86_64|intel)
        download_jre "mac-x86_64" "${URL_X86_64}"
        ;;
    all|*)
        download_jre "mac-aarch64" "${URL_AARCH64}"
        download_jre "mac-x86_64" "${URL_X86_64}"
        ;;
esac

echo ""
echo "✓ JRE(s) prêts dans : ${RESOURCES_DIR}"
du -sh "${RESOURCES_DIR}"/* 2>/dev/null || true
