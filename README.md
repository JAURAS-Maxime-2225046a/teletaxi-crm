# teletaxi-crm

## Sécurité des dépendances

### CVE-2025-59472 (Next.js) — faux positif

Le scanner Red Hat Dependency Analytics peut signaler CVE-2025-59472
sur le paquet `next`. Ce signalement est un **faux positif** :

- Version installée : `next@16.2.6`, soit AU-DESSUS de la version
  corrigée (la plage affectée est `< 16.1.5`).
- L'application n'est de toute façon pas exploitable : la CVE ne
  concerne que les apps avec `experimental.ppr` / `cacheComponents`
  activé en minimal mode et exposées sur le réseau. TELETAXI CRM est
  une app desktop Tauri en export statique, sans serveur exposé et
  sans PPR.

Aucune action n'est requise. Statut : vérifié et clos le 2026-05-17.
