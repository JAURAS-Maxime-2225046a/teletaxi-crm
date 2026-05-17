"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Upload, History, Database, ShieldCheck, HardDrive, Activity,
  FileSpreadsheet, Stethoscope, Users, MapPin, TrendingUp,
  TrendingDown, ChevronRight, CheckCircle2, AlertTriangle,
  AlertCircle, Eye, Zap, ArrowRight, Sparkles, RefreshCw,
  Settings,
} from "lucide-react";
import { tauri } from "@/lib/tauri";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";
import type { ImportEntry } from "@/lib/types";

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: config } = useQuery({ queryKey: ["config"], queryFn: tauri.config.get });
  const { data: imports = [], refetch } = useQuery({
    queryKey: ["imports"],
    queryFn: () => tauri.history.list(20),
  });

  const recent = imports.slice(0, 5);
  const kpis = imports.reduce(
    (acc, h: ImportEntry) => ({
      prescripteurs: acc.prescripteurs + h.report.prescripteurs.inseres,
      beneficiaires: acc.beneficiaires + h.report.beneficiaires.inseres,
      courses: acc.courses + h.report.courses.inseres,
      total: acc.total + 1,
    }),
    { prescripteurs: 0, beneficiaires: 0, courses: 0, total: 0 }
  );

  const dbConnected = !!config?.accdb_path;

  return (
    <div className="flex flex-col min-h-0 overflow-hidden h-full">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-6 py-3.5 flex items-center justify-between gap-3 shrink-0 flex-wrap">
        <div className="min-w-0">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">
            Bonjour{user?.display_name ? `, ${user.display_name}` : ""}
          </p>
          <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100 tracking-tight">Tableau de bord</h1>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => refetch()}
            className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Actualiser
          </button>
          <Link
            href="/import"
            className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 font-medium"
          >
            <Upload className="w-3.5 h-3.5" />
            Nouvel import
          </Link>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl p-6 lg:p-8 space-y-6">

          {/* Hero CTA */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 lg:p-7 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32" />
            <div className="absolute bottom-0 right-12 w-32 h-32 bg-white/5 rounded-full translate-y-8" />
            <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="inline-flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-full text-xs font-medium mb-3">
                  <Zap className="w-3 h-3" />
                  Action recommandée
                </div>
                <h2 className="text-xl lg:text-2xl font-semibold mb-1.5 tracking-tight">
                  Prêt à importer vos données
                </h2>
                <p className="text-blue-100 text-sm leading-relaxed max-w-md">
                  Importez votre fichier Excel de prescripteurs, bénéficiaires et courses pour les ajouter automatiquement à votre base TeleTaxi.
                </p>
              </div>
              <Link
                href="/import"
                className="bg-white text-blue-700 hover:bg-blue-50 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shrink-0"
              >
                <Upload className="w-4 h-4" />
                Démarrer un import
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* KPIs */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Vue d&apos;ensemble</h2>
              <span className="text-xs text-slate-500 dark:text-slate-400">Cumulé tous imports</span>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <KpiCard icon={FileSpreadsheet} label="Imports réalisés" value={kpis.total} color="blue" />
              <KpiCard icon={Stethoscope} label="Prescripteurs" value={kpis.prescripteurs} color="purple" />
              <KpiCard icon={Users} label="Bénéficiaires" value={kpis.beneficiaires} color="green" />
              <KpiCard icon={MapPin} label="Courses" value={kpis.courses} color="amber" />
            </div>
          </div>

          {/* Grille principale */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Activité récente */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl">
              <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Activité récente</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Vos 5 derniers imports</p>
                </div>
                <Link href="/history" className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                  Tout voir <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
              {recent.length === 0 ? (
                <div className="flex flex-col items-center py-12 text-slate-400">
                  <FileSpreadsheet className="w-10 h-10 mb-3 text-slate-300 dark:text-slate-600" />
                  <p className="text-sm">Aucun import pour l&apos;instant</p>
                  <Link href="/import" className="text-xs text-blue-600 mt-2">Faire un premier import</Link>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {recent.map((imp: ImportEntry) => (
                    <ActivityRow key={imp.id} imp={imp} />
                  ))}
                </div>
              )}
            </div>

            {/* Colonne droite */}
            <div className="space-y-5">
              {/* État système */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">État du système</h3>
                  <div className={cn("w-2 h-2 rounded-full", dbConnected ? "bg-green-500 animate-pulse" : "bg-amber-500")} />
                </div>
                <div className="space-y-3">
                  <SystemRow icon={Database} label="Base de données" status={dbConnected ? "Connectée" : "Non configurée"} green={dbConnected} />
                  <SystemRow icon={ShieldCheck} label="Backups auto" status={config?.backup_enabled ? "Activé" : "Désactivé"} green={config?.backup_enabled} />
                  <SystemRow icon={HardDrive} label="Stockage" status="Local" green />
                  <SystemRow icon={Activity} label="Dernier import" status={imports[0] ? imports[0].started_at.substring(0, 10) : "Aucun"} green={!!imports[0]} />
                </div>
              </div>

              {/* Accès rapides */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">Accès rapides</h3>
                <div className="space-y-1.5">
                  <QuickAction href="/import" icon={Upload} label="Nouvel import Excel" />
                  <QuickAction href="/history" icon={History} label="Voir l'historique" />
                  <QuickAction href="/database" icon={Database} label="Configurer la base" />
                  <QuickAction href="/settings" icon={Settings} label="Paramètres" />
                </div>
              </div>
            </div>
          </div>

          {/* Teaser V2 */}
          <div className="bg-gradient-to-br from-slate-50 dark:from-slate-900 to-blue-50/30 dark:to-blue-950/10 border border-slate-200 dark:border-slate-700 rounded-xl p-5 lg:p-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-start gap-4 min-w-0 flex-1">
                <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Bons scannés par IA</h3>
                    <span className="text-[10px] bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded font-medium">BIENTÔT</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Photographiez un bon de transport, l&apos;IA extrait les données automatiquement.
                  </p>
                </div>
              </div>
              <button disabled className="text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-md font-medium cursor-not-allowed shrink-0">
                Notifier au lancement
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// ─── Sous-composants ─────────────────────────────────────────────────────────

function KpiCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  color: "blue" | "purple" | "green" | "amber";
}) {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    purple: "bg-purple-50 text-purple-600",
    green: "bg-green-50 text-green-600",
    amber: "bg-amber-50 text-amber-600",
  };
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
      <div className="flex items-start justify-between mb-2.5">
        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", colors[color])}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex items-center gap-1 text-xs font-medium text-green-600">
          <TrendingUp className="w-3 h-3" />
        </div>
      </div>
      <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-0.5 tracking-tight tabular-nums">
        {value.toLocaleString("fr-FR")}
      </p>
      <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
    </div>
  );
}

function ActivityRow({ imp }: { imp: ImportEntry }) {
  const config = {
    success: { bg: "bg-green-50", color: "text-green-600", Icon: CheckCircle2, label: "Import réussi" },
    partial: { bg: "bg-amber-50", color: "text-amber-600", Icon: AlertTriangle, label: "Import partiel" },
    error: { bg: "bg-red-50", color: "text-red-600", Icon: AlertCircle, label: "Import échoué" },
    running: { bg: "bg-blue-50", color: "text-blue-600", Icon: Activity, label: "En cours" },
  };
  const s = config[imp.status as keyof typeof config] ?? config.error;

  return (
    <Link href="/history" className="w-full px-5 py-3 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors flex items-center gap-3 text-left">
      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", s.bg)}>
        <s.Icon className={cn("w-4 h-4", s.color)} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{s.label}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
          {imp.excel_filename} · {imp.report.total_inseres} lignes
        </p>
      </div>
      <span className="text-xs text-slate-400 dark:text-slate-500 shrink-0 hidden sm:inline">
        {imp.started_at.substring(0, 10)}
      </span>
      <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 shrink-0" />
    </Link>
  );
}

function SystemRow({
  icon: Icon,
  label,
  status,
  green,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  status: string;
  green?: boolean;
}) {
  return (
    <div className="flex items-center justify-between text-xs">
      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 min-w-0">
        <Icon className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
        <span className="truncate">{label}</span>
      </div>
      <span
        className={cn(
          "px-2 py-0.5 rounded-md border font-medium whitespace-nowrap",
          green ? "text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-950/40 border-green-200 dark:border-green-900" : "text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
        )}
      >
        {status}
      </span>
    </div>
  );
}

function QuickAction({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <Link href={href} className="w-full flex items-center gap-2.5 px-2 py-2 rounded-md text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
      <Icon className="w-4 h-4 text-slate-500 dark:text-slate-400" />
      <span className="flex-1 truncate">{label}</span>
    </Link>
  );
}
