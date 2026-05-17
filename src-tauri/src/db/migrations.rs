/// Migrations SQLite — appliquées dans l'ordre à chaque démarrage (idempotentes).
pub const MIGRATIONS: &[&str] = &[
    r#"CREATE TABLE IF NOT EXISTS users (
        id            INTEGER PRIMARY KEY AUTOINCREMENT,
        email         TEXT    NOT NULL UNIQUE,
        password_hash TEXT    NOT NULL,
        display_name  TEXT,
        created_at    TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
        last_login_at TEXT
    )"#,
    r#"CREATE TABLE IF NOT EXISTS app_config (
        key        TEXT PRIMARY KEY,
        value      TEXT NOT NULL,
        updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
    )"#,
    r#"CREATE TABLE IF NOT EXISTS sessions (
        token      TEXT PRIMARY KEY,
        user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
        expires_at TEXT    NOT NULL
    )"#,
    r#"CREATE TABLE IF NOT EXISTS imports (
        id                        TEXT    PRIMARY KEY,
        user_id                   INTEGER NOT NULL REFERENCES users(id),
        excel_filename            TEXT    NOT NULL,
        excel_path                TEXT    NOT NULL,
        accdb_path                TEXT    NOT NULL,
        started_at                TEXT    NOT NULL,
        ended_at                  TEXT,
        status                    TEXT    NOT NULL CHECK(status IN ('running','success','partial','error')),
        prescripteurs_inseres     INTEGER NOT NULL DEFAULT 0,
        prescripteurs_ignores     INTEGER NOT NULL DEFAULT 0,
        prescripteurs_erreurs     INTEGER NOT NULL DEFAULT 0,
        beneficiaires_inseres     INTEGER NOT NULL DEFAULT 0,
        beneficiaires_ignores     INTEGER NOT NULL DEFAULT 0,
        beneficiaires_erreurs     INTEGER NOT NULL DEFAULT 0,
        courses_inseres           INTEGER NOT NULL DEFAULT 0,
        courses_ignores           INTEGER NOT NULL DEFAULT 0,
        courses_erreurs           INTEGER NOT NULL DEFAULT 0,
        log_file_path             TEXT,
        backup_path               TEXT,
        error_message             TEXT
    )"#,
    r#"CREATE INDEX IF NOT EXISTS idx_imports_user_started
       ON imports(user_id, started_at DESC)"#,
];
