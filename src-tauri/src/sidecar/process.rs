use std::io::Write as _;

use serde_json::Value;
use tauri::{AppHandle, Emitter, Manager};
use tauri_plugin_shell::{process::CommandEvent, ShellExt};

use crate::sidecar::protocol::{SidecarMessage, SidecarRequest};

// ─── Log sidecar stderr ───────────────────────────────────────────────────────

fn log_sidecar_stderr(app: &AppHandle, line: &str) {
    eprintln!("[sidecar stderr] {line}");
    if let Ok(log_dir) = app.path().app_log_dir() {
        let _ = std::fs::create_dir_all(&log_dir);
        let log_path = log_dir.join("sidecar.log");
        if let Ok(mut f) = std::fs::OpenOptions::new()
            .create(true)
            .append(true)
            .open(&log_path)
        {
            let _ = writeln!(f, "{line}");
        }
    }
}

// ─── JAVA_HOME detection ──────────────────────────────────────────────────────

/// Détecte le chemin JAVA_HOME.
///
/// Ordre de priorité :
/// 1. Variable d'environnement JAVA_HOME déjà définie
/// 2. Mac : `/usr/libexec/java_home` (retourne l'active JVM)
/// 3. Dossier JRE embarqué dans les ressources Tauri (Phase 7)
pub fn detect_java_home(app: &AppHandle) -> Option<String> {
    // 1. Var d'env existante
    if let Ok(home) = std::env::var("JAVA_HOME") {
        if !home.is_empty() {
            return Some(home);
        }
    }

    // 2. Mac system JVM detection
    #[cfg(target_os = "macos")]
    {
        if let Ok(output) = std::process::Command::new("/usr/libexec/java_home")
            .output()
        {
            if output.status.success() {
                let path = String::from_utf8_lossy(&output.stdout).trim().to_string();
                if !path.is_empty() && !path.starts_with("Unable") {
                    return Some(path);
                }
            }
        }
    }

    // 3. JRE embarqué dans les ressources Tauri (disponible en Phase 7)
    if let Ok(resource_dir) = app.path().resource_dir() {
        #[cfg(target_os = "macos")]
        let arch = if cfg!(target_arch = "aarch64") { "mac-aarch64" } else { "mac-x86_64" };
        #[cfg(target_os = "windows")]
        let arch = "win-x86_64";
        #[cfg(not(any(target_os = "macos", target_os = "windows")))]
        let arch = "linux-x86_64";

        let bundled = resource_dir.join("resources").join("jre").join(arch);
        if bundled.exists() {
            return Some(bundled.to_string_lossy().into_owned());
        }
    }

    None
}

// ─── Sidecar spawn helper ─────────────────────────────────────────────────────

fn build_command(app: &AppHandle) -> Result<tauri_plugin_shell::process::Command, String> {
    let mut cmd = app
        .shell()
        .sidecar("teletaxi-import")
        .map_err(|e| format!("Sidecar non trouvé : {e}"))?;

    if let Some(java_home) = detect_java_home(app) {
        cmd = cmd.env("JAVA_HOME", &java_home);
        // PATH enrichi pour que `java` soit accessible dans les PATH subs-processus
        if let Ok(path) = std::env::var("PATH") {
            let java_bin = format!("{}/bin", java_home);
            if !path.contains(&java_bin) {
                cmd = cmd.env("PATH", format!("{java_bin}:{path}"));
            }
        }
    }

    Ok(cmd)
}

// ─── API publique ─────────────────────────────────────────────────────────────

/// Appel synchrone : envoie une requête, attend `result` ou `error`.
pub async fn sidecar_call(
    app: &AppHandle,
    method: &str,
    params: Value,
) -> Result<Value, String> {
    let request_id = uuid::Uuid::new_v4().to_string();
    let request = SidecarRequest {
        id: request_id.clone(),
        method: method.to_string(),
        params,
    };
    let line = format!(
        "{}\n",
        serde_json::to_string(&request).map_err(|e| e.to_string())?
    );

    let (mut rx, mut child) = build_command(app)?
        .spawn()
        .map_err(|e| format!("Échec spawn sidecar : {e}"))?;

    child
        .write(line.as_bytes())
        .map_err(|e| format!("Écriture stdin sidecar : {e}"))?;

    loop {
        match rx.recv().await {
            Some(CommandEvent::Stdout(bytes)) => {
                let text = String::from_utf8_lossy(&bytes);
                match serde_json::from_str::<SidecarMessage>(&text) {
                    Ok(msg) => match msg.msg_type.as_str() {
                        "result" => {
                            let _ = child.kill();
                            return Ok(msg.data.unwrap_or(Value::Null));
                        }
                        "error" => {
                            let message = msg
                                .message
                                .unwrap_or_else(|| "Erreur sidecar inconnue".to_string());
                            let err = match msg.code.as_deref() {
                                Some(code) if !code.is_empty() => {
                                    format!("{code}: {message}")
                                }
                                _ => message,
                            };
                            let _ = child.kill();
                            return Err(err);
                        }
                        _ => {}
                    },
                    Err(_) => {}
                }
            }
            Some(CommandEvent::Stderr(bytes)) => {
                log_sidecar_stderr(app, &String::from_utf8_lossy(&bytes));
            }
            Some(CommandEvent::Error(e)) => {
                let _ = child.kill();
                return Err(format!("Erreur process sidecar : {e}"));
            }
            Some(CommandEvent::Terminated(payload)) => {
                let code_info = payload
                    .code
                    .map(|c| format!(" (code {c})"))
                    .unwrap_or_default();
                return Err(format!("Sidecar terminé sans réponse{code_info}"));
            }
            None => {
                return Err("Canal sidecar fermé sans réponse".to_string());
            }
            Some(_) => {}
        }
    }
}

/// Appel streaming : émet des events Tauri pour chaque progress/log.
/// Retourne le payload `data` du message `result` final.
pub async fn sidecar_stream(
    app: AppHandle,
    method: &str,
    params: Value,
) -> Result<Value, String> {
    let request_id = uuid::Uuid::new_v4().to_string();
    let request = SidecarRequest {
        id: request_id.clone(),
        method: method.to_string(),
        params,
    };
    let line = format!(
        "{}\n",
        serde_json::to_string(&request).map_err(|e| e.to_string())?
    );

    let (mut rx, mut child) = build_command(&app)?
        .spawn()
        .map_err(|e| format!("Échec spawn sidecar : {e}"))?;

    child
        .write(line.as_bytes())
        .map_err(|e| format!("Écriture stdin sidecar : {e}"))?;

    loop {
        match rx.recv().await {
            Some(CommandEvent::Stdout(bytes)) => {
                let text = String::from_utf8_lossy(&bytes);
                match serde_json::from_str::<SidecarMessage>(&text) {
                    Ok(msg) => match msg.msg_type.as_str() {
                        "progress" => {
                            let _ = app.emit("import:progress", &msg);
                        }
                        "log" => {
                            let _ = app.emit("import:log", &msg);
                        }
                        "result" => {
                            let data = msg.data.clone().unwrap_or(Value::Null);
                            // Émet directement le sous-objet "report" (pas le wrapper data)
                            // pour que le frontend reçoive {prescripteurs, beneficiaires, courses, ...}
                            let report = data.get("report").cloned().unwrap_or(data.clone());
                            let _ = app.emit("import:complete", &report);
                            let _ = child.kill();
                            return Ok(data);
                        }
                        "error" => {
                            let _ = app.emit("import:error", &msg);
                            let message = msg
                                .message
                                .unwrap_or_else(|| "Erreur import".to_string());
                            let err = match msg.code.as_deref() {
                                Some(code) if !code.is_empty() => {
                                    format!("{code}: {message}")
                                }
                                _ => message,
                            };
                            let _ = child.kill();
                            return Err(err);
                        }
                        _ => {}
                    },
                    Err(_) => {}
                }
            }
            Some(CommandEvent::Stderr(bytes)) => {
                log_sidecar_stderr(&app, &String::from_utf8_lossy(&bytes));
            }
            Some(CommandEvent::Error(e)) => {
                let _ = app.emit("import:error", serde_json::json!({"message": e}));
                let _ = child.kill();
                return Err(e);
            }
            Some(CommandEvent::Terminated(payload)) => {
                let msg = payload
                    .code
                    .map(|c| format!("Sidecar terminé prématurément (code {c})"))
                    .unwrap_or_else(|| "Sidecar terminé prématurément".to_string());
                let _ = app.emit("import:error", serde_json::json!({"message": msg}));
                return Err(msg);
            }
            None => {
                let msg = "Canal sidecar fermé sans résultat".to_string();
                let _ = app.emit("import:error", serde_json::json!({"message": msg}));
                return Err(msg);
            }
            Some(_) => {}
        }
    }
}
