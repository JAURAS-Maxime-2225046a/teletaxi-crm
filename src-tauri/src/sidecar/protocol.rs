use serde::{Deserialize, Serialize};
use serde_json::Value;

/// Requête envoyée au sidecar Python sur stdin.
#[derive(Serialize, Debug)]
pub struct SidecarRequest {
    pub id: String,
    pub method: String,
    pub params: Value,
}

/// Message reçu du sidecar Python sur stdout (et retransmis au frontend via emit).
#[derive(Deserialize, Serialize, Debug)]
pub struct SidecarMessage {
    pub id: Option<String>,
    #[serde(rename = "type")]
    pub msg_type: String,

    // Présent quand type = "result"
    pub data: Option<Value>,

    // Présents quand type = "error"
    pub code: Option<String>,
    pub message: Option<String>,
    pub details: Option<String>,

    // Présents quand type = "progress"
    pub phase: Option<String>,
    pub current: Option<u64>,
    pub total: Option<u64>,

    // Présent quand type = "log"
    pub level: Option<String>,
}

