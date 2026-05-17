"use client";

import { useState, useEffect, useRef } from "react";
import {
  Upload, FileSpreadsheet, Trash2, RefreshCw, Play, Eye,
  ShieldCheck, ChevronRight, X, Stethoscope, Users, MapPin,
  AlertCircle, AlertTriangle, CheckCircle2, Info, Loader2,
  ChevronsRight, ChevronsLeft, Search, History,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { listen, type UnlistenFn } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/core";
import Link from "next/link";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";
import type { ExcelPreview, ExcelRowPreview, ImportProgress, ImportReport } from "@/lib/types";

type Phase = "upload" | "preview" | "running" | "report";
type SheetTab = "prescripteurs" | "beneficiaires" | "courses";
type ErrorTab = "errors" | "warnings" | "info";

const SHEET_LABELS: Record<SheetTab, string> = {
  prescripteurs: "Prescripteurs",
  beneficiaires: "Bénéficiaires",
  courses: "Courses",
};

export default function ImportPage() {
  const { session } = useAuth();
  const qc = useQueryClient();
  const [phase, setPhase] = useState<Phase>("upload");
  const [excelPath, setExcelPath] = useState<string | null>(null);
  const [excelFilename, setExcelFilename] = useState("");
  const [activeSheet, setActiveSheet] = useState<SheetTab>("prescripteurs");
  const [previews, setPreviews] = useState<Partial<Record<SheetTab, ExcelPreview>>>({});
  const [loadingSheet, setLoadingSheet] = useState<SheetTab | null>(null);
  const [errorPanelOpen, setErrorPanelOpen] = useState(true);
  const [activeErrorTab, setActiveErrorTab] = useState<ErrorTab>("errors");
  const [importId, setImportId] = useState<string | null>(null);
  const [progress, setProgress] = useState<ImportProgress | null>(null);
  const [report, setReport] = useState<ImportReport | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const logRef = useRef<string[]>([]);
  const [logLines, setLogLines] = useState<string[]>([]);

  // Load preview for current sheet
  useEffect(() => {
    if (!excelPath || phase !== "preview") return;
    if (previews[activeSheet]) return;
    setLoadingSheet(activeSheet);
    const sheetName = SHEET_LABELS[activeSheet];

    invoke<ExcelPreview>("preview_excel", { excelPath, sheetName })
      .then((data) => setPreviews((p) => ({ ...p, [activeSheet]: data })))
      .catch((e) => toast.error(`Erreur prévisualisation : ${e}`))
      .finally(() => setLoadingSheet(null));
  }, [excelPath, activeSheet, phase, previews]);

  // Streaming listeners for import progress
  useEffect(() => {
    if (!importId) return;
    let unProgress: UnlistenFn | undefined;
    let unComplete: UnlistenFn | undefined;
    let unError: UnlistenFn | undefined;

    (async () => {
      unProgress = await listen<ImportProgress>("import:progress", (e) => {
        setProgress(e.payload);
        const msg = `[${e.payload.phase}] ${e.payload.current}/${e.payload.total} ${e.payload.message}`;
        logRef.current = [...logRef.current, msg];
        setLogLines([...logRef.current]);
      });
      unComplete = await listen<ImportReport>("import:complete", (e) => {
        setReport(e.payload);
        setPhase("report");
        qc.invalidateQueries({ queryKey: ["imports"] });
        toast.success(`Import terminé : ${e.payload.total_inseres} lignes insérées`);
      });
      unError = await listen<{ message: string }>("import:error", (e) => {
        setImportError(e.payload.message);
        toast.error(`Import échoué : ${e.payload.message}`);
        setPhase("preview");
      });
    })();

    return () => {
      unProgress?.();
      unComplete?.();
      unError?.();
    };
  }, [importId]);

  const handleSelectFile = async () => {
    try {
      const path = await invoke<string | null>("open_excel_dialog");
      if (!path) return;
      setExcelPath(path);
      setExcelFilename(path.split(/[\\/]/).pop() ?? path);
      setPreviews({});
      setPhase("preview");
    } catch (e) {
      toast.error(`Erreur : ${e}`);
    }
  };

  const handleStartImport = async () => {
    if (!excelPath) return;
    logRef.current = [];
    setLogLines([]);
    setProgress(null);
    setReport(null);
    setImportError(null);

    try {
      if (!session?.token) {
        toast.error("Session expirée — reconnectez-vous");
        return;
      }
      const result = await invoke<{ import_id: string }>("start_import", {
        sessionToken: session.token,
        excelPath,
        backupEnabled: true,
      });
      setImportId(result.import_id);
      setPhase("running");
    } catch (e) {
      toast.error(`Impossible de lancer l'import : ${e}`);
    }
  };

  const handleReset = () => {
    setPhase("upload");
    setExcelPath(null);
    setExcelFilename("");
    setPreviews({});
    setImportId(null);
    setProgress(null);
    setReport(null);
    setImportError(null);
  };

  const preview = previews[activeSheet];
  const errors = preview?.preview_rows.filter((r) => r.status === "error") ?? [];
  const warnings = preview?.preview_rows.filter((r) => r.status === "warning") ?? [];
  const validCount = preview?.preview_rows.filter((r) => r.status === "valid").length ?? 0;

  const phasePercent = progress
    ? Math.round((progress.current / Math.max(progress.total, 1)) * 100)
    : 0;

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-6 py-3.5 flex items-center justify-between shrink-0">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-0.5">
            <span>Principal</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-900 dark:text-slate-100 font-medium">Import Excel</span>
          </div>
          <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100 tracking-tight">Importer un fichier Excel</h1>
        </div>
      </header>

      {/* File bar (when file loaded) */}
      {phase !== "upload" && excelPath && phase !== "report" && (
        <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-6 py-3 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-9 h-9 rounded-lg bg-green-50 dark:bg-green-950/40 flex items-center justify-center shrink-0">
              <FileSpreadsheet className="w-4 h-4 text-green-600 dark:text-green-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{excelFilename}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">3 feuilles</p>
            </div>
          </div>
          {phase === "preview" && (
            <div className="flex items-center gap-1.5 shrink-0">
              <button onClick={handleReset} className="text-xs text-red-600 hover:text-red-700 px-2.5 py-1.5 rounded-md hover:bg-red-50 transition-colors flex items-center gap-1.5">
                <Trash2 className="w-3.5 h-3.5" />
                Supprimer
              </button>
            </div>
          )}
        </div>
      )}

      {/* Phase: Upload */}
      {phase === "upload" && (
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-xl">
            <div
              className="bg-white dark:bg-slate-900 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-12 text-center hover:border-blue-400 hover:bg-blue-50/30 dark:hover:border-blue-500 dark:hover:bg-blue-950/20 transition-all cursor-pointer"
              onClick={handleSelectFile}
            >
              <div className="w-14 h-14 rounded-2xl bg-blue-50 mx-auto flex items-center justify-center mb-4">
                <Upload className="w-7 h-7 text-blue-600" strokeWidth={1.8} />
              </div>
              <h3 className="text-base font-medium text-slate-900 dark:text-slate-100 mb-1.5">Déposez votre fichier Excel ici</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">ou cliquez pour parcourir vos fichiers</p>
              <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2.5 rounded-lg inline-flex items-center gap-2 transition-colors">
                <Upload className="w-4 h-4" />
                Sélectionner un fichier
              </button>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-4">Format accepté : .xlsx · .xlsm</p>
            </div>
          </div>
        </div>
      )}

      {/* Phase: Preview */}
      {phase === "preview" && (
        <div className="flex-1 flex min-h-0">
          {/* Preview */}
          <div className="flex-1 flex flex-col min-w-0 min-h-0">
            {/* Sheet tabs + stats */}
            <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-6 pt-3 flex flex-wrap items-end justify-between gap-y-2 shrink-0">
              <div className="flex items-center gap-1">
                {(Object.keys(SHEET_LABELS) as SheetTab[]).map((key) => {
                  const icons = { prescripteurs: Stethoscope, beneficiaires: Users, courses: MapPin };
                  const Icon = icons[key];
                  const count = previews[key]?.total_rows ?? "…";
                  const errs = previews[key]?.preview_rows.filter((r) => r.status === "error").length ?? 0;
                  return (
                    <button
                      key={key}
                      onClick={() => setActiveSheet(key)}
                      className={cn(
                        "px-3.5 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2",
                        activeSheet === key ? "border-blue-600 text-blue-700 dark:text-blue-300" : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                      )}
                    >
                      <Icon className={cn("w-3.5 h-3.5", activeSheet === key ? "text-blue-700" : "text-slate-400")} />
                      {SHEET_LABELS[key]}
                      <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded font-medium">{count}</span>
                      {errs > 0 && <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-medium">{errs}</span>}
                    </button>
                  );
                })}
              </div>
              <div className="flex items-center gap-3 pb-2">
                <StatPill label="Total" value={preview?.total_rows ?? 0} />
                <StatPill label="Valides" value={validCount} color="green" />
                <StatPill label="Erreurs" value={errors.length} color="red" />
                <StatPill label="Avert." value={warnings.length} color="amber" />
              </div>
            </div>

            {/* Toolbar */}
            <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-6 py-2.5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className="relative w-48">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input type="text" placeholder="Rechercher…" className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 dark:text-slate-100 placeholder:text-slate-400" />
                </div>
              </div>
              <button
                onClick={() => setErrorPanelOpen(!errorPanelOpen)}
                className={cn("text-xs px-2 py-1.5 rounded-md transition-colors flex items-center gap-1.5", errorPanelOpen ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100" : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800")}
              >
                {errorPanelOpen ? <ChevronsRight className="w-3.5 h-3.5" /> : <ChevronsLeft className="w-3.5 h-3.5" />}
                {errorPanelOpen ? "Réduire" : "Détails"}
              </button>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-auto bg-slate-50/30">
              {loadingSheet === activeSheet ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                </div>
              ) : preview ? (
                <PreviewTable rows={preview.preview_rows} />
              ) : (
                <div className="flex items-center justify-center h-32 text-slate-400 text-sm">
                  Chargement…
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 px-6 py-3 flex items-center justify-between gap-3 shrink-0 flex-wrap">
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-green-600 shrink-0" />
                Backup automatique avant import
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleStartImport}
                  disabled={errors.length > 0}
                  className="text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 font-medium"
                >
                  <Play className="w-3.5 h-3.5" />
                  Importer
                  {errors.length > 0 && (
                    <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded">
                      {errors.length} erreur{errors.length > 1 ? "s" : ""}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Error panel */}
          {errorPanelOpen && (
            <aside className="w-72 xl:w-80 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-700 flex flex-col shrink-0">
              <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between shrink-0">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Vérifications</h3>
                <button onClick={() => setErrorPanelOpen(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="border-b border-slate-200 grid grid-cols-3 shrink-0">
                <ErrorTabBtn label="Erreurs" count={errors.length} color="red" active={activeErrorTab === "errors"} onClick={() => setActiveErrorTab("errors")} />
                <ErrorTabBtn label="Avert." count={warnings.length} color="amber" active={activeErrorTab === "warnings"} onClick={() => setActiveErrorTab("warnings")} />
                <ErrorTabBtn label="Infos" count={0} color="blue" active={activeErrorTab === "info"} onClick={() => setActiveErrorTab("info")} />
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {activeErrorTab === "errors" && errors.map((r) => (
                  <IssueItem key={r.row_number} row={r.row_number} message={`Ligne ${r.row_number} : données invalides`} severity="error" />
                ))}
                {activeErrorTab === "warnings" && warnings.map((r) => (
                  <IssueItem key={r.row_number} row={r.row_number} message={`Ligne ${r.row_number} : vérifier les données`} severity="warning" />
                ))}
                {activeErrorTab === "info" && (
                  <IssueItem row={0} message={`${validCount} lignes seront importées`} severity="info" />
                )}
              </div>
              <div className="border-t border-slate-200 dark:border-slate-700 p-3 bg-slate-50/50 dark:bg-slate-800/50 shrink-0">
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Corrigez les <span className="font-medium text-red-700 dark:text-red-400">erreurs</span> pour activer l&apos;import.
                </p>
              </div>
            </aside>
          )}
        </div>
      )}

      {/* Phase: Running */}
      {phase === "running" && (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-lg space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/40 mx-auto flex items-center justify-center mb-4">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">Import en cours…</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">{progress?.phase ?? "Démarrage"}</p>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
                <span>{progress?.message || "Initialisation…"}</span>
                <span className="font-mono tabular-nums">{phasePercent}%</span>
              </div>
              <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300"
                  style={{ width: `${phasePercent}%` }}
                />
              </div>
              {progress && (
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 tabular-nums">
                  {progress.current} / {progress.total} lignes
                </p>
              )}
            </div>

            {/* Log console */}
            {logLines.length > 0 && (
              <div className="bg-slate-900 text-slate-100 font-mono text-xs rounded-lg p-3 max-h-48 overflow-y-auto space-y-0.5">
                {logLines.map((l, i) => (
                  <p key={i} className="text-slate-400">{l}</p>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Phase: Report */}
      {phase === "report" && report && (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-2xl space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-green-50 dark:bg-green-950/40 mx-auto flex items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-1">Import terminé</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {report.total_inseres} enregistrement{report.total_inseres > 1 ? "s" : ""} insérés
                {report.total_erreurs > 0 && ` · ${report.total_erreurs} erreurs`}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {([
                { label: "Prescripteurs", data: report.prescripteurs, icon: Stethoscope },
                { label: "Bénéficiaires", data: report.beneficiaires, icon: Users },
                { label: "Courses", data: report.courses, icon: MapPin },
              ] as const).map(({ label, data, icon: Icon }) => (
                <div key={label} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Icon className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{label}</p>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Insérés</span>
                      <span className="font-medium text-green-700 dark:text-green-300">{data.inseres}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Ignorés</span>
                      <span className="font-medium text-slate-700 dark:text-slate-300">{data.ignores}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Erreurs</span>
                      <span className={cn("font-medium", data.erreurs > 0 ? "text-red-700 dark:text-red-300" : "text-slate-700 dark:text-slate-300")}>{data.erreurs}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3 justify-center">
              <Link
                href="/history"
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                <History className="w-4 h-4" />
                Voir l&apos;historique
              </Link>
              <button onClick={handleReset} className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Nouvel import
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function PreviewTable({ rows }: { rows: ExcelRowPreview[] }) {
  if (rows.length === 0) return (
    <div className="flex items-center justify-center h-32 text-slate-400 text-sm">Aucune donnée</div>
  );

  const columns = Object.keys(rows[0]?.data ?? {});

  return (
    <table className="w-full min-w-[600px] text-sm">
      <thead className="bg-white dark:bg-slate-900 sticky top-0 border-b border-slate-200 dark:border-slate-700 z-10">
        <tr>
          <th className="w-12 px-3 py-2.5 text-left text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">#</th>
          {columns.map((col) => (
            <th key={col} className="px-3 py-2.5 text-left text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">{col}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr
            key={row.row_number}
            className={cn(
              "border-b border-slate-100 dark:border-slate-800",
              row.status === "error" ? "bg-red-50/40 dark:bg-red-950/20" :
              row.status === "warning" ? "bg-amber-50/40 dark:bg-amber-950/20" :
              "bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800"
            )}
          >
            <td className="px-3 py-2.5">
              <div className="flex items-center gap-1.5">
                {row.status === "error" && <AlertCircle className="w-3.5 h-3.5 text-red-500" />}
                {row.status === "warning" && <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />}
                {row.status === "valid" && <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />}
                <span className="text-xs text-slate-400 font-mono">{row.row_number}</span>
              </div>
            </td>
            {columns.map((col) => (
              <td key={col} className="px-3 py-2.5 text-sm text-slate-700 dark:text-slate-300">
                {row.data[col] != null ? String(row.data[col]) : <span className="text-slate-400 dark:text-slate-500 italic text-xs">—</span>}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function StatPill({ label, value, color = "slate" }: { label: string; value: number; color?: string }) {
  const colors: Record<string, string> = { slate: "text-slate-700", green: "text-green-700", red: "text-red-700", amber: "text-amber-700" };
  return (
    <div className="flex items-baseline gap-1.5">
      <span className="text-[10px] uppercase tracking-wide text-slate-500 font-medium">{label}</span>
      <span className={cn("text-sm font-semibold", colors[color] ?? colors.slate)}>{value}</span>
    </div>
  );
}

function ErrorTabBtn({ label, count, color, active, onClick }: { label: string; count: number; color: string; active: boolean; onClick: () => void }) {
  const c: Record<string, string> = { red: "border-red-500 text-red-700", amber: "border-amber-500 text-amber-700", blue: "border-blue-500 text-blue-700" };
  return (
    <button
      onClick={onClick}
      className={cn("py-2.5 text-xs font-medium border-b-2 transition-colors flex items-center justify-center gap-1.5",
        active ? c[color] : "border-transparent text-slate-500 hover:text-slate-900")}
    >
      {label}
      <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-medium", active ? "bg-current/10" : "bg-slate-100 text-slate-600")}>{count}</span>
    </button>
  );
}

function IssueItem({ row, message, severity }: { row: number; message: string; severity: "error" | "warning" | "info" }) {
  const s = {
    error: { bg: "bg-red-50/50 border-red-200", icon: <AlertCircle className="w-3.5 h-3.5 text-red-600" /> },
    warning: { bg: "bg-amber-50/50 border-amber-200", icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> },
    info: { bg: "bg-blue-50/50 border-blue-200", icon: <Info className="w-3.5 h-3.5 text-blue-600" /> },
  }[severity];

  return (
    <div className={cn("border rounded-lg p-2.5", s.bg)}>
      <div className="flex items-start gap-2">
        <div className="mt-0.5 shrink-0">{s.icon}</div>
        <div className="flex-1 min-w-0">
          {row > 0 && <div className="text-[10px] font-mono text-slate-500 mb-0.5">Ligne {row}</div>}
          <p className="text-xs text-slate-700">{message}</p>
        </div>
      </div>
    </div>
  );
}
