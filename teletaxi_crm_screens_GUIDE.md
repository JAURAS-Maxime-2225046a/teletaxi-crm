# TELETAXI CRM — Guide d'intégration des 6 écrans

> **Document destiné à Claude Code** : transformer les 6 mockups JSX existants en écrans TSX fonctionnels intégrés à l'app Tauri.
>
> Ce document est **le plan d'exécution écran par écran**. Lis-le après `FOUNDATIONS.md` et avant de commencer la Phase 5 du SPEC principal.

---

## Pré-requis avant de commencer

1. **Avoir lu** `teletaxi_crm_tauri_SPEC.md` (architecture générale)
2. **Avoir lu** `teletaxi_crm_frontend_FOUNDATIONS.md` (types, hooks, schemas, composants partagés)
3. **Avoir les 6 mockups JSX** dans `mockups_originaux/` (référence visuelle et structurelle)
4. **Avoir setup** Tauri + Next.js + shadcn/ui (Phase 1 du SPEC principal)
5. **Avoir implémenté** les hooks et composants partagés (sections 5-7 de FOUNDATIONS.md)

---

## Méthodologie générale pour chaque écran

Pour chaque écran, suivre **ce process en 5 étapes** :

### Étape 1 : Lire le mockup JSX original
Le fichier dans `mockups_originaux/XX_NomScreen.jsx` est la **référence visuelle absolue**. Ne pas inventer un design différent — recopier scrupuleusement :
- Tous les classNames Tailwind
- Les icônes Lucide utilisées
- La structure hiérarchique des divs
- Les espacements et tailles

### Étape 2 : Identifier les états et mock data
En haut du JSX, repérer :
- Tous les `useState`
- Tous les objets mock (data, errors, warnings, etc.)
- Tous les handlers (`handleSubmit`, `handleSelectFile`, etc.)

Lister tout ça en commentaires en haut du nouveau fichier TSX.

### Étape 3 : Convertir en TSX avec typage strict
- Tout `useState` doit avoir un type explicite : `useState<string>("")`, `useState<Mode>("login")`
- Tout `onClick`, `onChange` typé : `(e: React.FormEvent) => void`
- Tous les sous-composants ont leur interface Props
- Aucun `any` toléré

### Étape 4 : Remplacer les handlers mock par des hooks
Pour chaque handler ou setTimeout :
- Identifier ce qu'il fait (login, upload, save, etc.)
- Le remplacer par le hook correspondant : `useLogin()`, `useStartImport()`, etc.
- Garder le mock visible **temporairement** avec un commentaire `// TODO: remplacer par useXxx()`

### Étape 5 : Vérifier l'intégration
- Le composant compile sans erreur TypeScript stricte
- Le rendu visuel correspond au mockup original
- Les états loading, error, success sont gérés
- Les toasts apparaissent aux bons moments

---

## Mapping des 6 écrans

Voici l'ordre recommandé d'implémentation (du plus simple au plus complexe) :

| Ordre | Écran | Fichier mockup | Path Next.js | Difficulté |
|---|---|---|---|---|
| 1 | **Auth** | `01_AuthScreen.jsx` | `src/app/auth/page.tsx` | ⭐ Simple |
| 2 | **Database Config** | `02_DatabaseConfigScreen.jsx` | `src/app/database/page.tsx` | ⭐⭐ Moyen |
| 3 | **Dashboard** | `06_DashboardScreen.jsx` | `src/app/(authenticated)/page.tsx` | ⭐⭐ Moyen |
| 4 | **History** | `04_HistoryScreen.jsx` | `src/app/(authenticated)/history/page.tsx` | ⭐⭐⭐ Complexe |
| 5 | **Settings** | `05_SettingsScreen.jsx` | `src/app/(authenticated)/settings/page.tsx` | ⭐⭐⭐ Complexe |
| 6 | **Import Excel** | `03_ImportExcelScreen.jsx` | `src/app/(authenticated)/import/page.tsx` | ⭐⭐⭐⭐ Très complexe |

**Pourquoi l'Import en dernier** : c'est le plus complexe (streaming, table éditable, error panel) et il bénéficiera de toutes les conventions établies dans les écrans précédents.

---

## ÉCRAN 1 — Auth

### Localisation
- **Mockup** : `mockups_originaux/01_AuthScreen.jsx`
- **Cible** : `src/app/auth/page.tsx`

### Particularités importantes

#### Layout non-authentifié
Cet écran est **HORS** du layout `(authenticated)`. Pas de sidebar. Centrage absolu.

```tsx
// src/app/auth/layout.tsx
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-slate-50">{children}</div>;
}
```

#### Toggle login/signup
Garder le pattern `mode === 'login' | 'signup'` du mockup. C'est une seule page avec 2 modes.

#### Validation password en temps réel
Le mockup montre 3 règles visuelles cochées en temps réel (8 caractères, maj/min, chiffre). C'est **déjà fait** dans `SignupSchema` de FOUNDATIONS.md, il suffit de :

```tsx
const password = watch("password"); // depuis useForm
const rules = [
  { label: "Au moins 8 caractères", valid: password?.length >= 8 },
  { label: "Une majuscule et une minuscule", valid: /[a-z]/.test(password) && /[A-Z]/.test(password) },
  { label: "Au moins un chiffre", valid: /\d/.test(password) },
];
```

#### Branchements à faire
- `setLoading(true) + setTimeout(...)` → utiliser `useLogin()` ou `useSignup()` de FOUNDATIONS section 6.1
- Toast d'erreur si email déjà utilisé
- Redirect post-login géré par `AuthContext` (déjà fait)

### Structure cible TSX

```tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, Mail, Eye, EyeOff, Car, ArrowRight, CheckCircle2 } from "lucide-react";
import { LoginSchema, SignupSchema, type LoginInput, type SignupInput } from "@/lib/schemas";
import { useLogin, useSignup } from "@/hooks/use-auth-mutations";

type Mode = "login" | "signup";

export default function AuthPage() {
  const [mode, setMode] = useState<Mode>("login");
  const [showPassword, setShowPassword] = useState(false);

  // ... le reste suit le mockup
}
```

### Checklist Auth

- [ ] Toggle login/signup fonctionne sans perte d'état (email préservé)
- [ ] Validation Zod en temps réel sous chaque champ
- [ ] Bouton Eye/EyeOff toggle password
- [ ] 3 règles password cochées dynamiquement (mode signup)
- [ ] Bouton submit disabled pendant `isPending`
- [ ] Spinner blanc sur fond bleu pendant submit
- [ ] Toast vert après succès, redirection auto
- [ ] Toast rouge avec message clair en cas d'erreur

---

## ÉCRAN 2 — Database Config

### Localisation
- **Mockup** : `mockups_originaux/02_DatabaseConfigScreen.jsx`
- **Cible** : `src/app/database/page.tsx`

### Particularités importantes

#### 4 états distincts
Le mockup gère 4 états via `useState('empty' | 'verifying' | 'connected' | 'error')`. **À conserver tel quel**, mais piloté par les hooks :

```tsx
const { data: dbInfo, isLoading, error } = useDatabaseInfo();
const setAccdbMutation = useSetAccdbPath();
const openDialog = useOpenAccdbDialog();

const state: DbState =
  setAccdbMutation.isPending ? "verifying"
  : error ? "error"
  : dbInfo ? "connected"
  : "empty";
```

#### Détection du fichier verrouillé
Quand l'erreur est "DatabaseLockedError", afficher l'écran d'erreur spécifique (TELETAXI ouvert). Sinon, erreur générique :

```tsx
const isLocked = error?.message.includes("verrouillée");
```

#### Composants helper extraits
Le mockup a 2 sous-composants à extraire dans `src/components/database/` :
- `CheckRow` → `src/components/database/check-row.tsx`
- `InfoCard` → `src/components/database/info-card.tsx`

#### Localisation responsive
Sur écran < 1280px, la sidebar passe en `w-52`. Le contenu central reste `max-w-2xl`.

### Branchements à faire

```tsx
// handleSelectFile du mockup
const handleSelectFile = async () => {
  const path = await openDialog.mutateAsync();
  if (path) {
    await setAccdbMutation.mutateAsync(path);
    // Si succès : useDatabaseInfo refetch automatiquement
    // Si échec : toast d'erreur géré par le hook
  }
};

// handleChangeDb du mockup
const handleChangeDb = () => {
  // TODO: clear le path via tauri.config.setAccdbPath(null)
  // Pour V1, on peut juste relancer handleSelectFile
};
```

### Checklist Database

- [ ] État vide : bouton "Sélectionner ma base"
- [ ] État vérification : 4 checks animés (Loader2 spin)
- [ ] État connecté : 3 InfoCards (Taille, Modifiée, Tables)
- [ ] État connecté : chips des tables détectées
- [ ] État erreur "Base verrouillée" : message spécifique + retry
- [ ] Bouton "Continuer vers l'import" navigue vers `/import`
- [ ] Détails fichier expandable (`<details>` HTML natif fonctionne)
- [ ] Le path peut être copié (clipboard API)

---

## ÉCRAN 3 — Dashboard

### Localisation
- **Mockup** : `mockups_originaux/06_DashboardScreen.jsx`
- **Cible** : `src/app/(authenticated)/page.tsx`

### Particularités importantes

#### Layout authentifié (sidebar partagée)
Le mockup contient sa propre sidebar. Dans la version TSX, **utiliser la sidebar partagée** de `components/layout/sidebar.tsx` (déjà dans le layout `(authenticated)`). Donc le composant `DashboardPage` ne contient **que le contenu principal**.

#### KPIs depuis l'historique
Les 4 KPI cards (Prescripteurs/Bénéficiaires/Courses/Imports) calculés depuis `useImportHistory()` :

```tsx
const { data: history = [] } = useImportHistory();

const kpis = useMemo(() => {
  const totals = history.reduce((acc, h) => ({
    prescripteurs: acc.prescripteurs + h.report.prescripteurs.inseres,
    beneficiaires: acc.beneficiaires + h.report.beneficiaires.inseres,
    courses: acc.courses + h.report.courses.inseres,
  }), { prescripteurs: 0, beneficiaires: 0, courses: 0 });
  return { ...totals, totalImports: history.length };
}, [history]);
```

#### Activité récente
Les 5 dernières lignes de `history` → composant `ActivityRow`.

#### Status système
Lire la config + tester la connexion BD :

```tsx
const { data: config } = useConfig();
const { data: dbInfo } = useDatabaseInfo();

const systemStatus = {
  database: dbInfo ? "connected" : "disconnected",
  java: "ok", // TODO: vérifier via tauri.system.checkJava()
  backup: config?.auto_backup ? "enabled" : "disabled",
};
```

### Composants helper à extraire

- `KpiCard` → `src/components/dashboard/kpi-card.tsx`
- `ActivityRow` → `src/components/dashboard/activity-row.tsx`
- `SystemRow` → `src/components/dashboard/system-row.tsx`
- `QuickAction` → `src/components/dashboard/quick-action.tsx`

### Checklist Dashboard

- [ ] Hero CTA avec icône Plus → navigue vers `/import`
- [ ] 4 KPI cards avec valeurs réelles depuis historique
- [ ] Liste activité récente (5 derniers imports)
- [ ] Status système : BD, Java, Backup
- [ ] Quick actions navigation
- [ ] Teaser V2 features (Scan + IA) sans CTA actif

---

## ÉCRAN 4 — History

### Localisation
- **Mockup** : `mockups_originaux/04_HistoryScreen.jsx`
- **Cible** : `src/app/(authenticated)/history/page.tsx`

### Particularités importantes

#### Liste + Drawer detail
Pattern Linear/Notion : liste à gauche, drawer détail à droite (sliding panel). Le mockup gère ça via `selectedImport` state.

Utiliser le composant `<Sheet>` de shadcn/ui pour le drawer :

```tsx
import { Sheet, SheetContent } from "@/components/ui/sheet";

<Sheet open={!!selectedId} onOpenChange={(open) => !open && setSelectedId(null)}>
  <SheetContent side="right" className="w-full sm:max-w-xl">
    <DetailDrawer importEntry={selectedDetail} />
  </SheetContent>
</Sheet>
```

#### Filtres + recherche
Le mockup a :
- 4 chips de filtre status (`all | success | partial | failed`)
- 1 search input
- 1 dropdown filtre date

À brancher sur `useImportHistory({ status, q })` qui prend ces filtres en paramètres.

#### Pagination
Pour V1, **pagination simple par lots de 20**. `useImportHistory` retourne déjà tous les imports (limit 50), on peut faire la pagination côté client :

```tsx
const PAGE_SIZE = 20;
const paginated = useMemo(() => {
  const start = (page - 1) * PAGE_SIZE;
  return filtered.slice(start, start + PAGE_SIZE);
}, [filtered, page]);
```

#### Log viewer dans le drawer
Le mockup affiche un terminal style noir avec les logs d'un import. Utiliser le composant `<ConsoleLog>` de FOUNDATIONS section 7.4.

Les logs viennent de `log_file_path` du `ImportEntry`. À charger via :

```tsx
// TODO: tauri.history.readLogs(importId) → string[]
```

#### Actions sur un import
Dans le drawer :
- **Voir le rapport** → ouvre une modal ou un export
- **Restaurer le backup** → ouverture confirm dialog destructif
- **Télécharger le log** → save dialog Tauri
- **Supprimer de l'historique** → confirm dialog destructif

### Composants helper à extraire

- `ImportRow` → `src/components/history/import-row.tsx`
- `DetailDrawer` → `src/components/history/detail-drawer.tsx`
- `StatLine` → `src/components/history/stat-line.tsx`
- `LogLine` → déjà dans `ConsoleLog`
- `FilterChip` → `src/components/history/filter-chip.tsx`

### Checklist History

- [ ] Liste virtualizée si > 100 entrées (sinon scroll natif OK)
- [ ] Click sur ligne ouvre le drawer detail
- [ ] Filtres status sont reactive (refetch immédiat)
- [ ] Search debounced (300ms)
- [ ] Pagination buttons disabled correctement
- [ ] Drawer ferme à Escape ou click outside
- [ ] Actions destructives passent par ConfirmDialog
- [ ] Logs viewer avec scroll auto-bottom
- [ ] Empty state si aucun import

---

## ÉCRAN 5 — Settings

### Localisation
- **Mockup** : `mockups_originaux/05_SettingsScreen.jsx`
- **Cible** : `src/app/(authenticated)/settings/page.tsx`

### Particularités importantes

#### Sous-navigation 5 sections
- `account` — Compte (email, mot de passe, déconnexion)
- `database` — Base TELETAXI (chemin .accdb, backup)
- `appearance` — Apparence (thème, langue, densité)
- `advanced` — Avancé (logs, notifications, audit)
- `danger` — Zone de danger (suppression compte, reset)

Pattern : sous-nav verticale à gauche du contenu principal. **Pas via React Router**, juste un state local :

```tsx
type Section = "account" | "database" | "appearance" | "advanced" | "danger";
const [activeSection, setActiveSection] = useState<Section>("account");
```

#### Toggles avec persistance
Chaque toggle (auto_backup, notifications, audit_log) appelle immédiatement `useUpdateSettings()` :

```tsx
const updateSettings = useUpdateSettings();

const handleToggleAutoBackup = (checked: boolean) => {
  updateSettings.mutate({ auto_backup: checked });
};
```

#### Theme switcher
3 modes : light / dark / system. Pour V1, **on peut faire un placeholder** (theme = "system" toujours) car le dark mode est optionnel.

Si on l'implémente : utiliser `next-themes` ou un toggle de classe sur `<html>`.

#### Zone de danger
2 actions destructives :
1. **Supprimer toutes les données locales** (SQLite uniquement, pas le .accdb)
2. **Supprimer le compte** (utilisateur + sessions + historique)

Les deux passent par `ConfirmDialog` avec confirmation textuelle ("Tapez SUPPRIMER pour confirmer") :

```tsx
const [confirmText, setConfirmText] = useState("");
const isConfirmValid = confirmText === "SUPPRIMER";
```

### Composants helper à extraire

- `SubNav` → `src/components/settings/sub-nav.tsx`
- `Section` → `src/components/settings/section.tsx`
- `FormRow` → `src/components/settings/form-row.tsx`
- `ToggleRow` → utiliser `<Switch>` de shadcn + label
- `ThemeOption` → `src/components/settings/theme-option.tsx`
- `DangerSection` → `src/components/settings/danger-section.tsx`
- `ConfirmDeleteModal` → utiliser `<ConfirmDialog>` partagé

### Checklist Settings

- [ ] Sub-navigation gauche fonctionnelle (5 sections)
- [ ] Section Compte : afficher email, bouton changer password (modal)
- [ ] Section Base : chemin .accdb avec bouton "Changer" → navigate `/database`
- [ ] Section Apparence : sélecteurs thème, langue, densité (V2 ok)
- [ ] Section Avancé : 3 toggles (notifications, audit, etc.)
- [ ] Section Danger : 2 boutons + confirmation textuelle obligatoire
- [ ] Toutes les modifs sont persistées immédiatement
- [ ] Toast vert sur changement réussi

---

## ÉCRAN 6 — Import Excel (LE PLUS COMPLEXE)

### Localisation
- **Mockup** : `mockups_originaux/03_ImportExcelScreen.jsx`
- **Cible** : `src/app/(authenticated)/import/page.tsx`

### Particularités importantes

C'est l'écran central de l'app. **Prends ton temps** sur celui-ci. Il a plusieurs phases :

#### Phase A : Upload (pas de fichier)
État `fileLoaded = false` :
- Drag & drop zone large
- Bouton "Parcourir mes fichiers"
- Hint sur formats acceptés

```tsx
const [excelPath, setExcelPath] = useState<string | null>(null);
const openExcel = useOpenExcelDialog();

const handleUpload = async () => {
  const path = await openExcel.mutateAsync();
  if (path) setExcelPath(path);
};
```

#### Phase B : Preview (fichier chargé)
État `fileLoaded = true` :
- Mini barre avec nom de fichier + bouton X pour le retirer
- 3 tabs : Prescripteurs / Bénéficiaires / Courses
- Table éditable avec status par ligne (valid/warning/error)
- Stats agrégées en haut (X valides, Y erreurs, Z warnings)
- Panneau d'erreurs latéral (collapsible)

Brancher sur `useExcelPreview(excelPath)`.

#### Phase C : Import en cours
Quand on clique "Lancer l'import" :
- Modal ou panel qui affiche la progress bar streaming
- Hooks `useStartImport()` + `useImportProgress(importId)`
- Logs en temps réel dans un `<ConsoleLog>`
- Bouton "Annuler" (V1 : seulement bouton "Fermer", l'annulation est complexe à implémenter)

```tsx
const startImport = useStartImport();
const [activeImportId, setActiveImportId] = useState<string | null>(null);
const { progress, report, completed } = useImportProgress(activeImportId);

const handleStartImport = async () => {
  if (!excelPath || !accdbPath) return;
  const result = await startImport.mutateAsync({
    excel_path: excelPath,
    accdb_path: accdbPath,
    backup_enabled: true,
  });
  setActiveImportId(result.import_id);
};
```

#### Phase D : Résultat
Après `completed = true` :
- Afficher le rapport final (3 cards stats)
- Boutons "Voir l'historique", "Nouvel import"
- Si erreurs : afficher liste avec liens vers les lignes Excel

### Table éditable (la partie la plus subtile)

Le mockup permet d'éditer une cellule en ligne. **Pour V1, on peut SIMPLIFIER** :
- Read-only pour V1 (juste prévisualisation)
- Édition en V1.1 si demandé

Cellule simple :

```tsx
function Cell({ value, hasError, hasWarning, placeholder }: CellProps) {
  return (
    <div className={cn(
      "px-3 py-2 text-sm",
      hasError && "bg-red-50 text-red-900",
      hasWarning && "bg-amber-50 text-amber-900"
    )}>
      {value || <span className="text-slate-400 italic">{placeholder}</span>}
    </div>
  );
}
```

### Panneau d'erreurs latéral

Section droite (collapsible) avec 3 tabs : Errors / Warnings / Info.
Chaque issue affiche : ligne + champ + message + suggestion.

```tsx
const issues = useMemo(() => {
  if (!preview) return { errors: [], warnings: [], infos: [] };
  return {
    errors: preview.preview_rows.filter(r => r.status === "error"),
    warnings: preview.preview_rows.filter(r => r.status === "warning"),
    infos: [],
  };
}, [preview]);
```

### Streaming de la progress bar

C'est le **highlight technique** de cet écran. Le hook `useImportProgress` doit :
1. Écouter `tauri.import.onProgress` events
2. Mettre à jour le state local
3. Émettre toast à chaque phase complétée
4. Stocker les logs dans un buffer

```tsx
useEffect(() => {
  if (!activeImportId) return;

  let unlistenProgress: UnlistenFn;
  let unlistenComplete: UnlistenFn;

  (async () => {
    unlistenProgress = await tauri.import.onProgress((p) => {
      if (p.request_id === activeImportId) {
        setProgress(p);
      }
    });
    unlistenComplete = await tauri.import.onComplete((r) => {
      setReport(r);
      setCompleted(true);
      toast.success(`Import terminé : ${r.total_inseres} lignes insérées`);
    });
  })();

  return () => {
    unlistenProgress?.();
    unlistenComplete?.();
  };
}, [activeImportId]);
```

### Composants helper à extraire

- `SheetTab` → `src/components/import/sheet-tab.tsx`
- `StatPill` → `src/components/import/stat-pill.tsx`
- `Cell` → `src/components/import/cell.tsx`
- `ErrorTab` → `src/components/import/error-tab.tsx`
- `ErrorItem` → `src/components/import/error-item.tsx`
- `ProgressPanel` → `src/components/import/progress-panel.tsx` (nouveau composant pour la phase C)
- `ReportSummary` → `src/components/import/report-summary.tsx` (nouveau composant pour la phase D)

### Checklist Import (la plus longue)

#### Phase A — Upload
- [ ] Zone drag & drop visible
- [ ] Bouton "Parcourir" ouvre `useOpenExcelDialog`
- [ ] Validation : refus si extension différente de .xlsx/.xlsm

#### Phase B — Preview
- [ ] Mini-barre avec nom de fichier + bouton X
- [ ] 3 tabs avec compteurs (Prescripteurs / Bénéficiaires / Courses)
- [ ] Table affiche les 10-50 premières lignes (préview)
- [ ] Cellules vides affichent un placeholder
- [ ] Lignes en erreur surlignées en rouge clair
- [ ] Lignes en warning surlignées en orange clair
- [ ] StatPills en haut : Total, Valides, Erreurs, Warnings
- [ ] Bouton "Lancer l'import" disabled si erreurs critiques

#### Phase B — Panneau d'erreurs
- [ ] Collapsible (chevron)
- [ ] 3 tabs : Errors / Warnings / Info
- [ ] Click sur une issue scroll vers la ligne dans la table
- [ ] Bouton "Tout exporter" (CSV ou JSON)

#### Phase C — Import en cours
- [ ] Modal plein écran (ou panel) pendant l'import
- [ ] Progress bar gradient blue
- [ ] Pourcentage tabulaire (e.g. "45 / 100")
- [ ] Console log live (auto-scroll bottom)
- [ ] Pas de bouton "Annuler" pour V1 (juste "Fermer" disabled)

#### Phase D — Résultat
- [ ] 3 cards stats avec icônes : Prescripteurs / Bénéficiaires / Courses
- [ ] Chaque card : Insérés (vert), Ignorés (gris), Erreurs (rouge)
- [ ] Bouton "Voir le rapport" ouvre la page History avec cet import sélectionné
- [ ] Bouton "Nouvel import" reset le state
- [ ] Toast vert global

---

## Ordre d'implémentation recommandé

### Jour 1 — Foundations TSX
- Setup `globals.css` + `tailwind.config.ts`
- Implémenter `lib/types.ts` complet
- Implémenter `lib/schemas.ts` complet
- Implémenter `lib/utils.ts`
- Implémenter les **mock** hooks (use-auth-mutations, use-config, etc.)
- Tester : `pnpm dev` doit afficher la page racine sans erreur

### Jour 2 — Layout + Auth
- Layout racine + providers + auth-context
- Layout `(authenticated)` + Sidebar partagée
- Écran Auth complet (login + signup)
- Branchements mock vers vrais hooks
- Test : signup mock fonctionne, redirect OK

### Jour 3 — Composants partagés
- EmptyState, ConfirmDialog, StatusBadge, ConsoleLog
- Tester chacun isolément dans une page de test

### Jour 4 — Database Config
- Écran complet avec 4 états
- Branchement `useOpenAccdbDialog` + `useSetAccdbPath`
- Test : full flow mock OK

### Jour 5 — Dashboard
- Écran complet avec KPIs depuis history
- Composants helper

### Jour 6 — History (lourd)
- Liste + Drawer detail
- Filtres + recherche + pagination
- Composants helper

### Jour 7 — Settings (lourd)
- 5 sections avec sub-nav
- Tous les toggles + persistance
- Zone de danger avec confirmation

### Jours 8-10 — Import Excel (très lourd)
- Phase A : Upload
- Phase B : Preview + table + panneau erreurs
- Phase C : Streaming progress
- Phase D : Rapport
- Polish + tests

### Jour 11 — Branchements Tauri réels
- Remplacer tous les mocks par les vrais `tauri.*` calls
- Tester chaque écran avec le vrai backend

### Jour 12 — Polish global
- Toasts cohérents
- États loading partout
- Accessibilité
- Responsive 900×600

---

## Conventions de code finales

### Imports
Ordre obligatoire :
```tsx
// 1. React / Next.js
import { useState, useEffect } from "react";
import Link from "next/link";

// 2. Bibliothèques tierces
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Mail } from "lucide-react";

// 3. shadcn/ui
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// 4. Hooks et lib internes
import { useLogin } from "@/hooks/use-auth-mutations";
import { LoginSchema, type LoginInput } from "@/lib/schemas";
import { cn } from "@/lib/utils";

// 5. Composants internes
import { EmptyState } from "@/components/shared/empty-state";
```

### Naming
- Composants : `PascalCase`
- Fichiers : `kebab-case.tsx`
- Hooks : `useCamelCase` (toujours préfixés `use`)
- Types : `PascalCase` (suffix `Type` interdit)
- Props interfaces : `<ComponentName>Props`

### TypeScript strict
- **Zéro `any`** toléré
- **Zéro `// @ts-ignore`** toléré (utiliser `as` si vraiment nécessaire avec commentaire explicatif)
- Toujours typer les retours de fonctions publiques

### Performance
- `useMemo` pour les calculs coûteux (filtres, mappings)
- `useCallback` pour les handlers passés à des composants memoizés
- `React.memo` sur les sous-composants de listes (ImportRow, ActivityRow)

---

**Fin du guide d'intégration des écrans.**

Une fois les 6 écrans implémentés, repasser à la Phase 7 du SPEC principal (packaging Mac/Windows).
