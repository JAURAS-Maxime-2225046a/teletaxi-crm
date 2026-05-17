// ─── Auth ──────────────────────────────────────────────────────────────────

export interface User {
  id: number;
  email: string;
  display_name: string | null;
  created_at: string;
  last_login_at: string | null;
}

export interface AuthResult {
  user_id: number;
  email: string;
  display_name: string | null;
  session_token: string;
  created_at: string;
}

export interface Session {
  user: User;
  token: string;
}

// ─── Config ────────────────────────────────────────────────────────────────

export interface AppConfig {
  accdb_path: string | null;
  backup_enabled: boolean;
}

export interface DatabaseInfo {
  path: string;
  size_bytes: number;
  modified_at: string;
  tables_count: number;
  tables: string[];
  counts: {
    PRESCRIPTEUR?: number;
    PATIENT?: number;
    TRANSPORT?: number;
  };
}

// ─── Import ────────────────────────────────────────────────────────────────

export type ImportStatus = "running" | "success" | "partial" | "error";
export type ImportPhase =
  | "starting"
  | "opening_excel"
  | "loading_cache"
  | "prescripteurs"
  | "beneficiaires"
  | "courses"
  | "writing_report"
  | "done";

export interface ImportProgress {
  request_id: string;
  phase: ImportPhase;
  current: number;
  total: number;
  message: string;
}

export interface EntityStats {
  inseres: number;
  ignores: number;
  erreurs: number;
}

export interface ImportReport {
  prescripteurs: EntityStats;
  beneficiaires: EntityStats;
  courses: EntityStats;
  total_inseres: number;
  total_erreurs: number;
}

export interface ImportEntry {
  id: string;
  user_id: number;
  excel_filename: string;
  excel_path: string;
  accdb_path: string;
  started_at: string;
  ended_at: string | null;
  status: ImportStatus;
  duration_ms: number | null;
  report: ImportReport;
  log_file_path: string | null;
  backup_path: string | null;
  error_message: string | null;
}

// ─── Excel Preview ─────────────────────────────────────────────────────────

export type RowStatus = "valid" | "warning" | "error";

export interface ExcelRowPreview {
  row_number: number;
  status: RowStatus;
  data: Record<string, unknown>;
}

export interface ExcelPreview {
  sheet_name: string;
  total_rows: number;
  preview_rows: ExcelRowPreview[];
}
