use chrono::Utc;
use serde_json::Value;
use tauri::{AppHandle, State};

use crate::db::queries;
use crate::sidecar::process::{sidecar_call, sidecar_stream};
use crate::state::AppState;

#[tauri::command]
pub async fn ping_sidecar(app: AppHandle) -> Result<Value, String> {
    sidecar_call(&app, "ping", serde_json::json!({})).await
}

#[tauri::command]
pub async fn test_connection(
    app: AppHandle,
    accdb_path: String,
) -> Result<Value, String> {
    sidecar_call(
        &app,
        "test_connection",
        serde_json::json!({ "accdb_path": accdb_path }),
    )
    .await
}

/// Lance un import Excel → Access.
///
/// - Valide la session et obtient user_id
/// - Crée un enregistrement "running" en DB
/// - Spawn une tâche de fond qui stream les events et met à jour la DB à la fin
/// - Retourne immédiatement import_id au frontend
#[tauri::command]
pub async fn start_import(
    app: AppHandle,
    state: State<'_, AppState>,
    session_token: String,
    excel_path: String,
    backup_enabled: Option<bool>,
) -> Result<Value, String> {
    // 1. Valider la session et obtenir l'user_id
    let user = queries::session_get_user(&state.db, &session_token)
        .await?
        .ok_or("Session expirée. Reconnectez-vous.")?;
    let user_id = user.0;

    // 2. Récupérer le chemin de la base configurée
    let accdb_path = queries::config_get(&state.db, "accdb_path")
        .await?
        .ok_or("Base de données non configurée. Allez dans Paramètres → Base de données.")?;

    // 3. Créer l'enregistrement import en DB (status = running)
    let import_id = uuid::Uuid::new_v4().to_string();
    let excel_filename = std::path::Path::new(&excel_path)
        .file_name()
        .map(|n| n.to_string_lossy().into_owned())
        .unwrap_or_else(|| excel_path.clone());
    let started_at = Utc::now().format("%Y-%m-%dT%H:%M:%SZ").to_string();

    queries::import_create(
        &state.db,
        &queries::ImportCreateParams {
            id: &import_id,
            user_id,
            excel_filename: &excel_filename,
            excel_path: &excel_path,
            accdb_path: &accdb_path,
            started_at: &started_at,
        },
    )
    .await?;

    // 4. Lancer l'import en tâche de fond (streaming events + mise à jour DB)
    let db = state.db.clone();
    let id_clone = import_id.clone();
    let params = serde_json::json!({
        "excel_path": excel_path,
        "accdb_path": accdb_path,
        "backup_enabled": backup_enabled.unwrap_or(true),
    });

    tokio::spawn(async move {
        let ended_at = || Utc::now().format("%Y-%m-%dT%H:%M:%SZ").to_string();

        match sidecar_stream(app, "import.run", params).await {
            Ok(result) => {
                let report = &result["report"];
                let _ = queries::import_update_success(&db, &id_clone, report, &ended_at()).await;
            }
            Err(e) => {
                let _ = queries::import_update_error(&db, &id_clone, &e, &ended_at()).await;
            }
        }
    });

    Ok(serde_json::json!({ "import_id": import_id }))
}

#[tauri::command]
pub async fn preview_excel(
    app: AppHandle,
    excel_path: String,
    sheet_name: Option<String>,
) -> Result<Value, String> {
    sidecar_call(
        &app,
        "excel.preview",
        serde_json::json!({
            "excel_path": excel_path,
            "sheet_name": sheet_name.unwrap_or_else(|| "Prescripteurs".to_string()),
            "limit": 50,
        }),
    )
    .await
}
