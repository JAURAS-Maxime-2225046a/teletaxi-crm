mod commands;
mod db;
mod sidecar;
mod state;

use state::AppState;
use tauri::Manager;

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .setup(|app| {
            // Dossier de données de l'app (~/Library/Application Support/fr.maxime.teletaxi-crm/)
            let data_dir = app.path().app_data_dir()?;
            std::fs::create_dir_all(&data_dir)?;
            let db_path = data_dir.join("data.db");

            // Initialisation synchrone de la base SQLite
            // (setup s'exécute sur le thread principal avant le démarrage de l'event loop)
            let db = tauri::async_runtime::block_on(
                db::connection::setup_db(&db_path),
            )
            .map_err(|e| Box::<dyn std::error::Error>::from(e))?;

            app.manage(AppState::new(db));
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            // Auth
            commands::auth::signup,
            commands::auth::login,
            commands::auth::logout,
            commands::auth::check_session,
            // Config
            commands::config::get_config,
            commands::config::set_accdb_path,
            commands::config::open_excel_dialog,
            commands::config::open_accdb_dialog,
            // History
            commands::history::list_imports,
            commands::history::get_import,
            // Sidecar
            commands::sidecar::ping_sidecar,
            commands::sidecar::test_connection,
            commands::sidecar::start_import,
            commands::sidecar::preview_excel,
            commands::sidecar::get_sidecar_log,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application")
}
