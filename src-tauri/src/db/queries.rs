use serde_json::Value;
use sqlx::SqlitePool;

// ─── Config ──────────────────────────────────────────────────────────────────

pub async fn config_get(pool: &SqlitePool, key: &str) -> Result<Option<String>, String> {
    sqlx::query_scalar::<_, String>("SELECT value FROM app_config WHERE key = ?")
        .bind(key)
        .fetch_optional(pool)
        .await
        .map_err(|e| e.to_string())
}

pub async fn config_set(pool: &SqlitePool, key: &str, value: &str) -> Result<(), String> {
    sqlx::query(
        "INSERT INTO app_config (key, value) VALUES (?, ?)
         ON CONFLICT(key) DO UPDATE SET value = excluded.value,
         updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')",
    )
    .bind(key)
    .bind(value)
    .execute(pool)
    .await
    .map(|_| ())
    .map_err(|e| e.to_string())
}

// ─── Sessions ─────────────────────────────────────────────────────────────────

pub async fn session_create(
    pool: &SqlitePool,
    token: &str,
    user_id: i64,
    expires_at: &str,
) -> Result<(), String> {
    sqlx::query(
        "INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)",
    )
    .bind(token)
    .bind(user_id)
    .bind(expires_at)
    .execute(pool)
    .await
    .map(|_| ())
    .map_err(|e| e.to_string())
}

pub async fn session_delete(pool: &SqlitePool, token: &str) -> Result<(), String> {
    sqlx::query("DELETE FROM sessions WHERE token = ?")
        .bind(token)
        .execute(pool)
        .await
        .map(|_| ())
        .map_err(|e| e.to_string())
}

/// Retourne (user_id, email) si la session est valide et non expirée.
pub async fn session_get_user(
    pool: &SqlitePool,
    token: &str,
) -> Result<Option<(i64, String, Option<String>)>, String> {
    sqlx::query_as::<_, (i64, String, Option<String>)>(
        "SELECT u.id, u.email, u.display_name
         FROM sessions s
         JOIN users u ON u.id = s.user_id
         WHERE s.token = ?
           AND s.expires_at > strftime('%Y-%m-%dT%H:%M:%SZ', 'now')",
    )
    .bind(token)
    .fetch_optional(pool)
    .await
    .map_err(|e| e.to_string())
}

// ─── Imports ──────────────────────────────────────────────────────────────────

pub struct ImportCreateParams<'a> {
    pub id: &'a str,
    pub user_id: i64,
    pub excel_filename: &'a str,
    pub excel_path: &'a str,
    pub accdb_path: &'a str,
    pub started_at: &'a str,
}

pub async fn import_create(pool: &SqlitePool, p: &ImportCreateParams<'_>) -> Result<(), String> {
    sqlx::query(
        "INSERT INTO imports
         (id, user_id, excel_filename, excel_path, accdb_path, started_at, status)
         VALUES (?, ?, ?, ?, ?, ?, 'running')",
    )
    .bind(p.id).bind(p.user_id).bind(p.excel_filename)
    .bind(p.excel_path).bind(p.accdb_path).bind(p.started_at)
    .execute(pool)
    .await
    .map(|_| ())
    .map_err(|e| e.to_string())
}

pub async fn import_update_success(
    pool: &SqlitePool,
    id: &str,
    report: &Value,
    ended_at: &str,
) -> Result<(), String> {
    let g = |s: &str, f: &str| report[s][f].as_i64().unwrap_or(0);
    let (pi, pn, pe) = (g("prescripteurs","inseres"), g("prescripteurs","ignores"), g("prescripteurs","erreurs"));
    let (bi, bn, be) = (g("beneficiaires","inseres"), g("beneficiaires","ignores"), g("beneficiaires","erreurs"));
    let (ci, cn, ce) = (g("courses","inseres"),       g("courses","ignores"),       g("courses","erreurs"));
    let status = if pe + be + ce > 0 { "partial" } else { "success" };

    sqlx::query(
        "UPDATE imports SET ended_at=?, status=?,
         prescripteurs_inseres=?, prescripteurs_ignores=?, prescripteurs_erreurs=?,
         beneficiaires_inseres=?, beneficiaires_ignores=?, beneficiaires_erreurs=?,
         courses_inseres=?,       courses_ignores=?,       courses_erreurs=?
         WHERE id=?",
    )
    .bind(ended_at).bind(status)
    .bind(pi).bind(pn).bind(pe)
    .bind(bi).bind(bn).bind(be)
    .bind(ci).bind(cn).bind(ce)
    .bind(id)
    .execute(pool).await.map(|_| ()).map_err(|e| e.to_string())
}

pub async fn import_update_error(
    pool: &SqlitePool,
    id: &str,
    error_message: &str,
    ended_at: &str,
) -> Result<(), String> {
    sqlx::query(
        "UPDATE imports SET ended_at=?, status='error', error_message=? WHERE id=?",
    )
    .bind(ended_at).bind(error_message).bind(id)
    .execute(pool).await.map(|_| ()).map_err(|e| e.to_string())
}
