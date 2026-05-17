"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTheme } from "next-themes";
import {
  User, Database, Palette, Shield, AlertTriangle,
  ChevronRight, Mail, Key, LogOut, Bell, ShieldCheck,
  FolderOpen, RefreshCw, Sun, Moon, Monitor, CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { tauri } from "@/lib/tauri";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";

type Section = "account" | "database" | "appearance" | "advanced" | "danger";

const SECTIONS: { id: Section; icon: React.ComponentType<{ className?: string }>; label: string; danger?: boolean }[] = [
  { id: "account", icon: User, label: "Compte" },
  { id: "database", icon: Database, label: "Base de données" },
  { id: "appearance", icon: Palette, label: "Apparence" },
  { id: "advanced", icon: Shield, label: "Avancé" },
  { id: "danger", icon: AlertTriangle, label: "Zone sensible", danger: true },
];

export default function SettingsPage() {
  const [active, setActive] = useState<Section>("account");
  const { user, signout, session } = useAuth();
  const qc = useQueryClient();
  const { theme, setTheme } = useTheme();

  const { data: config } = useQuery({ queryKey: ["config"], queryFn: tauri.config.get });

  const handleLogout = async () => {
    if (session?.token) {
      try { await tauri.auth.logout(session.token); } catch {}
    }
    signout();
  };

  const handleChangeDb = async () => {
    try {
      const path = await tauri.config.openAccdbDialog();
      if (!path) return;
      await tauri.config.setAccdbPath(path);
      qc.invalidateQueries({ queryKey: ["config"] });
      toast.success("Base mise à jour");
    } catch (e) {
      toast.error(`Erreur : ${e}`);
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-6 py-3.5 shrink-0">
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-0.5">
          <span>Paramètres</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-slate-900 dark:text-slate-100 font-medium">Configuration</span>
        </div>
        <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100 tracking-tight">Configuration</h1>
      </header>

      <div className="flex-1 flex min-h-0">
        {/* Sub-nav */}
        <nav className="w-44 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 p-3 shrink-0 hidden lg:flex lg:flex-col">
          <div className="space-y-0.5 flex-1">
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                onClick={() => setActive(s.id)}
                className={cn(
                  "w-full flex items-center gap-2 px-2.5 py-2 rounded-md text-xs font-medium transition-colors text-left",
                  active === s.id
                    ? s.danger ? "bg-red-50 dark:bg-red-950/40 text-red-700" : "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300"
                    : s.danger ? "text-red-600 hover:bg-red-50/50 dark:hover:bg-red-950/20" : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                )}
              >
                <s.icon className="w-4 h-4 shrink-0" />
                {s.label}
              </button>
            ))}
          </div>
          <div className="mt-auto pt-4 border-t border-slate-200 dark:border-slate-700 space-y-1">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Se déconnecter
            </button>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 px-2 pt-2">Version 0.1.0</p>
          </div>
        </nav>

        {/* Mobile tabs */}
        <div className="lg:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-4 py-2 shrink-0 overflow-x-auto w-full">
          <div className="flex items-center gap-1 min-w-max">
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                onClick={() => setActive(s.id)}
                className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap",
                  active === s.id ? s.danger ? "bg-red-50 dark:bg-red-950/40 text-red-700" : "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300"
                  : s.danger ? "text-red-600 hover:bg-red-50/50 dark:hover:bg-red-950/20" : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800")}
              >
                <s.icon className="w-3.5 h-3.5" />
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <main className="flex-1 overflow-y-auto min-w-0">
          <div className="max-w-2xl px-6 lg:px-10 py-8 space-y-6">

            {/* Account */}
            {active === "account" && (
              <>
                <SectionTitle title="Compte" description="Vos informations de compte local." />
                <SettingCard title="Identifiants">
                  <SettingRow label="Adresse email" hint={user?.email ?? ""}>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="email"
                        defaultValue={user?.email ?? ""}
                        readOnly
                        className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300"
                      />
                    </div>
                  </SettingRow>
                  <SettingRow label="Mot de passe">
                    <button className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5" />
                      Changer le mot de passe
                    </button>
                  </SettingRow>
                </SettingCard>
                <SettingCard title="Session">
                  <SettingRow label="Compte créé le" hint={user?.created_at?.substring(0, 10) ?? "—"}>
                    <span className="text-sm text-slate-700 dark:text-slate-300">{user?.created_at?.substring(0, 10) ?? "—"}</span>
                  </SettingRow>
                  <SettingRow label="Déconnexion">
                    <button
                      onClick={handleLogout}
                      className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1.5"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Se déconnecter
                    </button>
                  </SettingRow>
                </SettingCard>
              </>
            )}

            {/* Database */}
            {active === "database" && (
              <>
                <SectionTitle title="Base de données" description="Chemin vers votre fichier data.accdb TeleTaxi." />
                <SettingCard title="Fichier Access">
                  <SettingRow label="Chemin actuel" hint={config?.accdb_path ? "Configuré" : "Non configuré"}>
                    <div className="flex items-center gap-2">
                      <code className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-700 dark:text-slate-300 truncate max-w-[200px]">
                        {config?.accdb_path ?? "Aucun fichier sélectionné"}
                      </code>
                      <button
                        onClick={handleChangeDb}
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 shrink-0"
                      >
                        <FolderOpen className="w-3.5 h-3.5" />
                        Changer
                      </button>
                    </div>
                  </SettingRow>
                  <SettingRow label="Configuration avancée">
                    <Link href="/database" className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                      <RefreshCw className="w-3.5 h-3.5" />
                      Tester la connexion
                    </Link>
                  </SettingRow>
                </SettingCard>
                <SettingCard title="Sécurité">
                  <SettingRow label="Backup automatique" hint="Copie de data.accdb avant chaque import">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-green-700 font-medium">Activé</span>
                    </div>
                  </SettingRow>
                </SettingCard>
              </>
            )}

            {/* Appearance */}
            {active === "appearance" && (
              <>
                <SectionTitle
                  title="Apparence"
                  description="Personnalisez le thème et l'affichage de l'application."
                />

                <SettingCard title="Thème">
                  <div className="px-5 py-4">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                      Choisissez le thème visuel de l'application.
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      <ThemeOption
                        icon={<Sun className="w-5 h-5" />}
                        label="Clair"
                        active={theme === "light"}
                        onClick={() => setTheme("light")}
                      />
                      <ThemeOption
                        icon={<Moon className="w-5 h-5" />}
                        label="Sombre"
                        active={theme === "dark"}
                        onClick={() => setTheme("dark")}
                      />
                      <ThemeOption
                        icon={<Monitor className="w-5 h-5" />}
                        label="Système"
                        active={theme === "system"}
                        onClick={() => setTheme("system")}
                      />
                    </div>
                  </div>
                </SettingCard>
              </>
            )}

            {/* Advanced */}
            {active === "advanced" && (
              <>
                <SectionTitle title="Avancé" description="Options techniques et journalisation." />
                <SettingCard title="Notifications">
                  <ToggleRow label="Notifications dans l'application" description="Alertes à la fin d'un import." defaultChecked />
                  <ToggleRow label="Journal d'audit" description="Enregistre toutes les opérations d'import." defaultChecked />
                </SettingCard>
              </>
            )}

            {/* Danger */}
            {active === "danger" && (
              <>
                <SectionTitle title="Zone sensible" description="Actions irréversibles. Procédez avec précaution." danger />
                <div className="border border-red-200 dark:border-red-900 rounded-xl overflow-hidden">
                  <div className="bg-red-50/50 dark:bg-red-950/40 px-5 py-4 border-b border-red-200 dark:border-red-900">
                    <h3 className="text-sm font-semibold text-red-900 dark:text-red-300">Réinitialisation du compte</h3>
                    <p className="text-xs text-red-700 dark:text-red-400 mt-1">Supprime votre compte et toutes les données locales (historique, config). Le fichier data.accdb n&apos;est PAS supprimé.</p>
                  </div>
                  <div className="p-5">
                    <button
                      onClick={handleLogout}
                      className="bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Se déconnecter
                    </button>
                  </div>
                </div>
              </>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}

// ─── Shared sub-components ────────────────────────────────────────────────────

function SectionTitle({ title, description, danger }: { title: string; description: string; danger?: boolean }) {
  return (
    <div>
      <h2 className={cn("text-base font-semibold", danger ? "text-red-900" : "text-slate-900 dark:text-slate-100")}>{title}</h2>
      <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{description}</p>
    </div>
  );
}

function SettingCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
      <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
      </div>
      <div className="divide-y divide-slate-100 dark:divide-slate-800">{children}</div>
    </div>
  );
}

function SettingRow({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</p>
        {hint && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{hint}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function ToggleRow({ label, description, defaultChecked }: { label: string; description: string; defaultChecked?: boolean }) {
  const [checked, setChecked] = useState(defaultChecked ?? false);
  return (
    <div className="px-5 py-4 flex items-center justify-between gap-3">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{description}</p>
      </div>
      <button
        onClick={() => { setChecked(!checked); toast.success("Réglage enregistré"); }}
        className={cn(
          "relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors",
          checked ? "bg-blue-600" : "bg-slate-200 dark:bg-slate-700"
        )}
        role="switch"
        aria-checked={checked}
      >
        <span className={cn("h-4 w-4 rounded-full bg-white shadow transition-transform", checked ? "translate-x-4" : "translate-x-0")} />
      </button>
    </div>
  );
}

function ThemeOption({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative p-3 border-2 rounded-lg transition-all flex flex-col items-center gap-1.5",
        active
          ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/40 dark:border-blue-500"
          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-slate-600 dark:hover:bg-slate-800"
      )}
    >
      <span
        className={cn(
          active
            ? "text-blue-600 dark:text-blue-400"
            : "text-slate-500 dark:text-slate-400"
        )}
      >
        {icon}
      </span>
      <span
        className={cn(
          "text-xs font-medium",
          active
            ? "text-blue-700 dark:text-blue-300"
            : "text-slate-700 dark:text-slate-300"
        )}
      >
        {label}
      </span>
      {active && (
        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 absolute top-1.5 right-1.5" />
      )}
    </button>
  );
}

