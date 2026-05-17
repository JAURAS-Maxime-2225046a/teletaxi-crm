use sqlx::SqlitePool;
use std::sync::Mutex;

/// État global de l'application partagé entre tous les handlers Tauri.
pub struct AppState {
    pub db: SqlitePool,
    /// ID de l'utilisateur actuellement connecté (défini après login/signup).
    pub current_user_id: Mutex<Option<i64>>,
}

impl AppState {
    pub fn new(db: SqlitePool) -> Self {
        Self {
            db,
            current_user_id: Mutex::new(None),
        }
    }
}
