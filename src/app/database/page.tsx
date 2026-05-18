"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Car, Database, FolderOpen, CheckCircle2, Loader2,
  HardDrive, Calendar, FileText, RefreshCw, Lock, ChevronRight,
  Info, ShieldCheck, X, ChevronDown,
} from "lucide-react";
import { tauri } from "@/lib/tauri";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type DbState = "empty" | "verifying" | "connected" | "error";

function parseErrorCode(msg: string): { code: string; detail: string } {
  const match = msg.match(/^([A-Z_]+):\s*([\s\S]*)/);
  if (match) return { code: match[1], detail: match[2] };
  return { code: "", detail: msg };
}

type DbInfo = {
  connected: boolean;
  tables_count: number;
  counts: Record<string, number>;
  path: string;
};

export default function DatabasePage() {
  const { user } = useAuth();
  const [dbState, setDbState] = useState<DbState>("empty");
  const [dbPath, setDbPath] = useState("");

  // Préchargement : si accdb_path déjà configuré, tester la connexion au montage
  const { data: existingConfig } = useQuery({
    queryKey: ["config"],
    queryFn: tauri.config.get,
  });
  useEffect(() => {
    if (!existingConfig?.accdb_path || dbState !== "empty") return;
    const path = existingConfig.accdb_path;
    setDbPath(path);
    setDbState("verifying");
    tauri.sidecar
      .testConnection(path)
      .then((info) => {
        setDbInfo({ ...info, path });
        setDbState("connected");
      })
      .catch(() => {
        // La base était configurée mais n'est plus accessible
        setDbState("error");
        setErrorMsg("La base précédemment configurée n'est plus accessible.");
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingConfig?.accdb_path]);
  const [dbInfo, setDbInfo] = useState<DbInfo | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSelectFile = async () => {
    try {
      const path = await tauri.config.openAccdbDialog();
      if (!path) return;
      setDbPath(path);
      setDbState("verifying");

      const info = await tauri.sidecar.testConnection(path);
      await tauri.config.setAccdbPath(path);
      setDbInfo({ ...info, path });
      setDbState("connected");
      toast.success("Base connectée avec succès");
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : String(e));
      setDbState("error");
    }
  };

  const handleReset = () => {
    setDbState("empty");
    setDbPath("");
    setDbInfo(null);
    setErrorMsg("");
  };

  const handleRetry = async () => {
    if (!dbPath) { handleReset(); return; }
    setDbState("verifying");
    try {
      const info = await tauri.sidecar.testConnection(dbPath);
      await tauri.config.setAccdbPath(dbPath);
      setDbInfo({ ...info, path: dbPath });
      setDbState("connected");
      toast.success("Base reconnectée");
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : String(e));
      setDbState("error");
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 flex flex-col">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <Car className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          <span className="font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
            TELETAXI <span className="text-blue-600">CRM</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          {dbState === "connected" && (
            <Link href="/" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              ← Tableau de bord
            </Link>
          )}
          <div className="text-right">
            <p className="text-xs text-slate-500 dark:text-slate-400">Connecté</p>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate max-w-[120px]">
              {user?.display_name ?? user?.email ?? "Utilisateur"}
            </p>
          </div>
          <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-medium text-slate-600 dark:text-slate-300 shrink-0">
            {user?.email?.charAt(0).toUpperCase() ?? "U"}
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl">
          {dbState !== "connected" && (
            <>
              <div className="flex items-center gap-2 mb-6 text-xs text-slate-500">
                <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-medium">Étape 1/2</span>
                <span>Configuration initiale</span>
              </div>
              <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 tracking-tight mb-2">
                Connexion à votre base TeleTaxi
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
                Sélectionnez le fichier{" "}
                <code className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded text-xs">data.accdb</code>{" "}
                utilisé par votre logiciel TeleTaxi. Ce fichier reste sur votre poste.
              </p>
            </>
          )}

          {/* État vide */}
          {dbState === "empty" && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
              <div className="p-8">
                <div className="flex flex-col items-center text-center py-8 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50/50 dark:bg-slate-800/30">
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center mb-4">
                    <Database className="w-7 h-7 text-blue-600" strokeWidth={1.8} />
                  </div>
                  <h3 className="text-base font-medium text-slate-900 dark:text-slate-100 mb-1">Aucune base sélectionnée</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-5 max-w-xs">
                    Cliquez ci-dessous pour parcourir votre disque et trouver votre fichier{" "}
                    <code className="text-xs">data.accdb</code>.
                  </p>
                  <button
                    onClick={handleSelectFile}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2.5 rounded-lg flex items-center gap-2 transition-colors"
                  >
                    <FolderOpen className="w-4 h-4" />
                    Sélectionner ma base TeleTaxi
                  </button>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-3">Format accepté : <code>.accdb</code></p>
                </div>
              </div>
              <div className="border-t border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 px-6 py-4">
                <details className="text-sm">
                  <summary className="cursor-pointer text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 flex items-center gap-2 font-medium">
                    <Info className="w-4 h-4" />
                    Comment retrouver mon fichier data.accdb ?
                  </summary>
                  <div className="mt-3 pl-6 space-y-2 text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
                    <p>Consultez les paramètres ou préférences de votre application TeleTaxi.</p>
                    <p>Ou recherchez <code className="bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">data.accdb</code> dans l&apos;explorateur de fichiers.</p>
                  </div>
                </details>
              </div>
            </div>
          )}

          {/* État vérification */}
          {dbState === "verifying" && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-8">
              <div className="flex items-center gap-3 mb-6">
                <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Vérification de la base…</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 mb-6 flex items-center gap-3">
                <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                <code className="text-xs text-slate-700 dark:text-slate-300 truncate">{dbPath}</code>
              </div>
              <div className="space-y-3">
                <CheckRow label="Fichier accessible" state="done" />
                <CheckRow label="Format .accdb valide" state="done" />
                <CheckRow label="Connexion UCanAccess (JVM)" state="loading" />
                <CheckRow label="Détection des tables TeleTaxi" state="pending" />
              </div>
            </div>
          )}

          {/* État connecté */}
          {dbState === "connected" && dbInfo && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
              <div className="bg-green-50/50 dark:bg-green-950/20 border-b border-green-100 dark:border-green-900 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-green-100 dark:bg-green-950/40 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-green-900 dark:text-green-300">Base connectée</p>
                    <p className="text-xs text-green-700 dark:text-green-400">Toutes les vérifications sont passées</p>
                  </div>
                </div>
                <button onClick={handleReset} className="text-xs text-green-700 hover:text-green-900 font-medium flex items-center gap-1">
                  <RefreshCw className="w-3 h-3" />
                  Changer
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide font-medium mb-1.5">Fichier</p>
                  <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 rounded-lg p-2.5">
                    <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                    <code className="text-xs text-slate-700 dark:text-slate-300 truncate flex-1">{dbPath}</code>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <InfoCard icon={Database} label="Tables" value={String(dbInfo.tables_count)} />
                  <InfoCard icon={HardDrive} label="Prescripteurs" value={String(dbInfo.counts["PRESCRIPTEUR"] ?? 0)} />
                  <InfoCard icon={Calendar} label="Transports" value={String(dbInfo.counts["TRANSPORT"] ?? 0)} />
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide font-medium mb-2">Tables clés</p>
                  <div className="flex flex-wrap gap-1.5">
                    {Object.keys(dbInfo.counts).map((t) => (
                      <span key={t} className="text-xs px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-900 font-medium">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="border-t border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <ShieldCheck className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                  Backup automatique avant chaque import
                </div>
                <Link
                  href="/import"
                  className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                  Continuer vers l&apos;import
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}

          {/* État erreur */}
          {dbState === "error" && <ErrorPanel errorMsg={errorMsg} onRetry={handleRetry} onReset={handleReset} />}
        </div>
      </main>
    </div>
  );
}

function interpretExitCode(code: number): string {
  const hex = (code >>> 0).toString(16).toUpperCase().padStart(8, "0");
  const known: Record<number, string> = {
    // eslint-disable-next-line @typescript-eslint/no-loss-of-precision
    0xC0000135: "DLL introuvable — Visual C++ Redistributable manquant",
    // eslint-disable-next-line @typescript-eslint/no-loss-of-precision
    0xC0000142: "Initialisation DLL échouée — dépendance système manquante",
    // eslint-disable-next-line @typescript-eslint/no-loss-of-precision
    0xC0000005: "Violation d'accès mémoire",
    // eslint-disable-next-line @typescript-eslint/no-loss-of-precision
    0xC000007B: "Format d'image incorrect (mélange 32/64 bits)",
  };
  // JS numbers can't represent 0xC0000135 exactly as positive int, compare as signed
  const signed = code | 0;
  const unsigned = code >>> 0;
  const label = known[unsigned] ?? known[signed] ?? null;
  return label ? `0x${hex} — ${label}` : `0x${hex}`;
}

function ErrorPanel({
  errorMsg,
  onRetry,
  onReset,
}: {
  errorMsg: string;
  onRetry: () => void;
  onReset: () => void;
}) {
  const { code, detail } = parseErrorCode(errorMsg);
  const isCrash = code === "SIDECAR_CRASH" || code === "STARTUP_CRASH";

  // Pour les crashes bootloader, on ouvre le rapport automatiquement
  const [logExpanded, setLogExpanded] = useState(isCrash);
  const [logData, setLogData] = useState<{
    path: string | null;
    content: string;
    exists: boolean;
    java_home: string | null;
  } | null>(null);
  const [logLoading, setLogLoading] = useState(false);

  const loadLog = useCallback(async () => {
    if (logData) return;
    setLogLoading(true);
    try {
      const data = await tauri.sidecar.getLog();
      setLogData(data);
    } catch {
      setLogData({ path: null, content: "", exists: false, java_home: null });
    } finally {
      setLogLoading(false);
    }
  }, [logData]);

  // Charger le log automatiquement pour les crashes
  useEffect(() => {
    if (isCrash) loadLog();
  }, [isCrash, loadLog]);

  const handleToggleLog = () => {
    if (!logExpanded) loadLog();
    setLogExpanded((v) => !v);
  };

  // Extraire le code de sortie numérique depuis le message "code X"
  const exitCodeMatch = detail.match(/code\s+(-?\d+)/i);
  const exitCode = exitCodeMatch ? parseInt(exitCodeMatch[1], 10) : null;

  const copyDiag = async () => {
    const lines = [
      `Code erreur : ${code || "(aucun)"}`,
      `Message : ${detail}`,
      exitCode !== null ? `Code sortie Windows : ${interpretExitCode(exitCode)}` : null,
      logData?.java_home ? `Java détecté : ${logData.java_home}` : "Java : INTROUVABLE",
      "",
      `Log sidecar (${logData?.path ?? "?"}) :`,
      logData?.content?.trim() || "(vide)",
    ]
      .filter(Boolean)
      .join("\n");
    await navigator.clipboard.writeText(lines);
    toast.success("Infos de diagnostic copiées");
  };

  const guidance: { title: string; steps: string[] } = (() => {
    switch (code) {
      case "DB_LOCKED":
        return {
          title: "TeleTaxi est ouvert — fermez-le puis réessayez.",
          steps: [
            "Fermez complètement le logiciel TeleTaxi",
            "Attendez quelques secondes",
            'Cliquez sur "Réessayer" ci-dessous',
          ],
        };
      case "ACCESS_DRIVER_MISSING":
        return {
          title: "Le pilote Microsoft Access Database Engine est manquant.",
          steps: [
            "Téléchargez le pilote sur le site Microsoft (même bitness que l'app)",
            "Installez-le puis redémarrez l'application",
          ],
        };
      case "SIDECAR_CRASH":
        return {
          title: "Le moteur Python a planté au démarrage — vérifiez le rapport ci-dessous.",
          steps: [
            "Regardez le code de sortie Windows dans le rapport technique",
            "Si Java est INTROUVABLE : le JRE embarqué n'a pas été trouvé",
            "Copiez le rapport et contactez le support",
          ],
        };
      case "STARTUP_CRASH":
        return {
          title: "Le sidecar a planté au démarrage.",
          steps: [
            "Copiez le message d'erreur ci-dessous",
            "Contactez le support TeleTaxi CRM avec ce message",
          ],
        };
      default:
        return {
          title: "Impossible de se connecter au fichier. Si TeleTaxi est ouvert, fermez-le et réessayez.",
          steps: [
            "Fermez complètement le logiciel TeleTaxi",
            "Attendez quelques secondes",
            'Cliquez sur "Réessayer" ci-dessous',
          ],
        };
    }
  })();

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-red-200 dark:border-red-900 shadow-sm overflow-hidden">
      <div className="bg-red-50/50 dark:bg-red-950/20 border-b border-red-100 dark:border-red-900 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-red-100 dark:bg-red-950/40 flex items-center justify-center">
            <Lock className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-red-900 dark:text-red-300">Connexion échouée</p>
            <p className="text-xs text-red-700 dark:text-red-400 truncate max-w-xs">{detail || "Erreur inconnue"}</p>
          </div>
        </div>
        <button
          onClick={onReset}
          className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="p-6 space-y-4">
        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{guidance.title}</p>
        <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
          <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">Pour continuer :</p>
          <ol className="text-xs text-slate-600 dark:text-slate-400 space-y-1.5 list-decimal list-inside">
            {guidance.steps.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ol>
        </div>

        {/* Rapport technique */}
        <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
          <button
            onClick={handleToggleLog}
            className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Info className="w-3.5 h-3.5" />
              Rapport technique (support)
              {isCrash && <span className="bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 px-1.5 py-0.5 rounded text-xs">auto</span>}
            </span>
            <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", logExpanded && "rotate-180")} />
          </button>
          {logExpanded && (
            <div className="border-t border-slate-200 dark:border-slate-700 p-4 space-y-3 bg-slate-50 dark:bg-slate-800/50">
              {/* Code erreur */}
              <div className="space-y-1">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Code erreur</p>
                <p className="text-xs font-mono text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 rounded px-2 py-1 border border-slate-200 dark:border-slate-700">
                  {code || "(aucun)"}
                </p>
              </div>
              {/* Code de sortie Windows (pour crashes) */}
              {exitCode !== null && (
                <div className="space-y-1">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Code de sortie Windows</p>
                  <p className={cn(
                    "text-xs font-mono rounded px-2 py-1 border",
                    exitCode !== 0
                      ? "text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800"
                      : "text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                  )}>
                    {interpretExitCode(exitCode)}
                  </p>
                </div>
              )}
              {/* Java */}
              {logLoading ? (
                <div className="flex items-center gap-2 text-xs text-slate-500 py-1">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Chargement…
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Java (JRE)</p>
                  <p className={cn(
                    "text-xs font-mono rounded px-2 py-1 border",
                    logData?.java_home
                      ? "text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800"
                      : "text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800"
                  )}>
                    {logData?.java_home ?? "INTROUVABLE — cause probable du crash"}
                  </p>
                </div>
              )}
              {/* Log sidecar */}
              <div className="space-y-1">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Log sidecar
                  {logData?.path && (
                    <span className="font-normal ml-1 text-slate-400 dark:text-slate-500">— {logData.path}</span>
                  )}
                </p>
                {logLoading ? null : (
                  <pre className="text-xs text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700 p-2 max-h-40 overflow-auto whitespace-pre-wrap break-all font-mono">
                    {logData?.content?.trim() || "(vide — le processus Python n'a pas démarré)"}
                  </pre>
                )}
              </div>
              <button
                onClick={copyDiag}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                Copier pour le support
              </button>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={onRetry}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Réessayer
          </button>
          <button
            onClick={onReset}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            Choisir un autre fichier
          </button>
        </div>
      </div>
    </div>
  );
}

function CheckRow({ label, state }: { label: string; state: "done" | "loading" | "pending" }) {
  return (
    <div className="flex items-center gap-3 text-sm">
      {state === "done" && <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />}
      {state === "loading" && <Loader2 className="w-4 h-4 text-blue-600 animate-spin shrink-0" />}
      {state === "pending" && <div className="w-4 h-4 rounded-full border-2 border-slate-200 shrink-0" />}
      <span className={cn(state === "done" ? "text-slate-700 dark:text-slate-300" : state === "loading" ? "text-slate-900 dark:text-slate-100 font-medium" : "text-slate-400 dark:text-slate-500")}>
        {label}
      </span>
    </div>
  );
}

function InfoCard({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
      <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 mb-1">
        <Icon className="w-3.5 h-3.5" />
        <span className="text-xs">{label}</span>
      </div>
      <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{value}</p>
    </div>
  );
}
