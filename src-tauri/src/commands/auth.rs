use chrono::{Duration, Utc};
use serde::Serialize;
use tauri::State;

use crate::db::queries;
use crate::state::AppState;

#[derive(Serialize)]
pub struct AuthResult {
    pub user_id: i64,
    pub email: String,
    pub display_name: Option<String>,
    pub session_token: String,
    pub created_at: String,
}

#[tauri::command]
pub async fn signup(
    state: State<'_, AppState>,
    email: String,
    password: String,
    display_name: Option<String>,
) -> Result<AuthResult, String> {
    // 1. Email déjà utilisé ?
    let exists: Option<i64> =
        sqlx::query_scalar("SELECT id FROM users WHERE email = ?")
            .bind(&email)
            .fetch_optional(&state.db)
            .await
            .map_err(|e| e.to_string())?;

    if exists.is_some() {
        return Err("Cet email est déjà utilisé".to_string());
    }

    // 2. Hash du mot de passe (CPU-intensif → spawn_blocking)
    let pw = password.clone();
    let hash = tokio::task::spawn_blocking(move || bcrypt::hash(&pw, bcrypt::DEFAULT_COST))
        .await
        .map_err(|e| e.to_string())?
        .map_err(|e| e.to_string())?;

    // 3. Insertion utilisateur
    let now = Utc::now().format("%Y-%m-%dT%H:%M:%SZ").to_string();

    let user_id: i64 = sqlx::query_scalar(
        "INSERT INTO users (email, password_hash, display_name, created_at)
         VALUES (?, ?, ?, ?) RETURNING id",
    )
    .bind(&email)
    .bind(&hash)
    .bind(&display_name)
    .bind(&now)
    .fetch_one(&state.db)
    .await
    .map_err(|e| e.to_string())?;

    // 4. Création de session (30 jours)
    let token = uuid::Uuid::new_v4().to_string();
    let expires_at = (Utc::now() + Duration::days(30))
        .format("%Y-%m-%dT%H:%M:%SZ")
        .to_string();

    queries::session_create(&state.db, &token, user_id, &expires_at).await?;

    if let Ok(mut uid) = state.current_user_id.lock() {
        *uid = Some(user_id);
    }

    Ok(AuthResult {
        user_id,
        email,
        display_name,
        session_token: token,
        created_at: now,
    })
}

#[tauri::command]
pub async fn login(
    state: State<'_, AppState>,
    email: String,
    password: String,
) -> Result<AuthResult, String> {
    // 1. Récupérer l'utilisateur
    let row: Option<(i64, String, String, Option<String>, String)> = sqlx::query_as(
        "SELECT id, email, password_hash, display_name, created_at
         FROM users WHERE email = ?",
    )
    .bind(&email)
    .fetch_optional(&state.db)
    .await
    .map_err(|e| e.to_string())?;

    let (user_id, stored_email, hash, display_name, created_at) =
        row.ok_or("Email ou mot de passe invalide")?;

    // 2. Vérifier le mot de passe
    let pw = password.clone();
    let valid =
        tokio::task::spawn_blocking(move || bcrypt::verify(&pw, &hash))
            .await
            .map_err(|e| e.to_string())?
            .map_err(|e| e.to_string())?;

    if !valid {
        return Err("Email ou mot de passe invalide".to_string());
    }

    // 3. Mettre à jour last_login_at
    let now = Utc::now().format("%Y-%m-%dT%H:%M:%SZ").to_string();
    sqlx::query("UPDATE users SET last_login_at = ? WHERE id = ?")
        .bind(&now)
        .bind(user_id)
        .execute(&state.db)
        .await
        .ok();

    // 4. Nouvelle session
    let token = uuid::Uuid::new_v4().to_string();
    let expires_at = (Utc::now() + Duration::days(30))
        .format("%Y-%m-%dT%H:%M:%SZ")
        .to_string();

    queries::session_create(&state.db, &token, user_id, &expires_at).await?;

    if let Ok(mut uid) = state.current_user_id.lock() {
        *uid = Some(user_id);
    }

    Ok(AuthResult {
        user_id,
        email: stored_email,
        display_name,
        session_token: token,
        created_at,
    })
}

#[tauri::command]
pub async fn logout(
    state: State<'_, AppState>,
    token: String,
) -> Result<(), String> {
    queries::session_delete(&state.db, &token).await
}

/// Valide un token de session et retourne les infos utilisateur si valide.
/// Appelé au démarrage de l'app pour vérifier la session stockée en localStorage.
#[tauri::command]
pub async fn check_session(
    state: State<'_, AppState>,
    token: String,
) -> Result<AuthResult, String> {
    let row = queries::session_get_user(&state.db, &token).await?;
    let (user_id, email, display_name) =
        row.ok_or("Session expirée ou invalide")?;

    let created_at: String = sqlx::query_scalar(
        "SELECT created_at FROM users WHERE id = ?",
    )
    .bind(user_id)
    .fetch_one(&state.db)
    .await
    .map_err(|e| e.to_string())?;

    Ok(AuthResult {
        user_id,
        email,
        display_name,
        session_token: token,
        created_at,
    })
}
