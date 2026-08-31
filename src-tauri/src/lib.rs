pub mod commands;
pub mod downloader;
pub mod models;
pub mod parser;
pub mod storage;

use commands::AppState;
use downloader::DownloadManager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let app_state = AppState {
        download_manager: DownloadManager::new(),
    };

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_notification::init())
        .manage(app_state)
        .invoke_handler(tauri::generate_handler![
            commands::parse_video,
            commands::start_download,
            commands::cancel_download,
            commands::get_download_history,
            commands::clear_download_history,
            commands::get_app_settings,
            commands::save_app_settings,
            commands::open_in_explorer,
            commands::open_folder,
            commands::get_suggested_save_path
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
