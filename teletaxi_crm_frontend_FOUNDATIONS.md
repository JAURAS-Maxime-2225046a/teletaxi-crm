# TELETAXI CRM — Annexe Frontend : Composants, Hooks et Schemas

> **Document complémentaire au `teletaxi_crm_tauri_SPEC.md`** — Frontend détaillé en TSX strict.
>
> Ce document contient tous les écrans, hooks, schémas Zod et composants prêts à l'emploi pour la construction frontend de TELETAXI CRM.

## Comment utiliser ce document

Ce document est **complémentaire au SPEC principal**. Il se lit dans cet ordre :

1. **Foundations** (sections 1-4) — Setup global, types, design tokens, sidebar
2. **Hooks et schemas** (sections 5-6) — Infrastructure réutilisable
3. **Composants partagés** (section 7) — Petits composants utilisés partout
4. **Écrans détaillés** (sections 8-13) — Les 6 écrans complets

Chaque écran TSX est livré avec :
- ✅ **Composant principal en TSX strict** (typage complet)
- ✅ **Mock data en haut du fichier** (faciles à remplacer)
- ✅ **TODO explicites** marquant où brancher les appels Tauri
- ✅ **Sous-composants** typés et exportables
- ❌ **Pas de branchement Tauri réel** — Claude Code branchera

---

## Table des matières

1. [Setup design tokens et globals.css](#1-setup-design-tokens-et-globalscss)
2. [Types partagés (`lib/types.ts`)](#2-types-partagés-libtypests)
3. [Layout racine (`app/layout.tsx`)](#3-layout-racine-applayouttsx)
4. [Sidebar partagée (`components/layout/sidebar.tsx`)](#4-sidebar-partagée-componentslayoutsidebartsx)
5. [Schémas Zod (`lib/schemas.ts`)](#5-schémas-zod-libschemasts)
6. [Hooks TanStack Query](#6-hooks-tanstack-query)
7. [Composants partagés (`components/shared/`)](#7-composants-partagés-componentsshared)
8. [Écran 1 — Auth (`app/auth/page.tsx`)](#8-écran-1--auth-appauthpagetsx)
9. [Écran 2 — Database Config (`app/database/page.tsx`)](#9-écran-2--database-config-appdatabasepagetsx)
10. [Écran 3 — Import Excel (`app/import/page.tsx`)](#10-écran-3--import-excel-appimportpagetsx)
11. [Écran 4 — History (`app/history/page.tsx`)](#11-écran-4--history-apphistorypagetsx)
12. [Écran 5 — Settings (`app/settings/page.tsx`)](#12-écran-5--settings-appsettingspagetsx)
13. [Écran 6 — Dashboard (`app/page.tsx`)](#13-écran-6--dashboard-apppagetsx)
14. [Checklist d'intégration finale](#14-checklist-dintégration-finale)

---

## 1. Setup design tokens et globals.css

### 1.1 `src/app/globals.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* shadcn/ui slate theme */
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
    --radius: 0.5rem;
  }

  * {
    @apply border-border;
  }

  body {
    @apply bg-background text-foreground antialiased;
    font-feature-settings: "rlig" 1, "calt" 1;
  }

  /* Scrollbars sobres */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  ::-webkit-scrollbar-track {
    @apply bg-transparent;
  }
  ::-webkit-scrollbar-thumb {
    @apply bg-slate-300 rounded-full;
  }
  ::-webkit-scrollbar-thumb:hover {
    @apply bg-slate-400;
  }
}

@layer utilities {
  /* Désactive la sélection de texte sur les boutons et éléments UI */
  .select-none-ui {
    -webkit-user-select: none;
    user-select: none;
  }

  /* Tabular nums pour les chiffres alignés */
  .tabular-nums {
    font-variant-numeric: tabular-nums;
  }
}
```

### 1.2 `tailwind.config.ts`

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
```

### 1.3 `src/lib/utils.ts`

```typescript
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / 1024 / 1024).toFixed(1)} Mo`;
}

export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const diffMs = Date.now() - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return "à l'instant";
  if (diffMin < 60) return `Il y a ${diffMin} min`;
  if (diffHr < 24) return `Il y a ${diffHr} h`;
  if (diffDay < 7) return `Il y a ${diffDay} j`;
  return d.toLocaleDateString("fr-FR");
}

export function truncate(str: string, max: number): string {
  if (str.length <= max) return str;
  return str.slice(0, max - 1) + "…";
}
```

---

## 2. Types partagés (`lib/types.ts`)

```typescript
/**
 * Types partagés entre le frontend et le backend Tauri.
 *
 * Ces types DOIVENT correspondre aux types Rust exposés par les
 * commandes Tauri (cf. src-tauri/src/commands/).
 */

// ─── Authentication ────────────────────────────────────────────────────────

export interface User {
  id: number;
  email: string;
  display_name: string | null;
  created_at: string; // ISO 8601
  last_login_at: string | null;
}

export interface AuthResult {
  user_id: number;
  email: string;
  session_token: string;
}

export interface Session {
  user: User;
  token: string;
}

// ─── Configuration ─────────────────────────────────────────────────────────

export interface AppConfig {
  accdb_path: string | null;
  backup_enabled: boolean;
  backup_dir: string | null;
  theme: "light" | "dark" | "system";
  language: "fr" | "en";
  auto_backup: boolean;
  notifications_enabled: boolean;
  audit_log_enabled: boolean;
}

export interface DatabaseInfo {
  path: string;
  size_bytes: number;
  modified_at: string;
  tables_count: number;
  tables: string[];
  counts: {
    PRESCRIPTEUR?: number;
    PATIENT?: number;
    TRANSPORT?: number;
  };
}

// ─── Import ────────────────────────────────────────────────────────────────

export type ImportStatus = "running" | "success" | "partial" | "error";
export type ImportPhase =
  | "starting"
  | "opening_excel"
  | "loading_cache"
  | "prescripteurs"
  | "beneficiaires"
  | "courses"
  | "writing_report"
  | "done";

export interface ImportProgress {
  request_id: string;
  phase: ImportPhase;
  current: number;
  total: number;
  message: string;
}

export interface EntityStats {
  inseres: number;
  ignores: number;
  erreurs: number;
}

export interface ImportReport {
  prescripteurs: EntityStats;
  beneficiaires: EntityStats;
  courses: EntityStats;
  total_inseres: number;
  total_erreurs: number;
}

export interface ImportEntry {
  id: string;
  user_id: number;
  excel_filename: string;
  excel_path: string;
  accdb_path: string;
  started_at: string;
  ended_at: string | null;
  status: ImportStatus;
  duration_ms: number | null;
  report: ImportReport;
  log_file_path: string | null;
  backup_path: string | null;
  error_message: string | null;
}

// ─── Excel Preview ─────────────────────────────────────────────────────────

export type RowStatus = "valid" | "warning" | "error";

export interface ExcelRowPreview {
  row_number: number;
  status: RowStatus;
  data: Record<string, unknown>;
  error_field?: string;
  warning_field?: string;
}

export interface ExcelPreview {
  sheet_name: string;
  total_rows: number;
  preview_rows: ExcelRowPreview[];
}

// ─── Errors & Warnings ─────────────────────────────────────────────────────

export type IssueSeverity = "error" | "warning" | "info";

export interface ImportIssue {
  severity: IssueSeverity;
  sheet: "prescripteurs" | "beneficiaires" | "courses";
  row: number;
  field?: string;
  message: string;
  suggestion?: string;
}

// ─── Sidecar protocol ──────────────────────────────────────────────────────

export interface SidecarLogEvent {
  request_id: string;
  level: "debug" | "info" | "warning" | "error";
  message: string;
}

export interface SidecarError {
  request_id: string;
  code: string;
  message: string;
  details?: string;
}
```

---

## 3. Layout racine (`app/layout.tsx`)

```tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import { Providers } from "@/components/providers";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TELETAXI CRM",
  description: "Compagnon de saisie pour TeleTaxi",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={inter.className}>
      <body className="bg-slate-50 text-slate-900 antialiased overflow-hidden h-screen">
        <Providers>
          {children}
          <Toaster
            position="bottom-right"
            richColors
            closeButton
            duration={4000}
          />
        </Providers>
      </body>
    </html>
  );
}
```

### 3.1 Providers

`src/components/providers.tsx` :

```tsx
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { AuthProvider } from "@/contexts/auth-context";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  );
}
```

### 3.2 Auth Context

`src/contexts/auth-context.tsx` :

```tsx
"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import type { Session, User } from "@/lib/types";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signin: (session: Session) => void;
  signout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const SESSION_STORAGE_KEY = "teletaxi_session";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Charge la session au démarrage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(SESSION_STORAGE_KEY);
      if (raw) {
        setSession(JSON.parse(raw) as Session);
      }
    } catch {
      // Session corrompue : on l'efface
      localStorage.removeItem(SESSION_STORAGE_KEY);
    } finally {
      setLoading(false);
    }
  }, []);

  // Redirige vers /auth si non connecté
  useEffect(() => {
    if (loading) return;
    const isAuthPage = pathname.startsWith("/auth");
    if (!session && !isAuthPage) {
      router.replace("/auth");
    } else if (session && isAuthPage) {
      router.replace("/");
    }
  }, [session, loading, pathname, router]);

  const signin = (newSession: Session) => {
    setSession(newSession);
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(newSession));
  };

  const signout = () => {
    setSession(null);
    localStorage.removeItem(SESSION_STORAGE_KEY);
    router.replace("/auth");
  };

  return (
    <AuthContext.Provider
      value={{ user: session?.user ?? null, session, loading, signin, signout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
```

### 3.3 Layout authentifié

`src/app/(authenticated)/layout.tsx` :

```tsx
"use client";

import { Sidebar } from "@/components/layout/sidebar";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
```

---

## 4. Sidebar partagée (`components/layout/sidebar.tsx`)

La sidebar est utilisée par **tous les écrans authentifiés**. Pattern factorisé depuis les 6 mockups :

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Car, Home, Upload, History, Settings, Database,
  Camera, Sparkles, ShieldCheck, ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";

// TODO: brancher sur tauri.config.getConfig() via useConfig hook
const MOCK_DB_STATUS = {
  connected: true,
  filename: "data.accdb",
};

interface NavItem {
  href: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  badge?: string;
  soon?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/", icon: Home, label: "Dashboard" },
  { href: "/import", icon: Upload, label: "Importer Excel" },
  { href: "/history", icon: History, label: "Historique" },
];

const NAV_ITEMS_V2: NavItem[] = [
  { href: "/scan", icon: Camera, label: "Scanner bons", soon: true },
  { href: "/ai", icon: Sparkles, label: "Assistant IA", soon: true },
];

const NAV_ITEMS_BOTTOM: NavItem[] = [
  { href: "/settings", icon: Settings, label: "Réglages" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, signout } = useAuth();

  return (
    <aside className="w-52 xl:w-60 bg-white border-r border-slate-200 flex flex-col shrink-0">
      {/* Logo + titre */}
      <div className="px-4 py-4 border-b border-slate-200 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
          <Car className="w-4 h-4 text-white" strokeWidth={2.5} />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-900 tracking-tight truncate">
            TELETAXI <span className="text-blue-600">CRM</span>
          </p>
          <p className="text-xs text-slate-500 truncate">Compagnon TeleTaxi</p>
        </div>
      </div>

      {/* Statut base de données */}
      <Link
        href="/database"
        title="Gérer la base de données"
        className={cn(
          "mx-3 mt-3 mb-1 px-2.5 py-2 rounded-lg flex items-center gap-2 transition-colors text-left",
          MOCK_DB_STATUS.connected
            ? "bg-green-50/50 border border-green-100 hover:bg-green-100/60 hover:border-green-200"
            : "bg-amber-50/50 border border-amber-100 hover:bg-amber-100/60"
        )}
      >
        <div
          className={cn(
            "w-7 h-7 rounded-md flex items-center justify-center shrink-0",
            MOCK_DB_STATUS.connected ? "bg-green-100" : "bg-amber-100"
          )}
        >
          <Database
            className={cn(
              "w-3.5 h-3.5",
              MOCK_DB_STATUS.connected ? "text-green-700" : "text-amber-700"
            )}
          />
        </div>
        <div className="min-w-0 flex-1">
          <p
            className={cn(
              "text-xs font-medium leading-tight truncate",
              MOCK_DB_STATUS.connected ? "text-green-900" : "text-amber-900"
            )}
          >
            {MOCK_DB_STATUS.connected ? "Base connectée" : "Base à configurer"}
          </p>
          <p
            className={cn(
              "text-[10px] truncate",
              MOCK_DB_STATUS.connected ? "text-green-700" : "text-amber-700"
            )}
          >
            {MOCK_DB_STATUS.connected ? MOCK_DB_STATUS.filename : "Cliquez pour configurer"}
          </p>
        </div>
        <ChevronRight
          className={cn(
            "w-3.5 h-3.5 shrink-0",
            MOCK_DB_STATUS.connected ? "text-green-600" : "text-amber-600"
          )}
        />
      </Link>

      {/* Navigation principale */}
      <nav className="flex-1 px-2 py-2 space-y-0.5 overflow-y-auto">
        <SidebarSection label="Principal" />
        {NAV_ITEMS.map((item) => (
          <SidebarItem
            key={item.href}
            href={item.href}
            icon={item.icon}
            label={item.label}
            active={pathname === item.href}
          />
        ))}

        <SidebarSection label="Bientôt disponible" />
        {NAV_ITEMS_V2.map((item) => (
          <SidebarItem
            key={item.href}
            href={item.href}
            icon={item.icon}
            label={item.label}
            soon
          />
        ))}
      </nav>

      {/* Bas de sidebar : settings + user */}
      <div className="border-t border-slate-200 p-2 space-y-0.5">
        {NAV_ITEMS_BOTTOM.map((item) => (
          <SidebarItem
            key={item.href}
            href={item.href}
            icon={item.icon}
            label={item.label}
            active={pathname === item.href}
          />
        ))}

        <button
          type="button"
          onClick={signout}
          className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-medium text-slate-600 shrink-0">
            {user?.email?.charAt(0).toUpperCase() ?? "U"}
          </div>
          <div className="min-w-0 flex-1 text-left">
            <p className="font-medium text-slate-900 truncate">
              {user?.display_name ?? user?.email ?? "Utilisateur"}
            </p>
            <p className="text-[10px] text-slate-500 truncate">Déconnexion</p>
          </div>
        </button>
      </div>
    </aside>
  );
}

// ─── Sous-composants ─────────────────────────────────────────────────────

function SidebarSection({ label }: { label: string }) {
  return (
    <p className="text-[10px] uppercase tracking-wider font-medium text-slate-400 px-2.5 pt-3 pb-1">
      {label}
    </p>
  );
}

interface SidebarItemProps {
  href: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  active?: boolean;
  badge?: string;
  soon?: boolean;
}

function SidebarItem({
  href,
  icon: Icon,
  label,
  active,
  badge,
  soon,
}: SidebarItemProps) {
  const className = cn(
    "flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs transition-colors",
    active
      ? "bg-blue-50 text-blue-700 font-medium"
      : soon
        ? "text-slate-400 cursor-not-allowed"
        : "text-slate-700 hover:bg-slate-100"
  );

  const content = (
    <>
      <Icon
        className={cn(
          "w-4 h-4 shrink-0",
          active ? "text-blue-700" : soon ? "text-slate-400" : "text-slate-500"
        )}
        strokeWidth={active ? 2.5 : 2}
      />
      <span className="flex-1 truncate">{label}</span>
      {badge && (
        <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-medium">
          {badge}
        </span>
      )}
      {soon && (
        <span className="text-[9px] uppercase tracking-wide bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
          Soon
        </span>
      )}
    </>
  );

  if (soon) {
    return <div className={className}>{content}</div>;
  }
  return (
    <Link href={href} className={className}>
      {content}
    </Link>
  );
}
```

---

## 5. Schémas Zod (`lib/schemas.ts`)

```typescript
import { z } from "zod";

// ─── Auth ──────────────────────────────────────────────────────────────────

export const LoginSchema = z.object({
  email: z
    .string()
    .min(1, "Email requis")
    .email("Email invalide"),
  password: z
    .string()
    .min(1, "Mot de passe requis"),
  remember: z.boolean().optional(),
});

export type LoginInput = z.infer<typeof LoginSchema>;

export const SignupSchema = z
  .object({
    email: z
      .string()
      .min(1, "Email requis")
      .email("Email invalide"),
    password: z
      .string()
      .min(8, "Au moins 8 caractères")
      .regex(/[a-z]/, "Doit contenir une minuscule")
      .regex(/[A-Z]/, "Doit contenir une majuscule")
      .regex(/\d/, "Doit contenir un chiffre"),
    confirmPassword: z.string().min(1, "Confirmation requise"),
    displayName: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

export type SignupInput = z.infer<typeof SignupSchema>;

// ─── Database config ───────────────────────────────────────────────────────

export const DatabasePathSchema = z.object({
  accdb_path: z
    .string()
    .min(1, "Chemin requis")
    .endsWith(".accdb", "Le fichier doit être un .accdb"),
});

export type DatabasePathInput = z.infer<typeof DatabasePathSchema>;

// ─── Import ────────────────────────────────────────────────────────────────

export const ImportConfigSchema = z.object({
  excel_path: z
    .string()
    .min(1, "Fichier Excel requis")
    .regex(/\.(xlsx|xlsm|xls)$/i, "Le fichier doit être un Excel"),
  accdb_path: z.string().min(1, "Chemin .accdb requis"),
  backup_enabled: z.boolean().default(true),
  dry_run: z.boolean().default(false),
});

export type ImportConfigInput = z.infer<typeof ImportConfigSchema>;

// ─── Settings ──────────────────────────────────────────────────────────────

export const SettingsSchema = z.object({
  theme: z.enum(["light", "dark", "system"]),
  language: z.enum(["fr", "en"]),
  auto_backup: z.boolean(),
  notifications_enabled: z.boolean(),
  audit_log_enabled: z.boolean(),
});

export type SettingsInput = z.infer<typeof SettingsSchema>;

export const ChangePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Mot de passe actuel requis"),
    newPassword: z
      .string()
      .min(8, "Au moins 8 caractères")
      .regex(/[a-z]/, "Doit contenir une minuscule")
      .regex(/[A-Z]/, "Doit contenir une majuscule")
      .regex(/\d/, "Doit contenir un chiffre"),
    confirmNewPassword: z.string().min(1, "Confirmation requise"),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmNewPassword"],
  });

export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>;
```

---

## 6. Hooks TanStack Query

### 6.1 `src/hooks/use-auth-mutations.ts`

```typescript
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth-context";
import type { LoginInput, SignupInput } from "@/lib/schemas";

// TODO: importer depuis @/lib/tauri quand prêt
// import { tauri } from "@/lib/tauri";

// MOCK temporaire — à remplacer par tauri.auth.* dans use-auth-mutations.ts
async function mockLogin(input: LoginInput) {
  await new Promise((r) => setTimeout(r, 800));
  return {
    user_id: 1,
    email: input.email,
    session_token: "mock-token-" + Date.now(),
  };
}

async function mockSignup(input: SignupInput) {
  await new Promise((r) => setTimeout(r, 1200));
  return {
    user_id: 1,
    email: input.email,
    session_token: "mock-token-" + Date.now(),
  };
}

export function useLogin() {
  const router = useRouter();
  const { signin } = useAuth();

  return useMutation({
    // TODO: remplacer par tauri.auth.login(input.email, input.password)
    mutationFn: (input: LoginInput) => mockLogin(input),
    onSuccess: (data) => {
      signin({
        token: data.session_token,
        user: {
          id: data.user_id,
          email: data.email,
          display_name: null,
          created_at: new Date().toISOString(),
          last_login_at: new Date().toISOString(),
        },
      });
      toast.success("Connexion réussie");
      router.replace("/");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Échec de la connexion");
    },
  });
}

export function useSignup() {
  const router = useRouter();
  const { signin } = useAuth();

  return useMutation({
    // TODO: remplacer par tauri.auth.signup({ email, password, display_name })
    mutationFn: (input: SignupInput) => mockSignup(input),
    onSuccess: (data) => {
      signin({
        token: data.session_token,
        user: {
          id: data.user_id,
          email: data.email,
          display_name: null,
          created_at: new Date().toISOString(),
          last_login_at: new Date().toISOString(),
        },
      });
      toast.success("Compte créé avec succès");
      router.replace("/database"); // Première config
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Échec de l'inscription");
    },
  });
}
```

### 6.2 `src/hooks/use-config.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { AppConfig, DatabaseInfo } from "@/lib/types";

const QUERY_KEYS = {
  config: ["config"] as const,
  databaseInfo: ["database-info"] as const,
};

// TODO: remplacer par tauri.config.getConfig()
async function mockGetConfig(): Promise<AppConfig> {
  await new Promise((r) => setTimeout(r, 200));
  return {
    accdb_path: null,
    backup_enabled: true,
    backup_dir: null,
    theme: "system",
    language: "fr",
    auto_backup: true,
    notifications_enabled: true,
    audit_log_enabled: true,
  };
}

async function mockSetAccdbPath(path: string): Promise<DatabaseInfo> {
  await new Promise((r) => setTimeout(r, 1500));
  return {
    path,
    size_bytes: 47_200_000,
    modified_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    tables_count: 14,
    tables: ["PRESCRIPTEUR", "PATIENT", "TRANSPORT", "MEMBRE", "VOITURE"],
    counts: { PRESCRIPTEUR: 2381, PATIENT: 9128, TRANSPORT: 111295 },
  };
}

async function mockTestConnection(path: string): Promise<DatabaseInfo> {
  await new Promise((r) => setTimeout(r, 2000));
  return mockGetConfig().then(() => mockSetAccdbPath(path));
}

export function useConfig() {
  return useQuery({
    queryKey: QUERY_KEYS.config,
    // TODO: remplacer par tauri.config.getConfig
    queryFn: mockGetConfig,
  });
}

export function useDatabaseInfo() {
  const { data: config } = useConfig();
  return useQuery({
    queryKey: [...QUERY_KEYS.databaseInfo, config?.accdb_path],
    queryFn: () => {
      if (!config?.accdb_path) return null;
      // TODO: remplacer par tauri.config.testConnection(config.accdb_path)
      return mockTestConnection(config.accdb_path);
    },
    enabled: !!config?.accdb_path,
  });
}

export function useSetAccdbPath() {
  const qc = useQueryClient();
  return useMutation({
    // TODO: remplacer par tauri.config.setAccdbPath(path) puis testConnection
    mutationFn: (path: string) => mockSetAccdbPath(path),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.config });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.databaseInfo });
      toast.success("Base de données configurée");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Échec de la configuration");
    },
  });
}

export function useUpdateSettings() {
  const qc = useQueryClient();
  return useMutation({
    // TODO: remplacer par tauri.config.updateSettings(...)
    mutationFn: async (partial: Partial<AppConfig>) => {
      await new Promise((r) => setTimeout(r, 400));
      return partial;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.config });
      toast.success("Réglages enregistrés");
    },
  });
}
```

### 6.3 `src/hooks/use-import.ts`

```typescript
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type {
  ExcelPreview,
  ImportEntry,
  ImportProgress,
  ImportReport,
} from "@/lib/types";

const QUERY_KEYS = {
  excelPreview: (path: string) => ["excel-preview", path] as const,
  importHistory: ["import-history"] as const,
  importDetail: (id: string) => ["import-detail", id] as const,
};

// ─── Mock ────────────────────────────────────────────────────────────────

async function mockPreviewExcel(excelPath: string): Promise<ExcelPreview> {
  await new Promise((r) => setTimeout(r, 600));
  return {
    sheet_name: "Prescripteurs",
    total_rows: 23,
    preview_rows: [
      // ... données mock
    ],
  };
}

async function mockRunImport(params: {
  excel_path: string;
  accdb_path: string;
  backup_enabled: boolean;
}): Promise<{ import_id: string }> {
  await new Promise((r) => setTimeout(r, 100));
  return { import_id: "mock-" + Date.now() };
}

async function mockGetHistory(): Promise<ImportEntry[]> {
  await new Promise((r) => setTimeout(r, 400));
  return [];
}

async function mockGetImportDetail(id: string): Promise<ImportEntry | null> {
  await new Promise((r) => setTimeout(r, 200));
  return null;
}

// ─── Hooks ───────────────────────────────────────────────────────────────

export function useExcelPreview(excelPath: string | null) {
  return useQuery({
    queryKey: QUERY_KEYS.excelPreview(excelPath ?? ""),
    // TODO: remplacer par tauri.import.previewExcel({ excel_path: excelPath })
    queryFn: () => (excelPath ? mockPreviewExcel(excelPath) : null),
    enabled: !!excelPath,
  });
}

export function useStartImport() {
  const qc = useQueryClient();
  return useMutation({
    // TODO: remplacer par tauri.import.run(params)
    mutationFn: mockRunImport,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.importHistory });
    },
  });
}

export function useImportHistory(filters?: { status?: string; q?: string }) {
  return useQuery({
    queryKey: [...QUERY_KEYS.importHistory, filters],
    // TODO: remplacer par tauri.history.list({ limit: 50, filters })
    queryFn: () => mockGetHistory(),
  });
}

export function useImportDetail(id: string | null) {
  return useQuery({
    queryKey: QUERY_KEYS.importDetail(id ?? ""),
    // TODO: remplacer par tauri.history.get(id)
    queryFn: () => (id ? mockGetImportDetail(id) : null),
    enabled: !!id,
  });
}

/**
 * Hook qui écoute les événements de progression d'un import en cours.
 *
 * TODO: brancher sur les events Tauri :
 *   tauri.import.onProgress(callback)
 *   tauri.import.onComplete(callback)
 *   tauri.import.onError(callback)
 */
export function useImportProgress(importId: string | null) {
  const [progress, setProgress] = useState<ImportProgress | null>(null);
  const [report, setReport] = useState<ImportReport | null>(null);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (!importId) {
      setProgress(null);
      setReport(null);
      setCompleted(false);
      return;
    }

    // TODO: remplacer par les vrais listeners Tauri
    // const unlistenProgress = await tauri.import.onProgress((p) => {
    //   if (p.request_id === importId) setProgress(p);
    // });
    // const unlistenComplete = await tauri.import.onComplete((r) => {
    //   setReport(r);
    //   setCompleted(true);
    // });
    // return () => { unlistenProgress(); unlistenComplete(); };

    // Mock simulation
    const phases: Array<ImportProgress["phase"]> = [
      "starting", "opening_excel", "loading_cache",
      "prescripteurs", "beneficiaires", "courses", "writing_report", "done",
    ];
    let idx = 0;
    const interval = setInterval(() => {
      if (idx >= phases.length) {
        clearInterval(interval);
        setCompleted(true);
        return;
      }
      setProgress({
        request_id: importId,
        phase: phases[idx],
        current: 50,
        total: 100,
        message: `Phase: ${phases[idx]}`,
      });
      idx++;
    }, 800);

    return () => clearInterval(interval);
  }, [importId]);

  return { progress, report, completed };
}
```

### 6.4 `src/hooks/use-file-dialogs.ts`

```typescript
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

// TODO: importer depuis @tauri-apps/plugin-dialog
// import { open } from "@tauri-apps/plugin-dialog";

export function useOpenExcelDialog() {
  return useMutation({
    mutationFn: async (): Promise<string | null> => {
      // TODO: remplacer par :
      // const path = await open({
      //   filters: [{ name: "Excel", extensions: ["xlsx", "xlsm", "xls"] }],
      //   multiple: false,
      // });
      // return typeof path === "string" ? path : null;

      // Mock pour le dev frontend
      return new Promise((resolve) => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = ".xlsx,.xlsm,.xls";
        input.onchange = () => {
          const file = input.files?.[0];
          resolve(file ? file.name : null);
        };
        input.click();
      });
    },
    onError: () => toast.error("Impossible d'ouvrir le sélecteur de fichier"),
  });
}

export function useOpenAccdbDialog() {
  return useMutation({
    mutationFn: async (): Promise<string | null> => {
      // TODO: remplacer par open({ filters: [{ name: "Access", extensions: ["accdb"] }] })
      return new Promise((resolve) => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = ".accdb";
        input.onchange = () => {
          const file = input.files?.[0];
          resolve(file ? file.name : null);
        };
        input.click();
      });
    },
  });
}
```

---

## 7. Composants partagés (`components/shared/`)

### 7.1 `components/shared/empty-state.tsx`

```tsx
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center text-center py-12 px-6",
        className
      )}
    >
      <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
        <Icon className="w-7 h-7 text-slate-400" strokeWidth={1.8} />
      </div>
      <h3 className="text-base font-medium text-slate-900 mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-slate-500 mb-5 max-w-sm">{description}</p>
      )}
      {action}
    </div>
  );
}
```

### 7.2 `components/shared/confirm-dialog.tsx`

```tsx
"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void | Promise<void>;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirmer",
  cancelLabel = "Annuler",
  destructive,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            {destructive && (
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
            )}
            <DialogTitle>{title}</DialogTitle>
          </div>
          <DialogDescription className="pt-2">{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {cancelLabel}
          </Button>
          <Button
            variant={destructive ? "destructive" : "default"}
            onClick={async () => {
              await onConfirm();
              onOpenChange(false);
            }}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

### 7.3 `components/shared/status-badge.tsx`

```tsx
import { cn } from "@/lib/utils";
import { CheckCircle2, AlertCircle, AlertTriangle, Loader2 } from "lucide-react";

type Status = "success" | "warning" | "error" | "loading" | "neutral";

interface StatusBadgeProps {
  status: Status;
  label: string;
  size?: "sm" | "md";
}

const STATUS_CONFIG: Record<Status, { bg: string; text: string; icon: React.ComponentType<{ className?: string }> }> = {
  success: { bg: "bg-green-50 text-green-700 border-green-200", text: "text-green-700", icon: CheckCircle2 },
  warning: { bg: "bg-amber-50 text-amber-700 border-amber-200", text: "text-amber-700", icon: AlertTriangle },
  error: { bg: "bg-red-50 text-red-700 border-red-200", text: "text-red-700", icon: AlertCircle },
  loading: { bg: "bg-blue-50 text-blue-700 border-blue-200", text: "text-blue-700", icon: Loader2 },
  neutral: { bg: "bg-slate-100 text-slate-700 border-slate-200", text: "text-slate-700", icon: CheckCircle2 },
};

export function StatusBadge({ status, label, size = "md" }: StatusBadgeProps) {
  const { bg, icon: Icon } = STATUS_CONFIG[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border font-medium",
        bg,
        size === "sm" ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-1 text-xs"
      )}
    >
      <Icon
        className={cn(
          size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5",
          status === "loading" && "animate-spin"
        )}
      />
      {label}
    </span>
  );
}
```

### 7.4 `components/shared/console-log.tsx`

```tsx
import { cn } from "@/lib/utils";

interface LogLine {
  time: string;
  level: "DEBUG" | "INFO" | "WARN" | "ERROR";
  message: string;
}

interface ConsoleLogProps {
  lines: LogLine[];
  maxHeight?: string;
}

const LEVEL_COLORS = {
  DEBUG: "text-slate-400",
  INFO: "text-blue-300",
  WARN: "text-amber-300",
  ERROR: "text-red-300",
};

export function ConsoleLog({ lines, maxHeight = "400px" }: ConsoleLogProps) {
  return (
    <div
      className="bg-slate-900 text-slate-100 font-mono text-xs rounded-lg overflow-auto"
      style={{ maxHeight }}
    >
      <div className="p-3 space-y-0.5">
        {lines.map((line, idx) => (
          <div key={idx} className="flex gap-3 leading-relaxed">
            <span className="text-slate-500 shrink-0">{line.time}</span>
            <span className={cn("font-medium shrink-0 w-12", LEVEL_COLORS[line.level])}>
              {line.level}
            </span>
            <span className="text-slate-200 break-all">{line.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 8-13 Écrans détaillés

> **Note importante** : Les sections 8 à 13 contiennent les 6 écrans en TSX complet. Vu leur volume (~3500 lignes au total), ils sont livrés dans un **document séparé** : `teletaxi_crm_screens_DETAILED.md`.
>
> Chaque écran y est livré avec :
> - Mock data en haut de fichier
> - TSX complet typé
> - Sous-composants extraits si pertinent
> - TODO marqués pour les branchements Tauri

---

## 14. Checklist d'intégration finale

Une fois tous les écrans implémentés, Claude Code doit valider :

### 14.1 Branchements Tauri

- [ ] `useLogin` branche `tauri.auth.login()`
- [ ] `useSignup` branche `tauri.auth.signup()`
- [ ] `useConfig` branche `tauri.config.getConfig()`
- [ ] `useSetAccdbPath` branche `tauri.config.setAccdbPath()` + `tauri.import.testConnection()`
- [ ] `useExcelPreview` branche `tauri.import.previewExcel()`
- [ ] `useStartImport` branche `tauri.import.run()`
- [ ] `useImportProgress` branche les listeners `tauri.import.onProgress/onComplete/onError`
- [ ] `useImportHistory` branche `tauri.history.list()`
- [ ] `useImportDetail` branche `tauri.history.get()`
- [ ] `useOpenExcelDialog` branche `@tauri-apps/plugin-dialog::open`
- [ ] `useOpenAccdbDialog` branche `@tauri-apps/plugin-dialog::open`

### 14.2 Navigation et auth

- [ ] Redirection `/auth` → `/` après login
- [ ] Redirection `/` → `/auth` si non connecté
- [ ] Redirection `/auth` → `/database` après premier signup
- [ ] Persistance de la session (localStorage) survive au refresh
- [ ] Logout efface la session et redirige vers `/auth`

### 14.3 Validation des formulaires

- [ ] Tous les formulaires utilisent `react-hook-form` + `zodResolver`
- [ ] Les erreurs Zod s'affichent sous les champs
- [ ] Les boutons sont disabled quand le form est invalide
- [ ] Les états loading désactivent les soumissions

### 14.4 Toasts (notifications)

- [ ] Succès login : toast vert
- [ ] Erreur réseau ou Tauri : toast rouge
- [ ] Action ambiguë (warning) : toast orange
- [ ] Pas de toast pour les actions silencieuses (navigation)

### 14.5 Accessibilité

- [ ] Tab navigation fonctionne sur tous les écrans
- [ ] Boutons ont des `aria-label` quand nécessaire (icon-only)
- [ ] Modals se ferment à Échap
- [ ] Focus visible sur tous les éléments interactifs

### 14.6 Performance

- [ ] Pas de re-render inutile dans les listes (`React.memo` si besoin)
- [ ] TanStack Query déduplique les requêtes parallèles
- [ ] Les hooks ne refetch pas en boucle (vérifier les dépendances)

### 14.7 Polish visuel

- [ ] Tous les états loading affichent un Spinner ou Skeleton
- [ ] Tous les états vides utilisent `<EmptyState>` partagé
- [ ] Les listes longues sont scrollables (pas de page entière qui scrolle)
- [ ] Sidebar reste fixe pendant le scroll du contenu
- [ ] Responsive minimum 900×600

---

**Fin du document complémentaire frontend.**

Le document `teletaxi_crm_screens_DETAILED.md` contient les 6 écrans complets en TSX.
