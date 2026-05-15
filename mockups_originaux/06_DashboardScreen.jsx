import React from 'react';
import {
  Car, Database, Upload, History, Settings, Camera, Sparkles,
  CheckCircle2, AlertCircle, AlertTriangle, ChevronRight, MoreHorizontal,
  TrendingUp, TrendingDown, Users, MapPin, Stethoscope, Clock,
  FileSpreadsheet, ShieldCheck, ArrowRight, Plus, Activity,
  HardDrive, Calendar, Eye, RefreshCw, Zap, BarChart3, FileText
} from 'lucide-react';

export default function DashboardScreen() {
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
          <SidebarItem icon={<Database className="w-4 h-4" />} label="Tableau de bord" active />
          <SidebarItem icon={<Upload className="w-4 h-4" />} label="Import Excel" />
          <SidebarItem icon={<History className="w-4 h-4" />} label="Historique" badge="12" />

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
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between gap-3 shrink-0 flex-wrap">
          <div className="min-w-0">
            <p className="text-xs text-slate-500 mb-0.5">Bienvenue</p>
            <h1 className="text-lg font-semibold text-slate-900 tracking-tight">
              Tableau de bord
            </h1>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button className="text-sm text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors flex items-center gap-1.5 whitespace-nowrap">
              <RefreshCw className="w-3.5 h-3.5" />
              Actualiser
            </button>
            <button className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 font-medium whitespace-nowrap">
              <Upload className="w-3.5 h-3.5" />
              Nouvel import
            </button>
          </div>
        </header>

        {/* Contenu scrollable */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-6xl p-6 lg:p-8 space-y-6">

            {/* ====== CTA HERO : Action principale ====== */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 lg:p-7 text-white relative overflow-hidden">
              {/* Décoration */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32"></div>
              <div className="absolute bottom-0 right-12 w-32 h-32 bg-white/5 rounded-full translate-y-8"></div>

              <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-medium mb-3">
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

                <div className="flex items-center gap-2 shrink-0">
                  <button className="bg-white text-blue-700 hover:bg-blue-50 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap">
                    <Upload className="w-4 h-4" />
                    Démarrer un import
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* ====== KPIs ====== */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-slate-900">Vue d'ensemble</h2>
                <span className="text-xs text-slate-500">30 derniers jours</span>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <KpiCard
                  icon={<FileSpreadsheet className="w-4 h-4" />}
                  label="Imports réalisés"
                  value="12"
                  change="+3"
                  trend="up"
                  color="blue"
                />
                <KpiCard
                  icon={<Stethoscope className="w-4 h-4" />}
                  label="Prescripteurs"
                  value="247"
                  change="+18"
                  trend="up"
                  color="purple"
                />
                <KpiCard
                  icon={<Users className="w-4 h-4" />}
                  label="Bénéficiaires"
                  value="1 432"
                  change="+86"
                  trend="up"
                  color="green"
                />
                <KpiCard
                  icon={<MapPin className="w-4 h-4" />}
                  label="Courses"
                  value="8 921"
                  change="-124"
                  trend="down"
                  color="amber"
                />
              </div>
            </div>

            {/* ====== Grille principale : activité + côté droit ====== */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

              {/* Activité récente */}
              <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl">
                <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">Activité récente</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Vos 5 derniers imports</p>
                  </div>
                  <button className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                    Tout voir
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>

                <div className="divide-y divide-slate-100">
                  <ActivityRow
                    icon={<CheckCircle2 className="w-4 h-4" />}
                    iconBg="bg-green-50"
                    iconColor="text-green-600"
                    title="Import réussi"
                    description="TeleTaxi_Import_Janvier2026.xlsx · 188 lignes"
                    time="Il y a 2h"
                  />
                  <ActivityRow
                    icon={<Eye className="w-4 h-4" />}
                    iconBg="bg-slate-100"
                    iconColor="text-slate-600"
                    title="Simulation effectuée"
                    description="TeleTaxi_Import_Janvier2026.xlsx · 188 lignes"
                    time="Il y a 2h"
                  />
                  <ActivityRow
                    icon={<AlertTriangle className="w-4 h-4" />}
                    iconBg="bg-amber-50"
                    iconColor="text-amber-600"
                    title="Import partiel"
                    description="Patients_Janvier_Semaine2.xlsx · 12 erreurs"
                    time="Hier"
                  />
                  <ActivityRow
                    icon={<CheckCircle2 className="w-4 h-4" />}
                    iconBg="bg-green-50"
                    iconColor="text-green-600"
                    title="Import réussi"
                    description="Mise_a_jour_prescripteurs.xlsx · 15 lignes"
                    time="Il y a 3 jours"
                  />
                  <ActivityRow
                    icon={<AlertCircle className="w-4 h-4" />}
                    iconBg="bg-red-50"
                    iconColor="text-red-600"
                    title="Import échoué"
                    description="Import_test_invalide.xlsx · Structure invalide"
                    time="Il y a 5 jours"
                  />
                </div>
              </div>

              {/* Colonne droite : 2 cartes empilées */}
              <div className="space-y-5">
                {/* État système */}
                <div className="bg-white border border-slate-200 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-slate-900">État du système</h3>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  </div>

                  <div className="space-y-3">
                    <SystemRow
                      icon={<Database className="w-3.5 h-3.5" />}
                      label="Base de données"
                      status="Connectée"
                      statusColor="green"
                    />
                    <SystemRow
                      icon={<ShieldCheck className="w-3.5 h-3.5" />}
                      label="Backups"
                      status="12 disponibles"
                      statusColor="slate"
                    />
                    <SystemRow
                      icon={<HardDrive className="w-3.5 h-3.5" />}
                      label="Espace utilisé"
                      status="486 Mo"
                      statusColor="slate"
                    />
                    <SystemRow
                      icon={<Activity className="w-3.5 h-3.5" />}
                      label="Dernière synchro"
                      status="Il y a 2h"
                      statusColor="slate"
                    />
                  </div>
                </div>

                {/* Accès rapides */}
                <div className="bg-white border border-slate-200 rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-slate-900 mb-3">Accès rapides</h3>
                  <div className="space-y-1.5">
                    <QuickAction
                      icon={<Upload className="w-4 h-4" />}
                      label="Nouvel import Excel"
                      shortcut="⌘N"
                    />
                    <QuickAction
                      icon={<History className="w-4 h-4" />}
                      label="Voir l'historique"
                      shortcut="⌘H"
                    />
                    <QuickAction
                      icon={<FileText className="w-4 h-4" />}
                      label="Exporter le journal"
                    />
                    <QuickAction
                      icon={<Settings className="w-4 h-4" />}
                      label="Paramètres"
                      shortcut="⌘,"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* ====== Section V2 teaser ====== */}
            <div className="bg-gradient-to-br from-slate-50 to-blue-50/30 border border-slate-200 rounded-xl p-5 lg:p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-start gap-4 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="text-sm font-semibold text-slate-900">Bons scannés par IA</h3>
                      <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-medium">
                        BIENTÔT
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Photographiez un bon de transport, l'IA extrait les données automatiquement.
                      Plus besoin de saisir manuellement.
                    </p>
                  </div>
                </div>
                <button
                  disabled
                  className="text-xs text-slate-500 bg-white border border-slate-200 px-3 py-1.5 rounded-md font-medium cursor-not-allowed whitespace-nowrap shrink-0"
                >
                  Notifier au lancement
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

// ============== Sous-composants ==============

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

function KpiCard({ icon, label, value, change, trend, color = 'blue' }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
    green: 'bg-green-50 text-green-600',
    amber: 'bg-amber-50 text-amber-600',
  };
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4">
      <div className="flex items-start justify-between mb-2.5">
        <div className={`w-8 h-8 rounded-lg ${colors[color]} flex items-center justify-center`}>
          {icon}
        </div>
        <div className={`flex items-center gap-1 text-xs font-medium ${
          trend === 'up' ? 'text-green-600' : 'text-red-600'
        }`}>
          {trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {change}
        </div>
      </div>
      <p className="text-2xl font-semibold text-slate-900 mb-0.5 tracking-tight">{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  );
}

function ActivityRow({ icon, iconBg, iconColor, title, description, time }) {
  return (
    <button className="w-full px-5 py-3 hover:bg-slate-50/50 transition-colors flex items-center gap-3 text-left">
      <div className={`w-8 h-8 rounded-lg ${iconBg} flex items-center justify-center shrink-0`}>
        <span className={iconColor}>{icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-900 truncate">{title}</p>
        <p className="text-xs text-slate-500 truncate">{description}</p>
      </div>
      <span className="text-xs text-slate-400 shrink-0 hidden sm:inline">{time}</span>
      <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
    </button>
  );
}

function SystemRow({ icon, label, status, statusColor }) {
  const colors = {
    green: 'text-green-700 bg-green-50 border-green-200',
    slate: 'text-slate-700 bg-slate-50 border-slate-200',
  };
  return (
    <div className="flex items-center justify-between text-xs">
      <div className="flex items-center gap-2 text-slate-600 min-w-0">
        <span className="text-slate-400 shrink-0">{icon}</span>
        <span className="truncate">{label}</span>
      </div>
      <span className={`px-2 py-0.5 rounded-md border font-medium whitespace-nowrap ${colors[statusColor]}`}>
        {status}
      </span>
    </div>
  );
}

function QuickAction({ icon, label, shortcut }) {
  return (
    <button className="w-full flex items-center gap-2.5 px-2 py-2 rounded-md text-sm text-slate-700 hover:bg-slate-100 transition-colors text-left">
      <span className="text-slate-500">{icon}</span>
      <span className="flex-1 truncate">{label}</span>
      {shortcut && (
        <kbd className="text-[10px] text-slate-500 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded font-mono">
          {shortcut}
        </kbd>
      )}
    </button>
  );
}
