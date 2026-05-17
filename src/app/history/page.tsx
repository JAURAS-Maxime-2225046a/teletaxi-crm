"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Upload, Download, Search, ChevronRight, CheckCircle2,
  AlertTriangle, AlertCircle, History, FileSpreadsheet,
  Clock, Stethoscope, Users, MapPin, X, Activity,
} from "lucide-react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { tauri } from "@/lib/tauri";
import { cn } from "@/lib/utils";
import type { ImportEntry, ImportStatus } from "@/lib/types";

type Filter = "all" | ImportStatus;

export default function HistoryPage() {
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data: imports = [], isLoading } = useQuery({
    queryKey: ["imports"],
    queryFn: () => tauri.history.list(100),
  });

  const filtered = imports.filter((imp: ImportEntry) => {
    const matchStatus = filter === "all" || imp.status === filter;
    const matchSearch =
      query === "" ||
      imp.excel_filename.toLowerCase().includes(query.toLowerCase());
    return matchStatus && matchSearch;
  });

  const selected = imports.find((i: ImportEntry) => i.id === selectedId) ?? null;

  const stats = {
    total: imports.length,
    success: imports.filter((i: ImportEntry) => i.status === "success").length,
    partial: imports.filter((i: ImportEntry) => i.status === "partial").length,
    error: imports.filter((i: ImportEntry) => i.status === "error").length,
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-6 py-3.5 flex items-center justify-between gap-3 shrink-0 flex-wrap">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-0.5">
            <span>Principal</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-900 dark:text-slate-100 font-medium">Historique</span>
          </div>
          <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100 tracking-tight">Historique des imports</h1>
        </div>
        <Link
          href="/import"
          className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 font-medium shrink-0"
        >
          <Upload className="w-3.5 h-3.5" />
          Nouvel import
        </Link>
      </header>

      {/* Stat bar */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-6 py-4 shrink-0">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <MetricCard label="Total" value={stats.total} icon={History} />
          <MetricCard label="Réussis" value={stats.success} icon={CheckCircle2} color="green" />
          <MetricCard label="Partiels" value={stats.partial} icon={AlertTriangle} color="amber" />
          <MetricCard label="Échoués" value={stats.error} icon={AlertCircle} color="red" />
        </div>
      </div>

      {/* Filters + search */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-6 py-3 flex items-center gap-3 shrink-0 flex-wrap">
        <div className="flex items-center gap-1 flex-wrap">
          {(["all", "success", "partial", "error"] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-2.5 py-1 text-xs rounded-md font-medium transition-colors",
                filter === f
                  ? "bg-blue-600 text-white"
                  : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700"
              )}
            >
              {f === "all" ? "Tous" : f === "success" ? "Réussis" : f === "partial" ? "Partiels" : "Échoués"}
            </button>
          ))}
        </div>
        <div className="relative ml-auto">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un fichier…"
            className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-52 text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
          />
          {query && (
            <button onClick={() => setQuery("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-300">
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-32 text-slate-400">Chargement…</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-slate-400">
            <FileSpreadsheet className="w-12 h-12 mb-4 text-slate-300 dark:text-slate-600" strokeWidth={1.5} />
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
              {imports.length === 0 ? "Aucun import pour l'instant" : "Aucun résultat"}
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              {imports.length === 0 ? "Vos futurs imports apparaîtront ici" : "Essayez un autre filtre"}
            </p>
            {imports.length === 0 && (
              <Link href="/import" className="mt-4 text-sm text-blue-600 font-medium hover:underline">
                Faire un premier import →
              </Link>
            )}
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filtered.map((imp: ImportEntry) => (
              <ImportRow
                key={imp.id}
                imp={imp}
                selected={selectedId === imp.id}
                onClick={() => setSelectedId(imp.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Detail drawer */}
      <Sheet open={!!selectedId} onOpenChange={(open: boolean) => !open && setSelectedId(null)}>
        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
          {selected && <DetailDrawer imp={selected} onClose={() => setSelectedId(null)} />}
        </SheetContent>
      </Sheet>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function MetricCard({
  label,
  value,
  icon: Icon,
  color = "slate",
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color?: "green" | "amber" | "red" | "slate";
}) {
  const colors = {
    green: "bg-green-50 text-green-600",
    amber: "bg-amber-50 text-amber-600",
    red: "bg-red-50 text-red-600",
    slate: "bg-slate-100 text-slate-600",
  };
  return (
    <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 flex items-center gap-3">
      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", colors[color])}>
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <p className="text-lg font-semibold text-slate-900 dark:text-slate-100 tabular-nums">{value}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
      </div>
    </div>
  );
}

const STATUS_CONFIG = {
  success: { bg: "bg-green-50", color: "text-green-600", Icon: CheckCircle2, label: "Réussi" },
  partial: { bg: "bg-amber-50", color: "text-amber-600", Icon: AlertTriangle, label: "Partiel" },
  error: { bg: "bg-red-50", color: "text-red-600", Icon: AlertCircle, label: "Échoué" },
  running: { bg: "bg-blue-50", color: "text-blue-600", Icon: Activity, label: "En cours" },
};

function ImportRow({ imp, selected, onClick }: { imp: ImportEntry; selected: boolean; onClick: () => void }) {
  const s = STATUS_CONFIG[imp.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.error;
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full px-6 py-4 flex items-center gap-4 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800",
        selected && "bg-blue-50/50 dark:bg-blue-950/20"
      )}
    >
      <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0", s.bg)}>
        <s.Icon className={cn("w-5 h-5", s.color)} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{imp.excel_filename}</p>
          <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-medium shrink-0", s.bg, s.color)}>
            {s.label}
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {imp.started_at.substring(0, 16).replace("T", " ")}
          </span>
          <span>{imp.report.total_inseres} insérés</span>
          {imp.report.total_erreurs > 0 && (
            <span className="text-red-600">{imp.report.total_erreurs} erreurs</span>
          )}
        </div>
      </div>
      <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 shrink-0" />
    </button>
  );
}

function DetailDrawer({ imp, onClose }: { imp: ImportEntry; onClose: () => void }) {
  const s = STATUS_CONFIG[imp.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.error;
  return (
    <div className="space-y-6 pt-2">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1 truncate">{imp.id}</p>
          <SheetTitle className="text-base font-semibold text-slate-900 dark:text-slate-100 truncate">{imp.excel_filename}</SheetTitle>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className={cn("flex items-center gap-2 px-3 py-2 rounded-lg", s.bg)}>
        <s.Icon className={cn("w-4 h-4", s.color)} />
        <span className={cn("text-sm font-medium", s.color)}>{s.label}</span>
        <span className="text-xs text-slate-500 dark:text-slate-400 ml-auto">{imp.started_at.substring(0, 16).replace("T", " ")}</span>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Résultats</h3>
        <div className="grid grid-cols-3 gap-3">
          {([
            { label: "Prescripteurs", data: imp.report.prescripteurs, icon: Stethoscope },
            { label: "Bénéficiaires", data: imp.report.beneficiaires, icon: Users },
            { label: "Courses", data: imp.report.courses, icon: MapPin },
          ] as const).map(({ label, data, icon: Icon }) => (
            <div key={label} className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
              <div className="flex items-center gap-1.5 mb-2">
                <Icon className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                <p className="text-xs font-medium text-slate-700 dark:text-slate-300">{label}</p>
              </div>
              <div className="space-y-0.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Insérés</span>
                  <span className="font-medium text-green-700 dark:text-green-300">{data.inseres}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Ignorés</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">{data.ignores}</span>
                </div>
                {data.erreurs > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Erreurs</span>
                    <span className="font-medium text-red-700 dark:text-red-300">{data.erreurs}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {imp.error_message && (
        <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-lg p-3">
          <p className="text-xs font-medium text-red-700 dark:text-red-300 mb-1">Erreur</p>
          <p className="text-xs text-red-600 dark:text-red-400">{imp.error_message}</p>
        </div>
      )}

      <div className="space-y-2 text-xs">
        <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
          <span className="text-slate-500 dark:text-slate-400">Fichier Excel</span>
          <span className="text-slate-900 dark:text-slate-100 font-medium truncate max-w-[180px]">{imp.excel_path.split(/[\\/]/).pop()}</span>
        </div>
        <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
          <span className="text-slate-500 dark:text-slate-400">Base Access</span>
          <span className="text-slate-900 dark:text-slate-100 font-medium truncate max-w-[180px]">{imp.accdb_path.split(/[\\/]/).pop()}</span>
        </div>
        {imp.backup_path && (
          <div className="flex justify-between py-2">
            <span className="text-slate-500 dark:text-slate-400">Backup</span>
            <span className="text-green-700 dark:text-green-300 font-medium">Disponible</span>
          </div>
        )}
      </div>
    </div>
  );
}
