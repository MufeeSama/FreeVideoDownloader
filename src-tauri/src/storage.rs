use chrono::Local;
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;


#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppSettings {
    pub default_download_dir: String,
    pub auto_organize_by_author: bool,
    pub auto_organize_by_date: bool,
    pub naming_template: String,
    pub auto_monitor_clipboard: bool,
    pub max_concurrent_downloads: usize,
    pub theme: String, // "dark" | "light" | "system"
    pub close_to_tray: bool,
}

impl Default for AppSettings {
    fn default() -> Self {
        let default_dir = dirs_next::download_dir()
            .unwrap_or_else(|| PathBuf::from("."))
            .join("FreeVideoDownloader")
            .to_string_lossy()
            .to_string();

        Self {
            default_download_dir: default_dir,
            auto_organize_by_author: false,
            auto_organize_by_date: false,
            naming_template: "{title}_{quality}".to_string(),
            auto_monitor_clipboard: true,
            max_concurrent_downloads: 3,
            theme: "system".to_string(),
            close_to_tray: false,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DownloadTaskRecord {
    pub id: String,
    pub title: String,
    pub platform: String,
    pub media_type: String, // "video" | "image" | "audio"
    pub quality: Option<String>,
    pub download_url: String,
    pub save_path: String,
    pub total_bytes: u64,
    pub downloaded_bytes: u64,
    pub progress: f64,
    pub status: String,
    pub error_message: Option<String>,
    pub created_at: i64,
    pub completed_at: Option<i64>,
}

pub fn sanitize_filename(name: &str) -> String {
    let invalid_chars = ['\\', '/', ':', '*', '?', '"', '<', '>', '|', '\n', '\r', '\t'];
    let sanitized: String = name.chars()
        .map(|c| if invalid_chars.contains(&c) { '_' } else { c })
        .collect();
    
    // Truncate to maximum safe length
    let trimmed = sanitized.trim();
    if trimmed.chars().count() > 64 {
        trimmed.chars().take(64).collect()
    } else if trimmed.is_empty() {
        "media".to_string()
    } else {
        trimmed.to_string()
    }
}

pub fn generate_save_path(
    base_dir: &str,
    author: Option<&str>,
    title: &str,
    quality: Option<&str>,
    extension: &str,
    organize_by_author: bool,
    organize_by_date: bool,
) -> PathBuf {
    let mut path = PathBuf::from(base_dir);

    if organize_by_author {
        let safe_author = sanitize_filename(author.unwrap_or("未知作者"));
        path.push(safe_author);
    }

    if organize_by_date {
        let date_str = Local::now().format("%Y-%m-%d").to_string();
        path.push(date_str);
    }

    let safe_title = sanitize_filename(title);
    let filename = if let Some(q) = quality {
        let safe_q = sanitize_filename(q);
        format!("{}_{}.{}", safe_title, safe_q, extension.trim_start_matches('.'))
    } else {
        format!("{}.{}", safe_title, extension.trim_start_matches('.'))
    };

    path.push(filename);
    path
}

fn get_app_data_dir() -> PathBuf {
    let mut dir = dirs_next::data_local_dir().unwrap_or_else(|| PathBuf::from("."));
    dir.push("FreeVideoDownloader");
    let _ = fs::create_dir_all(&dir);
    dir
}

pub fn load_settings() -> AppSettings {
    let config_path = get_app_data_dir().join("settings.json");
    if config_path.exists() {
        if let Ok(content) = fs::read_to_string(&config_path) {
            if let Ok(settings) = serde_json::from_str::<AppSettings>(&content) {
                return settings;
            }
        }
    }
    let default_settings = AppSettings::default();
    let _ = save_settings(&default_settings);
    default_settings
}

pub fn save_settings(settings: &AppSettings) -> Result<(), String> {
    let config_path = get_app_data_dir().join("settings.json");
    let json = serde_json::to_string_pretty(settings).map_err(|e| e.to_string())?;
    fs::write(&config_path, json).map_err(|e| e.to_string())
}

pub fn load_history() -> Vec<DownloadTaskRecord> {
    let history_path = get_app_data_dir().join("history.json");
    if history_path.exists() {
        if let Ok(content) = fs::read_to_string(&history_path) {
            if let Ok(records) = serde_json::from_str::<Vec<DownloadTaskRecord>>(&content) {
                return records;
            }
        }
    }
    Vec::new()
}

pub fn save_history(records: &[DownloadTaskRecord]) -> Result<(), String> {
    let history_path = get_app_data_dir().join("history.json");
    let json = serde_json::to_string_pretty(records).map_err(|e| e.to_string())?;
    fs::write(&history_path, json).map_err(|e| e.to_string())
}

pub fn append_or_update_history_record(record: DownloadTaskRecord) -> Result<(), String> {
    let mut history = load_history();
    if let Some(pos) = history.iter().position(|r| r.id == record.id) {
        history[pos] = record;
    } else {
        history.insert(0, record);
    }
    save_history(&history)
}

pub fn clear_history() -> Result<(), String> {
    let history_path = get_app_data_dir().join("history.json");
    if history_path.exists() {
        let _ = fs::remove_file(history_path);
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_sanitize_filename() {
        let dirty = "测试:视频/魔都日记*潘敏?test<tag>|pipe\"quote\nnewline";
        let clean = sanitize_filename(dirty);
        assert!(!clean.contains(':'));
        assert!(!clean.contains('/'));
        assert!(!clean.contains('*'));
        assert!(!clean.contains('?'));
        assert!(!clean.contains('<'));
        assert!(!clean.contains('>'));
        assert!(!clean.contains('|'));
        assert!(!clean.contains('"'));
        assert!(!clean.contains('\n'));
    }
}
