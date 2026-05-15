# TELETAXI CRM — Index des documents

> Lis ce fichier en premier. Il te dit comment naviguer dans les 4 documents fournis.

---

## Vue d'ensemble

Tu as **3 documents Markdown** et **6 fichiers JSX de référence** pour construire l'application TELETAXI CRM. Voici l'ordre de lecture recommandé :

```
1. teletaxi_crm_tauri_SPEC.md            ← Architecture complète (lis-le en entier)
2. teletaxi_crm_frontend_FOUNDATIONS.md  ← Setup TSX, types, hooks, schemas
3. teletaxi_crm_screens_GUIDE.md         ← Guide écran par écran
4. mockups_originaux/*.jsx               ← Référence visuelle (consultation)
```

---

## Que contient chaque document

### 📄 `teletaxi_crm_tauri_SPEC.md` (2127 lignes)
**Le document maître.** Contient :
- Architecture globale (Tauri + Python sidecar + JRE)
- Structure complète du projet
- Phase 1 — Setup Tauri + Next.js
- Phase 2 — Sidecar Python (PyInstaller)
- Phase 3 — Protocole JSON Tauri ↔ Python
- Phase 4 — Auth + SQLite (Rust)
- Phase 5 — Frontend Next.js (vue d'ensemble)
- Phase 6 — Écrans (référence à FOUNDATIONS + GUIDE)
- Phase 7 — Packaging Mac (.dmg)
- Phase 8 — Packaging Windows (.msi)
- Phase 9 — Code signing
- Plan d'exécution 28 jours
- Pièges connus

**À lire en premier, en entier.**

### 📄 `teletaxi_crm_frontend_FOUNDATIONS.md` (1593 lignes)
**Les fondations du frontend.** Contient :
- Setup design tokens (`globals.css`, `tailwind.config.ts`)
- Types partagés (`lib/types.ts`)
- Layout racine + providers + auth context
- Sidebar partagée (utilisée par tous les écrans authentifiés)
- Schémas Zod (validation formulaires)
- Hooks TanStack Query (auth, config, import, history)
- Composants partagés (EmptyState, ConfirmDialog, ConsoleLog, etc.)
- Checklist d'intégration finale

**À lire avant d'attaquer la Phase 5 du SPEC principal.**

### 📄 `teletaxi_crm_screens_GUIDE.md` (728 lignes)
**Le plan d'exécution écran par écran.** Contient :
- Méthodologie en 5 étapes pour transformer chaque JSX en TSX
- Mapping des 6 écrans (mockup → fichier TSX cible)
- Pour chaque écran : particularités, branchements, composants à extraire, checklist
- Ordre d'implémentation jour par jour (12 jours)
- Conventions de code finales

**À lire avant d'implémenter chaque écran.**

### 📁 `mockups_originaux/` (6 fichiers JSX, 2866 lignes)
**Référence visuelle absolue.** Les 6 mockups originaux à respecter pour le design :

| Fichier | Lignes | À utiliser pour |
|---|---|---|
| `01_AuthScreen.jsx` | 182 | Page `/auth` |
| `02_DatabaseConfigScreen.jsx` | 320 | Page `/database` |
| `03_ImportExcelScreen.jsx` | 592 | Page `/import` (LE PLUS COMPLEXE) |
| `04_HistoryScreen.jsx` | 621 | Page `/history` |
| `05_SettingsScreen.jsx` | 710 | Page `/settings` |
| `06_DashboardScreen.jsx` | 441 | Page `/` (dashboard) |

**À consulter en parallèle pendant l'implémentation de chaque écran.**

⚠️ **Important** : ces JSX sont en JavaScript (pas TypeScript) et utilisent du mock data inline. Tu dois :
1. **Préserver fidèlement** la structure visuelle (classNames Tailwind, hiérarchie DOM)
2. **Convertir en TSX** avec typage strict
3. **Remplacer les mocks** par les hooks de `FOUNDATIONS.md`
4. **Utiliser shadcn/ui** quand un composant équivalent existe (Button, Input, Dialog, Sheet, etc.)

---

## Ordre d'exécution global

```
SEMAINE 1 — Fondations
  J1  : Installer la stack dev (Rust, Node, pnpm, Tauri CLI, PyInstaller)
  J2  : Scaffold Tauri + Next.js (SPEC §5)
  J3  : Setup shadcn/ui + design tokens (FOUNDATIONS §1)
  J4  : Sidecar Python — premier build PyInstaller (SPEC §6)
  J5  : Download JRE Temurin (SPEC §6.5)
  J6-7: Pont Rust ↔ Python — méthode `ping` fonctionnelle (SPEC §7)

SEMAINE 2 — Auth + Config + Premiers écrans
  J8  : SQLite + migrations + commandes Rust auth (SPEC §8)
  J9  : Types + schemas + hooks mock (FOUNDATIONS §2-6)
  J10 : Layout racine + auth context + sidebar (FOUNDATIONS §3-4)
  J11 : Écran Auth (GUIDE §Écran 1)
  J12 : Composants partagés (FOUNDATIONS §7)
  J13 : Écran Database Config (GUIDE §Écran 2)
  J14 : Écran Dashboard (GUIDE §Écran 3)

SEMAINE 3 — Import + History
  J15-16 : Adapter ImportService Python (callbacks progression, SPEC §7.4)
  J17    : Commande Rust `start_import` + streaming events (SPEC §7.5)
  J18-19 : Écran Import Phase A (upload) + Phase B (preview) (GUIDE §Écran 6)
  J20    : Écran Import Phase C (streaming) + Phase D (rapport) (GUIDE §Écran 6)
  J21    : Écran History (GUIDE §Écran 4)

SEMAINE 4 — Settings + Packaging
  J22 : Écran Settings (GUIDE §Écran 5)
  J23 : Branchements Tauri réels (remplacer tous les mocks)
  J24 : Polish, toasts, états loading, accessibility
  J25 : Build Mac universal binary + .dmg (SPEC §11)
  J26 : GitHub Actions Windows + .msi (SPEC §12)
  J27 : Code signing Mac (achat cert + notarisation, SPEC §13)
  J28 : Documentation finale + release v0.1.0
```

---

## Règles d'or pendant l'implémentation

1. **Valide chaque phase avant la suivante.** Ne pas empiler 3 jours de code sans tester.
2. **Demande des clarifications.** Si un détail n'est pas spécifié, demande plutôt qu'inventer.
3. **Respecte les conventions de code.** PEP 8 pour Python, TypeScript strict pour TSX, Rust idiomatique.
4. **Documente les décisions importantes.** Crée `docs/DECISIONS.md` au fur et à mesure.
5. **Commit Git fréquemment.** Un commit par feature/fix, avec messages descriptifs.

---

## Démarrage rapide

Premier prompt à donner à Claude Code dans le dossier `teletaxi-crm/` :

```
Lis dans cet ordre :
  1. teletaxi_crm_tauri_SPEC.md (architecture complète)
  2. teletaxi_crm_frontend_FOUNDATIONS.md (foundations TSX)
  3. teletaxi_crm_screens_GUIDE.md (guide écrans)
  4. INDEX.md (résumé global)

Les 6 mockups JSX originaux sont dans mockups_originaux/ — c'est la
référence visuelle absolue à respecter.

Le module Python (teletaxi_import) est déjà fonctionnel et se trouve à :
/Users/maxime/Documents/TeleTaxi/teletaxi_import/

Commence par la Phase 1 du SPEC principal (setup Tauri + Next.js).
Implémente méthodiquement, valide chaque étape avec moi avant de passer
à la suivante.
```

---

**Bonne construction !** Tu pars sur des fondations solides : MVP Python validé + spec complète + mockups précis + plan d'exécution clair.
