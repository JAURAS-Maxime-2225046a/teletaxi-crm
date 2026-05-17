# -*- mode: python ; coding: utf-8 -*-
"""
Spec PyInstaller pour le sidecar TELETAXI CRM.

Ce spec bundle en un seul exécutable autonome :
  - Python 3.12 + toutes ses dépendances
  - Le package teletaxi_import
  - Le JAR UCanAccess (dans lib/)

Le JRE Temurin est embarqué séparément via Tauri resources (Phase 5 du SPEC).
"""

import platform
import sys
from pathlib import Path

# ─── Chemins ─────────────────────────────────────────────────────────────────

# SPECPATH = dossier du fichier .spec (python-sidecar/)
PROJECT_ROOT = Path(SPECPATH).parent                       # teletaxi-crm/
TELETAXI_REPO = PROJECT_ROOT.parent / "teletaxi_import"   # TeleTaxi/teletaxi_import/
TELETAXI_PKG = TELETAXI_REPO / "teletaxi_import"          # le package Python
UCANACCESS_JAR = TELETAXI_REPO / "lib" / "ucanaccess-5.1.5-uber.jar"

assert TELETAXI_PKG.is_dir(), f"Package introuvable : {TELETAXI_PKG}"
assert UCANACCESS_JAR.is_file(), f"JAR introuvable : {UCANACCESS_JAR}"

# ─── Nom du binaire (convention Tauri sidecar) ────────────────────────────────

if sys.platform == "darwin":
    _arch = "aarch64" if platform.machine() == "arm64" else "x86_64"
    EXE_NAME = f"teletaxi-import-{_arch}-apple-darwin"
elif sys.platform == "win32":
    EXE_NAME = "teletaxi-import-x86_64-pc-windows-msvc"
else:
    EXE_NAME = "teletaxi-import-x86_64-unknown-linux-gnu"

# ─── Analyse ─────────────────────────────────────────────────────────────────

a = Analysis(
    ["sidecar_main.py"],
    # pathex : ajoute le repo teletaxi_import au sys.path pour l'analyse statique
    pathex=[str(TELETAXI_REPO)],
    binaries=[],
    datas=[
        # JAR bundlé dans lib/ — accessible via sys._MEIPASS/lib/
        (str(UCANACCESS_JAR), "lib"),
    ],
    hiddenimports=[
        # Imports dynamiques de jaydebeapi/jpype (non détectés par analyse statique)
        "jaydebeapi",
        "jpype",
        "jpype._jvmfinder",
        "jpype._core",
        "jpype.imports",
        # Pydantic v2 : pydantic_core est en C, non détecté automatiquement
        "pydantic",
        "pydantic_core",
        "pydantic.v1",
        # openpyxl (pour excel.preview)
        "openpyxl",
        "openpyxl.styles",
        "openpyxl.utils",
        # Package teletaxi_import — tous les sous-modules
        "teletaxi_import",
        "teletaxi_import.config",
        "teletaxi_import.exceptions",
        "teletaxi_import.logger",
        "teletaxi_import.database",
        "teletaxi_import.database.connection",
        "teletaxi_import.database.reader",
        "teletaxi_import.database.writer",
        "teletaxi_import.excel",
        "teletaxi_import.excel.reader",
        "teletaxi_import.excel.sheets",
        "teletaxi_import.models",
        "teletaxi_import.models.beneficiaire",
        "teletaxi_import.models.cache",
        "teletaxi_import.models.course",
        "teletaxi_import.models.prescripteur",
        "teletaxi_import.services",
        "teletaxi_import.services.import_service",
        "teletaxi_import.services.report",
        "teletaxi_import.services.validator",
        "teletaxi_import.utils",
        "teletaxi_import.utils.converters",
        "teletaxi_import.utils.sql_helpers",
    ],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[
        "tkinter",
        "matplotlib",
        "pytest",
        "coverage",
        "mypy",
        "ruff",
        "_pytest",
        "numpy",
        "pandas",
    ],
    noarchive=False,
    optimize=0,
)

pyz = PYZ(a.pure)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.datas,
    [],
    name=EXE_NAME,
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=False,      # UPX incompatible avec Tauri et fragile sur Mac ARM
    runtime_tmpdir=None,
    console=True,   # mode console : stdin/stdout fonctionnent correctement
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
)
