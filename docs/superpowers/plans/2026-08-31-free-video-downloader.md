# Free Video Downloader 桌面端无水印视频下载器实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 基于 Tauri v2 + React 18 + TypeScript + Vite + Tailwind CSS 技术栈，构建一个支持抖音、TikTok、小红书、快手等全平台短视频/图集/LivePhoto/音频的高性能桌面无水印下载器。

**Architecture:** 前端采用 React 18 + Tailwind CSS 打造现代化无边框沉浸式毛玻璃 UI；Rust 后端实现 HelloTik 端到端逆向解密引擎（AES-GCM 签名与 AES-CBC 密文还原）、Tokio 多线程流式断点续传下载器及本地数据归档。

**Tech Stack:** Tauri v2, Rust 1.75+, Tokio, Reqwest, AES, CBC, SHA-2, Base64, React 18, TypeScript, Vite 6, Tailwind CSS 3.4, Lucide React, Sonner.

**Spec:** [docs/superpowers/specs/2026-08-31-free-video-downloader-design.md](file:///d:/Code/FreeVideoDownloader/docs/superpowers/specs/2026-08-31-free-video-downloader-design.md)

## Global Constraints

- **Tauri 版本**：Tauri v2 (`@tauri-apps/api@^2.0.0`, `@tauri-apps/cli@^2.0.0`, `tauri = "2.0"`)
- **HelloTik 固定密钥**：`"93838338562359368888868323563256"` (UTF-8 32 字节)
- **HelloTik 字符置换表**：`"ZYXABCDEFGHIJKLMNOPQRSTUVWzyxabcdefghijklmnopqrstuvw9876543210-_"` $\rightarrow$ `"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"`
- **默认下载目录**：用户下载目录下的 `FreeVideoDownloader` 文件夹
- **文件命名清洗**：替换 Windows 保留字符 `\ / : * ? " < > |` 为下划线，标题安全截断至 64 字符

---

### Task 1: 项目工程脚手架与 Tauri v2 / React / Vite 环境初始化

**Files:**
- Create: `package.json`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `tsconfig.node.json`
- Create: `tailwind.config.js`
- Create: `postcss.config.js`
- Create: `index.html`
- Create: `src-tauri/Cargo.toml`
- Create: `src-tauri/tauri.conf.json`
- Create: `src-tauri/src/main.rs`
- Create: `src-tauri/src/lib.rs`

**Interfaces:**
- Produces: 完整可运行的 Tauri v2 + React 18 + TypeScript + Vite + Tailwind CSS 基础架构

- [ ] **Step 1: 创建 package.json 并配置依赖项**

```json
{
  "name": "free-video-downloader",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "tauri": "tauri"
  },
  "dependencies": {
    "@tauri-apps/api": "^2.0.0",
    "@tauri-apps/plugin-clipboard-manager": "^2.0.0",
    "@tauri-apps/plugin-dialog": "^2.0.0",
    "@tauri-apps/plugin-fs": "^2.0.0",
    "@tauri-apps/plugin-notification": "^2.0.0",
    "@tauri-apps/plugin-opener": "^2.0.0",
    "clsx": "^2.1.1",
    "lucide-react": "^0.475.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "sonner": "^2.0.1",
    "tailwind-merge": "^3.0.1"
  },
  "devDependencies": {
    "@tauri-apps/cli": "^2.0.0",
    "@types/node": "^22.13.4",
    "@types/react": "^18.3.18",
    "@types/react-dom": "^18.3.5",
    "@vitejs/plugin-react": "^4.3.4",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.5.2",
    "tailwindcss": "^3.4.17",
    "typescript": "~5.7.2",
    "vite": "^6.1.0"
  }
}
```

- [ ] **Step 2: 配置 Vite, TypeScript 与 Tailwind CSS**

```typescript
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

const host = process.env.TAURI_DEV_HOST;

export default defineConfig(async () => ({
  plugins: [react()],
  clearScreen: false,
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host
      ? {
          protocol: "ws",
          host,
          port: 1421,
        }
      : undefined,
    watch: {
      ignored: ["**/src-tauri/**"],
    },
  },
}));
```

```javascript
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f5f3ff",
          100: "#ede9fe",
          200: "#ddd6fe",
          300: "#c4b5fd",
          400: "#a78bfa",
          500: "#8b5cf6",
          600: "#7c3aed",
          700: "#6d28d9",
          800: "#5b21b6",
          900: "#4c1d95",
        }
      }
    },
  },
  plugins: [],
}
```

- [ ] **Step 3: 配置 src-tauri/Cargo.toml 与 tauri.conf.json**

```toml
# src-tauri/Cargo.toml
[package]
name = "free-video-downloader"
version = "1.0.0"
description = "Social Media Video Downloader"
authors = ["Antigravity"]
edition = "2021"

[lib]
name = "free_video_downloader_lib"
crate-type = ["staticlib", "cdylib", "rlib"]

[build-dependencies]
tauri-build = { version = "2.0.0", features = [] }

[dependencies]
tauri = { version = "2.0.0", features = ["tray-icon"] }
tauri-plugin-opener = "2.0.0"
tauri-plugin-dialog = "2.0.0"
tauri-plugin-fs = "2.0.0"
tauri-plugin-clipboard-manager = "2.0.0"
tauri-plugin-notification = "2.0.0"
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
tokio = { version = "1.38", features = ["full"] }
reqwest = { version = "0.12", features = ["json", "stream", "cookies"] }
aes = "0.8"
cbc = { version = "0.1", features = ["alloc"] }
aes-gcm = "0.10"
sha2 = "0.10"
base64 = "0.22"
rand = "0.8"
uuid = { version = "1.8", features = ["v4", "serde"] }
chrono = { version = "0.4", features = ["serde"] }
futures-util = "0.3"
```

```json
// src-tauri/tauri.conf.json
{
  "$schema": "https://schema.tauri.app/config/2",
  "productName": "Free Video Downloader",
  "version": "1.0.0",
  "identifier": "com.antigravity.videodownloader",
  "build": {
    "beforeDevCommand": "npm run dev",
    "devUrl": "http://localhost:1420",
    "beforeBuildCommand": "npm run build",
    "frontendDist": "../dist"
  },
  "app": {
    "windows": [
      {
        "title": "Free Video Downloader",
        "width": 980,
        "height": 720,
        "minWidth": 800,
        "minHeight": 600,
        "decorations": false,
        "transparent": true,
        "center": true
      }
    ],
    "security": {
      "csp": null
    }
  },
  "bundle": {
    "active": true,
    "targets": "all",
    "icon": [
      "icons/32x32.png",
      "icons/128x128.png",
      "icons/128x128@2x.png",
      "icons/icon.icns",
      "icons/icon.ico"
    ]
  }
}
```

- [ ] **Step 4: 安装依赖并测试启动编译**

Run: `npm install`
Run: `npm run build`
Expected: 前端编译通过，无类型与打包错误。

- [ ] **Step 5: 提交脚手架代码**

```bash
git add .
git commit -m "chore: scaffold tauri v2 react typescript vite project"
```

---

### Task 2: Rust 端 HelloTik 逆向协议解析引擎与单元测试

**Files:**
- Create: `src-tauri/src/parser.rs`
- Create: `src-tauri/src/models.rs`
- Modify: `src-tauri/src/lib.rs`

**Interfaces:**
- Produces: `pub async fn parse_video_url(raw_input: &str) -> Result<VideoParseResult, String>`
- Produces: `pub fn decrypt_hellotik_data(enc_data: &str, enc_key: &str) -> Result<ParsedRawResponse, String>`

- [ ] **Step 1: 定义核心数据模型 (`models.rs`)**

```rust
// src-tauri/src/models.rs
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
```

- [ ] **Step 2: 实现加解密流水线与 HelloTik 协议引擎 (`parser.rs`)**

```rust
// src-tauri/src/parser.rs
use crate::models::{GateResponse, RawParseApiResponse, VideoItem, VideoParseResult, VideoQualityInfo};
use aes::cipher::{block_padding::Pkcs7, BlockDecryptMut, KeyIvInit};
use aes_gcm::{aead::Aead, Aes256Gcm, KeyInit, Nonce};
use base64::{engine::general_purpose::STANDARD as BASE64, Engine as _};
use rand::RngCore;
use reqwest::header::{HeaderMap, HeaderValue, CONTENT_TYPE, USER_AGENT};
use sha2::{Digest, Sha256};
use std::time::Duration;

type Aes256CbcDec = cbc::Decryptor<aes::Aes256>;

const HELLOTIK_FIXED_KEY: &[u8; 32] = b"93838338562359368888868323563256";
const CUSTOM_CHAR_MAP_FROM: &str = "ZYXABCDEFGHIJKLMNOPQRSTUVWzyxabcdefghijklmnopqrstuvw9876543210-_";
const CUSTOM_CHAR_MAP_TO: &str = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

// 字符串字符映射置换
fn custom_substitute(input: &str) -> String {
    input.chars().map(|c| {
        if let Some(pos) = CUSTOM_CHAR_MAP_FROM.find(c) {
            CUSTOM_CHAR_MAP_TO.chars().nth(pos).unwrap_or(c)
        } else {
            c
        }
    }).collect()
}

// 8字符分块反转
fn reverse_chunks(input: &str, chunk_size: usize) -> String {
    let mut result = String::with_capacity(input.len());
    let chars: Vec<char> = input.chars().collect();
    for chunk in chars.chunks(chunk_size) {
        let rev: String = chunk.iter().rev().collect();
        result.push_str(&rev);
    }
    result
}

// XOR 90 运算
fn xor_str(input: &str, xor_val: u8) -> String {
    input.bytes().map(|b| (b ^ xor_val) as char).collect()
}

pub fn decrypt_hellotik_payload(enc_data: &str, enc_key: &str) -> Result<serde_json::Value, String> {
    // 1. atob (Base64 decode to string bytes)
    let c1_bytes = BASE64.decode(enc_data).map_err(|e| format!("Base64 decode data error: {}", e))?;
    let i1_bytes = BASE64.decode(enc_key).map_err(|e| format!("Base64 decode key error: {}", e))?;
    
    let c1_str: String = c1_bytes.iter().map(|&b| b as char).collect();
    let i1_str: String = i1_bytes.iter().map(|&b| b as char).collect();

    // 2. XOR 90
    let c2 = xor_str(&c1_str, 90);
    let i2 = xor_str(&i1_str, 90);

    // 3. Chunk reverse (8 chars)
    let c3 = reverse_chunks(&c2, 8);
    let i3 = reverse_chunks(&i2, 8);

    // 4. Custom substitution
    let c4 = custom_substitute(&c3);
    let i4 = custom_substitute(&i3);

    // 5. Base64 decode to cipher & iv bytes
    let cipher_bytes = BASE64.decode(c4).map_err(|e| format!("Base64 decode cipher error: {}", e))?;
    let iv_bytes = BASE64.decode(i4).map_err(|e| format!("Base64 decode iv error: {}", e))?;

    if iv_bytes.len() != 16 {
        return Err(format!("Invalid IV length: expected 16, got {}", iv_bytes.len()));
    }

    // 6. AES-256-CBC Decrypt with PKCS7 padding
    let decryptor = Aes256CbcDec::new(HELLOTIK_FIXED_KEY.into(), iv_bytes.as_slice().into());
    let mut buf = cipher_bytes.clone();
    let decrypted_slice = decryptor.decrypt_padded_mut::<Pkcs7>(&mut buf)
        .map_err(|e| format!("AES-256-CBC decrypt failed: {:?}", e))?;

    let json_str = String::from_utf8(decrypted_slice.to_vec())
        .map_err(|e| format!("UTF-8 decode failed: {}", e))?;

    serde_json::from_str(&json_str).map_err(|e| format!("JSON parse error: {}", e))
}

pub async fn parse_video_url(raw_input: &str) -> Result<VideoParseResult, String> {
    let client = reqwest::Client::builder()
        .timeout(Duration::from_secs(15))
        .build()
        .map_err(|e| e.to_string())?;

    let mut headers = HeaderMap::new();
    headers.insert(USER_AGENT, HeaderValue::from_static("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"));
    headers.insert(CONTENT_TYPE, HeaderValue::from_static("application/json"));

    // 1. Gate Auth
    let gate_body = serde_json::json!({
        "requestURL": raw_input.trim(),
        "isBatch": false,
        "mode": "single"
    });

    let gate_res = client.post("https://www.hellotik.app/api/gate-e5eea8")
        .headers(headers.clone())
        .json(&gate_body)
        .send()
        .await
        .map_err(|e| format!("Gate auth request failed: {}", e))?;

    let gate_data: GateResponse = gate_res.json().await
        .map_err(|e| format!("Failed to parse gate response: {}", e))?;

    let ticket = gate_data.ticket.ok_or("Missing ticket from gate auth")?;
    let seed = gate_data.seed.ok_or("Missing seed from gate auth")?;

    // 2. Derive AES-256-GCM Key from SHA256(ticket:seed)
    let mut hasher = Sha256::new();
    hasher.update(format!("{}:{}", ticket, seed).as_bytes());
    let derived_key = hasher.finalize();

    // 3. Encrypt Request Payload
    let mut iv = [0u8; 12];
    rand::thread_rng().fill_bytes(&mut iv);
    let nonce = Nonce::from_slice(&iv);

    let cipher = Aes256Gcm::new_from_slice(&derived_key)
        .map_err(|e| format!("Failed to create AES-GCM cipher: {}", e))?;

    let payload_json = serde_json::json!({
        "requestURL": raw_input.trim(),
        "isMobile": "false",
        "isoCode": "CN",
        "adType": "adsense",
        "uwx_id": format!("uwxs_{}", uuid::Uuid::new_v4().simple()),
        "successCount": "0",
        "totalSuccessCount": "0",
        "firstSuccessDate": null,
        "geoipIp": ""
    });

    let payload_bytes = serde_json::to_vec(&payload_json).unwrap();
    let encrypted_payload = cipher.encrypt(nonce, payload_bytes.as_ref())
        .map_err(|e| format!("AES-GCM encryption failed: {:?}", e))?;

    let parse_request_body = serde_json::json!({
        "tk_e5eea8": ticket,
        "pl_e5eea8": BASE64.encode(&encrypted_payload),
        "iv_e5eea8": BASE64.encode(&iv),
        "vr_e5eea8": 1
    });

    // 4. Send Parse Request
    let parse_res = client.post("https://www.hellotik.app/api/parse")
        .headers(headers)
        .json(&parse_request_body)
        .send()
        .await
        .map_err(|e| format!("Parse request failed: {}", e))?;

    let parse_raw: RawParseApiResponse = parse_res.json().await
        .map_err(|e| format!("Failed to parse parse API response: {}", e))?;

    if parse_raw.status != 0 {
        return Err(parse_raw.error.unwrap_or_else(|| "解析失败，平台可能限制了该链接".into()));
    }

    let final_data = if parse_raw.encrypt == Some(true) {
        let enc_data_str = parse_raw.data.and_then(|v| v.as_str().map(|s| s.to_string()))
            .ok_or("Encrypted data field missing or not string")?;
        let enc_key_str = parse_raw.key.ok_or("Encrypted key field missing")?;
        decrypt_hellotik_payload(&enc_data_str, &enc_key_str)?
    } else {
        parse_raw.data.ok_or("Data field is empty")?
    };

    // 5. Transform to VideoParseResult
    let title = final_data.get("title").and_then(|v| v.as_str()).unwrap_or("无标题视频").to_string();
    let author = final_data.get("author").and_then(|v| v.as_str()).map(|s| s.to_string());
    let cover = final_data.get("cover").and_then(|v| v.as_str())
        .or_else(|| final_data.get("pics").and_then(|p| p.as_array()).and_then(|arr| arr.get(0)).and_then(|v| v.as_str()))
        .unwrap_or("").to_string();

    let mut videos = Vec::new();
    if let Some(video_list) = final_data.get("videos").and_then(|v| v.as_array()) {
        for v in video_list {
            if let Some(url) = v.as_str() {
                videos.push(VideoItem {
                    url: url.to_string(),
                    video_fullinfo: None,
                });
            } else if let Some(obj) = v.as_object() {
                let url = obj.get("url").and_then(|u| u.as_str()).unwrap_or("").to_string();
                let fullinfo = obj.get("video_fullinfo").and_then(|f| f.as_array()).map(|arr| {
                    arr.iter().filter_map(|info| {
                        let info_obj = info.as_object()?;
                        let q_type = info_obj.get("type").and_then(|t| t.as_str())?.to_string();
                        let q_url = info_obj.get("url").and_then(|u| u.as_str())?.to_string();
                        let q_size = info_obj.get("size").and_then(|s| s.as_u64());
                        let formatted_size = q_size.map(|s| format!("{:.1} MB", s as f64 / 1024.0 / 1024.0));
                        Some(VideoQualityInfo {
                            r#type: q_type,
                            url: q_url,
                            size: q_size,
                            formatted_size,
                        })
                    }).collect()
                });
                videos.push(VideoItem {
                    url,
                    video_fullinfo: fullinfo,
                });
            }
        }
    }

    let pics: Option<Vec<String>> = final_data.get("pics").and_then(|p| p.as_array()).map(|arr| {
        arr.iter().filter_map(|item| item.as_str().map(|s| s.to_string())).collect()
    });

    let audio_url = final_data.get("music").and_then(|m| m.get("url")).and_then(|u| u.as_str()).map(|s| s.to_string())
        .or_else(|| final_data.get("music_url").and_then(|u| u.as_str()).map(|s| s.to_string()));

    let platform = if raw_input.contains("douyin.com") || raw_input.contains("iesdouyin") {
        "douyin".into()
    } else if raw_input.contains("tiktok.com") {
        "tiktok".into()
    } else if raw_input.contains("xiaohongshu.com") || raw_input.contains("xhslink.com") {
        "rednote".into()
    } else if raw_input.contains("kuaishou.com") || raw_input.contains("kwai") {
        "kuaishou".into()
    } else if raw_input.contains("bilibili.com") || raw_input.contains("b23.tv") {
        "bilibili".into()
    } else {
        "other".into()
    };

    Ok(VideoParseResult {
        title,
        author,
        cover,
        avatar: None,
        platform,
        videos,
        pics,
        audio_url,
        source_url: raw_input.to_string(),
    })
}
```

- [ ] **Step 3: 编写 Rust 单元测试并验证抖音真实链接**

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_parse_douyin_video() {
        let test_url = "3.02 复制打开抖音，看看【大马菲鱼的作品】魔都日记 # 潘敏  https://v.douyin.com/LTjjepu4yFg/ :9pm A@T.Yz ULw:/ 02/12";
        let result = parse_video_url(test_url).await;
        assert!(result.is_ok(), "Failed to parse: {:?}", result.err());
        let res = result.unwrap();
        assert!(!res.title.is_empty());
        assert!(!res.videos.is_empty());
    }
}
```

- [ ] **Step 4: 执行 `cargo test` 验证通过**

Run: `cargo test -- --nocapture` (in `src-tauri`)
Expected: `test_parse_douyin_video ... ok`

- [ ] **Step 5: 提交解析引擎代码**

```bash
git add src-tauri/
git commit -m "feat(parser): implement reverse-engineered HelloTik AES crypto parsing engine"
```

---

### Task 3: Rust 高性能流式下载器与断点续传引擎

**Files:**
- Create: `src-tauri/src/downloader.rs`
- Modify: `src-tauri/src/lib.rs`

**Interfaces:**
- Produces: `pub async fn start_download_task(app: AppHandle, req: DownloadRequest) -> Result<String, String>`
- Produces: `pub async fn pause_task(task_id: &str) -> Result<(), String>`
- Produces: `pub async fn cancel_task(task_id: &str) -> Result<(), String>`

- [ ] **Step 1: 编写下载器结构体与流式进度广播逻辑 (`downloader.rs`)**

```rust
// src-tauri/src/downloader.rs
use futures_util::StreamExt;
use reqwest::header::{HeaderMap, HeaderValue, RANGE, USER_AGENT};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::path::{Path, PathBuf};
use std::sync::Arc;
use tauri::{AppHandle, Emitter};
use tokio::fs::{File, OpenOptions};
use tokio::io::AsyncWriteExt;
use tokio::sync::Mutex;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DownloadProgressPayload {
    pub task_id: String,
    pub downloaded_bytes: u64,
    pub total_bytes: u64,
    pub progress: f64,
    pub speed: f64, // bytes per second
    pub status: String, // "downloading" | "completed" | "failed" | "paused"
    pub error: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DownloadRequest {
    pub id: String,
    pub url: String,
    pub save_path: String,
    pub title: String,
    pub media_type: String,
}

pub struct DownloadManager {
    pub active_tasks: Arc<Mutex<HashMap<String, tokio::sync::watch::Sender<bool>>>>,
}

impl DownloadManager {
    pub fn new() -> Self {
        Self {
            active_tasks: Arc::new(Mutex::new(HashMap::new())),
        }
    }
}
```

- [ ] **Step 2: 实现流式分块写入、断点续传与速度计算**

- [ ] **Step 3: 编写单测验证大文件流式下载与取消机制**

- [ ] **Step 4: 提交下载器代码**

```bash
git add src-tauri/src/downloader.rs
git commit -m "feat(downloader): implement tokio streaming downloader with progress events"
```

---

### Task 4: Rust 文件名清洗、归档与配置/历史持久化

**Files:**
- Create: `src-tauri/src/storage.rs`
- Modify: `src-tauri/src/lib.rs`

**Interfaces:**
- Produces: `pub fn sanitize_filename(name: &str) -> String`
- Produces: `pub fn get_app_settings() -> AppSettings`
- Produces: `pub fn save_app_settings(settings: &AppSettings) -> Result<(), String>`
- Produces: `pub fn append_history(task: &DownloadTask) -> Result<(), String>`
- Produces: `pub fn load_history() -> Vec<DownloadTask>`

- [ ] **Step 1: 实现 Windows 保留字符清洗与模板命名**
- [ ] **Step 2: 实现基于 JSON / 本地文件的历史记录与配置存取**
- [ ] **Step 3: 编写单测验证字符清洗与存取**
- [ ] **Step 4: 提交持久化存储代码**

```bash
git add src-tauri/src/storage.rs
git commit -m "feat(storage): add sanitized filename formatter and local persistence"
```

---

### Task 5: Rust Tauri IPC 命令注册与系统级桌面集成

**Files:**
- Create: `src-tauri/src/commands.rs`
- Modify: `src-tauri/src/lib.rs`
- Modify: `src-tauri/src/main.rs`

**Interfaces:**
- Produces: `parse_video`, `start_download`, `pause_download`, `cancel_download`, `get_download_history`, `clear_download_history`, `open_file_in_folder`, `open_folder`, `get_app_settings`, `save_app_settings`, `select_directory`

- [ ] **Step 1: 编写 commands.rs 并接入 tauri::generate_handler**
- [ ] **Step 2: 配置系统托盘与窗口无边框控制（最小化/最大化/关闭）**
- [ ] **Step 3: 运行 `cargo check` 确保编译无误**
- [ ] **Step 4: 提交 Tauri IPC 层代码**

```bash
git add src-tauri/
git commit -m "feat(tauri): wire up ipc commands and window control handlers"
```

---

### Task 6: 前端类型系统、设计系统 Tokens 与 Tauri IPC 桥接层

**Files:**
- Create: `src/types/index.ts`
- Create: `src/services/tauriApi.ts`
- Create: `src/index.css`

**Interfaces:**
- Produces: 完整强类型定义、Tauri API 封装与现代毛玻璃深浅色设计 Tokens

- [ ] **Step 1: 创建 TypeScript 核心模型 (`src/types/index.ts`)**
- [ ] **Step 2: 封装 `src/services/tauriApi.ts` 支持所有 IPC 调用与 Event 订阅**
- [ ] **Step 3: 构建 `src/index.css` 设计系统样式变量与无边框毛玻璃特效**
- [ ] **Step 4: 提交前端桥接层代码**

```bash
git add src/
git commit -m "feat(frontend): set up core types, tauri api bridge and design tokens"
```

---

### Task 7: 自定义无边框窗口顶栏与主题管理

**Files:**
- Create: `src/components/layout/TitleBar.tsx`
- Create: `src/components/layout/AppLayout.tsx`
- Create: `src/hooks/useTheme.ts`

**Interfaces:**
- Produces: 自定义 macOS/Windows 风格磨砂顶栏、窗口拖拽与主题自适应

- [ ] **Step 1: 实现 `useTheme.ts`（支持 dark, light, system 自动跟随）**
- [ ] **Step 2: 实现 `TitleBar.tsx`（包含 App 图标、标题、主题切换按钮、最小化、最大化、关闭）**
- [ ] **Step 3: 实现 `AppLayout.tsx` 主框架导航布局**
- [ ] **Step 4: 提交顶栏与布局组件**

```bash
git add src/components/layout/ src/hooks/useTheme.ts
git commit -m "feat(ui): add custom frameless titlebar and theme management"
```

---

### Task 8: 智能多功能输入框与剪贴板监听器

**Files:**
- Create: `src/components/parser/UrlInputBox.tsx`
- Create: `src/components/parser/ClipboardModal.tsx`
- Create: `src/hooks/useClipboard.ts`
- Create: `src/hooks/useVideoParser.ts`

**Interfaces:**
- Produces: 粘贴、一键清空、多行批量解析模式切换、复制短视频分享文本自动提示解析

- [ ] **Step 1: 实现 `useClipboard.ts` 监听短视频特征 URL 并防抖触发提示**
- [ ] **Step 2: 实现 `ClipboardModal.tsx` 优雅浮窗提示“检测到视频链接，是否立即解析？”**
- [ ] **Step 3: 实现 `UrlInputBox.tsx` 单/多行链接输入与解析动画反馈**
- [ ] **Step 4: 提交输入与剪贴板模块**

```bash
git add src/components/parser/ src/hooks/
git commit -m "feat(parser-ui): implement smart clipboard monitor and url input box"
```

---

### Task 9: 多媒体结果卡片、多清晰度自选、内置播放器与图集画廊

**Files:**
- Create: `src/components/media/MediaResultCard.tsx`
- Create: `src/components/media/QualityBadge.tsx`
- Create: `src/components/media/VideoPlayerModal.tsx`
- Create: `src/components/media/ImageGalleryModal.tsx`

**Interfaces:**
- Produces: 解析成功展示、封面图/动图呈现、540p/720p/1080p/4K原画清晰度选择、视频在线静默/有声预览、图集瀑布流查看与打包下载

- [ ] **Step 1: 实现 `QualityBadge.tsx` 清晰度与体积标签**
- [ ] **Step 2: 实现 `VideoPlayerModal.tsx` 内置无水印高清视频播放器**
- [ ] **Step 3: 实现 `ImageGalleryModal.tsx` 图集瀑布流与放大看图器**
- [ ] **Step 4: 实现 `MediaResultCard.tsx` 整合媒体展示与一键下载/复制直链**
- [ ] **Step 5: 提交媒体展示组件**

```bash
git add src/components/media/
git commit -m "feat(media-ui): add media result cards, video player and image gallery modal"
```

---

### Task 10: 下载管理看板、实时速率进度、历史面板与偏好设置

**Files:**
- Create: `src/components/download/DownloadQueue.tsx`
- Create: `src/components/download/HistoryList.tsx`
- Create: `src/components/download/TaskItem.tsx`
- Create: `src/components/settings/SettingsModal.tsx`
- Create: `src/hooks/useDownloadManager.ts`
- Modify: `src/App.tsx`

**Interfaces:**
- Produces: 任务列表动态进度看板、实时下载速率（MB/s）、一键打开定位、历史搜索过滤、下载目录与命名模板自定义设置

- [ ] **Step 1: 实现 `useDownloadManager.ts` 管理活动队列与历史列表状态**
- [ ] **Step 2: 实现 `DownloadQueue.tsx` 与 `TaskItem.tsx` 展示实时网速与进度**
- [ ] **Step 3: 实现 `HistoryList.tsx` 支持在文件管理器中一键打开与清空记录**
- [ ] **Step 4: 实现 `SettingsModal.tsx` 目录选择与归档规则设置**
- [ ] **Step 5: 组装 `App.tsx` 串联所有页面组件并引入 Sonner Toaster**
- [ ] **Step 6: 提交下载管理与设置面板代码**

```bash
git add src/components/download/ src/components/settings/ src/App.tsx
git commit -m "feat(download-ui): add download dashboard, history viewer and settings modal"
```

---

### Task 11: 全流程端到端联调、真机解析测试与构建交付

**Files:**
- Modify: `package.json`
- Modify: `README.md`

**Interfaces:**
- Produces: 完整的端到端自动化与手动测试验证，生成 Windows Release 安装包与可执行文件

- [ ] **Step 1: 运行完整前端测试与 TypeScript 严格检查**
  Run: `npm run build`
  Expected: 0 TS 错误，Vite 构建成功。

- [ ] **Step 2: 启动 `npm run tauri dev` 进行真实短视频解析与下载实测**
  - 测试链接：`3.02 复制打开抖音，看看【大马菲鱼的作品】魔都日记 # 潘敏 https://v.douyin.com/LTjjepu4yFg/ :9pm A@T.Yz ULw:/ 02/12`
  - 验证：视频标题解析、封面图预览、多清晰度（540p/720p/1080p/超高清）解析、在线播放预览、点击下载并定位到本地保存文件。

- [ ] **Step 3: 编写精美 README.md 并进行最终代码 Commit**

```bash
git add .
git commit -m "docs: add project readme and release instructions"
```

---
