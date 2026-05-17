use serde_json::Value;
use tauri::{AppHandle, State};
use tauri_plugin_dialog::DialogExt;

use crate::db::queries;
use crate::state::AppState;

#[tauri::command]
pub async fn get_config(state: State<'_, AppState>) -> Result<Value, String> {
    let accdb_path = queries::config_get(&state.db, "accdb_path").await?;
    let backup_str = queries::config_get(&state.db, "backup_enabled").await?;
    let backup_enabled = backup_str
        .map(|v| v == "1" || v == "true")
        .unwrap_or(true);

    Ok(serde_json::json!({
        "accdb_path": accdb_path,
        "backup_enabled": backup_enabled,
    }))
}

#[tauri::command]
pub async fn set_accdb_path(
    state: State<'_, AppState>,
    path: String,
) -> Result<(), String> {
    queries::config_set(&state.db, "accdb_path", &path).await
}

#[tauri::command]
pub async fn open_excel_dialog(app: AppHandle) -> Result<Option<String>, String> {
    tokio::task::spawn_blocking(move || {
        app.dialog()
            .file()
            .add_filter("Excel", &["xlsx", "xlsm", "xls"])
            .blocking_pick_file()
            .map(|p| p.to_string())
    })
    .await
    .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn open_accdb_dialog(app: AppHandle) -> Result<Option<String>, String> {
    tokio::task::spawn_blocking(move || {
        app.dialog()
            .file()
            .add_filter("Access Database", &["accdb"])
            .blocking_pick_file()
            .map(|p| p.to_string())
    })
    .await
    .map_err(|e| e.to_string())
}
