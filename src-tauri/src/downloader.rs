use futures_util::StreamExt;
use reqwest::header::{HeaderMap, HeaderValue, RANGE, USER_AGENT};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::path::PathBuf;
use std::sync::Arc;
use std::time::{Duration, Instant};
use tauri::{AppHandle, Emitter};
use tokio::fs::OpenOptions;
use tokio::io::AsyncWriteExt;

use tokio::sync::Mutex;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DownloadProgressPayload {
    pub task_id: String,
    pub downloaded_bytes: u64,
    pub total_bytes: u64,
    pub progress: f64,
    pub speed: f64, // bytes per second
    pub status: String, // "downloading" | "completed" | "failed" | "paused" | "cancelled"
    pub error: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DownloadRequest {
    pub id: String,
    pub url: String,
    pub save_path: String,
    pub title: String,
    pub media_type: String, // "video" | "image" | "audio"
}

#[derive(Clone)]
pub struct DownloadManager {
    pub active_tasks: Arc<Mutex<HashMap<String, tokio::sync::watch::Sender<bool>>>>,
}

impl DownloadManager {
    pub fn new() -> Self {
        Self {
            active_tasks: Arc::new(Mutex::new(HashMap::new())),
        }
    }

    pub async fn cancel_task(&self, task_id: &str) -> bool {
        let mut tasks = self.active_tasks.lock().await;
        if let Some(sender) = tasks.remove(task_id) {
            let _ = sender.send(true);
            true
        } else {
            false
        }
    }

    pub async fn start_download(&self, app: AppHandle, req: DownloadRequest) -> Result<(), String> {
        let (tx, mut rx) = tokio::sync::watch::channel(false);
        {
            let mut tasks = self.active_tasks.lock().await;
            tasks.insert(req.id.clone(), tx);
        }

        let active_tasks_clone = self.active_tasks.clone();
        tokio::spawn(async move {
            let res = Self::download_file_internal(app.clone(), req.clone(), &mut rx).await;
            {
                let mut tasks = active_tasks_clone.lock().await;
                tasks.remove(&req.id);
            }

            match res {
                Ok(_) => {
                    let _ = app.emit("download://completed", serde_json::json!({
                        "task_id": req.id,
                        "save_path": req.save_path
                    }));
                }
                Err(err) => {
                    if err != "cancelled" {
                        let _ = app.emit("download://failed", serde_json::json!({
                            "task_id": req.id,
                            "error": err
                        }));
                    }
                }
            }
        });

        Ok(())
    }

    async fn download_file_internal(
        app: AppHandle,
        req: DownloadRequest,
        cancel_rx: &mut tokio::sync::watch::Receiver<bool>,
    ) -> Result<(), String> {
        let save_path = PathBuf::from(&req.save_path);
        if let Some(parent) = save_path.parent() {
            tokio::fs::create_dir_all(parent).await
                .map_err(|e| format!("Failed to create directory: {}", e))?;
        }

        let part_path = PathBuf::from(format!("{}.part", req.save_path));
        let mut downloaded_bytes: u64 = 0;

        if part_path.exists() {
            if let Ok(metadata) = tokio::fs::metadata(&part_path).await {
                downloaded_bytes = metadata.len();
            }
        }

        let client = reqwest::Client::builder()
            .timeout(Duration::from_secs(60))
            .build()
            .map_err(|e| e.to_string())?;

        let mut headers = HeaderMap::new();
        headers.insert(USER_AGENT, HeaderValue::from_static("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"));
        if downloaded_bytes > 0 {
            let range_val = format!("bytes={}-", downloaded_bytes);
            if let Ok(hv) = HeaderValue::from_str(&range_val) {
                headers.insert(RANGE, hv);
            }
        }

        let response = client.get(&req.url)
            .headers(headers)
            .send()
            .await
            .map_err(|e| format!("Download request error: {}", e))?;

        if !response.status().is_success() && response.status().as_u16() != 206 {
            return Err(format!("Download failed with status: {}", response.status()));
        }

        let content_length = response.content_length().unwrap_or(0);
        let total_bytes = if response.status().as_u16() == 206 {
            downloaded_bytes + content_length
        } else {
            downloaded_bytes = 0; // restart from 0 if server doesn't support 206
            content_length
        };

        let mut file = if downloaded_bytes > 0 {
            OpenOptions::new().append(true).open(&part_path).await
                .map_err(|e| format!("Failed to open part file: {}", e))?
        } else {
            OpenOptions::new().create(true).write(true).truncate(true).open(&part_path).await
                .map_err(|e| format!("Failed to create part file: {}", e))?
        };

        let mut stream = response.bytes_stream();
        let mut last_emit_time = Instant::now();
        let mut bytes_since_last_emit: u64 = 0;
        let mut speed: f64 = 0.0;

        while let Some(chunk_result) = stream.next().await {
            if *cancel_rx.borrow() {
                let _ = app.emit("download://progress", DownloadProgressPayload {
                    task_id: req.id.clone(),
                    downloaded_bytes,
                    total_bytes,
                    progress: if total_bytes > 0 { (downloaded_bytes as f64 / total_bytes as f64) * 100.0 } else { 0.0 },
                    speed: 0.0,
                    status: "cancelled".to_string(),
                    error: None,
                });
                return Err("cancelled".to_string());
            }

            let chunk = chunk_result.map_err(|e| format!("Stream error: {}", e))?;
            file.write_all(&chunk).await
                .map_err(|e| format!("Write error: {}", e))?;

            let chunk_len = chunk.len() as u64;
            downloaded_bytes += chunk_len;
            bytes_since_last_emit += chunk_len;

            let now = Instant::now();
            let elapsed = now.duration_since(last_emit_time);
            if elapsed >= Duration::from_millis(150) {
                speed = (bytes_since_last_emit as f64) / elapsed.as_secs_f64();
                bytes_since_last_emit = 0;
                last_emit_time = now;

                let progress = if total_bytes > 0 {
                    (downloaded_bytes as f64 / total_bytes as f64) * 100.0
                } else {
                    0.0
                };

                let _ = app.emit("download://progress", DownloadProgressPayload {
                    task_id: req.id.clone(),
                    downloaded_bytes,
                    total_bytes,
                    progress,
                    speed,
                    status: "downloading".to_string(),
                    error: None,
                });
            }
        }

        file.flush().await.map_err(|e| format!("Flush error: {}", e))?;
        drop(file);

        // Rename .part file to final file
        if save_path.exists() {
            let _ = tokio::fs::remove_file(&save_path).await;
        }
        tokio::fs::rename(&part_path, &save_path).await
            .map_err(|e| format!("Failed to finalize file: {}", e))?;

        // Final progress emit
        let _ = app.emit("download://progress", DownloadProgressPayload {
            task_id: req.id.clone(),
            downloaded_bytes,
            total_bytes: downloaded_bytes,
            progress: 100.0,
            speed: 0.0,
            status: "completed".to_string(),
            error: None,
        });

        Ok(())
    }
}
