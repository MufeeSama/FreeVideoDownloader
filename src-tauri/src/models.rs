use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VideoQualityInfo {
    pub r#type: String,
    pub url: String,
    pub size: Option<u64>,
    pub formatted_size: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VideoItem {
    pub url: String,
    pub video_fullinfo: Option<Vec<VideoQualityInfo>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VideoParseResult {
    pub title: String,
    pub author: Option<String>,
    pub cover: String,
    pub avatar: Option<String>,
    pub platform: String,
    pub videos: Vec<VideoItem>,
    pub pics: Option<Vec<String>>,
    pub audio_url: Option<String>,
    pub source_url: String,
}

#[derive(Debug, Deserialize)]
pub struct GateResponse {
    pub success: bool,
    #[serde(rename = "tk_e5eea8")]
    pub ticket: Option<String>,
    #[serde(rename = "sd_e5eea8")]
    pub seed: Option<String>,
    #[serde(rename = "ex_e5eea8")]
    pub expires_at: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct RawParseApiResponse {
    pub status: i32,
    pub encrypt: Option<bool>,
    pub data: Option<serde_json::Value>,
    pub key: Option<String>,
    pub error: Option<String>,
}
