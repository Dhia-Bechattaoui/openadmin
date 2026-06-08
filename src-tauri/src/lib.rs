mod db;
use std::sync::Mutex;
use tauri::State;
use db::Item;

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

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            use tauri::Manager;
            // Get the secure application data directory
            if let Ok(app_data_dir) = app.path().app_data_dir() {
                // Initialize the embedded SQLite database
                let conn = db::init_db(&app_data_dir).expect("Failed to initialize database");
                app.manage(AppState {
                    db_conn: Mutex::new(conn),
                });
            }
            Ok(())
        })
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![insert_item, get_items])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
