# Spécifications techniques — TELETAXI CRM Desktop App (Tauri V1)

> **Document destiné à Claude Code** pour construire l'application desktop Tauri 2.0 multi-OS qui encapsule le module Python `teletaxi_import` validé en MVP.
>
> **Statut au démarrage** : MVP Python complet et fonctionnel. Cette phase construit l'interface graphique, la communication Tauri ↔ Python, et le packaging multi-OS.

---

## Table des matières

1. [Contexte et objectifs](#1-contexte-et-objectifs)
2. [Décisions architecturales validées](#2-décisions-architecturales-validées)
3. [Pré-requis environnement de dev](#3-pré-requis-environnement-de-dev)
4. [Structure du projet](#4-structure-du-projet)
5. [Phase 1 — Setup initial Tauri + Next.js](#5-phase-1--setup-initial-tauri--nextjs)
6. [Phase 2 — Sidecar Python (PyInstaller + JRE)](#6-phase-2--sidecar-python-pyinstaller--jre)
7. [Phase 3 — Protocole JSON Tauri ↔ Python](#7-phase-3--protocole-json-tauri--python)
8. [Phase 4 — Auth locale + SQLite](#8-phase-4--auth-locale--sqlite)
9. [Phase 5 — Frontend Next.js + shadcn/ui](#9-phase-5--frontend-nextjs--shadcnui)
10. [Phase 6 — Écrans applicatifs](#10-phase-6--écrans-applicatifs)
11. [Phase 7 — Packaging Mac (.dmg)](#11-phase-7--packaging-mac-dmg)
12. [Phase 8 — Packaging Windows (.msi)](#12-phase-8--packaging-windows-msi)
13. [Phase 9 — Code signing](#13-phase-9--code-signing)
14. [Plan d'exécution recommandé (28 jours)](#14-plan-dexécution-recommandé-28-jours)
15. [Critères d'acceptation finaux](#15-critères-dacceptation-finaux)
16. [Pièges connus et solutions](#16-pièges-connus-et-solutions)

---

## 1. Contexte et objectifs

### 1.1 Description du produit

**TELETAXI CRM** est une application desktop qui sert d'interface graphique pour automatiser l'import de données Excel dans la base Microsoft Access `data.accdb` utilisée par le logiciel métier **TELETAXI** (gestion de transports sanitaires).

Le moteur d'import (Python) existe déjà et fonctionne. Cette phase construit :
- Une **interface graphique moderne** (Linear/Notion-like)
- Une **distribution multi-OS** (Mac universal binary + Windows x64)
- Une **expérience utilisateur professionnelle** (auth locale, historique, settings)

### 1.2 Contraintes non négociables

| Contrainte | Détail |
|---|---|
| **Multi-OS** | macOS (Intel + Apple Silicon) ET Windows x64 dès la V1 |
| **RGPD** | Données médicales **strictement locales** (aucune télémétrie, aucun envoi externe) |
| **Offline-first** | L'app fonctionne sans Internet (pas de cloud) |
| **Mono-utilisateur** | Une instance = un utilisateur sur sa machine |
| **Historique local** | SQLite local, pas de synchro entre machines |
| **Sécurité .accdb** | Backup automatique avant chaque écriture |
| **Performance** | Démarrage app < 3s, premier rendu < 1s |
| **Code signing** | Mac + Windows signés pour éviter les warnings |

### 1.3 Public cible

- **Utilisateurs primaires** : taxis sanitaires utilisant TELETAXI (peu tech, doivent pouvoir installer sans aide)
- **Utilisateurs secondaires** : développeurs (toi) pour debug et évolutions
- **Volumes attendus** : 100-500 lignes Excel par import, 5-20 imports/mois/cabinet

---

## 2. Décisions architecturales validées

### 2.1 Stack technique

```
┌─────────────────────────────────────────────────────────┐
│  Frontend                                                │
│  • Next.js 14 (export static, pas de serveur)           │
│  • React 18 + TypeScript strict                          │
│  • Tailwind CSS + shadcn/ui                              │
│  • TanStack Query v5 (state serveur)                     │
│  • React Hook Form + Zod                                 │
│  • Lucide icons                                          │
└─────────────────────────────────────────────────────────┘
                          ↕ Tauri invoke()
┌─────────────────────────────────────────────────────────┐
│  Tauri Core (Rust)                                       │
│  • Tauri 2.x                                             │
│  • SQLx (SQLite local)                                   │
│  • bcrypt (hash mots de passe)                           │
│  • serde_json (sérialisation IPC)                        │
│  • tokio (async runtime)                                 │
└─────────────────────────────────────────────────────────┘
                          ↕ stdin/stdout JSON
┌─────────────────────────────────────────────────────────┐
│  Python Sidecar (PyInstaller bundle)                     │
│  • Le code teletaxi_import existant                      │
│  • + sidecar_main.py (boucle JSON-RPC)                   │
│  • + JRE Temurin 17 embarqué                             │
│  • + UCanAccess JAR                                      │
└─────────────────────────────────────────────────────────┘
```

### 2.2 Tailles attendues du bundle

| Composant | Taille |
|---|---|
| Tauri Core (Rust compilé) | ~15 Mo |
| Frontend Next.js (build static) | ~3 Mo |
| Python sidecar (PyInstaller) | ~30 Mo |
| JRE Temurin minimal | ~40 Mo |
| UCanAccess JAR | ~3 Mo |
| Resources (icônes, etc.) | ~1 Mo |
| **Total bundle Mac (.dmg)** | **~85 Mo** |
| **Total bundle Win (.msi)** | **~95 Mo** |

C'est dans la moyenne pour ce type d'app (Discord = 200 Mo, VS Code = 350 Mo).

### 2.3 Communication Tauri ↔ Python

**Choix** : JSON line-delimited sur stdin/stdout (un message = une ligne JSON).

**Justification** :
- Simple à implémenter et debugger
- Pas de problème de réseau/firewall (vs HTTP)
- Streaming naturel pour les progress bars
- Pattern recommandé par Tauri (sidecar API)
- Crash Python isolé du process Tauri principal

### 2.4 Choix bibliothèques importantes

| Lib | Version | Pourquoi |
|---|---|---|
| `tauri` | `2.x` | Stable depuis fin 2024, supporte sidecar |
| `next` | `14.2.x` | App Router, export static stable |
| `shadcn/ui` | dernière | Composants accessibles, pas de runtime |
| `@tanstack/react-query` | `5.x` | Standard de fait pour state serveur |
| `zod` | `3.x` | Validation runtime + inférence TS |
| `sqlx` | `0.8.x` | SQLite async + compile-time check Rust |
| `bcrypt` | `0.15.x` | Hash mot de passe standard |

---

## 3. Pré-requis environnement de dev

### 3.1 À installer sur la machine de dev (Mac)

```bash
# 1. Rust (via rustup)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
# Recharger le shell ou: source $HOME/.cargo/env

# 2. Xcode Command Line Tools
xcode-select --install

# 3. Node.js 20+
brew install node@20

# 4. pnpm (recommandé, plus rapide que npm)
brew install pnpm

# 5. PyInstaller (pour bundler le sidecar)
pip install pyinstaller --break-system-packages

# 6. Tauri CLI 2.x
cargo install tauri-cli --version "^2.0"

# 7. Vérifications
rustc --version    # ≥ 1.80
node --version     # ≥ 20.0
pnpm --version     # ≥ 9.0
cargo tauri --version  # ≥ 2.0
pyinstaller --version  # ≥ 6.0
```

### 3.2 Pour cross-compiler vers Windows depuis Mac

**Important** : la compilation cross-OS vers Windows depuis Mac est **complexe et fragile**. Recommandation :
- **Développer + builder Mac sur Mac** (toi)
- **Builder Windows via GitHub Actions** (CI/CD, plus fiable)

Voir [Phase 8](#12-phase-8--packaging-windows-msi) pour le détail.

---

## 4. Structure du projet

### 4.1 Layout cible

Créer un **nouveau dépôt** séparé du repo `teletaxi_import` :

```
teletaxi-crm/                            ← Nouveau dépôt Git
│
├── src-tauri/                           ← Code Rust Tauri
│   ├── src/
│   │   ├── main.rs                      # Entry point
│   │   ├── lib.rs                       # Module principal
│   │   ├── error.rs                     # Errors custom
│   │   ├── state.rs                     # AppState global
│   │   ├── db/
│   │   │   ├── mod.rs
│   │   │   ├── connection.rs            # Pool SQLite
│   │   │   ├── migrations.rs            # Schéma + migrations
│   │   │   └── queries.rs               # Queries CRUD
│   │   ├── commands/                    # Commandes invoke()
│   │   │   ├── mod.rs
│   │   │   ├── auth.rs                  # signup, login, logout
│   │   │   ├── config.rs                # set_accdb_path, get_config
│   │   │   ├── import.rs                # run_import (sidecar)
│   │   │   ├── history.rs               # list_imports, get_import
│   │   │   └── files.rs                 # open_file_dialog, etc.
│   │   ├── sidecar/
│   │   │   ├── mod.rs
│   │   │   ├── process.rs               # Spawn Python sidecar
│   │   │   ├── protocol.rs              # JSON-RPC types
│   │   │   └── handler.rs               # Lecture stdout streaming
│   │   └── crypto.rs                    # bcrypt wrapper
│   ├── binaries/                        # Sidecars compilés (PyInstaller)
│   │   ├── teletaxi-import-x86_64-apple-darwin
│   │   ├── teletaxi-import-aarch64-apple-darwin
│   │   └── teletaxi-import-x86_64-pc-windows-msvc.exe
│   ├── resources/                       # Ressources embarquées
│   │   └── jre/                         # JRE Temurin par OS
│   │       ├── mac-x86_64/
│   │       ├── mac-aarch64/
│   │       └── win-x86_64/
│   ├── icons/                           # Icônes app (générées par tauri icon)
│   ├── tauri.conf.json                  # Config Tauri
│   ├── Cargo.toml                       # Dépendances Rust
│   ├── build.rs                         # Script de build
│   └── .gitignore
│
├── src/                                 # Frontend Next.js 14
│   ├── app/                             # App Router
│   │   ├── layout.tsx                   # Layout racine avec sidebar
│   │   ├── page.tsx                     # Dashboard (redirect ou affichage)
│   │   ├── globals.css                  # Tailwind + variables
│   │   ├── auth/
│   │   │   ├── login/page.tsx
│   │   │   └── signup/page.tsx
│   │   ├── database/page.tsx            # Config .accdb
│   │   ├── import/page.tsx              # Upload + preview + run
│   │   ├── history/page.tsx             # Historique
│   │   └── settings/page.tsx            # Réglages
│   ├── components/
│   │   ├── ui/                          # shadcn/ui (Button, Card, etc.)
│   │   ├── layout/
│   │   │   ├── sidebar.tsx
│   │   │   ├── header.tsx
│   │   │   └── route-guard.tsx          # Redirige si non auth
│   │   ├── auth/
│   │   │   ├── login-form.tsx
│   │   │   └── signup-form.tsx
│   │   ├── database/
│   │   │   ├── connection-card.tsx
│   │   │   └── status-badge.tsx
│   │   ├── import/
│   │   │   ├── file-dropzone.tsx
│   │   │   ├── excel-preview.tsx
│   │   │   ├── progress-panel.tsx       # Progress bar streaming
│   │   │   ├── error-panel.tsx
│   │   │   └── report-summary.tsx
│   │   ├── history/
│   │   │   ├── history-list.tsx
│   │   │   ├── history-detail-drawer.tsx
│   │   │   └── console-log.tsx
│   │   └── shared/
│   │       ├── empty-state.tsx
│   │       └── confirm-dialog.tsx
│   ├── lib/
│   │   ├── tauri.ts                     # Wrappers invoke() typés
│   │   ├── types.ts                     # Types partagés app
│   │   ├── schemas.ts                   # Zod schemas
│   │   ├── utils.ts                     # cn() + helpers
│   │   └── constants.ts
│   ├── hooks/
│   │   ├── use-auth.ts
│   │   ├── use-config.ts
│   │   ├── use-import.ts                # Hook pour run + streaming
│   │   ├── use-history.ts
│   │   └── use-theme.ts
│   └── styles/
│       └── tokens.css                   # Design tokens
│
├── python-sidecar/                      # Wrapper PyInstaller
│   ├── sidecar_main.py                  # Entry point JSON stdin/stdout
│   ├── teletaxi-import.spec             # Config PyInstaller
│   ├── build_sidecar.sh                 # Script de build Mac
│   ├── build_sidecar.ps1                # Script de build Windows
│   ├── requirements.txt                 # Dépendances pinned
│   └── README.md
│
├── scripts/
│   ├── download_jre.sh                  # Récupère Temurin JRE Mac
│   ├── download_jre.ps1                 # Récupère Temurin JRE Win
│   ├── prepare_resources.sh             # Prépare resources/ avant build
│   ├── build_all_mac.sh                 # Build complet Mac (.dmg)
│   └── build_all_win.ps1                # Build complet Windows (.msi)
│
├── docs/
│   ├── ARCHITECTURE.md
│   ├── PROTOCOL.md                      # Spec détaillée JSON-RPC
│   ├── BUILD.md                         # Comment builder
│   ├── DEPLOY.md                        # Comment distribuer
│   └── DEVELOPMENT.md                   # Setup dev local
│
├── .github/
│   └── workflows/
│       ├── ci.yml                       # Tests + lint
│       ├── build-mac.yml                # Build Mac (universal)
│       └── build-windows.yml            # Build Windows
│
├── package.json                         # Frontend deps
├── pnpm-lock.yaml
├── next.config.mjs
├── tailwind.config.ts
├── postcss.config.mjs
├── tsconfig.json
├── components.json                      # shadcn/ui config
├── .gitignore
├── README.md
└── LICENSE
```

### 4.2 .gitignore

```gitignore
# Node
node_modules/
.next/
out/
*.log

# Rust
src-tauri/target/
src-tauri/Cargo.lock

# Python
__pycache__/
*.pyc
.venv/
dist/
build/
*.egg-info/

# Tauri
src-tauri/binaries/
src-tauri/resources/jre/

# OS
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/

# Build artefacts
*.dmg
*.msi
*.app

# Secrets
.env
.env.local
*.p12
*.cer
```

---

## 5. Phase 1 — Setup initial Tauri + Next.js

### 5.1 Création du projet

```bash
# 1. Créer le dépôt
mkdir teletaxi-crm && cd teletaxi-crm
git init
git branch -m main

# 2. Initialiser Next.js avec TypeScript
pnpm create next-app@14 . \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*" \
  --use-pnpm

# 3. Initialiser Tauri 2.x (depuis le dossier teletaxi-crm)
pnpm create tauri-app@latest --template react-ts --manager pnpm
# Lors du prompt : choisir "Use existing frontend"
# App name: TELETAXI CRM
# Window title: TELETAXI CRM
# Web assets location: ../out
# Dev server URL: http://localhost:3000
# Frontend dev command: pnpm dev
# Frontend build command: pnpm build && pnpm export
```

### 5.2 Configuration Next.js pour export static

`next.config.mjs` :

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: { unoptimized: true },
  // Tauri n'a pas de serveur Node : tout doit être statique
  trailingSlash: true,
  // Désactive le check de devtools React (warning Tauri sinon)
  reactStrictMode: true,
};

export default nextConfig;
```

### 5.3 Configuration Tauri

`src-tauri/tauri.conf.json` :

```json
{
  "$schema": "../node_modules/@tauri-apps/cli/schema.json",
  "productName": "TELETAXI CRM",
  "version": "0.1.0",
  "identifier": "fr.maxime.teletaxi-crm",
  "build": {
    "frontendDist": "../out",
    "devUrl": "http://localhost:3000",
    "beforeDevCommand": "pnpm dev",
    "beforeBuildCommand": "pnpm build"
  },
  "app": {
    "windows": [
      {
        "title": "TELETAXI CRM",
        "width": 1280,
        "height": 800,
        "minWidth": 900,
        "minHeight": 600,
        "resizable": true,
        "fullscreen": false,
        "decorations": true,
        "transparent": false,
        "center": true
      }
    ],
    "security": {
      "csp": "default-src 'self'; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-eval'"
    }
  },
  "bundle": {
    "active": true,
    "targets": ["dmg", "msi"],
    "icon": [
      "icons/32x32.png",
      "icons/128x128.png",
      "icons/128x128@2x.png",
      "icons/icon.icns",
      "icons/icon.ico"
    ],
    "category": "Business",
    "shortDescription": "Import Excel vers TELETAXI",
    "longDescription": "Outil d'import automatisé de fichiers Excel vers la base de données TELETAXI (data.accdb). Multi-OS, RGPD-compliant.",
    "copyright": "© 2026 Maxime Jauras",
    "externalBin": [
      "binaries/teletaxi-import"
    ],
    "resources": [
      "resources/**/*"
    ],
    "macOS": {
      "minimumSystemVersion": "11.0",
      "frameworks": [],
      "providerShortName": null,
      "signingIdentity": null,
      "entitlements": "entitlements.plist"
    },
    "windows": {
      "wix": {
        "language": ["fr-FR", "en-US"]
      }
    }
  }
}
```

### 5.4 Dépendances Rust à ajouter (Cargo.toml)

```toml
[package]
name = "teletaxi-crm"
version = "0.1.0"
edition = "2021"

[build-dependencies]
tauri-build = { version = "2.0", features = [] }

[dependencies]
tauri = { version = "2.0", features = ["protocol-asset"] }
tauri-plugin-shell = "2.0"
tauri-plugin-fs = "2.0"
tauri-plugin-dialog = "2.0"
tauri-plugin-process = "2.0"
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
tokio = { version = "1.40", features = ["full"] }
sqlx = { version = "0.8", features = ["sqlite", "runtime-tokio-rustls", "macros", "chrono"] }
bcrypt = "0.15"
chrono = { version = "0.4", features = ["serde"] }
thiserror = "1.0"
anyhow = "1.0"
tracing = "0.1"
tracing-subscriber = "0.3"
uuid = { version = "1.10", features = ["v4", "serde"] }

[features]
default = ["custom-protocol"]
custom-protocol = ["tauri/custom-protocol"]
```

### 5.5 Dépendances Frontend à ajouter (package.json)

```json
{
  "dependencies": {
    "@tanstack/react-query": "^5.59.0",
    "@hookform/resolvers": "^3.9.0",
    "react-hook-form": "^7.53.0",
    "zod": "^3.23.0",
    "@tauri-apps/api": "^2.0.0",
    "@tauri-apps/plugin-dialog": "^2.0.0",
    "@tauri-apps/plugin-fs": "^2.0.0",
    "@tauri-apps/plugin-shell": "^2.0.0",
    "lucide-react": "^0.460.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.5.0",
    "tailwindcss-animate": "^1.0.7",
    "sonner": "^1.5.0",
    "date-fns": "^4.1.0"
  },
  "devDependencies": {
    "@types/node": "^22",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "@tauri-apps/cli": "^2.0.0",
    "typescript": "^5.5"
  }
}
```

### 5.6 Setup shadcn/ui

```bash
pnpm dlx shadcn@latest init
# Choisir :
# - Style: Default
# - Base color: Slate
# - CSS variables: Yes

# Installer les composants nécessaires
pnpm dlx shadcn@latest add button card input label \
  dialog dropdown-menu form select toast \
  table progress badge alert tabs \
  separator scroll-area sheet skeleton
```

### 5.7 Validation Phase 1

À ce stade, on doit pouvoir lancer :

```bash
pnpm tauri dev
```

Et voir une **fenêtre native** avec le Next.js de base affiché. Pas encore notre design, juste la preuve que tout est branché.

**Critère d'acceptation Phase 1** :
- ✅ `pnpm tauri dev` ouvre une fenêtre Tauri
- ✅ Hot reload fonctionne (modifier un .tsx recharge l'UI)
- ✅ shadcn/ui import fonctionne : `<Button>Test</Button>` s'affiche stylisé
- ✅ Pas d'erreur dans la console DevTools

---

## 6. Phase 2 — Sidecar Python (PyInstaller + JRE)

### 6.1 Objectif

Bundler le code `teletaxi_import` existant en un **exécutable autonome** par OS qui :
- Embarque Python 3.11+ et toutes ses dépendances
- Embarque les JARs UCanAccess
- Accepte des commandes JSON sur stdin
- Émet des événements JSON sur stdout

### 6.2 Création du wrapper sidecar

`python-sidecar/sidecar_main.py` :

```python
"""
Point d'entrée du sidecar Python pour TELETAXI CRM.

Lit des messages JSON sur stdin, exécute les méthodes correspondantes,
et émet des réponses/événements JSON sur stdout.

Protocole : voir docs/PROTOCOL.md
"""

from __future__ import annotations

import json
import sys
import traceback
from pathlib import Path
from typing import Any

# Ajoute le package teletaxi_import au PYTHONPATH (PyInstaller le copie ici)
sys.path.insert(0, str(Path(__file__).parent))

from teletaxi_import.config import AppConfig
from teletaxi_import.services.import_service import ImportService
from teletaxi_import.logger import setup_logger


# ─── Helpers I/O ─────────────────────────────────────────────────────────────


def write_message(msg: dict[str, Any]) -> None:
    """Émet un message JSON sur stdout (line-delimited)."""
    sys.stdout.write(json.dumps(msg, ensure_ascii=False, default=str) + "\n")
    sys.stdout.flush()


def write_error(request_id: str, code: str, message: str, details: str = "") -> None:
    write_message({
        "id": request_id,
        "type": "error",
        "code": code,
        "message": message,
        "details": details,
    })


def write_progress(
    request_id: str,
    phase: str,
    current: int = 0,
    total: int = 0,
    message: str = "",
) -> None:
    write_message({
        "id": request_id,
        "type": "progress",
        "phase": phase,
        "current": current,
        "total": total,
        "message": message,
    })


# ─── Méthodes JSON-RPC ───────────────────────────────────────────────────────


def handle_ping(request_id: str, params: dict) -> None:
    """Sanity check : Tauri vérifie que le sidecar répond."""
    write_message({
        "id": request_id,
        "type": "result",
        "data": {
            "status": "ok",
            "version": "0.1.0",
            "python": sys.version,
        }
    })


def handle_test_connection(request_id: str, params: dict) -> None:
    """Teste la connexion à une base Access."""
    from teletaxi_import.database.connection import AccessConnection

    accdb_path = params.get("accdb_path")
    if not accdb_path:
        write_error(request_id, "MISSING_PARAM", "accdb_path requis")
        return

    try:
        config = AppConfig.from_env(accdb_path=accdb_path, excel_path="/tmp/dummy")
        with AccessConnection(config, read_only=True) as conn:
            tables = conn.list_tables()
            counts = {}
            for table in ["PRESCRIPTEUR", "PATIENT", "TRANSPORT"]:
                if table in tables:
                    result = conn.fetch_one(f"SELECT COUNT(*) AS nb FROM [{table}]")
                    counts[table] = next(iter(result.values()), 0) if result else 0

        write_message({
            "id": request_id,
            "type": "result",
            "data": {
                "connected": True,
                "tables_count": len(tables),
                "counts": counts,
            }
        })
    except Exception as e:
        write_error(request_id, "CONNECTION_FAILED", str(e), traceback.format_exc())


def handle_run_import(request_id: str, params: dict) -> None:
    """Lance un import complet avec streaming des événements."""
    excel_path = params.get("excel_path")
    accdb_path = params.get("accdb_path")
    backup_enabled = params.get("backup_enabled", True)
    dry_run = params.get("dry_run", False)

    if not excel_path or not accdb_path:
        write_error(request_id, "MISSING_PARAM", "excel_path et accdb_path requis")
        return

    try:
        config = AppConfig.from_env(
            excel_path=excel_path,
            accdb_path=accdb_path,
            backup_enabled=backup_enabled,
        )
        setup_logger(config.log_dir)

        write_progress(request_id, "starting", message="Démarrage de l'import")

        # NOTE : ImportService devra être adapté pour émettre des callbacks
        # à chaque ligne traitée. Cf. section 7.4 du présent doc.
        service = ImportService(config)
        # service.on_progress = lambda p: write_progress(request_id, ...)
        report = service.run()

        write_message({
            "id": request_id,
            "type": "result",
            "data": {
                "report": {
                    "prescripteurs": {
                        "inseres": report.prescripteurs.inseres,
                        "ignores": report.prescripteurs.ignores,
                        "erreurs": report.prescripteurs.erreurs,
                    },
                    "beneficiaires": {
                        "inseres": report.beneficiaires.inseres,
                        "ignores": report.beneficiaires.ignores,
                        "erreurs": report.beneficiaires.erreurs,
                    },
                    "courses": {
                        "inseres": report.courses.inseres,
                        "ignores": report.courses.ignores,
                        "erreurs": report.courses.erreurs,
                    },
                    "total_inseres": report.total_inseres,
                    "total_erreurs": report.total_erreurs,
                }
            }
        })

    except Exception as e:
        write_error(request_id, "IMPORT_FAILED", str(e), traceback.format_exc())


# ─── Boucle principale ───────────────────────────────────────────────────────


HANDLERS = {
    "ping": handle_ping,
    "test_connection": handle_test_connection,
    "import.run": handle_run_import,
}


def main() -> int:
    """Boucle principale : lit ligne par ligne depuis stdin, dispatch."""
    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue

        try:
            msg = json.loads(line)
        except json.JSONDecodeError as e:
            write_error("unknown", "INVALID_JSON", f"JSON invalide : {e}")
            continue

        request_id = msg.get("id", "unknown")
        method = msg.get("method")
        params = msg.get("params", {})

        if method not in HANDLERS:
            write_error(request_id, "UNKNOWN_METHOD", f"Méthode inconnue : {method}")
            continue

        try:
            HANDLERS[method](request_id, params)
        except Exception as e:
            write_error(request_id, "INTERNAL_ERROR", str(e), traceback.format_exc())

    return 0


if __name__ == "__main__":
    sys.exit(main())
```

### 6.3 Configuration PyInstaller

`python-sidecar/teletaxi-import.spec` :

```python
# -*- mode: python ; coding: utf-8 -*-
"""
Spec PyInstaller pour bundler le sidecar TELETAXI.

Génère un exécutable autonome qui inclut :
- Python interpreter
- Toutes les dépendances pip (openpyxl, pydantic, jaydebeapi, JPype1, ...)
- Le code teletaxi_import
- Le JAR UCanAccess (placé à côté de l'exe)

Le JRE est embarqué séparément via Tauri resources (pas par PyInstaller),
pour pouvoir partager une JVM entre les plateformes.
"""

import sys
from pathlib import Path

# Ajuste selon l'arbo locale
PROJECT_ROOT = Path(SPECPATH).parent
TELETAXI_IMPORT = PROJECT_ROOT.parent / "teletaxi_import" / "teletaxi_import"  # le package
UCANACCESS_JAR = PROJECT_ROOT.parent / "teletaxi_import" / "lib" / "ucanaccess-5.1.5-uber.jar"

block_cipher = None

a = Analysis(
    ["sidecar_main.py"],
    pathex=[str(PROJECT_ROOT.parent / "teletaxi_import")],
    binaries=[],
    datas=[
        (str(UCANACCESS_JAR), "lib"),
        (str(TELETAXI_IMPORT), "teletaxi_import"),
    ],
    hiddenimports=[
        "jaydebeapi",
        "jpype",
        "openpyxl",
        "pydantic",
        "pydantic_core",
    ],
    hookspath=[],
    runtime_hooks=[],
    excludes=["tkinter", "matplotlib", "pytest"],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)

pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

# Nom de l'exe selon la plateforme cible (Tauri sidecar convention)
if sys.platform == "darwin":
    import platform
    arch = "aarch64" if platform.machine() == "arm64" else "x86_64"
    exe_name = f"teletaxi-import-{arch}-apple-darwin"
elif sys.platform == "win32":
    exe_name = "teletaxi-import-x86_64-pc-windows-msvc.exe"
else:
    exe_name = "teletaxi-import-x86_64-unknown-linux-gnu"

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.zipfiles,
    a.datas,
    [],
    name=exe_name,
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=False,  # UPX pose problème avec Tauri
    runtime_tmpdir=None,
    console=True,  # Console pour debug, à passer à False en prod
    disable_windowed_traceback=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
)
```

### 6.4 Build script Mac

`python-sidecar/build_sidecar.sh` :

```bash
#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "${SCRIPT_DIR}"

echo "═══════════════════════════════════════════════════════════════"
echo " Build sidecar Python pour Mac"
echo "═══════════════════════════════════════════════════════════════"

# 1. Activer le venv du projet teletaxi_import
PYTHON_VENV="${SCRIPT_DIR}/../teletaxi_import/.venv"
if [ ! -d "${PYTHON_VENV}" ]; then
    echo "✗ Venv introuvable : ${PYTHON_VENV}"
    echo "  Crée-le avec : cd ../teletaxi_import && python3 -m venv .venv"
    exit 1
fi
source "${PYTHON_VENV}/bin/activate"

# 2. S'assurer que PyInstaller est installé
pip install --quiet pyinstaller

# 3. Nettoyer les builds précédents
rm -rf build/ dist/

# 4. Lancer PyInstaller
pyinstaller --clean --noconfirm teletaxi-import.spec

# 5. Détecter l'architecture
ARCH=$(uname -m)
if [ "${ARCH}" = "arm64" ]; then
    TARGET="aarch64-apple-darwin"
else
    TARGET="x86_64-apple-darwin"
fi

# 6. Copier dans src-tauri/binaries/
TAURI_BINARIES_DIR="${SCRIPT_DIR}/../src-tauri/binaries"
mkdir -p "${TAURI_BINARIES_DIR}"

SRC="dist/teletaxi-import-${TARGET}"
DEST="${TAURI_BINARIES_DIR}/teletaxi-import-${TARGET}"

if [ -d "${SRC}" ]; then
    cp -r "${SRC}" "${DEST}"
elif [ -f "${SRC}" ]; then
    cp "${SRC}" "${DEST}"
else
    echo "✗ Build PyInstaller introuvable : ${SRC}"
    exit 1
fi

echo ""
echo "✓ Sidecar buildé : ${DEST}"
ls -lh "${DEST}"
```

### 6.5 Téléchargement du JRE

`scripts/download_jre.sh` :

```bash
#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RESOURCES_DIR="${SCRIPT_DIR}/../src-tauri/resources/jre"

# Eclipse Temurin 17 JRE Headless (LTS, gratuit, multi-OS)
TEMURIN_VERSION="17.0.13+11"
TEMURIN_VERSION_URL="17.0.13_11"

download_jre() {
    local platform="$1"
    local url="$2"
    local dest_dir="${RESOURCES_DIR}/${platform}"

    if [ -d "${dest_dir}" ]; then
        echo "  ✓ JRE ${platform} déjà présent"
        return
    fi

    echo "  → Téléchargement JRE ${platform}..."
    local tmp_archive="/tmp/jre-${platform}.tar.gz"
    curl -sSLfo "${tmp_archive}" "${url}"

    mkdir -p "${dest_dir}"
    tar -xzf "${tmp_archive}" -C "${dest_dir}" --strip-components=1
    rm "${tmp_archive}"

    echo "  ✓ JRE ${platform} prêt"
}

echo "═══════════════════════════════════════════════════════════════"
echo " Téléchargement JRE Temurin ${TEMURIN_VERSION}"
echo "═══════════════════════════════════════════════════════════════"

# Mac Apple Silicon (M1/M2/M3)
download_jre "mac-aarch64" \
    "https://github.com/adoptium/temurin17-binaries/releases/download/jdk-${TEMURIN_VERSION}/OpenJDK17U-jre_aarch64_mac_hotspot_${TEMURIN_VERSION_URL}.tar.gz"

# Mac Intel
download_jre "mac-x86_64" \
    "https://github.com/adoptium/temurin17-binaries/releases/download/jdk-${TEMURIN_VERSION}/OpenJDK17U-jre_x64_mac_hotspot_${TEMURIN_VERSION_URL}.tar.gz"

# Windows x64 (téléchargé en .zip sur Mac, géré dans build_all_win.ps1)
echo "  ℹ JRE Windows téléchargé séparément par build_all_win.ps1"

echo ""
echo "✓ Téléchargement terminé."
du -sh "${RESOURCES_DIR}"/*
```

### 6.6 Critère d'acceptation Phase 2

```bash
# Build sidecar
cd python-sidecar && bash build_sidecar.sh

# Test manuel : ping
echo '{"id":"test","method":"ping","params":{}}' | \
    ../src-tauri/binaries/teletaxi-import-aarch64-apple-darwin

# Attendu : une ligne JSON avec status: "ok"
```

---

## 7. Phase 3 — Protocole JSON Tauri ↔ Python

### 7.1 Format général

**Toutes les communications** sont des JSON séparés par `\n`. Chaque ligne est un message indépendant.

### 7.2 Messages Tauri → Python (requêtes)

```typescript
interface SidecarRequest {
  id: string;              // UUID v4
  method: string;          // ex: "import.run"
  params: Record<string, any>;
}
```

#### Méthodes supportées

| Méthode | Description | Params |
|---|---|---|
| `ping` | Sanity check | `{}` |
| `test_connection` | Teste connexion .accdb | `{accdb_path: string}` |
| `import.run` | Lance un import | `{excel_path, accdb_path, backup_enabled?, dry_run?}` |
| `excel.preview` | Lit les 10 premières lignes d'une feuille | `{excel_path: string, sheet_name: string}` |

### 7.3 Messages Python → Tauri (réponses)

#### Type `result` (succès final)

```json
{
  "id": "uuid",
  "type": "result",
  "data": { ... }
}
```

#### Type `progress` (streaming)

```json
{
  "id": "uuid",
  "type": "progress",
  "phase": "prescripteurs|beneficiaires|courses|loading_cache|opening_excel",
  "current": 5,
  "total": 100,
  "message": "Insertion ligne 5/100"
}
```

#### Type `log` (log streaming)

```json
{
  "id": "uuid",
  "type": "log",
  "level": "debug|info|warning|error",
  "message": "Ligne 3 : prescripteur DUPONT inséré"
}
```

#### Type `error` (échec)

```json
{
  "id": "uuid",
  "type": "error",
  "code": "INVALID_JSON|MISSING_PARAM|CONNECTION_FAILED|IMPORT_FAILED|...",
  "message": "Message lisible",
  "details": "Stack trace optionnelle"
}
```

### 7.4 Adapter `ImportService` pour le streaming

Le `ImportService` actuel ne diffuse pas d'événements. Il faut l'enrichir avec des **callbacks** :

```python
# Dans teletaxi_import/services/import_service.py

from typing import Callable
from dataclasses import dataclass

@dataclass
class ProgressEvent:
    phase: str
    current: int
    total: int
    message: str = ""

ProgressCallback = Callable[[ProgressEvent], None]

class ImportService:
    def __init__(self, config: AppConfig, on_progress: ProgressCallback | None = None):
        self.config = config
        self.report = ImportReport()
        self.on_progress = on_progress or (lambda e: None)

    def _emit(self, phase: str, current: int = 0, total: int = 0, msg: str = ""):
        self.on_progress(ProgressEvent(phase, current, total, msg))

    def run(self) -> ImportReport:
        self._emit("starting")
        # ... etc
        for row_num, raw in excel.read_sheet(PRESCRIPTEURS_SCHEMA):
            self._emit("prescripteurs", current=row_num, total=total_rows)
            # ... etc
```

Et dans `sidecar_main.py` :

```python
def handle_run_import(request_id, params):
    def on_progress(event):
        write_progress(
            request_id,
            phase=event.phase,
            current=event.current,
            total=event.total,
            message=event.message,
        )

    service = ImportService(config, on_progress=on_progress)
    report = service.run()
    write_message({"id": request_id, "type": "result", "data": {"report": ...}})
```

### 7.5 Côté Rust : implémenter le sidecar manager

`src-tauri/src/sidecar/process.rs` :

```rust
use std::process::{Command, Stdio};
use std::io::{BufRead, BufReader, Write};
use tokio::sync::mpsc;
use tauri::Manager;

pub struct SidecarProcess {
    process: std::process::Child,
    stdin: std::process::ChildStdin,
}

impl SidecarProcess {
    pub fn spawn(app_handle: &tauri::AppHandle) -> Result<Self, String> {
        // Tauri résout automatiquement le binaire selon l'OS via externalBin
        let resource_path = app_handle
            .path()
            .resource_dir()
            .map_err(|e| e.to_string())?;

        let binary_path = if cfg!(target_os = "macos") {
            let arch = if cfg!(target_arch = "aarch64") {
                "aarch64-apple-darwin"
            } else {
                "x86_64-apple-darwin"
            };
            resource_path.join(format!("binaries/teletaxi-import-{}", arch))
        } else {
            resource_path.join("binaries/teletaxi-import-x86_64-pc-windows-msvc.exe")
        };

        let jre_path = if cfg!(target_os = "macos") {
            let arch = if cfg!(target_arch = "aarch64") {
                "mac-aarch64"
            } else {
                "mac-x86_64"
            };
            resource_path.join(format!("resources/jre/{}", arch))
        } else {
            resource_path.join("resources/jre/win-x86_64")
        };

        let mut cmd = Command::new(&binary_path);
        cmd.env("JAVA_HOME", &jre_path)
            .env("PATH", format!("{}/bin:{}",
                jre_path.display(),
                std::env::var("PATH").unwrap_or_default()))
            .stdin(Stdio::piped())
            .stdout(Stdio::piped())
            .stderr(Stdio::piped());

        let mut process = cmd.spawn().map_err(|e| format!("Spawn failed: {}", e))?;
        let stdin = process.stdin.take().ok_or("No stdin")?;

        Ok(Self { process, stdin })
    }

    pub fn send_request(&mut self, request: &serde_json::Value) -> Result<(), String> {
        let line = serde_json::to_string(request).map_err(|e| e.to_string())?;
        writeln!(self.stdin, "{}", line).map_err(|e| e.to_string())?;
        self.stdin.flush().map_err(|e| e.to_string())?;
        Ok(())
    }
}
```

**Implémenter aussi** la lecture du stdout en boucle async dans un thread séparé qui émet des events Tauri vers le frontend.

---

## 8. Phase 4 — Auth locale + SQLite

### 8.1 Schéma SQLite

`src-tauri/src/db/migrations.rs` :

```rust
pub const MIGRATIONS: &[&str] = &[
    r#"
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        display_name TEXT,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        last_login_at DATETIME
    );

    CREATE TABLE IF NOT EXISTS app_config (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS imports (
        id TEXT PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        excel_filename TEXT NOT NULL,
        excel_path TEXT NOT NULL,
        accdb_path TEXT NOT NULL,
        started_at DATETIME NOT NULL,
        ended_at DATETIME,
        status TEXT NOT NULL CHECK(status IN ('running', 'success', 'partial', 'error')),
        prescripteurs_inseres INTEGER NOT NULL DEFAULT 0,
        prescripteurs_ignores INTEGER NOT NULL DEFAULT 0,
        prescripteurs_erreurs INTEGER NOT NULL DEFAULT 0,
        beneficiaires_inseres INTEGER NOT NULL DEFAULT 0,
        beneficiaires_ignores INTEGER NOT NULL DEFAULT 0,
        beneficiaires_erreurs INTEGER NOT NULL DEFAULT 0,
        courses_inseres INTEGER NOT NULL DEFAULT 0,
        courses_ignores INTEGER NOT NULL DEFAULT 0,
        courses_erreurs INTEGER NOT NULL DEFAULT 0,
        log_file_path TEXT,
        backup_path TEXT,
        error_message TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_imports_user_started
        ON imports(user_id, started_at DESC);

    CREATE TABLE IF NOT EXISTS sessions (
        token TEXT PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        expires_at DATETIME NOT NULL
    );
    "#,
];
```

### 8.2 Commandes Tauri

`src-tauri/src/commands/auth.rs` :

```rust
use serde::{Deserialize, Serialize};
use sqlx::SqlitePool;
use tauri::State;
use crate::state::AppState;

#[derive(Deserialize)]
pub struct SignupParams {
    pub email: String,
    pub password: String,
    pub display_name: Option<String>,
}

#[derive(Serialize)]
pub struct AuthResult {
    pub user_id: i64,
    pub email: String,
    pub session_token: String,
}

#[tauri::command]
pub async fn signup(
    state: State<'_, AppState>,
    params: SignupParams,
) -> Result<AuthResult, String> {
    // 1. Vérifier que l'email n'existe pas déjà
    let existing = sqlx::query_scalar::<_, i64>(
        "SELECT id FROM users WHERE email = ?"
    )
        .bind(&params.email)
        .fetch_optional(&state.db)
        .await
        .map_err(|e| e.to_string())?;

    if existing.is_some() {
        return Err("Email déjà utilisé".to_string());
    }

    // 2. Hasher le mot de passe avec bcrypt
    let hash = bcrypt::hash(&params.password, bcrypt::DEFAULT_COST)
        .map_err(|e| e.to_string())?;

    // 3. Insérer l'utilisateur
    let user_id = sqlx::query_scalar::<_, i64>(
        "INSERT INTO users (email, password_hash, display_name) VALUES (?, ?, ?) RETURNING id"
    )
        .bind(&params.email)
        .bind(&hash)
        .bind(&params.display_name)
        .fetch_one(&state.db)
        .await
        .map_err(|e| e.to_string())?;

    // 4. Créer une session
    let token = uuid::Uuid::new_v4().to_string();
    let expires_at = chrono::Utc::now() + chrono::Duration::days(30);

    sqlx::query(
        "INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)"
    )
        .bind(&token)
        .bind(user_id)
        .bind(expires_at)
        .execute(&state.db)
        .await
        .map_err(|e| e.to_string())?;

    Ok(AuthResult {
        user_id,
        email: params.email,
        session_token: token,
    })
}

#[tauri::command]
pub async fn login(state: State<'_, AppState>, email: String, password: String)
    -> Result<AuthResult, String>
{
    let user = sqlx::query_as::<_, (i64, String, String)>(
        "SELECT id, email, password_hash FROM users WHERE email = ?"
    )
        .bind(&email)
        .fetch_optional(&state.db)
        .await
        .map_err(|e| e.to_string())?
        .ok_or("Email ou mot de passe invalide")?;

    if !bcrypt::verify(&password, &user.2).map_err(|e| e.to_string())? {
        return Err("Email ou mot de passe invalide".to_string());
    }

    // Update last_login_at
    sqlx::query("UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?")
        .bind(user.0)
        .execute(&state.db)
        .await
        .ok();

    let token = uuid::Uuid::new_v4().to_string();
    let expires_at = chrono::Utc::now() + chrono::Duration::days(30);

    sqlx::query(
        "INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)"
    )
        .bind(&token)
        .bind(user.0)
        .bind(expires_at)
        .execute(&state.db)
        .await
        .map_err(|e| e.to_string())?;

    Ok(AuthResult {
        user_id: user.0,
        email: user.1,
        session_token: token,
    })
}

#[tauri::command]
pub async fn logout(state: State<'_, AppState>, token: String) -> Result<(), String> {
    sqlx::query("DELETE FROM sessions WHERE token = ?")
        .bind(&token)
        .execute(&state.db)
        .await
        .map_err(|e| e.to_string())?;
    Ok(())
}
```

### 8.3 Stockage du token côté frontend

Utiliser le **Stronghold** ou **Secure Storage** Tauri, ou simplement un fichier JSON dans `app_data_dir()`. Pour V1, **fichier JSON suffit** (la session est sur l'OS de l'utilisateur, mono-user).

---

## 9. Phase 5 — Frontend Next.js + shadcn/ui

### 9.1 Design system

**Couleurs** (basé sur shadcn/ui slate) :
- Primary : `slate-900` (texte principal)
- Background : `white` / `slate-50`
- Accent : `blue-600`
- Success : `green-600`
- Warning : `amber-500`
- Error : `red-600`

**Typographie** : Inter (par défaut), tailles standardisées (text-xs à text-3xl).

**Espacements** : grille 4px (gap-1, gap-2, gap-4, gap-8).

### 9.2 Layout principal

`src/app/layout.tsx` :

```tsx
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { QueryProvider } from "@/components/providers/query-provider";
import { AuthProvider } from "@/components/providers/auth-provider";
import { Sidebar } from "@/components/layout/sidebar";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "TELETAXI CRM",
  description: "Import Excel vers TELETAXI",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={inter.className}>
      <body className="bg-slate-50 text-slate-900">
        <QueryProvider>
          <AuthProvider>
            <div className="flex h-screen">
              <Sidebar />
              <main className="flex-1 overflow-auto">{children}</main>
            </div>
            <Toaster richColors />
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
```

### 9.3 Sidebar

`src/components/layout/sidebar.tsx` :

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Upload, History, Settings, Database, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

const navItems = [
  { href: "/", icon: Home, label: "Dashboard" },
  { href: "/import", icon: Upload, label: "Importer" },
  { href: "/history", icon: History, label: "Historique" },
  { href: "/database", icon: Database, label: "Base TELETAXI" },
  { href: "/settings", icon: Settings, label: "Réglages" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="w-60 bg-white border-r border-slate-200 flex flex-col">
      <div className="p-6 border-b border-slate-200">
        <h1 className="font-bold tracking-tight">TELETAXI CRM</h1>
        <p className="text-xs text-slate-500 mt-1">v0.1.0</p>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
              pathname === href
                ? "bg-slate-900 text-white"
                : "text-slate-700 hover:bg-slate-100"
            )}
          >
            <Icon className="w-4 h-4" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="p-3 border-t border-slate-200">
        <div className="px-3 py-2 text-xs text-slate-500 truncate">{user?.email}</div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-slate-700 hover:bg-slate-100"
        >
          <LogOut className="w-4 h-4" />
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
```

### 9.4 Wrapper Tauri typé

`src/lib/tauri.ts` :

```typescript
import { invoke } from "@tauri-apps/api/core";
import { listen, UnlistenFn } from "@tauri-apps/api/event";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface AuthResult {
  user_id: number;
  email: string;
  session_token: string;
}

export interface ImportReport {
  prescripteurs: EntityStats;
  beneficiaires: EntityStats;
  courses: EntityStats;
  total_inseres: number;
  total_erreurs: number;
}

export interface EntityStats {
  inseres: number;
  ignores: number;
  erreurs: number;
}

export interface ImportProgress {
  phase: string;
  current: number;
  total: number;
  message: string;
}

// ─── Auth ───────────────────────────────────────────────────────────────────

export const tauri = {
  auth: {
    signup: (params: { email: string; password: string; display_name?: string }) =>
      invoke<AuthResult>("signup", { params }),
    login: (email: string, password: string) =>
      invoke<AuthResult>("login", { email, password }),
    logout: (token: string) => invoke<void>("logout", { token }),
  },

  config: {
    setAccdbPath: (path: string) => invoke<void>("set_accdb_path", { path }),
    getConfig: () => invoke<{ accdb_path?: string; backup_enabled: boolean }>("get_config"),
  },

  import: {
    run: (params: {
      excel_path: string;
      accdb_path: string;
      backup_enabled: boolean;
    }) => invoke<{ import_id: string }>("start_import", { params }),

    onProgress: (callback: (p: ImportProgress) => void): Promise<UnlistenFn> =>
      listen<ImportProgress>("import:progress", (event) => callback(event.payload)),

    onComplete: (callback: (r: ImportReport) => void): Promise<UnlistenFn> =>
      listen<ImportReport>("import:complete", (event) => callback(event.payload)),
  },

  history: {
    list: (limit = 50) => invoke<HistoryEntry[]>("list_imports", { limit }),
    get: (id: string) => invoke<HistoryEntry>("get_import", { id }),
  },

  files: {
    openExcelDialog: () => invoke<string | null>("open_excel_dialog"),
    openAccdbDialog: () => invoke<string | null>("open_accdb_dialog"),
  },
};
```

---

## 10. Phase 6 — Écrans applicatifs

### 10.1 Référence aux mockups React existants

J'ai déjà produit **6 mockups React** au début de notre conversation. Tu les retrouveras dans le dossier `/Users/maxime/Documents/TeleTaxi/teletaxi_import/UI/` (à recopier dans le nouveau projet) :

1. `01_AuthScreen.jsx` — Login/Signup
2. `02_DatabaseConfigScreen.jsx` — Config .accdb
3. `03_ImportExcelScreen.jsx` — Upload + preview
4. `04_HistoryScreen.jsx` — Historique
5. `05_SettingsScreen.jsx` — Réglages
6. `06_DashboardScreen.jsx` — Dashboard

**Important** : ces mockups sont à **adapter en TSX** dans Next.js App Router et à brancher sur le vrai backend Tauri. La structure visuelle reste, le mock data devient des appels `tauri.*`.

### 10.2 Conventions des écrans

Chaque écran (`page.tsx`) suit ce pattern :

```tsx
"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { tauri } from "@/lib/tauri";
import { Card } from "@/components/ui/card";
// ...

export default function ImportPage() {
  // Lecture
  const { data: config } = useQuery({
    queryKey: ["config"],
    queryFn: tauri.config.getConfig,
  });

  // Action
  const runImport = useMutation({
    mutationFn: tauri.import.run,
    onSuccess: (data) => {
      toast.success(`Import ${data.import_id} démarré`);
    },
  });

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* ... */}
    </div>
  );
}
```

### 10.3 Écran d'import (le plus complexe)

Doit gérer :
- Drag & drop fichier Excel
- Preview des 10 premières lignes (via `excel.preview` sidecar)
- Validation pré-import (config OK ?)
- Lancement de l'import
- Progress bar streaming en temps réel
- Affichage du rapport final
- Possibilité de relancer ou voir le détail

Le composant `ImportProgressPanel` doit s'abonner à `tauri.import.onProgress` au montage et se désabonner au démontage.

---

## 11. Phase 7 — Packaging Mac (.dmg)

### 11.1 Build universel (Intel + Apple Silicon)

Tauri permet de produire un **universal binary** Mac :

```bash
# Ajouter les targets Rust
rustup target add aarch64-apple-darwin x86_64-apple-darwin

# Builder en universal
pnpm tauri build --target universal-apple-darwin
```

Pré-requis : **les sidecars Python doivent être pré-buildés pour les 2 archs** avant ce build.

### 11.2 Icône

Générer toutes les variantes depuis un PNG 1024x1024 :

```bash
pnpm tauri icon path/to/icon-1024.png
```

### 11.3 Le fichier .dmg

Tauri génère automatiquement un `.dmg` avec installeur graphique standard Mac. Sortie : `src-tauri/target/release/bundle/dmg/TELETAXI CRM_0.1.0_universal.dmg`.

---

## 12. Phase 8 — Packaging Windows (.msi)

### 12.1 Stratégie : GitHub Actions (recommandé)

Cross-compiler Windows depuis Mac est **possible mais douloureux**. La meilleure approche est de **builder via CI/CD** :

`.github/workflows/build-windows.yml` :

```yaml
name: Build Windows

on:
  push:
    tags: ['v*']
  workflow_dispatch:

jobs:
  build:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v4
        with:
          submodules: recursive

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm

      - name: Setup pnpm
        uses: pnpm/action-setup@v3
        with: { version: 9 }

      - name: Setup Rust
        uses: dtolnay/rust-toolchain@stable

      - name: Setup Python
        uses: actions/setup-python@v5
        with: { python-version: '3.11' }

      - name: Setup Java
        uses: actions/setup-java@v4
        with:
          distribution: 'temurin'
          java-version: '17'

      - name: Install Python deps
        run: |
          cd python-sidecar
          pip install -r requirements.txt
          pip install pyinstaller

      - name: Build sidecar
        run: |
          cd python-sidecar
          .\build_sidecar.ps1

      - name: Download JRE for Windows
        run: .\scripts\download_jre.ps1

      - name: Install frontend deps
        run: pnpm install

      - name: Build Tauri
        run: pnpm tauri build

      - name: Upload artifacts
        uses: actions/upload-artifact@v4
        with:
          name: windows-installer
          path: src-tauri/target/release/bundle/msi/*.msi
```

### 12.2 Build script Windows local (alternative)

`python-sidecar/build_sidecar.ps1` :

```powershell
$ErrorActionPreference = "Stop"

Write-Host "═══════════════════════════════════════════════════════════════"
Write-Host " Build sidecar Python pour Windows"
Write-Host "═══════════════════════════════════════════════════════════════"

# 1. Activer le venv
$venvPath = "$PSScriptRoot\..\teletaxi_import\.venv\Scripts\activate.ps1"
if (-not (Test-Path $venvPath)) {
    Write-Error "Venv introuvable : $venvPath"
    exit 1
}
. $venvPath

# 2. PyInstaller
pip install --quiet pyinstaller

# 3. Nettoyer
Remove-Item -Recurse -Force build, dist -ErrorAction SilentlyContinue

# 4. Build
pyinstaller --clean --noconfirm teletaxi-import.spec

# 5. Copier dans binaries/
$dest = "$PSScriptRoot\..\src-tauri\binaries\teletaxi-import-x86_64-pc-windows-msvc.exe"
$src = "dist\teletaxi-import-x86_64-pc-windows-msvc.exe"
Copy-Item $src $dest -Force

Write-Host "✓ Sidecar buildé : $dest"
```

---

## 13. Phase 9 — Code signing

### 13.1 Signing Mac (Apple Developer ID)

#### Pré-requis

1. **Compte Apple Developer** : 99 $/an sur [developer.apple.com](https://developer.apple.com)
2. **Certificat Developer ID Application** : généré depuis l'admin Apple Developer

#### Configuration

`src-tauri/tauri.conf.json` (bundle.macOS) :

```json
{
  "macOS": {
    "signingIdentity": "Developer ID Application: Maxime Jauras (TEAM_ID)",
    "providerShortName": "TEAM_ID",
    "entitlements": "entitlements.plist"
  }
}
```

`src-tauri/entitlements.plist` :

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>com.apple.security.cs.allow-jit</key>
    <true/>
    <key>com.apple.security.cs.allow-unsigned-executable-memory</key>
    <true/>
    <key>com.apple.security.cs.disable-library-validation</key>
    <true/>
    <key>com.apple.security.files.user-selected.read-write</key>
    <true/>
</dict>
</plist>
```

**Important** : les 3 premières lignes sont nécessaires car JPype/JVM utilise du JIT, sinon le binaire crashera au démarrage signé.

#### Notarisation

Variables d'environnement avant le build :

```bash
export APPLE_ID="ton-apple-id@email.com"
export APPLE_PASSWORD="app-specific-password"  # généré sur appleid.apple.com
export APPLE_TEAM_ID="TEAM_ID"

pnpm tauri build --target universal-apple-darwin
```

Tauri 2 fait la notarisation automatiquement si ces variables sont définies.

### 13.2 Signing Windows (Code Signing Certificate)

#### Pré-requis

- Certificat EV (Extended Validation) ou OV (Organization Validation)
- Coût : ~300 à 600 €/an selon le fournisseur (Sectigo, DigiCert, etc.)
- **Recommandation** : commencer avec un **certificat OV moins cher** (~150-200 €/an pour les particuliers via SSL.com par exemple)

#### Configuration

`src-tauri/tauri.conf.json` (bundle.windows) :

```json
{
  "windows": {
    "certificateThumbprint": "THUMBPRINT_HEX",
    "digestAlgorithm": "sha256",
    "timestampUrl": "http://timestamp.sectigo.com",
    "wix": {
      "language": ["fr-FR", "en-US"]
    }
  }
}
```

#### Approche sans certificat (pour démarrer)

Sans signing Windows, l'utilisateur verra un **SmartScreen warning** qui se débloque en cliquant "Plus d'informations" → "Exécuter quand même". C'est OK pour un usage interne, **pas OK pour une distribution large**.

---

## 14. Plan d'exécution recommandé (28 jours)

### Semaine 1 — Fondations

| Jour | Tâche | Critère d'acceptation |
|---|---|---|
| **J1** | Installer toute la stack dev (Rust, Node, pnpm, Tauri CLI) | `cargo tauri --version` OK |
| **J2** | Créer le repo + scaffolding Tauri + Next.js | `pnpm tauri dev` ouvre une fenêtre |
| **J3** | Setup Tailwind + shadcn/ui + design tokens | `<Button>Test</Button>` stylisé |
| **J4** | Sidecar : adapter `sidecar_main.py` + premier build PyInstaller | `echo '{"id":"1","method":"ping"}' \| ./sidecar` répond |
| **J5** | Download JRE + intégration resources Tauri | Sidecar trouve `JAVA_HOME` et démarre la JVM |
| **J6-J7** | Pont Tauri → Sidecar (Rust) | `invoke("ping_sidecar")` depuis le front fonctionne |

### Semaine 2 — Auth + Config

| Jour | Tâche | Critère d'acceptation |
|---|---|---|
| **J8** | SQLite + migrations + tables `users` et `app_config` | DB créée au premier lancement |
| **J9** | Commandes Tauri auth (signup/login/logout) | Tests unitaires Rust passent |
| **J10** | Écran Login/Signup TSX | UI fonctionnelle, vrai login |
| **J11** | Stockage session + route guard | Reload → reste connecté |
| **J12** | Écran Database Config (chemin .accdb) | `test_connection` via sidecar fonctionne |
| **J13** | Écran Settings de base | Sauvegarde préférences |
| **J14** | Layout final (sidebar + header) | Navigation entre écrans OK |

### Semaine 3 — Import

| Jour | Tâche | Critère d'acceptation |
|---|---|---|
| **J15** | Drag & drop Excel + sélection fichier | Fichier sélectionné → preview |
| **J16** | Preview Excel via sidecar (`excel.preview`) | 10 lignes affichées dans une table |
| **J17** | Adapter `ImportService` pour callbacks de progression | Test Python isolé OK |
| **J18** | Commande `start_import` Rust + streaming events | Console montre les progress JSON |
| **J19** | Composant ProgressPanel temps réel | Barre de progression live |
| **J20** | Écran d'historique + sauvegarde imports SQLite | Liste imports affichée |
| **J21** | Détail import (drawer) + log viewer | Click ligne → drawer avec détails |

### Semaine 4 — Polish + Packaging

| Jour | Tâche | Critère d'acceptation |
|---|---|---|
| **J22** | Dashboard avec KPIs + activité récente | KPIs réels depuis SQLite |
| **J23** | Toasts, états vides, gestion d'erreurs propre | UX cohérente partout |
| **J24** | Icônes app + splash screen | Icône custom Mac+Win |
| **J25** | Build Mac universal binary + .dmg | `.dmg` s'installe et se lance |
| **J26** | GitHub Actions Windows + .msi | `.msi` s'installe et se lance |
| **J27** | Code signing Mac (achat cert + notarisation) | Pas de warning Gatekeeper |
| **J28** | Documentation finale + release v0.1.0 | Tag Git + binaries publiés |

---

## 15. Critères d'acceptation finaux

### 15.1 Fonctionnel

- [ ] Au premier lancement, écran de signup
- [ ] Après signup, écran de config base (chemin .accdb)
- [ ] Test de connexion fonctionne sur Mac et Windows
- [ ] Import d'un Excel réel insère les données dans `.accdb`
- [ ] Progress bar affiche l'avancement en temps réel
- [ ] Historique liste les imports passés
- [ ] Détail d'un import affiche le log complet
- [ ] Settings permet de changer le chemin .accdb
- [ ] Logout puis login fonctionne
- [ ] L'app fonctionne sans Internet (pas de télémétrie)

### 15.2 Technique

- [ ] Bundle Mac universal binary < 100 Mo
- [ ] Bundle Windows < 100 Mo
- [ ] Démarrage à froid < 5 secondes
- [ ] Premier import < 30 secondes (JVM warmup inclus)
- [ ] Imports suivants < 5 secondes (JVM chaude)
- [ ] Aucun crash sur usage normal
- [ ] Aucune fuite mémoire après 10 imports successifs
- [ ] `pnpm tauri build` produit le bundle sans erreur

### 15.3 Qualité

- [ ] TypeScript strict mode (zero `any`)
- [ ] Rust `cargo clippy -- -D warnings` passe
- [ ] Frontend ESLint passe sans warning
- [ ] Composants UI accessibles (keyboard nav + ARIA)
- [ ] Dark mode fonctionne sur tous les écrans (V1 optionnel)
- [ ] Tous les écrans responsives min 900×600

---

## 16. Pièges connus et solutions

### 16.1 PyInstaller : modules cachés

**Problème** : PyInstaller ne détecte pas certains imports dynamiques (JPype, jaydebeapi).

**Solution** : déclarer explicitement dans `hiddenimports` du `.spec` :
```python
hiddenimports=["jaydebeapi", "jpype", "openpyxl", "pydantic_core"]
```

### 16.2 PyInstaller : taille du bundle

**Problème** : le bundle Python peut atteindre 100+ Mo si on inclut tout.

**Solution** : exclure les modules inutiles :
```python
excludes=["tkinter", "matplotlib", "pytest", "numpy.tests", ...]
```

### 16.3 Tauri sidecar : naming convention

**Problème** : Tauri attend des noms précis pour les sidecars selon l'arch :
- `<name>-x86_64-apple-darwin`
- `<name>-aarch64-apple-darwin`
- `<name>-x86_64-pc-windows-msvc.exe`

**Solution** : adapter le script PyInstaller pour générer le bon nom selon `platform.machine()`.

### 16.4 JVM signing sur Mac

**Problème** : si la JVM est signée séparément, Gatekeeper peut la bloquer.

**Solution** : signer **tout le contenu du bundle** récursivement avec `codesign --deep --force --options runtime`. Tauri le fait automatiquement si `signingIdentity` est correctement configuré.

### 16.5 Lancement sidecar en dev vs prod

**Problème** : en dev, le sidecar n'est pas dans le resource dir mais dans `src-tauri/binaries/`.

**Solution** : utiliser `tauri::path::resolve_path()` qui gère les deux cas, ou détecter le mode avec `cfg!(debug_assertions)`.

### 16.6 stdin du sidecar bloqué

**Problème** : si le sidecar attend `stdin` mais Tauri ne lui envoie rien, il bloque pour toujours.

**Solution** : envoyer un `ping` initial au démarrage du sidecar pour vérifier qu'il est vivant. Timeout de 10s.

### 16.7 SQLite et Tauri

**Problème** : SQLx en mode "offline" (vérification à la compilation) demande une DB locale.

**Solution** : utiliser `sqlx::query!` sans vérification offline (`SQLX_OFFLINE=false`), ou générer le schéma au premier lancement et utiliser `sqlx::query` (runtime).

### 16.8 React Strict Mode et invoke()

**Problème** : en dev, React StrictMode double-exécute les useEffect → double-invoke.

**Solution** : utiliser TanStack Query qui dédupplique automatiquement, ou ajouter un flag local.

### 16.9 Code signing Mac : entitlements pour JVM

**Problème** : sans entitlements spécifiques, la JVM ne peut pas allouer de mémoire exécutable.

**Solution** : les 3 entitlements `allow-jit`, `allow-unsigned-executable-memory`, `disable-library-validation` (cf. section 13.1).

### 16.10 Windows : path avec espaces

**Problème** : chemin Windows avec espaces (`C:\Program Files\...`) cassent les commandes shell.

**Solution** : utiliser toujours `Path` côté Rust (jamais de string concat), et `subprocess` avec `args=[...]` côté Python (jamais `shell=True`).

---

## 17. Ordre d'exécution recommandé pour Claude Code

1. **Lire ce document en entier** + le `SPEC.md` du projet Python pour contexte.
2. **Phase 1** : setup initial. Vérifier qu'on a une fenêtre Tauri qui s'ouvre.
3. **Phase 2** : sidecar Python. C'est la phase **la plus risquée techniquement**. Bien valider le `ping` avant tout.
4. **Phase 3** : protocole JSON. Implémenter `ping` puis `test_connection` puis `import.run`.
5. **Phase 4** : SQLite + auth. Pure backend, à valider avec tests Rust.
6. **Phase 5-6** : frontend. S'inspirer des 6 mockups React déjà produits.
7. **Phase 7-8** : packaging. Commencer par Mac (sur ta machine), puis Windows via CI.
8. **Phase 9** : code signing. À faire en dernier, après acquisition des certificats.

À chaque phase, **valider que tout fonctionne** avant de passer à la suivante. Documenter chaque problème rencontré dans `docs/TECHNICAL_NOTES.md`.

---

## 18. Démarrage rapide pour Claude Code

```bash
# Dans le terminal, depuis le dossier parent de teletaxi_import/
mkdir teletaxi-crm && cd teletaxi-crm
git init

# Lancer Claude Code
claude
```

Premier prompt à donner à Claude Code :

```
Lis le document teletaxi_crm_tauri_SPEC.md à la racine du projet.
C'est ta feuille de route complète pour construire l'app desktop Tauri.

Le module Python (teletaxi_import) est à l'emplacement
/Users/maxime/Documents/TeleTaxi/teletaxi_import/ et fonctionne déjà.

Commence par la Phase 1 (setup initial). Valide chaque étape avec moi
avant de passer à la suivante. Implémente méthodiquement, en testant
au fur et à mesure. Demande-moi des clarifications avant d'inventer
un comportement non spécifié.
```

---

**Fin du document de spécifications Tauri.**

Bonne construction. Cette V1 sera ton vrai produit fini.
