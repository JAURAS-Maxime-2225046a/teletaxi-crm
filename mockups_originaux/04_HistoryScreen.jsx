import React, { useState } from 'react';
import {
  Car, Database, Upload, History, Settings, Camera, Sparkles,
  CheckCircle2, AlertCircle, AlertTriangle, X, Search, Filter,
  FileSpreadsheet, Clock, Calendar, ChevronRight, ChevronLeft,
  Download, RotateCcw, Eye, MoreHorizontal, ChevronDown,
  Stethoscope, Users, MapPin, ShieldCheck, FileText, ArrowUpDown,
  Info, ArrowRight, RefreshCw, Trash2
} from 'lucide-react';

export default function HistoryScreen() {
  const [selectedImport, setSelectedImport] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'success' | 'partial' | 'failed'
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);

  // Mock data
  const imports = [
    {
      id: 'imp_2026_01_15_001',
      fileName: 'TeleTaxi_Import_Janvier2026.xlsx',
      date: '15 jan 2026',
      time: '14:32',
      relativeTime: 'Il y a 2 heures',
      status: 'success',
      duration: '4.2s',
      stats: { prescripteurs: 8, beneficiaires: 24, courses: 156, total: 188 },
      backupAvailable: true,
      type: 'real',
    },
    {
      id: 'imp_2026_01_15_002',
      fileName: 'TeleTaxi_Import_Janvier2026.xlsx',
      date: '15 jan 2026',
      time: '14:28',
      relativeTime: 'Il y a 2 heures',
      status: 'dry-run',
      duration: '1.8s',
      stats: { prescripteurs: 8, beneficiaires: 24, courses: 156, total: 188 },
      backupAvailable: false,
      type: 'simulation',
    },
    {
      id: 'imp_2026_01_14_001',
      fileName: 'Patients_Janvier_Semaine2.xlsx',
      date: '14 jan 2026',
      time: '09:15',
      relativeTime: 'Hier',
      status: 'partial',
      duration: '7.5s',
      stats: { prescripteurs: 3, beneficiaires: 47, courses: 89, total: 139, errors: 12 },
      backupAvailable: true,
      type: 'real',
    },
    {
      id: 'imp_2026_01_12_001',
      fileName: 'Mise_a_jour_prescripteurs.xlsx',
      date: '12 jan 2026',
      time: '16:45',
      relativeTime: 'Il y a 3 jours',
      status: 'success',
      duration: '2.1s',
      stats: { prescripteurs: 15, beneficiaires: 0, courses: 0, total: 15 },
      backupAvailable: true,
      type: 'real',
    },
    {
      id: 'imp_2026_01_10_001',
      fileName: 'Import_test_invalide.xlsx',
      date: '10 jan 2026',
      time: '11:02',
      relativeTime: 'Il y a 5 jours',
      status: 'failed',
      duration: '0.8s',
      stats: { errors: 47 },
      backupAvailable: true,
      type: 'real',
      errorMessage: 'Structure de fichier non reconnue : feuille "Prescripteurs" manquante',
    },
    {
      id: 'imp_2026_01_08_001',
      fileName: 'TeleTaxi_Import_Décembre2025.xlsx',
      date: '8 jan 2026',
      time: '10:22',
      relativeTime: 'Il y a une semaine',
      status: 'success',
      duration: '5.3s',
      stats: { prescripteurs: 12, beneficiaires: 38, courses: 201, total: 251 },
      backupAvailable: true,
      type: 'real',
    },
  ];

  const filtered = imports.filter(imp => {
    const matchesStatus = filterStatus === 'all' || imp.status === filterStatus;
    const matchesSearch = searchQuery === '' ||
      imp.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      imp.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const stats = {
    total: imports.length,
    success: imports.filter(i => i.status === 'success').length,
    partial: imports.filter(i => i.status === 'partial').length,
    failed: imports.filter(i => i.status === 'failed').length,
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* ========== SIDEBAR ========== */}
      <aside className="w-52 xl:w-60 bg-white border-r border-slate-200 flex flex-col shrink-0">
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

        <button
          type="button"
          title="Gérer la base de données"
          className="mx-3 mt-3 mb-1 px-2.5 py-2 bg-green-50/50 border border-green-100 rounded-lg flex items-center gap-2 hover:bg-green-100/60 hover:border-green-200 transition-colors group text-left w-[calc(100%-1.5rem)]"
        >
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full shrink-0 animate-pulse" />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-green-900 truncate">Base connectée</p>
            <p className="text-[10px] text-green-700 truncate">data.accdb</p>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-green-700 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
        </button>

        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
          <SidebarSection label="Principal" />
          <SidebarItem icon={<Database className="w-4 h-4" />} label="Tableau de bord" />
          <SidebarItem icon={<Upload className="w-4 h-4" />} label="Import Excel" />
          <SidebarItem icon={<History className="w-4 h-4" />} label="Historique" badge="12" active />

          <SidebarSection label="À venir" />
          <SidebarItem icon={<Camera className="w-4 h-4" />} label="Bons scannés" soon />
          <SidebarItem icon={<Sparkles className="w-4 h-4" />} label="Assistant IA" soon />

          <SidebarSection label="Paramètres" />
          <SidebarItem icon={<Settings className="w-4 h-4" />} label="Configuration" />
        </nav>

        <div className="border-t border-slate-200 p-3">
          <div className="flex items-center gap-2.5 px-1">
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-medium text-slate-600 shrink-0">
              U
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-slate-900 truncate">Utilisateur</p>
              <p className="text-[10px] text-slate-500 truncate">Compte local</p>
            </div>
            <button className="text-slate-400 hover:text-slate-700 p-1 rounded hover:bg-slate-100 transition-colors">
              <MoreHorizontal className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* ========== MAIN ========== */}
      <div className="flex-1 flex min-w-0">
        {/* Liste principale */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <header className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between gap-3 shrink-0 flex-wrap">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-0.5">
                <span>Principal</span>
                <ChevronRight className="w-3 h-3" />
                <span className="text-slate-900 font-medium">Historique</span>
              </div>
              <h1 className="text-lg font-semibold text-slate-900 tracking-tight truncate">
                Historique des imports
              </h1>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button className="text-sm text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors flex items-center gap-1.5 whitespace-nowrap">
                <Download className="w-3.5 h-3.5" />
                Exporter
              </button>
              <button className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 font-medium whitespace-nowrap">
                <Upload className="w-3.5 h-3.5" />
                Nouvel import
              </button>
            </div>
          </header>

          {/* Stats top */}
          <div className="bg-white border-b border-slate-200 px-6 py-4 shrink-0">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <MetricCard label="Total des imports" value={stats.total} icon={<History className="w-4 h-4" />} />
              <MetricCard label="Réussis" value={stats.success} icon={<CheckCircle2 className="w-4 h-4" />} color="green" />
              <MetricCard label="Partiels" value={stats.partial} icon={<AlertTriangle className="w-4 h-4" />} color="amber" />
              <MetricCard label="Échecs" value={stats.failed} icon={<AlertCircle className="w-4 h-4" />} color="red" />
            </div>
          </div>

          {/* Toolbar filtres */}
          <div className="bg-white border-b border-slate-200 px-6 py-2.5 flex items-center justify-between gap-x-3 gap-y-2 shrink-0 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap min-w-0">
              <div className="relative w-56">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher un import..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
                />
              </div>

              <div className="flex items-center gap-1 bg-slate-50 rounded-md p-0.5 border border-slate-200 flex-wrap">
                <FilterChip label="Tous" active={filterStatus === 'all'} onClick={() => setFilterStatus('all')} count={stats.total} />
                <FilterChip label="Réussis" active={filterStatus === 'success'} onClick={() => setFilterStatus('success')} count={stats.success} color="green" />
                <FilterChip label="Partiels" active={filterStatus === 'partial'} onClick={() => setFilterStatus('partial')} count={stats.partial} color="amber" />
                <FilterChip label="Échecs" active={filterStatus === 'failed'} onClick={() => setFilterStatus('failed')} count={stats.failed} color="red" />
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button className="text-xs text-slate-600 hover:text-slate-900 px-2 py-1.5 rounded-md hover:bg-slate-100 transition-colors flex items-center gap-1.5 whitespace-nowrap">
                <Calendar className="w-3.5 h-3.5" />
                Période
                <ChevronDown className="w-3 h-3" />
              </button>
              <button className="text-xs text-slate-600 hover:text-slate-900 px-2 py-1.5 rounded-md hover:bg-slate-100 transition-colors flex items-center gap-1.5 whitespace-nowrap">
                <Filter className="w-3.5 h-3.5" />
                Plus
              </button>
            </div>
          </div>

          {/* Liste des imports */}
          <div className="flex-1 overflow-y-auto bg-slate-50/30">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-12 text-center">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                  <Search className="w-7 h-7 text-slate-400" strokeWidth={1.5} />
                </div>
                <h3 className="text-sm font-medium text-slate-900 mb-1">Aucun import trouvé</h3>
                <p className="text-xs text-slate-500">Essayez d'ajuster vos filtres ou votre recherche</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-200">
                {filtered.map((imp) => (
                  <ImportRow
                    key={imp.id}
                    imp={imp}
                    selected={selectedImport === imp.id}
                    onClick={() => setSelectedImport(imp.id)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Pagination */}
          {filtered.length > 0 && (
            <div className="bg-white border-t border-slate-200 px-6 py-2.5 flex items-center justify-between shrink-0">
              <p className="text-xs text-slate-500">
                Affichage <span className="font-medium text-slate-900">1-{filtered.length}</span> sur <span className="font-medium text-slate-900">{imports.length}</span> imports
              </p>
              <div className="flex items-center gap-1">
                <button disabled className="text-xs text-slate-400 px-2 py-1 rounded-md disabled:cursor-not-allowed flex items-center gap-1">
                  <ChevronLeft className="w-3.5 h-3.5" />
                  Précédent
                </button>
                <button className="text-xs text-slate-700 hover:bg-slate-100 px-2 py-1 rounded-md flex items-center gap-1 transition-colors">
                  Suivant
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ========== DRAWER DE DÉTAIL ========== */}
        {selectedImport && (
          <DetailDrawer
            imp={imports.find(i => i.id === selectedImport)}
            onClose={() => setSelectedImport(null)}
          />
        )}
      </div>
    </div>
  );
}

// ============================================================
function ImportRow({ imp, selected, onClick }) {
  const statusConfig = {
    success: { icon: <CheckCircle2 className="w-4 h-4" />, color: 'text-green-600', bg: 'bg-green-50', label: 'Réussi' },
    partial: { icon: <AlertTriangle className="w-4 h-4" />, color: 'text-amber-600', bg: 'bg-amber-50', label: 'Partiel' },
    failed: { icon: <AlertCircle className="w-4 h-4" />, color: 'text-red-600', bg: 'bg-red-50', label: 'Échec' },
    'dry-run': { icon: <Eye className="w-4 h-4" />, color: 'text-slate-600', bg: 'bg-slate-100', label: 'Simulation' },
  };
  const s = statusConfig[imp.status];

  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-6 py-3.5 hover:bg-white transition-colors flex items-center gap-4 ${
        selected ? 'bg-white ring-1 ring-inset ring-blue-300' : ''
      }`}
    >
      {/* Status icon */}
      <div className={`w-9 h-9 rounded-lg ${s.bg} flex items-center justify-center shrink-0`}>
        <span className={s.color}>{s.icon}</span>
      </div>

      {/* Main info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="text-sm font-medium text-slate-900 truncate">{imp.fileName}</p>
          {imp.type === 'simulation' && (
            <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium shrink-0">
              SIMULATION
            </span>
          )}
        </div>
        <div className="flex items-center gap-x-3 gap-y-0.5 text-xs text-slate-500 flex-wrap">
          <span className="flex items-center gap-1 whitespace-nowrap">
            <Clock className="w-3 h-3" />
            {imp.relativeTime}
          </span>
          <span className="hidden md:inline">·</span>
          <span className="hidden md:inline whitespace-nowrap">{imp.date} · {imp.time}</span>
          <span className="hidden md:inline">·</span>
          <span className="font-mono whitespace-nowrap">{imp.duration}</span>
        </div>
      </div>

      {/* Stats inline */}
      <div className="hidden lg:flex items-center gap-3 shrink-0">
        {imp.status === 'failed' ? (
          <p className="text-xs text-red-700 max-w-xs truncate">
            {imp.errorMessage}
          </p>
        ) : (
          <>
            {imp.stats.prescripteurs > 0 && <MiniStat icon={<Stethoscope className="w-3 h-3" />} value={imp.stats.prescripteurs} />}
            {imp.stats.beneficiaires > 0 && <MiniStat icon={<Users className="w-3 h-3" />} value={imp.stats.beneficiaires} />}
            {imp.stats.courses > 0 && <MiniStat icon={<MapPin className="w-3 h-3" />} value={imp.stats.courses} />}
            {imp.stats.errors > 0 && <MiniStat icon={<AlertCircle className="w-3 h-3" />} value={imp.stats.errors} color="red" />}
          </>
        )}
      </div>

      {/* Chevron */}
      <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
    </button>
  );
}

function MiniStat({ icon, value, color = 'slate' }) {
  const colors = {
    slate: 'text-slate-600 bg-slate-100',
    red: 'text-red-700 bg-red-50',
  };
  return (
    <div className={`flex items-center gap-1 text-xs ${colors[color]} px-1.5 py-0.5 rounded font-medium`}>
      {icon}
      <span>{value}</span>
    </div>
  );
}

function MetricCard({ label, value, icon, color = 'slate' }) {
  const colors = {
    slate: 'text-slate-600 bg-slate-50',
    green: 'text-green-700 bg-green-50',
    amber: 'text-amber-700 bg-amber-50',
    red: 'text-red-700 bg-red-50',
  };
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-3">
      <div className="flex items-center justify-between mb-1.5">
        <p className="text-xs text-slate-500 font-medium">{label}</p>
        <div className={`w-6 h-6 rounded ${colors[color]} flex items-center justify-center`}>
          {icon}
        </div>
      </div>
      <p className="text-xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function FilterChip({ label, active, onClick, count, color = 'slate' }) {
  const activeColors = {
    slate: 'bg-white text-slate-900 shadow-sm border-slate-200',
    green: 'bg-white text-green-700 shadow-sm border-green-200',
    amber: 'bg-white text-amber-700 shadow-sm border-amber-200',
    red: 'bg-white text-red-700 shadow-sm border-red-200',
  };
  return (
    <button
      onClick={onClick}
      className={`text-xs px-2.5 py-1 rounded transition-all flex items-center gap-1.5 font-medium border whitespace-nowrap ${
        active ? activeColors[color] : 'text-slate-600 hover:text-slate-900 border-transparent'
      }`}
    >
      {label}
      <span className={`text-[10px] px-1 rounded ${active ? 'bg-slate-100' : 'bg-slate-200/60'}`}>
        {count}
      </span>
    </button>
  );
}

function SidebarSection({ label }) {
  return (
    <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider px-2 mt-3 mb-1">
      {label}
    </p>
  );
}

function SidebarItem({ icon, label, active, badge, soon }) {
  return (
    <button
      className={`w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md text-sm transition-colors ${
        active
          ? 'bg-blue-50 text-blue-700 font-medium'
          : soon
          ? 'text-slate-400 cursor-not-allowed'
          : 'text-slate-700 hover:bg-slate-100'
      }`}
      disabled={soon}
    >
      <span className={active ? 'text-blue-700' : 'text-slate-500'}>{icon}</span>
      <span className="flex-1 text-left truncate">{label}</span>
      {badge && (
        <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
          active ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-700'
        }`}>
          {badge}
        </span>
      )}
      {soon && (
        <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-medium">
          V2
        </span>
      )}
    </button>
  );
}

// ============================================================
function DetailDrawer({ imp, onClose }) {
  if (!imp) return null;

  const statusConfig = {
    success: { color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200', label: 'Import réussi', icon: <CheckCircle2 className="w-4 h-4" /> },
    partial: { color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', label: 'Import partiel', icon: <AlertTriangle className="w-4 h-4" /> },
    failed: { color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200', label: 'Import échoué', icon: <AlertCircle className="w-4 h-4" /> },
    'dry-run': { color: 'text-slate-700', bg: 'bg-slate-100', border: 'border-slate-200', label: 'Simulation (dry-run)', icon: <Eye className="w-4 h-4" /> },
  };
  const s = statusConfig[imp.status];

  return (
    <aside className="w-80 xl:w-96 bg-white border-l border-slate-200 flex flex-col shrink-0">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-200 flex items-start justify-between gap-3 shrink-0">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-mono text-slate-500 mb-1 truncate">{imp.id}</p>
          <h3 className="text-sm font-semibold text-slate-900 truncate">{imp.fileName}</h3>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-700 p-1 rounded hover:bg-slate-100 transition-colors shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Status banner */}
      <div className={`px-5 py-3 ${s.bg} border-b ${s.border} flex items-center gap-2.5 shrink-0`}>
        <span className={s.color}>{s.icon}</span>
        <div className="min-w-0 flex-1">
          <p className={`text-sm font-medium ${s.color}`}>{s.label}</p>
          <p className="text-xs text-slate-600">{imp.date} à {imp.time} · {imp.duration}</p>
        </div>
      </div>

      {/* Content scrollable */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {imp.errorMessage && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-xs font-medium text-red-900 mb-1">Message d'erreur</p>
            <p className="text-xs text-red-700 leading-relaxed">{imp.errorMessage}</p>
          </div>
        )}

        {/* Stats par table */}
        {(imp.stats.prescripteurs > 0 || imp.stats.beneficiaires > 0 || imp.stats.courses > 0) && (
          <div>
            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wide mb-2">
              Lignes traitées
            </p>
            <div className="space-y-1.5">
              {imp.stats.prescripteurs > 0 && (
                <StatLine icon={<Stethoscope className="w-3.5 h-3.5" />} label="Prescripteurs" value={imp.stats.prescripteurs} />
              )}
              {imp.stats.beneficiaires > 0 && (
                <StatLine icon={<Users className="w-3.5 h-3.5" />} label="Bénéficiaires" value={imp.stats.beneficiaires} />
              )}
              {imp.stats.courses > 0 && (
                <StatLine icon={<MapPin className="w-3.5 h-3.5" />} label="Courses" value={imp.stats.courses} />
              )}
              <div className="pt-2 mt-2 border-t border-slate-200">
                <StatLine icon={<FileText className="w-3.5 h-3.5" />} label="Total" value={imp.stats.total || 0} bold />
              </div>
              {imp.stats.errors > 0 && (
                <StatLine icon={<AlertCircle className="w-3.5 h-3.5" />} label="Erreurs" value={imp.stats.errors} color="red" />
              )}
            </div>
          </div>
        )}

        {/* Backup */}
        {imp.backupAvailable && (
          <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
              <p className="text-xs font-medium text-slate-900">Backup disponible</p>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed mb-2.5">
              Une copie de <code className="bg-white px-1 py-0.5 rounded">data.accdb</code> a été créée avant cet import.
            </p>
            <button className="text-xs text-slate-700 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 px-2.5 py-1.5 rounded-md transition-colors flex items-center gap-1.5 font-medium">
              <RotateCcw className="w-3 h-3" />
              Restaurer ce backup
            </button>
          </div>
        )}

        {/* Logs preview */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">
              Journal détaillé
            </p>
            <button className="text-[11px] text-blue-600 hover:text-blue-700 font-medium">
              Tout voir
            </button>
          </div>
          <div className="bg-slate-900 rounded-lg p-3 font-mono text-[11px] text-slate-300 space-y-0.5 leading-relaxed max-h-44 overflow-y-auto">
            <LogLine time="14:32:01" level="INFO" message="Début de l'import" />
            <LogLine time="14:32:01" level="INFO" message="Backup créé : backup_2026-01-15_14-32.accdb" />
            <LogLine time="14:32:02" level="INFO" message="Parsing Excel..." />
            <LogLine time="14:32:02" level="INFO" message="8 prescripteurs détectés" />
            <LogLine time="14:32:03" level="INFO" message="Insertion table Prescripteurs..." />
            {imp.status === 'partial' && (
              <LogLine time="14:32:04" level="WARN" message="Ligne 12 ignorée : RPPS manquant" />
            )}
            {imp.status === 'failed' && (
              <LogLine time="14:32:04" level="ERROR" message="Feuille 'Prescripteurs' introuvable" />
            )}
            <LogLine time="14:32:05" level="INFO" message="Import terminé" />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="border-t border-slate-200 p-4 space-y-2 shrink-0 bg-slate-50/50">
        <button className="w-full text-sm text-slate-700 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 px-3 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 font-medium">
          <Download className="w-3.5 h-3.5" />
          Télécharger le rapport complet
        </button>
        {imp.status !== 'dry-run' && (
          <button className="w-full text-sm text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 font-medium">
            <Trash2 className="w-3.5 h-3.5" />
            Supprimer cet historique
          </button>
        )}
      </div>
    </aside>
  );
}

function StatLine({ icon, label, value, bold, color = 'slate' }) {
  const colors = {
    slate: bold ? 'text-slate-900' : 'text-slate-700',
    red: 'text-red-700',
  };
  return (
    <div className="flex items-center justify-between text-xs">
      <div className={`flex items-center gap-2 ${bold ? 'font-medium' : ''} ${colors[color]}`}>
        <span className="text-slate-400">{icon}</span>
        {label}
      </div>
      <span className={`font-mono ${bold ? 'font-semibold' : 'font-medium'} ${colors[color]}`}>
        {value.toLocaleString('fr-FR')}
      </span>
    </div>
  );
}

function LogLine({ time, level, message }) {
  const levelColors = {
    INFO: 'text-blue-400',
    WARN: 'text-amber-400',
    ERROR: 'text-red-400',
  };
  return (
    <div className="flex gap-2">
      <span className="text-slate-500 shrink-0">{time}</span>
      <span className={`${levelColors[level]} shrink-0 w-12`}>{level}</span>
      <span className="text-slate-300 break-words min-w-0">{message}</span>
    </div>
  );
}
