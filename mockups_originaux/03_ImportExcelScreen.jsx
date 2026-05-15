import React, { useState } from 'react';
import {
  Car, Database, Upload, History, Settings, FileSpreadsheet,
  CheckCircle2, AlertCircle, AlertTriangle, X, Search, Filter,
  Play, Eye, EyeOff, Trash2, RefreshCw, Download, ChevronDown,
  ChevronRight, FileText, HardDrive, Clock, Users, MapPin,
  Stethoscope, Edit3, Info, ArrowUpDown, MoreHorizontal,
  Sparkles, Camera, ShieldCheck, ChevronsRight, ChevronsLeft
} from 'lucide-react';

export default function ImportExcelScreen() {
  const [activeTab, setActiveTab] = useState('prescripteurs'); // 'prescripteurs' | 'beneficiaires' | 'courses'
  const [fileLoaded, setFileLoaded] = useState(true);
  const [errorPanelOpen, setErrorPanelOpen] = useState(true);
  const [activeErrorTab, setActiveErrorTab] = useState('errors'); // 'errors' | 'warnings' | 'info'
  const [selectedRow, setSelectedRow] = useState(null);
  const [editingCell, setEditingCell] = useState(null);

  // Données mock pour la preview
  const mockData = {
    prescripteurs: [
      { id: 1, rpps: '10100123456', nom: 'Dupont', prenom: 'Marie', specialite: 'Médecin généraliste', cp: '75015', ville: 'Paris', status: 'valid' },
      { id: 2, rpps: '10100234567', nom: 'Martin', prenom: 'Jean', specialite: 'Cardiologue', cp: '69003', ville: 'Lyon', status: 'valid' },
      { id: 3, rpps: '', nom: 'Bernard', prenom: 'Sophie', specialite: 'Pédiatre', cp: '13008', ville: 'Marseille', status: 'error', errorField: 'rpps' },
      { id: 4, rpps: '10100456789', nom: 'Petit', prenom: '', specialite: 'Radiologue', cp: '31000', ville: 'Toulouse', status: 'error', errorField: 'prenom' },
      { id: 5, rpps: '10100567890', nom: 'Robert', prenom: 'Pierre', specialite: 'Ophtalmologue', cp: '44000', ville: 'Nantes', status: 'warning', warningField: 'cp' },
      { id: 6, rpps: '10100678901', nom: 'Richard', prenom: 'Claire', specialite: 'Dermatologue', cp: '67000', ville: 'Strasbourg', status: 'valid' },
      { id: 7, rpps: '10100789012', nom: 'Durand', prenom: 'Luc', specialite: 'Médecin généraliste', cp: '33000', ville: 'Bordeaux', status: 'valid' },
      { id: 8, rpps: '10100890123', nom: 'Moreau', prenom: 'Anne', specialite: 'Gynécologue', cp: '59000', ville: 'Lille', status: 'valid' },
    ]
  };

  const errors = [
    { id: 1, row: 3, field: 'RPPS', message: 'Le RPPS est obligatoire mais manquant', severity: 'error' },
    { id: 2, row: 4, field: 'Prénom', message: 'Le prénom est obligatoire mais manquant', severity: 'error' },
  ];

  const warnings = [
    { id: 3, row: 5, field: 'Code postal', message: 'Code postal proche d\'un doublon existant (44100)', severity: 'warning' },
  ];

  const infos = [
    { id: 4, message: '6 nouveaux prescripteurs seront créés', severity: 'info' },
    { id: 5, message: '2 lignes seront ignorées (erreurs)', severity: 'info' },
  ];

  const counts = {
    total: mockData.prescripteurs.length,
    valid: mockData.prescripteurs.filter(r => r.status === 'valid').length,
    errors: mockData.prescripteurs.filter(r => r.status === 'error').length,
    warnings: mockData.prescripteurs.filter(r => r.status === 'warning').length,
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* ========== SIDEBAR ========== */}
      <aside className="w-52 xl:w-60 bg-white border-r border-slate-200 flex flex-col shrink-0">
        {/* Logo */}
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

        {/* Status BD - cliquable pour aller à la config */}
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

        {/* Nav */}
        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
          <SidebarSection label="Principal" />
          <SidebarItem icon={<Database className="w-4 h-4" />} label="Tableau de bord" />
          <SidebarItem icon={<Upload className="w-4 h-4" />} label="Import Excel" active />
          <SidebarItem icon={<History className="w-4 h-4" />} label="Historique" badge="12" />

          <SidebarSection label="À venir" />
          <SidebarItem icon={<Camera className="w-4 h-4" />} label="Bons scannés" soon />
          <SidebarItem icon={<Sparkles className="w-4 h-4" />} label="Assistant IA" soon />

          <SidebarSection label="Paramètres" />
          <SidebarItem icon={<Settings className="w-4 h-4" />} label="Configuration" />
        </nav>

        {/* User card */}
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

      {/* ========== MAIN CONTENT ========== */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header de page */}
        <header className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-0.5">
              <span>Principal</span>
              <ChevronRight className="w-3 h-3" />
              <span className="text-slate-900 font-medium">Import Excel</span>
            </div>
            <h1 className="text-lg font-semibold text-slate-900 tracking-tight">
              Importer un fichier Excel
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button className="text-sm text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5" />
              Aide
            </button>
          </div>
        </header>

        {/* Zone fichier - mini barre récap */}
        {fileLoaded && (
          <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
                <FileSpreadsheet className="w-4.5 h-4.5 text-green-600" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    TeleTaxi_Import_Janvier2026.xlsx
                  </p>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium shrink-0">
                    312 Ko
                  </span>
                </div>
                <p className="text-xs text-slate-500 truncate">
                  3 feuilles · Chargé il y a 12 secondes
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button className="text-xs text-slate-600 hover:text-slate-900 px-2.5 py-1.5 rounded-md hover:bg-slate-100 transition-colors flex items-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5" />
                Recharger
              </button>
              <button
                onClick={() => setFileLoaded(false)}
                className="text-xs text-red-600 hover:text-red-700 px-2.5 py-1.5 rounded-md hover:bg-red-50 transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Supprimer
              </button>
            </div>
          </div>
        )}

        {/* État sans fichier */}
        {!fileLoaded && (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="w-full max-w-xl">
              <div
                className="bg-white border-2 border-dashed border-slate-300 rounded-2xl p-12 text-center hover:border-blue-400 hover:bg-blue-50/30 transition-all cursor-pointer"
                onClick={() => setFileLoaded(true)}
              >
                <div className="w-14 h-14 rounded-2xl bg-blue-50 mx-auto flex items-center justify-center mb-4">
                  <Upload className="w-7 h-7 text-blue-600" strokeWidth={1.8} />
                </div>
                <h3 className="text-base font-medium text-slate-900 mb-1.5">
                  Déposez votre fichier Excel ici
                </h3>
                <p className="text-sm text-slate-500 mb-5">
                  ou cliquez pour parcourir vos fichiers
                </p>
                <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2.5 rounded-lg inline-flex items-center gap-2 transition-colors">
                  <Upload className="w-4 h-4" />
                  Sélectionner un fichier
                </button>
                <p className="text-xs text-slate-400 mt-4">
                  Format accepté : .xlsx · Taille max : 10 Mo
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Workspace (preview + panneau) */}
        {fileLoaded && (
          <div className="flex-1 flex min-h-0">
            {/* Preview */}
            <div className="flex-1 flex flex-col min-w-0 min-h-0">
              {/* Tabs des feuilles + stats */}
              <div className="bg-white border-b border-slate-200 px-6 pt-3 flex flex-wrap items-end justify-between gap-y-2 shrink-0">
                <div className="flex items-center gap-1 flex-wrap">
                  <SheetTab
                    icon={<Stethoscope className="w-3.5 h-3.5" />}
                    label="Prescripteurs"
                    count={8}
                    errors={2}
                    active={activeTab === 'prescripteurs'}
                    onClick={() => setActiveTab('prescripteurs')}
                  />
                  <SheetTab
                    icon={<Users className="w-3.5 h-3.5" />}
                    label="Bénéficiaires"
                    count={24}
                    errors={1}
                    active={activeTab === 'beneficiaires'}
                    onClick={() => setActiveTab('beneficiaires')}
                  />
                  <SheetTab
                    icon={<MapPin className="w-3.5 h-3.5" />}
                    label="Courses"
                    count={156}
                    errors={0}
                    active={activeTab === 'courses'}
                    onClick={() => setActiveTab('courses')}
                  />
                </div>

                <div className="flex items-center gap-3 pb-2 flex-wrap">
                  <StatPill label="Total" value={counts.total} />
                  <StatPill label="Valides" value={counts.valid} color="green" />
                  <StatPill label="Erreurs" value={counts.errors} color="red" />
                  <StatPill label="Avertis." value={counts.warnings} color="amber" />
                </div>
              </div>

              {/* Toolbar */}
              <div className="bg-white border-b border-slate-200 px-6 py-2.5 flex items-center justify-between gap-3 shrink-0 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap min-w-0">
                  <div className="relative w-48">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Rechercher..."
                      className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
                    />
                  </div>
                  <button className="text-xs text-slate-600 hover:text-slate-900 px-2 py-1.5 rounded-md hover:bg-slate-100 transition-colors flex items-center gap-1.5 whitespace-nowrap">
                    <Filter className="w-3.5 h-3.5" />
                    Filtrer
                  </button>
                  <div className="h-4 w-px bg-slate-200 hidden sm:block" />
                  <button className="text-xs text-red-600 hover:text-red-700 px-2 py-1.5 rounded-md hover:bg-red-50 transition-colors flex items-center gap-1.5 whitespace-nowrap">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span className="hidden md:inline">Voir uniquement les erreurs</span>
                    <span className="md:hidden">Erreurs</span>
                  </button>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => setErrorPanelOpen(!errorPanelOpen)}
                    className={`text-xs px-2 py-1.5 rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                      errorPanelOpen ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {errorPanelOpen ? <ChevronsRight className="w-3.5 h-3.5" /> : <ChevronsLeft className="w-3.5 h-3.5" />}
                    {errorPanelOpen ? 'Réduire' : 'Détails'}
                  </button>
                </div>
              </div>

              {/* Tableau */}
              <div className="flex-1 overflow-auto bg-slate-50/30">
                <table className="w-full min-w-[720px] text-sm">
                  <thead className="bg-white sticky top-0 border-b border-slate-200 z-10">
                    <tr>
                      <th className="w-10 px-3 py-2.5 text-left">
                        <input type="checkbox" className="rounded border-slate-300" />
                      </th>
                      <th className="w-12 px-2 py-2.5 text-left text-[11px] font-medium text-slate-500 uppercase tracking-wide">#</th>
                      <th className="px-3 py-2.5 text-left text-[11px] font-medium text-slate-500 uppercase tracking-wide">
                        <button className="flex items-center gap-1 hover:text-slate-900">
                          RPPS <ArrowUpDown className="w-3 h-3" />
                        </button>
                      </th>
                      <th className="px-3 py-2.5 text-left text-[11px] font-medium text-slate-500 uppercase tracking-wide">Nom</th>
                      <th className="px-3 py-2.5 text-left text-[11px] font-medium text-slate-500 uppercase tracking-wide">Prénom</th>
                      <th className="px-3 py-2.5 text-left text-[11px] font-medium text-slate-500 uppercase tracking-wide">Spécialité</th>
                      <th className="px-3 py-2.5 text-left text-[11px] font-medium text-slate-500 uppercase tracking-wide">CP</th>
                      <th className="px-3 py-2.5 text-left text-[11px] font-medium text-slate-500 uppercase tracking-wide">Ville</th>
                      <th className="w-16 px-3 py-2.5 text-left text-[11px] font-medium text-slate-500 uppercase tracking-wide">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockData.prescripteurs.map((row, idx) => (
                      <tr
                        key={row.id}
                        onClick={() => setSelectedRow(row.id)}
                        className={`group border-b border-slate-100 cursor-pointer transition-colors ${
                          selectedRow === row.id ? 'bg-blue-50/50' :
                          row.status === 'error' ? 'bg-red-50/30 hover:bg-red-50/60' :
                          row.status === 'warning' ? 'bg-amber-50/30 hover:bg-amber-50/60' :
                          'bg-white hover:bg-slate-50'
                        }`}
                      >
                        <td className="px-3 py-2.5">
                          <input type="checkbox" className="rounded border-slate-300" onClick={(e) => e.stopPropagation()} />
                        </td>
                        <td className="px-2 py-2.5">
                          <div className="flex items-center gap-1.5">
                            {row.status === 'error' && <AlertCircle className="w-3.5 h-3.5 text-red-500" />}
                            {row.status === 'warning' && <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />}
                            {row.status === 'valid' && <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />}
                            <span className="text-xs text-slate-400 font-mono">{idx + 1}</span>
                          </div>
                        </td>
                        <Cell value={row.rpps} hasError={row.errorField === 'rpps'} placeholder="(manquant)" />
                        <Cell value={row.nom} />
                        <Cell value={row.prenom} hasError={row.errorField === 'prenom'} placeholder="(manquant)" />
                        <Cell value={row.specialite} />
                        <Cell value={row.cp} hasWarning={row.warningField === 'cp'} />
                        <Cell value={row.ville} />
                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-1 rounded hover:bg-slate-200 text-slate-500 hover:text-slate-900" onClick={(e) => e.stopPropagation()}>
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button className="p-1 rounded hover:bg-red-100 text-slate-500 hover:text-red-600" onClick={(e) => e.stopPropagation()}>
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Footer actions */}
              <div className="bg-white border-t border-slate-200 px-6 py-3 flex items-center justify-between gap-3 shrink-0 flex-wrap">
                <div className="flex items-center gap-2 text-xs text-slate-500 min-w-0">
                  <ShieldCheck className="w-3.5 h-3.5 text-green-600 shrink-0" />
                  <span className="whitespace-nowrap">Backup automatique avant import</span>
                  <span className="text-slate-300 hidden lg:inline">·</span>
                  <span className="hidden lg:inline truncate">L'import écrira dans <code className="bg-slate-100 px-1 py-0.5 rounded">data.accdb</code></span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button className="text-sm text-slate-700 hover:text-slate-900 px-3.5 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors flex items-center gap-2 font-medium whitespace-nowrap">
                    <Eye className="w-3.5 h-3.5" />
                    Simuler (dry-run)
                  </button>
                  <button
                    disabled={counts.errors > 0}
                    className="text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 font-medium whitespace-nowrap"
                  >
                    <Play className="w-3.5 h-3.5" />
                    Importer
                    {counts.errors > 0 && (
                      <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded">
                        {counts.errors} erreur{counts.errors > 1 ? 's' : ''}
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* ========== PANNEAU D'ERREURS LATÉRAL ========== */}
            {errorPanelOpen && (
              <aside className="w-72 xl:w-80 bg-white border-l border-slate-200 flex flex-col shrink-0">
                <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between shrink-0">
                  <h3 className="text-sm font-semibold text-slate-900">Vérifications</h3>
                  <button
                    onClick={() => setErrorPanelOpen(false)}
                    className="text-slate-400 hover:text-slate-700 p-1 rounded hover:bg-slate-100 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Tabs erreurs/warnings/info */}
                <div className="border-b border-slate-200 grid grid-cols-3 shrink-0">
                  <ErrorTab
                    label="Erreurs"
                    count={errors.length}
                    color="red"
                    active={activeErrorTab === 'errors'}
                    onClick={() => setActiveErrorTab('errors')}
                  />
                  <ErrorTab
                    label="Avertis."
                    count={warnings.length}
                    color="amber"
                    active={activeErrorTab === 'warnings'}
                    onClick={() => setActiveErrorTab('warnings')}
                  />
                  <ErrorTab
                    label="Infos"
                    count={infos.length}
                    color="blue"
                    active={activeErrorTab === 'info'}
                    onClick={() => setActiveErrorTab('info')}
                  />
                </div>

                {/* Liste */}
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                  {activeErrorTab === 'errors' && errors.map(err => (
                    <ErrorItem key={err.id} item={err} severity="error" />
                  ))}
                  {activeErrorTab === 'warnings' && warnings.map(w => (
                    <ErrorItem key={w.id} item={w} severity="warning" />
                  ))}
                  {activeErrorTab === 'info' && infos.map(i => (
                    <ErrorItem key={i.id} item={i} severity="info" />
                  ))}
                </div>

                {/* Footer panneau */}
                <div className="border-t border-slate-200 p-3 bg-slate-50/50 shrink-0">
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Corrigez les <span className="font-medium text-red-700">erreurs</span> pour activer l'import.
                    Les <span className="font-medium text-amber-700">avertissements</span> sont informatifs.
                  </p>
                </div>
              </aside>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ==================== Sous-composants ====================

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
        <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-medium">
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

function SheetTab({ icon, label, count, errors, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-3.5 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
        active
          ? 'border-blue-600 text-blue-700'
          : 'border-transparent text-slate-600 hover:text-slate-900'
      }`}
    >
      <span className={active ? 'text-blue-700' : 'text-slate-400'}>{icon}</span>
      {label}
      <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium">
        {count}
      </span>
      {errors > 0 && (
        <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-medium">
          {errors}
        </span>
      )}
    </button>
  );
}

function StatPill({ label, value, color = 'slate' }) {
  const colors = {
    slate: 'text-slate-700',
    green: 'text-green-700',
    red: 'text-red-700',
    amber: 'text-amber-700',
  };
  return (
    <div className="flex items-baseline gap-1.5">
      <span className="text-[10px] uppercase tracking-wide text-slate-500 font-medium">{label}</span>
      <span className={`text-sm font-semibold ${colors[color]}`}>{value}</span>
    </div>
  );
}

function Cell({ value, hasError, hasWarning, placeholder }) {
  return (
    <td className={`px-3 py-2.5 text-sm ${
      hasError ? 'text-red-700 font-medium' :
      hasWarning ? 'text-amber-700' :
      'text-slate-700'
    }`}>
      {value || <span className="text-slate-400 italic text-xs">{placeholder || '—'}</span>}
    </td>
  );
}

function ErrorTab({ label, count, color, active, onClick }) {
  const colors = {
    red: { active: 'border-red-500 text-red-700 bg-red-50/50', badge: 'bg-red-100 text-red-700' },
    amber: { active: 'border-amber-500 text-amber-700 bg-amber-50/50', badge: 'bg-amber-100 text-amber-700' },
    blue: { active: 'border-blue-500 text-blue-700 bg-blue-50/50', badge: 'bg-blue-100 text-blue-700' },
  };
  return (
    <button
      onClick={onClick}
      className={`py-2.5 text-xs font-medium border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
        active ? colors[color].active : 'border-transparent text-slate-500 hover:text-slate-900'
      }`}
    >
      {label}
      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
        active ? colors[color].badge : 'bg-slate-100 text-slate-600'
      }`}>
        {count}
      </span>
    </button>
  );
}

function ErrorItem({ item, severity }) {
  const styles = {
    error: { bg: 'bg-red-50/50', border: 'border-red-200', icon: <AlertCircle className="w-3.5 h-3.5 text-red-600" />, badgeBg: 'bg-red-100 text-red-700' },
    warning: { bg: 'bg-amber-50/50', border: 'border-amber-200', icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />, badgeBg: 'bg-amber-100 text-amber-700' },
    info: { bg: 'bg-blue-50/50', border: 'border-blue-200', icon: <Info className="w-3.5 h-3.5 text-blue-600" />, badgeBg: 'bg-blue-100 text-blue-700' },
  };
  const s = styles[severity];

  return (
    <button className={`w-full text-left ${s.bg} border ${s.border} rounded-lg p-2.5 hover:brightness-95 transition-all group`}>
      <div className="flex items-start gap-2">
        <div className="mt-0.5 shrink-0">{s.icon}</div>
        <div className="flex-1 min-w-0">
          {item.row && (
            <div className="flex items-center gap-1.5 mb-1">
              <span className={`text-[10px] font-mono ${s.badgeBg} px-1.5 py-0.5 rounded font-medium`}>
                Ligne {item.row}
              </span>
              <span className="text-[10px] text-slate-500 font-medium">{item.field}</span>
            </div>
          )}
          <p className="text-xs text-slate-700 leading-relaxed">{item.message}</p>
          {item.row && (
            <p className="text-[10px] text-slate-500 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
              Cliquez pour voir dans le tableau →
            </p>
          )}
        </div>
      </div>
    </button>
  );
}
