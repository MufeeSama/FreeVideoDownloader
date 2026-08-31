use crate::downloader::{DownloadManager, DownloadRequest};
use crate::models::VideoParseResult;
use crate::parser::parse_video_url;
use crate::storage::{
    append_or_update_history_record, clear_history as clear_history_storage,
    generate_save_path, load_history, load_settings,
    save_settings as save_settings_storage, AppSettings, DownloadTaskRecord,
};
use serde::Deserialize;
use std::path::{Path, PathBuf};
use std::process::Command;
use tauri::{AppHandle, State};

pub struct AppState {
    pub download_manager: DownloadManager,
}

#[derive(Debug, Deserialize)]
pub struct StartDownloadParams {
    pub url: String,
    pub title: String,
    pub platform: String,
    pub media_type: String, // "video" | "image" | "audio"
    pub quality: Option<String>,
    pub author: Option<String>,
    pub custom_save_path: Option<String>,
}

#[tauri::command]
pub async fn parse_video(raw_input: String) -> Result<VideoParseResult, String> {
    parse_video_url(&raw_input).await
}

#[tauri::command]
pub async fn start_download(
    app: AppHandle,
    state: State<'_, AppState>,
    params: StartDownloadParams,
) -> Result<DownloadTaskRecord, String> {
    let settings = load_settings();
    let ext = match params.media_type.as_str() {
        "image" => "jpg",
        "audio" => "mp3",
        _ => "mp4",
    };

    let save_path = if let Some(custom_path) = params.custom_save_path {
        PathBuf::from(custom_path)
    } else {
        generate_save_path(
            &settings.default_download_dir,
            params.author.as_deref(),
            &params.title,
            params.quality.as_deref(),
            ext,
            settings.auto_organize_by_author,
            settings.auto_organize_by_date,
        )
    };

    let task_id = format!("task_{}", uuid::Uuid::new_v4().simple());
    let now = chrono::Local::now().timestamp();

    let record = DownloadTaskRecord {
        id: task_id.clone(),
        title: params.title.clone(),
        platform: params.platform.clone(),
        media_type: params.media_type.clone(),
        quality: params.quality.clone(),
        download_url: params.url.clone(),
        save_path: save_path.to_string_lossy().to_string(),
        total_bytes: 0,
        downloaded_bytes: 0,
        progress: 0.0,
        status: "downloading".to_string(),
        error_message: None,
        created_at: now,
        completed_at: None,
    };

    // Save record to local history
    let _ = append_or_update_history_record(record.clone());

    let req = DownloadRequest {
        id: task_id,
        url: params.url,
        save_path: save_path.to_string_lossy().to_string(),
        title: params.title,
        media_type: params.media_type,
    };

    state.download_manager.start_download(app, req).await?;

    Ok(record)
}

#[tauri::command]
pub async fn cancel_download(
    state: State<'_, AppState>,
    task_id: String,
) -> Result<(), String> {
    let cancelled = state.download_manager.cancel_task(&task_id).await;
    if cancelled {
        let mut history = load_history();
        if let Some(pos) = history.iter().position(|r| r.id == task_id) {
            history[pos].status = "cancelled".to_string();
            let _ = crate::storage::save_history(&history);
        }
    }
    Ok(())
}

#[tauri::command]
pub fn get_download_history() -> Result<Vec<DownloadTaskRecord>, String> {
    Ok(load_history())
}

#[tauri::command]
pub fn clear_download_history() -> Result<(), String> {
    clear_history_storage()
}

#[tauri::command]
pub fn get_app_settings() -> Result<AppSettings, String> {
    Ok(load_settings())
}

#[tauri::command]
pub fn save_app_settings(settings: AppSettings) -> Result<(), String> {
    save_settings_storage(&settings)
}

#[tauri::command]
pub fn open_in_explorer(file_path: String) -> Result<(), String> {
    let path = Path::new(&file_path);
    if !path.exists() {
        if let Some(parent) = path.parent() {
            if parent.exists() {
                #[cfg(target_os = "windows")]
                {
                    let _ = Command::new("explorer").arg(parent).spawn();
                    return Ok(());
                }
            }
        }
        return Err("File or folder does not exist".to_string());
    }

    #[cfg(target_os = "windows")]
    {
        let _ = Command::new("explorer")
            .arg("/select,")
            .arg(path)
            .spawn()
            .map_err(|e| format!("Failed to open explorer: {}", e))?;
    }

    #[cfg(target_os = "macos")]
    {
        let _ = Command::new("open")
            .arg("-R")
            .arg(path)
            .spawn()
            .map_err(|e| format!("Failed to open Finder: {}", e))?;
    }

    #[cfg(target_os = "linux")]
    {
        if let Some(parent) = path.parent() {
            let _ = Command::new("xdg-open")
                .arg(parent)
                .spawn()
                .map_err(|e| format!("Failed to open file manager: {}", e))?;
        }
    }

    Ok(())
}

#[tauri::command]
pub fn open_folder(folder_path: String) -> Result<(), String> {
    let path = Path::new(&folder_path);
    if !path.exists() {
        let _ = std::fs::create_dir_all(path);
    }

    #[cfg(target_os = "windows")]
    {
        let _ = Command::new("explorer")
            .arg(path)
            .spawn()
            .map_err(|e| format!("Failed to open folder: {}", e))?;
    }

    #[cfg(target_os = "macos")]
    {
        let _ = Command::new("open")
            .arg(path)
            .spawn()
            .map_err(|e| format!("Failed to open folder: {}", e))?;
    }

    #[cfg(target_os = "linux")]
    {
        let _ = Command::new("xdg-open")
            .arg(path)
            .spawn()
            .map_err(|e| format!("Failed to open folder: {}", e))?;
    }

    Ok(())
}

#[tauri::command]
pub fn get_suggested_save_path(
    title: String,
    author: Option<String>,
    quality: Option<String>,
    media_type: String,
) -> Result<String, String> {
    let settings = load_settings();
    let ext = match media_type.as_str() {
        "image" => "jpg",
        "audio" => "mp3",
        _ => "mp4",
    };

    let path = generate_save_path(
        &settings.default_download_dir,
        author.as_deref(),
        &title,
        quality.as_deref(),
        ext,
        settings.auto_organize_by_author,
        settings.auto_organize_by_date,
    );

    Ok(path.to_string_lossy().to_string())
}
