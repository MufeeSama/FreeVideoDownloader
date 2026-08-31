pub mod commands;
pub mod downloader;
pub mod models;
pub mod parser;
pub mod proxy;
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
        .setup(|_app| {
            tauri::async_runtime::spawn(async {
                proxy::start_proxy_server().await;
            });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::parse_video,
            commands::get_video_proxy_url,
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
