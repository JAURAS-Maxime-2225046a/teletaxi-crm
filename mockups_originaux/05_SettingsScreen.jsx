import React, { useState } from 'react';
import {
  Car, Database, Upload, History, Settings, Camera, Sparkles,
  User, Palette, Shield, AlertTriangle, ChevronRight, MoreHorizontal,
  Mail, Lock, Sun, Moon, Monitor, HardDrive, FileText, Trash2,
  Download, RefreshCw, CheckCircle2, Info, Key, LogOut, Bell,
  Globe, Eye, EyeOff, X, ShieldCheck, Calendar, ChevronDown,
  Folder, FolderOpen
} from 'lucide-react';

export default function SettingsScreen() {
  const [activeSection, setActiveSection] = useState('account'); // account | database | appearance | advanced | danger
  const [theme, setTheme] = useState('system');
  const [language, setLanguage] = useState('fr');
  const [autoBackup, setAutoBackup] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [auditLog, setAuditLog] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* ========== SIDEBAR PRINCIPALE ========== */}
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
          <SidebarItem icon={<History className="w-4 h-4" />} label="Historique" badge="12" />

          <SidebarSection label="À venir" />
          <SidebarItem icon={<Camera className="w-4 h-4" />} label="Bons scannés" soon />
          <SidebarItem icon={<Sparkles className="w-4 h-4" />} label="Assistant IA" soon />

          <SidebarSection label="Paramètres" />
          <SidebarItem icon={<Settings className="w-4 h-4" />} label="Configuration" active />
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
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-6 py-3.5 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-0.5">
            <span>Paramètres</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-900 font-medium">Configuration</span>
          </div>
          <h1 className="text-lg font-semibold text-slate-900 tracking-tight">
            Configuration
          </h1>
        </header>

        {/* Workspace : sous-nav latérale + contenu */}
        <div className="flex-1 flex flex-col lg:flex-row min-w-0 overflow-hidden">
          {/* Sous-nav latérale - visible uniquement sur grand écran */}
          <nav className="w-44 bg-white border-r border-slate-200 p-3 shrink-0 overflow-y-auto hidden lg:flex lg:flex-col">
            <SubNav
              items={[
                { id: 'account', icon: <User className="w-4 h-4" />, label: 'Compte' },
                { id: 'database', icon: <Database className="w-4 h-4" />, label: 'Base de données' },
                { id: 'appearance', icon: <Palette className="w-4 h-4" />, label: 'Apparence' },
                { id: 'advanced', icon: <Shield className="w-4 h-4" />, label: 'Avancé' },
                { id: 'danger', icon: <AlertTriangle className="w-4 h-4" />, label: 'Zone sensible', danger: true },
              ]}
              active={activeSection}
              onChange={setActiveSection}
            />

            <div className="mt-auto pt-4 border-t border-slate-200">
              <button className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors">
                <LogOut className="w-3.5 h-3.5" />
                Se déconnecter
              </button>
              <p className="text-[10px] text-slate-400 leading-relaxed mt-3 px-2">
                Version 1.0.0<br />
                <span className="text-slate-300">Build 2026.01.15</span>
              </p>
            </div>
          </nav>

          {/* Onglets horizontaux pour écran étroit (< lg) */}
          <div className="lg:hidden bg-white border-b border-slate-200 px-4 py-2 shrink-0 overflow-x-auto">
            <div className="flex items-center gap-1 min-w-max">
              {[
                { id: 'account', icon: <User className="w-3.5 h-3.5" />, label: 'Compte' },
                { id: 'database', icon: <Database className="w-3.5 h-3.5" />, label: 'Base de données' },
                { id: 'appearance', icon: <Palette className="w-3.5 h-3.5" />, label: 'Apparence' },
                { id: 'advanced', icon: <Shield className="w-3.5 h-3.5" />, label: 'Avancé' },
                { id: 'danger', icon: <AlertTriangle className="w-3.5 h-3.5" />, label: 'Zone sensible', danger: true },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                    activeSection === item.id
                      ? item.danger
                        ? 'bg-red-50 text-red-700'
                        : 'bg-blue-50 text-blue-700'
                      : item.danger
                      ? 'text-red-600 hover:bg-red-50/50'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Contenu */}
          <main className="flex-1 overflow-y-auto min-w-0">
            <div className="max-w-4xl px-4 sm:px-6 lg:px-10 py-6 lg:py-8 space-y-5">

              {/* ====== COMPTE ====== */}
              {activeSection === 'account' && (
                <>
                  <SectionTitle
                    title="Compte"
                    description="Gérez les informations de votre compte local."
                  />

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    <Section title="Identifiants" description="Email utilisé pour vous connecter à l'application.">
                      <FormRow label="Adresse email">
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            type="email"
                            defaultValue=""
                            placeholder="email@adresse.fr"
                            className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                          />
                        </div>
                      </FormRow>

                      <FormRow label="Mot de passe" hint="Dernière modification : il y a 2 mois">
                        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1.5">
                          <Key className="w-3.5 h-3.5" />
                          Changer le mot de passe
                        </button>
                      </FormRow>
                    </Section>

                    <Section title="Préférences" description="Personnalisez votre expérience.">
                      <FormRow label="Langue de l'interface">
                        <select
                          value={language}
                          onChange={(e) => setLanguage(e.target.value)}
                          className="w-full text-sm px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        >
                          <option value="fr">Français</option>
                          <option value="en">English</option>
                        </select>
                      </FormRow>

                      <ToggleRow
                        label="Notifications dans l'application"
                        description="Recevoir des notifications lors d'imports terminés."
                        checked={notifications}
                        onChange={setNotifications}
                      />
                    </Section>
                  </div>
                </>
              )}

              {/* ====== BASE DE DONNÉES ====== */}
              {activeSection === 'database' && (
                <>
                  <SectionTitle
                    title="Base de données"
                    description="Configurez la connexion à votre fichier data.accdb."
                  />

                  <Section title="Fichier actuel" description="Base de données TeleTaxi actuellement utilisée par l'application.">
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
                          <Database className="w-4 h-4 text-green-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-slate-900 truncate">data.accdb</p>
                          <p className="text-xs text-slate-500 truncate">Connectée · 47,2 Mo · 14 tables</p>
                        </div>
                        <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                      </div>
                      <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-md p-2">
                        <FolderOpen className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <code className="text-xs text-slate-700 truncate flex-1">C:\TAXI2016\data.accdb</code>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-3">
                      <button className="text-sm text-slate-700 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 font-medium">
                        <RefreshCw className="w-3.5 h-3.5" />
                        Tester la connexion
                      </button>
                      <button className="text-sm text-slate-700 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 font-medium">
                        <Folder className="w-3.5 h-3.5" />
                        Changer de fichier
                      </button>
                    </div>
                  </Section>

                  <Section title="Sauvegardes" description="Backup automatique de la base avant chaque import.">
                    <ToggleRow
                      label="Activer le backup automatique"
                      description="Une copie de data.accdb sera créée avant chaque import dans le dossier de sauvegardes."
                      checked={autoBackup}
                      onChange={setAutoBackup}
                    />

                    <FormRow label="Dossier de sauvegardes">
                      <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg p-2">
                        <FolderOpen className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <code className="text-xs text-slate-700 truncate flex-1">~/TeleTaxi/backups</code>
                        <button className="text-xs text-blue-600 hover:text-blue-700 font-medium whitespace-nowrap px-2">
                          Modifier
                        </button>
                      </div>
                    </FormRow>

                    <FormRow label="Conservation des backups" hint="Les backups plus anciens seront supprimés automatiquement.">
                      <select className="w-full text-sm px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                        <option>30 derniers jours</option>
                        <option>90 derniers jours</option>
                        <option>1 an</option>
                        <option>Tout conserver</option>
                      </select>
                    </FormRow>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex gap-2.5">
                      <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <div className="text-xs text-blue-900 leading-relaxed">
                        <p className="font-medium mb-0.5">12 sauvegardes disponibles</p>
                        <p className="text-blue-700">
                          Espace utilisé : <span className="font-medium">486 Mo</span> · 
                          <button className="underline ml-1 hover:no-underline">Voir les sauvegardes</button>
                        </p>
                      </div>
                    </div>
                  </Section>
                </>
              )}

              {/* ====== APPARENCE ====== */}
              {activeSection === 'appearance' && (
                <>
                  <SectionTitle
                    title="Apparence"
                    description="Personnalisez le thème et l'affichage de l'application."
                  />

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    <Section title="Thème" description="Choisissez le thème visuel de l'application.">
                      <div className="grid grid-cols-3 gap-2">
                        <ThemeOption
                          icon={<Sun className="w-5 h-5" />}
                          label="Clair"
                          active={theme === 'light'}
                          onClick={() => setTheme('light')}
                        />
                        <ThemeOption
                          icon={<Moon className="w-5 h-5" />}
                          label="Sombre"
                          active={theme === 'dark'}
                          onClick={() => setTheme('dark')}
                        />
                        <ThemeOption
                          icon={<Monitor className="w-5 h-5" />}
                          label="Système"
                          active={theme === 'system'}
                          onClick={() => setTheme('system')}
                        />
                      </div>
                    </Section>

                    <Section title="Densité d'affichage" description="Ajustez l'espacement entre les éléments.">
                      <div className="space-y-2">
                        <DensityOption label="Confortable" description="Plus d'espace entre les éléments" active />
                        <DensityOption label="Compact" description="Affichez plus de données à l'écran" />
                      </div>
                    </Section>
                  </div>
                </>
              )}

              {/* ====== AVANCÉ ====== */}
              {activeSection === 'advanced' && (
                <>
                  <SectionTitle
                    title="Avancé"
                    description="Options techniques et conformité."
                  />

                  <Section title="Conformité RGPD" description="Options de traçabilité et de protection des données.">
                    <ToggleRow
                      label="Journal d'audit"
                      description="Enregistre toutes les actions (connexions, imports, modifications) pour la traçabilité RGPD."
                      checked={auditLog}
                      onChange={setAuditLog}
                    />

                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                      <div className="flex items-start gap-2.5">
                        <ShieldCheck className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                        <div className="text-xs leading-relaxed flex-1 min-w-0">
                          <p className="font-medium text-slate-900 mb-0.5">Données stockées localement</p>
                          <p className="text-slate-600">
                            Toutes vos données restent sur votre poste. Aucune information n'est envoyée à un serveur tiers.
                          </p>
                        </div>
                      </div>
                    </div>

                    <FormRow label="Export du journal d'audit" hint="Exportez le journal au format CSV pour archivage ou audit.">
                      <button className="text-sm text-slate-700 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 font-medium">
                        <Download className="w-3.5 h-3.5" />
                        Exporter le journal
                      </button>
                    </FormRow>
                  </Section>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    <Section title="Performance" description="Options pour ajuster la performance de l'application.">
                      <FormRow label="Taille maximale des fichiers Excel" hint="Limite pour éviter les imports trop volumineux.">
                        <select className="w-full text-sm px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                          <option>10 Mo (recommandé)</option>
                          <option>25 Mo</option>
                          <option>50 Mo</option>
                          <option>Pas de limite</option>
                        </select>
                      </FormRow>

                      <FormRow label="Lignes par page" hint="Plus la valeur est élevée, plus l'affichage peut ralentir.">
                        <select className="w-full text-sm px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                          <option>50 lignes</option>
                          <option>100 lignes</option>
                          <option>200 lignes</option>
                          <option>500 lignes</option>
                        </select>
                      </FormRow>
                    </Section>

                    <Section title="À propos" description="Informations sur l'application.">
                      <div className="space-y-2 text-sm">
                        <InfoLine label="Version" value="1.0.0" />
                        <InfoLine label="Build" value="2026.01.15" />
                        <InfoLine label="Système" value="macOS · Apple Silicon" />
                      </div>
                      <button className="text-sm text-blue-600 hover:text-blue-700 font-medium mt-3 flex items-center gap-1.5">
                        <RefreshCw className="w-3.5 h-3.5" />
                        Vérifier les mises à jour
                      </button>
                    </Section>
                  </div>
                </>
              )}

              {/* ====== DANGER ZONE ====== */}
              {activeSection === 'danger' && (
                <>
                  <SectionTitle
                    title="Zone sensible"
                    description="Actions irréversibles. Procédez avec précaution."
                    danger
                  />

                  <DangerSection
                    title="Réinitialiser les paramètres"
                    description="Restaure tous les paramètres à leurs valeurs par défaut. Vos données et imports ne sont pas affectés."
                    buttonLabel="Réinitialiser les paramètres"
                    onClick={() => {}}
                  />

                  <DangerSection
                    title="Supprimer l'historique des imports"
                    description="Efface tous les enregistrements d'imports passés. Les fichiers de sauvegarde de data.accdb sont conservés."
                    buttonLabel="Supprimer l'historique"
                    onClick={() => {}}
                  />

                  <DangerSection
                    title="Supprimer toutes les sauvegardes"
                    description="Efface définitivement tous les backups de data.accdb. Cette action ne peut pas être annulée."
                    buttonLabel="Supprimer les sauvegardes"
                    onClick={() => {}}
                  />

                  <DangerSection
                    title="Supprimer le compte"
                    description="Efface définitivement votre compte local et toutes les données de l'application. Le fichier data.accdb de TeleTaxi n'est pas affecté."
                    buttonLabel="Supprimer mon compte"
                    onClick={() => setConfirmDelete(true)}
                    severe
                  />
                </>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* Modal de confirmation suppression */}
      {confirmDelete && (
        <ConfirmDeleteModal onClose={() => setConfirmDelete(false)} />
      )}
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

function SubNav({ items, active, onChange }) {
  return (
    <div className="space-y-0.5">
      <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider px-2 mb-1.5">
        Sections
      </p>
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => onChange(item.id)}
          className={`w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md text-sm transition-colors text-left ${
            active === item.id
              ? item.danger
                ? 'bg-red-50 text-red-700 font-medium'
                : 'bg-blue-50 text-blue-700 font-medium'
              : item.danger
              ? 'text-red-600 hover:bg-red-50/50'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          <span className={
            active === item.id
              ? item.danger ? 'text-red-700' : 'text-blue-700'
              : item.danger ? 'text-red-500' : 'text-slate-500'
          }>
            {item.icon}
          </span>
          <span className="truncate">{item.label}</span>
        </button>
      ))}
    </div>
  );
}

function SectionTitle({ title, description, danger }) {
  return (
    <div className="pb-2 border-b border-slate-200 mb-2">
      <h2 className={`text-xl font-semibold tracking-tight ${danger ? 'text-red-700' : 'text-slate-900'}`}>
        {title}
      </h2>
      <p className="text-sm text-slate-500 mt-0.5">{description}</p>
    </div>
  );
}

function Section({ title, description, children }) {
  return (
    <section className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function FormRow({ label, hint, children }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-slate-700 block">{label}</label>
      {children}
      {hint && <p className="text-[11px] text-slate-500 leading-relaxed">{hint}</p>}
    </div>
  );
}

function ToggleRow({ label, description, checked, onChange }) {
  return (
    <label className="flex items-start gap-3 cursor-pointer group">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none mt-0.5 ${
          checked ? 'bg-blue-600' : 'bg-slate-200'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            checked ? 'translate-x-4' : 'translate-x-0'
          }`}
        />
      </button>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-900">{label}</p>
        {description && <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{description}</p>}
      </div>
    </label>
  );
}

function ThemeOption({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`relative p-3 border-2 rounded-lg transition-all flex flex-col items-center gap-1.5 ${
        active
          ? 'border-blue-500 bg-blue-50/50'
          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
      }`}
    >
      <span className={active ? 'text-blue-600' : 'text-slate-500'}>{icon}</span>
      <span className={`text-xs font-medium ${active ? 'text-blue-700' : 'text-slate-700'}`}>
        {label}
      </span>
      {active && (
        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 absolute top-1.5 right-1.5" />
      )}
    </button>
  );
}

function DensityOption({ label, description, active }) {
  return (
    <button
      className={`p-3 border-2 rounded-lg transition-all text-left ${
        active
          ? 'border-blue-500 bg-blue-50/50'
          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
      }`}
    >
      <p className={`text-sm font-medium ${active ? 'text-blue-700' : 'text-slate-900'}`}>
        {label}
      </p>
      <p className="text-xs text-slate-500 mt-0.5">{description}</p>
    </button>
  );
}

function InfoLine({ label, value }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-slate-100 last:border-0">
      <span className="text-xs text-slate-500">{label}</span>
      <span className="text-xs font-mono text-slate-700">{value}</span>
    </div>
  );
}

function DangerSection({ title, description, buttonLabel, onClick, severe }) {
  return (
    <section className={`bg-white border rounded-xl p-5 ${severe ? 'border-red-300' : 'border-red-200'}`}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{description}</p>
        </div>
        <button
          onClick={onClick}
          className={`text-sm font-medium px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
            severe
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'text-red-700 hover:text-red-800 bg-red-50 hover:bg-red-100 border border-red-200'
          }`}
        >
          <Trash2 className="w-3.5 h-3.5" />
          {buttonLabel}
        </button>
      </div>
    </section>
  );
}

function ConfirmDeleteModal({ onClose }) {
  const [confirmText, setConfirmText] = useState('');
  const canDelete = confirmText === 'SUPPRIMER';

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">Supprimer le compte ?</h3>
              <p className="text-xs text-slate-500">Cette action est irréversible</p>
            </div>
          </div>

          <p className="text-sm text-slate-700 leading-relaxed mb-4">
            Toutes vos données seront définitivement supprimées : compte, historique, paramètres, sauvegardes locales.
            Le fichier <code className="bg-slate-100 px-1 py-0.5 rounded text-xs">data.accdb</code> de TeleTaxi ne sera pas affecté.
          </p>

          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-xs text-red-900 leading-relaxed">
              Pour confirmer, tapez <span className="font-mono font-semibold">SUPPRIMER</span> dans le champ ci-dessous.
            </p>
          </div>

          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="Tapez SUPPRIMER"
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 mb-4 font-mono"
          />
        </div>

        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="text-sm text-slate-700 hover:text-slate-900 px-3 py-1.5 rounded-md hover:bg-white transition-colors font-medium"
          >
            Annuler
          </button>
          <button
            disabled={!canDelete}
            className="text-sm bg-red-600 hover:bg-red-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white px-3.5 py-1.5 rounded-md transition-colors font-medium"
          >
            Supprimer définitivement
          </button>
        </div>
      </div>
    </div>
  );
}
