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

// 字符置换映射
fn custom_substitute(input: &str) -> String {
    input.chars().map(|c| {
        if let Some(pos) = CUSTOM_CHAR_MAP_FROM.find(c) {
            CUSTOM_CHAR_MAP_TO.chars().nth(pos).unwrap_or(c)
        } else {
            c
        }
    }).collect()
}

// 8字符分块翻转
fn reverse_chunks(input: &str, chunk_size: usize) -> String {
    let mut result = String::with_capacity(input.len());
    let chars: Vec<char> = input.chars().collect();
    for chunk in chars.chunks(chunk_size) {
        let rev: String = chunk.iter().rev().collect();
        result.push_str(&rev);
    }
    result
}

// XOR 90
fn xor_str(input: &str, xor_val: u8) -> String {
    input.bytes().map(|b| (b ^ xor_val) as char).collect()
}

pub fn decrypt_hellotik_payload(enc_data: &str, enc_key: &str) -> Result<serde_json::Value, String> {
    // 1. atob (Base64 decode to binary string bytes)
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

    // 4. Custom substitution table
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
        .timeout(Duration::from_secs(20))
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
        return Err(parse_raw.error.unwrap_or_else(|| "解析失败，平台可能限制了该链接或需要验证".into()));
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
    let author = final_data.get("author").and_then(|v| v.as_str())
        .or_else(|| final_data.get("nickname").and_then(|v| v.as_str()))
        .map(|s| s.to_string());
    
    let cover = final_data.get("cover").and_then(|v| v.as_str())
        .or_else(|| final_data.get("pics").and_then(|p| p.as_array()).and_then(|arr| arr.get(0)).and_then(|v| v.as_str()))
        .unwrap_or("").to_string();

    let avatar = final_data.get("avatar").and_then(|v| v.as_str()).map(|s| s.to_string());

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
                        let formatted_size = q_size.map(|s| {
                            if s > 1024 * 1024 {
                                format!("{:.1} MB", s as f64 / 1024.0 / 1024.0)
                            } else {
                                format!("{:.1} KB", s as f64 / 1024.0)
                            }
                        });
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
        avatar,
        platform,
        videos,
        pics,
        audio_url,
        source_url: raw_input.to_string(),
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_parse_douyin_video() {
        let test_url = "3.02 复制打开抖音，看看【大马菲鱼的作品】魔都日记 # 潘敏  https://v.douyin.com/LTjjepu4yFg/ :9pm A@T.Yz ULw:/ 02/12";
        let result = parse_video_url(test_url).await;
        assert!(result.is_ok(), "Failed to parse: {:?}", result.err());
        let res = result.unwrap();
        println!("Parsed Title: {}", res.title);
        println!("Videos Count: {}", res.videos.len());
        assert!(!res.title.is_empty());
        assert!(!res.videos.is_empty());
    }
}
