use sqlx::{sqlite::SqliteConnectOptions, SqlitePool};
use std::path::Path;

use crate::db::migrations::MIGRATIONS;

/// Ouvre (ou crée) la base SQLite et applique les migrations.
pub async fn setup_db(db_path: &Path) -> Result<SqlitePool, String> {
    let opts = SqliteConnectOptions::new()
        .filename(db_path)
        .create_if_missing(true)
        // WAL améliore les perfs en écriture concurrente
        .journal_mode(sqlx::sqlite::SqliteJournalMode::Wal);

    let pool = SqlitePool::connect_with(opts)
        .await
        .map_err(|e| format!("Impossible d'ouvrir la base : {e}"))?;

    for stmt in MIGRATIONS {
        sqlx::query(stmt)
            .execute(&pool)
            .await
            .map_err(|e| format!("Migration échouée : {e}\nSQL : {stmt}"))?;
    }

    Ok(pool)
}
