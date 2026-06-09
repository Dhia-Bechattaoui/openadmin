mod db;
use db::{Item, Settings};
use std::sync::Mutex;
use tauri::State;

struct AppState {
    db_conn: Mutex<rusqlite::Connection>,
}

#[tauri::command]
fn insert_item(state: State<AppState>, item: Item) -> Result<i32, String> {
    let conn = state.db_conn.lock().unwrap();
    db::insert_item(&conn, item).map_err(|e| e.to_string())
}

#[tauri::command]
fn get_items(state: State<AppState>) -> Result<Vec<Item>, String> {
    let conn = state.db_conn.lock().unwrap();
    db::get_items(&conn).map_err(|e| e.to_string())
}

#[tauri::command]
fn update_item(state: State<AppState>, item: Item) -> Result<(), String> {
    let conn = state.db_conn.lock().unwrap();
    db::update_item(&conn, item).map_err(|e| e.to_string())
}

#[tauri::command]
fn delete_item(state: State<AppState>, id: i32) -> Result<(), String> {
    let conn = state.db_conn.lock().unwrap();
    db::delete_item(&conn, id).map_err(|e| e.to_string())
}

#[tauri::command]
fn get_settings(state: State<AppState>) -> Result<Settings, String> {
    let conn = state.db_conn.lock().unwrap();
    db::get_settings(&conn).map_err(|e| e.to_string())
}

#[tauri::command]
fn update_settings(state: State<AppState>, settings: Settings) -> Result<(), String> {
    let conn = state.db_conn.lock().unwrap();
    db::update_settings(&conn, settings).map_err(|e| e.to_string())
}

#[tauri::command]
fn wipe_database(state: State<AppState>) -> Result<(), String> {
    let conn = state.db_conn.lock().unwrap();
    db::wipe_database(&conn).map_err(|e| e.to_string())
}

#[tauri::command]
fn export_data(state: State<AppState>) -> Result<String, String> {
    let conn = state.db_conn.lock().unwrap();
    let items = db::get_items(&conn).map_err(|e| e.to_string())?;
    serde_json::to_string(&items).map_err(|e| e.to_string())
}

#[tauri::command]
fn save_export_file(path: String, data: String) -> Result<(), String> {
    std::fs::write(path, data).map_err(|e| e.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_notification::init())
        .setup(|app| {
            use std::thread;
            use std::time::Duration;
            use tauri::Manager;
            use tauri_plugin_notification::NotificationExt;

            // Get the secure application data directory
            if let Ok(app_data_dir) = app.path().app_data_dir() {
                // Initialize the embedded SQLite database
                let conn = db::init_db(&app_data_dir).expect("Failed to initialize database");

                // Clone path for the background worker
                let worker_db_path = app_data_dir.clone();
                let app_handle = app.handle().clone();

                // Spawn background worker thread for expiration checks
                thread::spawn(move || {
                    // Give the app a moment to start up
                    thread::sleep(Duration::from_secs(5));

                    if let Ok(worker_conn) = db::init_db(&worker_db_path) {
                        let settings = db::get_settings(&worker_conn).unwrap_or(db::Settings {
                            notifications_enabled: true,
                        });
                        if settings.notifications_enabled {
                            if let Ok(items) = db::get_items(&worker_conn) {
                                // Basic check logic: for demo, just notify if ANY items exist
                                // In reality, this would parse `expiration_date` and check if it's within 30 days
                                let expiring_items =
                                    items.iter().filter(|i| i.expiration_date.is_some()).count();

                                if expiring_items > 0 {
                                    let _ = app_handle
                                        .notification()
                                        .builder()
                                        .title("OpenAdmin Alert")
                                        .body(format!(
                                            "You have {} items that may need attention soon.",
                                            expiring_items
                                        ))
                                        .show();
                                }
                            }
                        }
                    }
                });

                app.manage(AppState {
                    db_conn: Mutex::new(conn),
                });
            }
            Ok(())
        })
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            insert_item,
            get_items,
            update_item,
            delete_item,
            get_settings,
            update_settings,
            wipe_database,
            export_data,
            save_export_file
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
