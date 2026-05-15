import React, { useState } from 'react';
import {
  Database, FolderOpen, CheckCircle2, AlertCircle, Loader2,
  HardDrive, Calendar, FileText, RefreshCw, Lock, Car,
  ChevronRight, X, Info, ShieldCheck
} from 'lucide-react';

export default function DatabaseConfigScreen() {
  const [state, setState] = useState('empty'); // 'empty' | 'verifying' | 'connected' | 'error'
  const [dbPath, setDbPath] = useState('');

  // Simule la sélection d'un fichier
  const handleSelectFile = () => {
    setState('verifying');
    setDbPath('C:\\TAXI2016\\data.accdb');
    setTimeout(() => setState('connected'), 2200);
  };

  const handleChangeDb = () => {
    setState('empty');
    setDbPath('');
  };

  const handleSimulateError = () => {
    setState('error');
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 flex flex-col">
      {/* Header / Topbar */}
      <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <Car className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          <span className="font-semibold text-slate-900 tracking-tight">
            TELETAXI <span className="text-blue-600">CRM</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-right">
            <p className="text-xs text-slate-500">Connecté</p>
            <p className="text-sm font-medium text-slate-700">Utilisateur</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-medium text-slate-600">
            U
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl">

          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-6 text-xs text-slate-500">
            <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-medium">Étape 1/2</span>
            <span>Configuration initiale</span>
          </div>

          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight mb-2">
            Connexion à votre base TeleTaxi
          </h1>
          <p className="text-sm text-slate-500 mb-8">
            Sélectionnez le fichier <code className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-xs">data.accdb</code> utilisé par votre logiciel TeleTaxi.
            Ce fichier reste sur votre poste, il n'est jamais envoyé sur Internet.
          </p>

          {/* ====== ÉTAT VIDE ====== */}
          {state === 'empty' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-8">
                <div className="flex flex-col items-center text-center py-8 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
                    <Database className="w-7 h-7 text-blue-600" strokeWidth={1.8} />
                  </div>
                  <h3 className="text-base font-medium text-slate-900 mb-1">
                    Aucune base sélectionnée
                  </h3>
                  <p className="text-sm text-slate-500 mb-5 max-w-xs">
                    Cliquez ci-dessous pour parcourir votre disque et trouver votre fichier <code className="text-xs">data.accdb</code>.
                  </p>
                  <button
                    onClick={handleSelectFile}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2.5 rounded-lg flex items-center gap-2 transition-colors"
                  >
                    <FolderOpen className="w-4 h-4" />
                    Sélectionner ma base TeleTaxi
                  </button>
                  <p className="text-xs text-slate-400 mt-3">
                    Format accepté : <code>.accdb</code> (Microsoft Access)
                  </p>
                </div>
              </div>

              {/* Aide trouver le fichier */}
              <div className="border-t border-slate-200 bg-slate-50/50 px-6 py-4">
                <details className="text-sm">
                  <summary className="cursor-pointer text-slate-600 hover:text-slate-900 flex items-center gap-2 font-medium">
                    <Info className="w-4 h-4" />
                    Comment retrouver mon fichier data.accdb ?
                  </summary>
                  <div className="mt-3 pl-6 space-y-2 text-slate-600 text-xs leading-relaxed">
                    <p>L'emplacement du fichier dépend de la configuration de votre installation TeleTaxi. Pour le retrouver :</p>
                    <ul className="space-y-1 ml-4">
                      <li>• Ouvrez TeleTaxi et consultez les <span className="font-medium">paramètres ou préférences</span> de l'application</li>
                      <li>• Le chemin de la base est généralement affiché dans les options de connexion</li>
                      <li>• Sinon, recherchez <code className="bg-slate-100 px-1.5 py-0.5 rounded">data.accdb</code> dans l'explorateur de fichiers de votre système</li>
                    </ul>
                  </div>
                </details>
              </div>
            </div>
          )}

          {/* ====== ÉTAT VÉRIFICATION ====== */}
          {state === 'verifying' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
              <div className="flex items-center gap-3 mb-6">
                <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                <p className="text-sm font-medium text-slate-900">Vérification de la base...</p>
              </div>

              <div className="bg-slate-50 rounded-lg p-3 mb-6 flex items-center gap-3">
                <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                <code className="text-xs text-slate-700 truncate">{dbPath}</code>
              </div>

              <div className="space-y-3">
                <CheckRow label="Fichier accessible" state="done" />
                <CheckRow label="Format .accdb valide" state="done" />
                <CheckRow label="Détection des tables TeleTaxi" state="loading" />
                <CheckRow label="Vérification de l'écriture" state="pending" />
              </div>
            </div>
          )}

          {/* ====== ÉTAT CONNECTÉ ====== */}
          {state === 'connected' && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Header succès */}
                <div className="bg-green-50/50 border-b border-green-100 px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-green-900">Base connectée</p>
                      <p className="text-xs text-green-700">Toutes les vérifications sont passées</p>
                    </div>
                  </div>
                  <button
                    onClick={handleChangeDb}
                    className="text-xs text-green-700 hover:text-green-900 font-medium flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Changer
                  </button>
                </div>

                {/* Détails fichier */}
                <div className="p-6 space-y-4">
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-1.5">
                      Fichier
                    </p>
                    <div className="flex items-center gap-2 bg-slate-50 rounded-lg p-2.5">
                      <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                      <code className="text-xs text-slate-700 truncate flex-1">{dbPath}</code>
                      <button className="text-xs text-slate-500 hover:text-slate-900 px-1.5 py-0.5 rounded hover:bg-slate-200 transition-colors">
                        Copier
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <InfoCard
                      icon={<HardDrive className="w-3.5 h-3.5" />}
                      label="Taille"
                      value="47,2 Mo"
                    />
                    <InfoCard
                      icon={<Calendar className="w-3.5 h-3.5" />}
                      label="Modifiée"
                      value="Il y a 2h"
                    />
                    <InfoCard
                      icon={<Database className="w-3.5 h-3.5" />}
                      label="Tables"
                      value="14"
                    />
                  </div>

                  {/* Tables détectées */}
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-2">
                      Tables TeleTaxi détectées
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {['Prescripteurs', 'Bénéficiaires', 'Courses', 'Tarifs', 'Véhicules', '+9 autres'].map((t, i) => (
                        <span
                          key={i}
                          className={`text-xs px-2.5 py-1 rounded-md ${
                            i < 3
                              ? 'bg-blue-50 text-blue-700 border border-blue-100 font-medium'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer actions */}
                <div className="border-t border-slate-200 bg-slate-50/50 px-6 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
                    Backup automatique avant chaque import
                  </div>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                    Continuer vers l'import
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Lien pour simuler erreur (démo) */}
              <button
                onClick={handleSimulateError}
                className="text-xs text-slate-400 hover:text-slate-600 underline mx-auto block"
              >
                [démo] Simuler une erreur de connexion
              </button>
            </div>
          )}

          {/* ====== ÉTAT ERREUR ====== */}
          {state === 'error' && (
            <div className="bg-white rounded-2xl border border-red-200 shadow-sm overflow-hidden">
              <div className="bg-red-50/50 border-b border-red-100 px-6 py-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center">
                  <Lock className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-red-900">Base verrouillée</p>
                  <p className="text-xs text-red-700">TeleTaxi semble être ouvert</p>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <p className="text-sm text-slate-700 leading-relaxed">
                  Le fichier <code className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-xs">data.accdb</code> est actuellement verrouillé,
                  probablement parce que le logiciel TeleTaxi est ouvert et l'utilise.
                </p>

                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-xs font-medium text-slate-700 mb-2">Pour continuer :</p>
                  <ol className="text-xs text-slate-600 space-y-1.5 list-decimal list-inside">
                    <li>Fermez complètement le logiciel TeleTaxi</li>
                    <li>Attendez quelques secondes</li>
                    <li>Cliquez sur "Réessayer" ci-dessous</li>
                  </ol>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setState('connected')}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Réessayer
                  </button>
                  <button
                    onClick={handleChangeDb}
                    className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-medium px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                  >
                    Choisir un autre fichier
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}

function CheckRow({ label, state }) {
  return (
    <div className="flex items-center gap-3 text-sm">
      {state === 'done' && <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />}
      {state === 'loading' && <Loader2 className="w-4 h-4 text-blue-600 animate-spin shrink-0" />}
      {state === 'pending' && <div className="w-4 h-4 rounded-full border-2 border-slate-200 shrink-0" />}
      <span className={
        state === 'done' ? 'text-slate-700' :
        state === 'loading' ? 'text-slate-900 font-medium' :
        'text-slate-400'
      }>
        {label}
      </span>
    </div>
  );
}

function InfoCard({ icon, label, value }) {
  return (
    <div className="bg-slate-50 rounded-lg p-3">
      <div className="flex items-center gap-1.5 text-slate-500 mb-1">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <p className="text-sm font-medium text-slate-900">{value}</p>
    </div>
  );
}
