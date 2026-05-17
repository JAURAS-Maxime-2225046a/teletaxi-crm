import { invoke } from "@tauri-apps/api/core";
import { listen, type UnlistenFn } from "@tauri-apps/api/event";
import type { AppConfig, AuthResult, ImportEntry, ImportProgress, ImportReport } from "./types";

export const tauri = {
  auth: {
    signup: (params: { email: string; password: string; display_name?: string }) =>
      invoke<AuthResult>("signup", {
        email: params.email,
        password: params.password,
        displayName: params.display_name ?? null,
      }),
    login: (email: string, password: string) =>
      invoke<AuthResult>("login", { email, password }),
    logout: (token: string) => invoke<void>("logout", { token }),
    checkSession: (token: string) => invoke<AuthResult>("check_session", { token }),
  },

  config: {
    get: () => invoke<AppConfig>("get_config"),
    setAccdbPath: (path: string) => invoke<void>("set_accdb_path", { path }),
    openExcelDialog: () => invoke<string | null>("open_excel_dialog"),
    openAccdbDialog: () => invoke<string | null>("open_accdb_dialog"),
  },

  sidecar: {
    ping: () => invoke<{ status: string; version: string; python: string }>("ping_sidecar"),
    testConnection: (accdbPath: string) =>
      invoke<{ connected: boolean; tables_count: number; counts: Record<string, number> }>(
        "test_connection",
        { accdbPath }
      ),
    getLog: () =>
      invoke<{ path: string | null; content: string; exists: boolean }>("get_sidecar_log"),
  },

  history: {
    list: (limit = 50) => invoke<ImportEntry[]>("list_imports", { limit }),
    get: (id: string) => invoke<ImportEntry>("get_import", { id }),
  },

  import: {
    start: (params: { excel_path: string; backup_enabled?: boolean; session_token: string }) =>
      invoke<{ import_id: string }>("start_import", {
        sessionToken: params.session_token,
        excelPath: params.excel_path,
        backupEnabled: params.backup_enabled ?? true,
      }),
    preview: (excelPath: string, sheetName?: string) =>
      invoke<{
        sheet_name: string;
        total_rows: number;
        preview_rows: Array<{ row_number: number; status: string; data: Record<string, unknown> }>;
      }>("preview_excel", { excelPath, sheetName }),
    onProgress: (cb: (p: ImportProgress) => void): Promise<UnlistenFn> =>
      listen<ImportProgress>("import:progress", (e) => cb(e.payload)),
    onComplete: (cb: (r: ImportReport) => void): Promise<UnlistenFn> =>
      listen<ImportReport>("import:complete", (e) => cb(e.payload)),
    onError: (cb: (err: { message: string }) => void): Promise<UnlistenFn> =>
      listen<{ message: string }>("import:error", (e) => cb(e.payload)),
  },
};
