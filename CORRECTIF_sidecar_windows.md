# Correctif — « Sidecar terminé sans réponse » sous Windows

## Contexte
Lors de l'étape « Connexion à votre base TeleTaxi » (Étape 1/2), la sélection du
fichier `data.accdb` échoue **uniquement sous Windows** avec le message :

> Connexion échouée — Sidecar terminé sans réponse
> Impossible de se connecter au fichier.

Sur macOS, la même étape fonctionne.

Ce message est l'erreur **générique** affichée quand le process sidecar Python a
démarré mais s'est terminé (exit / crash) **sans rien écrire d'exploitable sur
stdout**. Le problème est donc presque certainement dans le build Windows du
sidecar (PyInstaller) ou dans l'accès au driver Access — pas dans la logique
métier, qui tourne sur Mac.

⚠️ **Important : ne pas patcher à l'aveugle.** La cause exacte n'est pas encore
confirmée. Commencer impérativement par l'étape 0 (diagnostic) pour obtenir le
vrai traceback, PUIS appliquer le correctif correspondant.

---

## Étape 0 — Diagnostic (à faire en premier, obligatoire)

### 0.1 — Faire parler le sidecar
Sur le poste Windows, lancer l'exécutable du sidecar **directement en ligne de
commande**, hors Tauri, avec les mêmes arguments que ceux passés par l'app :

```powershell
# Adapter le chemin de l'exe et l'argument du .accdb
& "<chemin>\teletaxi-sidecar.exe" --db "C:\chemin\vers\data.accdb"
echo "Exit code: $LASTEXITCODE"
```

Objectif : récupérer le **traceback Python réel** sur stderr, ou le code de
sortie. Trois cas typiques :

- **Erreur `pyodbc` / driver introuvable** → cause = driver Access manquant ou
  mauvaise bitness → voir Correctif A.
- **`ImportError` / `ModuleNotFoundError` / DLL manquante** → cause = packaging
  PyInstaller incomplet → voir Correctif B.
- **Le process ne dit rien et exit ≠ 0, ou crash immédiat sans Python** →
  dépendance native manquante (souvent VC++ Redistributable) → voir Correctif C.

### 0.2 — Vérifier l'environnement Windows du poste
```powershell
# Bitness de l'OS
[Environment]::Is64BitOperatingSystem

# Drivers ODBC Access installés (et leur bitness)
Get-OdbcDriver | Where-Object { $_.Name -like "*Access*" -or $_.Name -like "*ACE*" }
```

Noter :
- la bitness de l'exe sidecar produit par `build_sidecar.ps1` (x64 ou x86) ;
- la bitness d'Office installé sur le poste (32 ou 64 bits) ;
- si l'« Microsoft Access Database Engine » est présent, et en quelle bitness.

➡️ **Reporter le résultat de l'étape 0 avant d'appliquer un correctif.**
Le correctif à retenir dépend directement de ce diagnostic.

---

## Correctif A — Driver Access manquant ou bitness incohérente
**Cause la plus probable.** Le sidecar lit un `.accdb` via `pyodbc` + le driver
*Microsoft Access Database Engine* (ACE OLEDB / ODBC). Si :
- le driver n'est pas installé sur le poste, **ou**
- le sidecar est compilé en **64 bits** alors que seul l'Access Engine **32
  bits** est présent (cas fréquent quand Office est en 32 bits),

…alors `pyodbc.connect()` lève une exception au tout début et le process meurt.

### A.1 — Aligner la bitness
Décider d'une bitness unique pour toute la chaîne sidecar :
- Si la cible est le grand public (Office souvent 32 bits) → envisager un
  sidecar **32 bits**, OU
- exiger l'Access Database Engine **64 bits** et garder le sidecar 64 bits.

La bitness du sidecar et celle de l'Access Engine **doivent être identiques**.
Documenter ce choix dans le README.

### A.2 — Embarquer ou vérifier le driver
Le *Microsoft Access Database Engine 2016 Redistributable* n'est pas
redistribuable silencieusement sans précautions. Deux options :

1. **Prérequis documenté** : l'installeur MSI vérifie la présence du driver et
   affiche un message clair s'il manque (avec lien de téléchargement officiel
   Microsoft). Le plus simple et le plus robuste.
2. **Bundling** : inclure l'installeur de l'Access Engine en dépendance du MSI.
   Plus lourd, à valider niveau licence.

➡️ Pour cette itération, partir sur l'**option 1** (vérification + message).

### A.3 — Détection et message d'erreur explicite côté sidecar
Dans le code du sidecar, entourer la connexion et renvoyer un message
**structuré et lisible** sur stdout plutôt que de crasher :

```python
import sys, json

def fail(code, message):
    print(json.dumps({"ok": False, "error_code": code, "message": message}))
    sys.exit(0)  # sortie propre : l'app lit le JSON au lieu de "terminé sans réponse"

try:
    import pyodbc
except ImportError:
    fail("PYODBC_MISSING", "Module pyodbc non disponible dans le sidecar.")

drivers = [d for d in pyodbc.drivers() if "ACE" in d or "Access" in d]
if not drivers:
    fail(
        "ACCESS_DRIVER_MISSING",
        "Le pilote Microsoft Access Database Engine n'est pas installé sur ce "
        "poste. Installez-le (même bitness que l'application) puis réessayez."
    )

try:
    conn = pyodbc.connect(
        r"DRIVER={Microsoft Access Driver (*.mdb, *.accdb)};"
        rf"DBQ={db_path};"
    )
except pyodbc.Error as e:
    sqlstate = e.args[0] if e.args else ""
    fail("ACCESS_CONNECT_FAILED", f"Connexion ODBC échouée ({sqlstate}): {e}")
```

➡️ Côté Tauri/front, gérer ces `error_code` pour afficher un message utile au
lieu du générique « Sidecar terminé sans réponse ».

---

## Correctif B — Packaging PyInstaller incomplet
Si l'étape 0 montre un `ImportError` / `ModuleNotFoundError` / DLL manquante :

Dans le `.spec` PyInstaller (ou `build_sidecar.ps1`), ajouter les imports cachés
et binaires nécessaires. Pour `pyodbc` notamment :

```python
hiddenimports = ['pyodbc']
```

Vérifier aussi que les éventuels modules `pywin32` (`win32api`, `pythoncom`,
etc.) sont bien collectés si le code les utilise. Au besoin :

```python
from PyInstaller.utils.hooks import collect_submodules
hiddenimports += collect_submodules('pyodbc')
```

Reconstruire avec `build_sidecar.ps1` et **retester l'exe seul (étape 0.1)**
avant de repasser par Tauri.

---

## Correctif C — Dépendance native manquante (VC++ Redistributable)
Si l'exe crashe **immédiatement sans aucun message Python** (pas même un
traceback), c'est typiquement une DLL système absente.

- `pyodbc` et l'Access Engine dépendent du **Microsoft Visual C++
  Redistributable**. Vérifier sa présence sur le poste de test.
- Tester l'exe sur une **machine Windows vierge** (VM propre) pour reproduire le
  cas d'un poste client sans dépendances.
- Documenter le VC++ Redistributable comme prérequis de l'installeur, ou
  l'inclure dans le MSI.

---

## Robustesse générale — à appliquer dans tous les cas

Le message « Sidecar terminé sans réponse » est trop opaque. Indépendamment de
la cause, améliorer la chaîne d'erreur :

1. **Le sidecar ne doit jamais sortir muet.** Toujours écrire un JSON
   `{"ok": false, "error_code": ..., "message": ...}` sur stdout, même en cas
   d'exception inattendue (try/except global qui formate puis `sys.exit(0)`).

2. **Logger stderr du sidecar côté Tauri.** Capturer et écrire le stderr du
   process sidecar dans un fichier de log applicatif (ex.
   `%APPDATA%\teletaxi\logs\sidecar.log`). Indispensable pour diagnostiquer
   chez un client sans accès ligne de commande.

3. **Distinguer les codes d'erreur** dans l'UI : driver manquant, fichier
   verrouillé, fichier introuvable, crash inattendu → messages distincts et
   actions adaptées.

4. **Cas fichier verrouillé** : si un `data.laccdb` est présent à côté du
   `.accdb`, TeleTaxi est probablement ouvert. Détecter ce cas et afficher le
   message « Fermez TeleTaxi » de façon ciblée (l'UI le suggère déjà, mais le
   sidecar peut le confirmer).

---

## Critères de validation
- [ ] L'étape 0 a produit un diagnostic clair (traceback ou code de sortie).
- [ ] Le sidecar lancé seul en ligne de commande renvoie un JSON exploitable.
- [ ] Sur un poste Windows sans driver Access, l'app affiche un message
      explicite (pas « terminé sans réponse »).
- [ ] La connexion réussit sur un poste Windows correctement configuré.
- [ ] Le stderr du sidecar est loggé dans un fichier applicatif.
- [ ] La bitness sidecar / Access Engine est documentée dans le README.
- [ ] Aucune régression sur le build macOS.
