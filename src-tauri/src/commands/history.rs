use serde_json::Value;
use sqlx::Row;
use tauri::State;

use crate::state::AppState;

fn row_to_json(row: &sqlx::sqlite::SqliteRow) -> Value {
    let pi: i64 = row.get("prescripteurs_inseres");
    let pn: i64 = row.get("prescripteurs_ignores");
    let pe: i64 = row.get("prescripteurs_erreurs");
    let bi: i64 = row.get("beneficiaires_inseres");
    let bn: i64 = row.get("beneficiaires_ignores");
    let be_: i64 = row.get("beneficiaires_erreurs");
    let ci: i64 = row.get("courses_inseres");
    let cn: i64 = row.get("courses_ignores");
    let ce: i64 = row.get("courses_erreurs");

    serde_json::json!({
        "id":            row.get::<String, _>("id"),
        "user_id":       row.get::<i64, _>("user_id"),
        "excel_filename": row.get::<String, _>("excel_filename"),
        "excel_path":    row.get::<String, _>("excel_path"),
        "accdb_path":    row.get::<String, _>("accdb_path"),
        "started_at":    row.get::<String, _>("started_at"),
        "ended_at":      row.get::<Option<String>, _>("ended_at"),
        "status":        row.get::<String, _>("status"),
        "report": {
            "prescripteurs": { "inseres": pi, "ignores": pn, "erreurs": pe },
            "beneficiaires": { "inseres": bi, "ignores": bn, "erreurs": be_ },
            "courses":       { "inseres": ci, "ignores": cn, "erreurs": ce },
            "total_inseres": pi + bi + ci,
            "total_erreurs": pe + be_ + ce,
        },
        "log_file_path": row.get::<Option<String>, _>("log_file_path"),
        "backup_path":   row.get::<Option<String>, _>("backup_path"),
        "error_message": row.get::<Option<String>, _>("error_message"),
    })
}

const IMPORT_SQL: &str = "
    SELECT id, user_id, excel_filename, excel_path, accdb_path,
           started_at, ended_at, status,
           prescripteurs_inseres, prescripteurs_ignores, prescripteurs_erreurs,
           beneficiaires_inseres, beneficiaires_ignores, beneficiaires_erreurs,
           courses_inseres, courses_ignores, courses_erreurs,
           log_file_path, backup_path, error_message
    FROM imports";

#[tauri::command]
pub async fn list_imports(
    state: State<'_, AppState>,
    limit: Option<i64>,
) -> Result<Value, String> {
    let rows = sqlx::query(&format!("{IMPORT_SQL} ORDER BY started_at DESC LIMIT ?"))
        .bind(limit.unwrap_or(50))
        .fetch_all(&state.db)
        .await
        .map_err(|e| e.to_string())?;

    Ok(Value::Array(rows.iter().map(row_to_json).collect()))
}

#[tauri::command]
pub async fn get_import(
    state: State<'_, AppState>,
    id: String,
) -> Result<Value, String> {
    let row = sqlx::query(&format!("{IMPORT_SQL} WHERE id = ?"))
        .bind(&id)
        .fetch_optional(&state.db)
        .await
        .map_err(|e| e.to_string())?
        .ok_or_else(|| format!("Import introuvable : {id}"))?;

    Ok(row_to_json(&row))
}
