use crate::models::{
    EntitlementResponse, GateResponse, RawMoreSizeResponse, RawParseApiResponse, VideoItem,
    VideoParseResult, VideoQualityInfo,
};
use aes::cipher::{block_padding::Pkcs7, BlockDecryptMut, KeyIvInit};
use aes_gcm::{aead::Aead, Aes256Gcm, KeyInit, Nonce};
use base64::{engine::general_purpose::STANDARD as BASE64, Engine as _};
use rand::RngCore;
use reqwest::header::{HeaderMap, HeaderValue, CONTENT_TYPE, COOKIE, ORIGIN, REFERER, SET_COOKIE, USER_AGENT};
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

fn get_platform_and_path(raw_input: &str) -> (&'static str, &'static str) {
    if raw_input.contains("douyin.com") || raw_input.contains("iesdouyin") {
        ("douyin", "/zh/douyin")
    } else if raw_input.contains("tiktok.com") {
        ("tiktok", "/zh")
    } else if raw_input.contains("xiaohongshu.com") || raw_input.contains("xhslink.com") {
        ("rednote", "/zh/rednote")
    } else if raw_input.contains("kuaishou.com") || raw_input.contains("kwai") {
        ("kuaishou", "/zh/kuaishou")
    } else if raw_input.contains("bilibili.com") || raw_input.contains("b23.tv") {
        ("bilibili", "/zh")
    } else {
        ("other", "/zh")
    }
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

// More-Size 响应解密：变换流程与主解析一致，但密钥为 SHA256(moreSizeToken)
pub fn decrypt_more_size_response(enc_data: &str, enc_iv: &str, token: &str) -> Result<serde_json::Value, String> {
    let c4 = custom_substitute(&reverse_chunks(&xor_str(enc_data, 90), 8));
    let i4 = custom_substitute(&reverse_chunks(&xor_str(enc_iv, 90), 8));

    let cipher_bytes = BASE64.decode(c4).map_err(|e| format!("Base64 decode data error: {}", e))?;
    let iv_bytes = BASE64.decode(i4).map_err(|e| format!("Base64 decode iv error: {}", e))?;

    if iv_bytes.len() != 16 {
        return Err(format!("Invalid IV length: expected 16, got {}", iv_bytes.len()));
    }

    let mut hasher = Sha256::new();
    hasher.update(token.as_bytes());
    let key = hasher.finalize();

    let decryptor = Aes256CbcDec::new(key.as_slice().into(), iv_bytes.as_slice().into());
    let mut buf = cipher_bytes.clone();
    let decrypted_slice = decryptor.decrypt_padded_mut::<Pkcs7>(&mut buf)
        .map_err(|e| format!("AES-256-CBC decrypt failed: {:?}", e))?;

    let json_str = String::from_utf8(decrypted_slice.to_vec())
        .map_err(|e| format!("UTF-8 decode failed: {}", e))?;

    serde_json::from_str(&json_str).map_err(|e| format!("JSON parse error: {}", e))
}

// 通过 more-size 端点换取 4K/原画变体（密钥为 SHA256(moreSizeToken)）
async fn fetch_more_size_variants(client: &reqwest::Client, input: &str, token: &str) -> Result<Vec<(u64, VideoQualityInfo)>, String> {
    let mut headers = HeaderMap::new();
    headers.insert(CONTENT_TYPE, HeaderValue::from_static("application/json"));
    headers.insert(ORIGIN, HeaderValue::from_static("https://www.hellotik.app"));
    headers.insert(REFERER, HeaderValue::from_static("https://www.hellotik.app/zh"));
    headers.insert(
        "X-More-Size-Token",
        HeaderValue::from_str(token).map_err(|e| e.to_string())?,
    );

    let res = client.post("https://www.hellotik.app/api/more-size")
        .headers(headers)
        .json(&serde_json::json!({ "input": input }))
        .send()
        .await
        .map_err(|e| format!("More-size request failed: {}", e))?;

    let status = res.status();
    let raw: RawMoreSizeResponse = res.json().await
        .map_err(|e| format!("Failed to parse more-size response: {}", e))?;

    if !status.is_success() {
        return Err(format!("More-size failed ({}): {}", status, raw.error.unwrap_or_default()));
    }
    if raw.encrypt != Some(true) {
        return Err("More-size response not encrypted as expected".into());
    }
    let data = raw.data.ok_or("More-size data field missing")?;
    let iv = raw.iv.ok_or("More-size iv field missing")?;

    let decrypted = decrypt_more_size_response(&data, &iv, token)?;

    let mut out: Vec<(u64, bool, VideoQualityInfo)> = Vec::new(); // (height, is_original, info)
    // variants 数组：每个含 url 与 redirected，分辨率需从 url 的 br 码率推断
    if let Some(variants) = decrypted.get("variants").and_then(|v| v.as_array()) {
        for v in variants {
            if v.get("redirected").and_then(|x| x.as_bool()) != Some(true) {
                continue;
            }
            let url = match v.get("url").and_then(|u| u.as_str()) {
                Some(u) => u.to_string(),
                None => continue,
            };
            let br = extract_br(&url);
            let height = infer_height_from_br(br);
            // 无 br 参数的是原画直链（码率远高于带 br 的转码版），优先保留
            let is_original = br.is_none();
            out.push((height, is_original, VideoQualityInfo {
                r#type: quality_label(height, is_original),
                url,
                size: None,
                formatted_size: None,
            }));
        }
    }
    // 顶层 url（无 br 参数）为 4K 原画直链
    if let Some(url) = decrypted.get("url").and_then(|u| u.as_str()) {
        if url.starts_with("http") {
            out.push((2160, true, VideoQualityInfo {
                r#type: quality_label(2160, true),
                url: url.to_string(),
                size: None,
                formatted_size: None,
            }));
        }
    }
    // 排序：原画优先于转码版，其次高分辨率优先，确保去重时真原画先占位
    out.sort_by(|a, b| {
        b.1.cmp(&a.1)          // is_original desc
            .then(b.0.cmp(&a.0)) // height desc
    });
    Ok(out.into_iter().map(|(h, _, i)| (h, i)).collect())
}

// 从抖音直链 url 中提取 br（码率）参数
fn extract_br(url: &str) -> Option<u64> {
    let idx = url.find("br=")?;
    let rest = &url[idx + 3..];
    let end = rest.find('&').unwrap_or(rest.len());
    rest[..end].parse().ok()
}

// 用 ffprobe 实测校准的码率→高度映射（hevc/h264 通用阈值）
fn infer_height_from_br(br: Option<u64>) -> u64 {
    match br {
        Some(b) if b >= 4000 => 2160,
        Some(b) if b >= 3000 => 1440,
        Some(b) if b >= 2000 => 1080,
        Some(b) if b >= 1000 => 720,
        Some(_) => 540,
        None => 2160,
    }
}

// 根据高度推断清晰度标签；is_original 区分真原画直链与转码版（仅 4K 档有意义）
fn quality_label(height: u64, is_original: bool) -> String {
    if height >= 2160 {
        if is_original {
            "4K 原画".into()
        } else {
            "4K".into()
        }
    } else if height >= 1440 {
        "2K".into()
    } else if height >= 1080 {
        "1080p".into()
    } else if height >= 720 {
        "720p".into()
    } else if height >= 540 {
        "540p".into()
    } else {
        format!("{}p", height)
    }
}

// 清晰度标签→高度，用于主解析变体与 more-size 变体之间的高度去重
fn quality_label_height(label: &str) -> u64 {
    match label {
        "4K 原画" | "4K" | "原画" => 2160,
        "2K" => 1440,
        "1080p" => 1080,
        "720p" => 720,
        "540p" => 540,
        other => other
            .trim_end_matches('p')
            .parse()
            .unwrap_or(0),
    }
}

// 清晰度排序：4K/原画 > 2K > 1080p > 720p > 540p > 其它
fn quality_rank(label: &str) -> u32 {
    match label {
        "4K 原画" | "原画" => 0,
        "4K" => 1,
        "2K" => 2,
        "1080p" => 3,
        "720p" => 4,
        "540p" => 5,
        _ => 6,
    }
}

fn sort_quality(list: &mut [VideoQualityInfo]) {
    list.sort_by(|a, b| {
        quality_rank(&a.r#type)
            .cmp(&quality_rank(&b.r#type))
            .then_with(|| b.size.unwrap_or(0).cmp(&a.size.unwrap_or(0)))
    });
}

pub async fn parse_video_url(raw_input: &str) -> Result<VideoParseResult, String> {
    let client = reqwest::Client::builder()
        .timeout(Duration::from_secs(20))
        .cookie_store(true)
        .build()
        .map_err(|e| e.to_string())?;

    let (platform_str, page_path) = get_platform_and_path(raw_input);
    let uwx_id = format!("uwxs_{}", &uuid::Uuid::new_v4().simple().to_string()[..12]);
    let external_request_id = uuid::Uuid::new_v4().to_string();

    let mut base_headers = HeaderMap::new();
    base_headers.insert(
        USER_AGENT,
        HeaderValue::from_static("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"),
    );
    base_headers.insert(CONTENT_TYPE, HeaderValue::from_static("application/json"));
    base_headers.insert(ORIGIN, HeaderValue::from_static("https://www.hellotik.app"));
    base_headers.insert(
        REFERER,
        HeaderValue::from_str(&format!("https://www.hellotik.app{}", page_path))
            .map_err(|e| e.to_string())?,
    );

    // 1. Entitlement Status (Get quoteToken)
    let ent_body = serde_json::json!({
        "requestURL": raw_input.trim(),
        "isMobile": "false",
        "isoCode": "Other",
        "adType": "adsense",
        "uwx_id": uwx_id,
        "successCount": "0",
        "totalSuccessCount": "1",
        "firstSuccessDate": "2026-08-31",
        "geoipIp": "",
        "pagePath": page_path,
        "externalRequestId": external_request_id,
        "browserQuota": {
            "rewardRequired": false,
            "dailyUsed": 0,
            "dailyLimit": 10,
            "totalSuccessCount": 1
        },
        "request_url": raw_input.trim(),
        "page_path": page_path
    });

    let ent_res = client.post("https://www.hellotik.app/api/parse-entitlement-status")
        .headers(base_headers.clone())
        .json(&ent_body)
        .send()
        .await
        .map_err(|e| format!("Entitlement status request failed: {}", e))?;

    let ent_data: EntitlementResponse = ent_res.json().await
        .map_err(|e| format!("Failed to parse entitlement response: {}", e))?;

    let quote_token = match ent_data.quote_token {
        Some(token) => token,
        None => {
            if let Some(data) = ent_data.data {
                if let Some(msg) = data.get("quoteMessageZh").and_then(|v| v.as_str()) {
                    return Err(format!("解析权限限制: {}", msg));
                }
            }
            return Err(ent_data.error.or(ent_data.message).unwrap_or_else(|| "获取解析凭证失败，请稍后重试".into()));
        }
    };

    // 2. Gate Auth
    let gate_body = serde_json::json!({
        "requestURL": raw_input.trim(),
        "isBatch": false,
        "mode": "single"
    });

    let gate_res = client.post("https://www.hellotik.app/api/gate-e5eea8")
        .headers(base_headers.clone())
        .json(&gate_body)
        .send()
        .await
        .map_err(|e| format!("Gate auth request failed: {}", e))?;

    let mut session_cookie: Option<String> = None;
    if let Some(cookie_val) = gate_res.headers().get(SET_COOKIE) {
        if let Ok(c_str) = cookie_val.to_str() {
            if let Some(first_part) = c_str.split(';').next() {
                session_cookie = Some(first_part.to_string());
            }
        }
    }

    let gate_data: GateResponse = gate_res.json().await
        .map_err(|e| format!("Failed to parse gate response: {}", e))?;

    let ticket = gate_data.ticket.ok_or("Missing ticket from gate auth")?;
    let seed = gate_data.seed.ok_or("Missing seed from gate auth")?;

    // 3. Derive AES-256-GCM Key from SHA256(ticket:seed)
    let mut hasher = Sha256::new();
    hasher.update(format!("{}:{}", ticket, seed).as_bytes());
    let derived_key = hasher.finalize();

    // 4. Encrypt Request Payload
    let mut iv = [0u8; 12];
    rand::thread_rng().fill_bytes(&mut iv);
    let nonce = Nonce::from_slice(&iv);

    let cipher = Aes256Gcm::new_from_slice(&derived_key)
        .map_err(|e| format!("Failed to create AES-GCM cipher: {}", e))?;

    let payload_json = serde_json::json!({
        "requestURL": raw_input.trim(),
        "isMobile": "false",
        "isoCode": "Other",
        "adType": "adsense",
        "uwx_id": uwx_id,
        "successCount": "0",
        "totalSuccessCount": "1",
        "firstSuccessDate": "2026-08-31",
        "geoipIp": "",
        "pagePath": page_path,
        "externalRequestId": external_request_id,
        "browserQuota": {
            "rewardRequired": false,
            "dailyUsed": 0,
            "dailyLimit": 10,
            "totalSuccessCount": 1
        },
        "quoteToken": quote_token,
        "qualityTier": "hd"
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

    // 5. Send Parse Request
    let mut parse_headers = base_headers.clone();
    if let Some(cookie_str) = session_cookie {
        if let Ok(val) = HeaderValue::from_str(&cookie_str) {
            parse_headers.insert(COOKIE, val);
        }
    }

    let parse_res = client.post("https://www.hellotik.app/api/parse")
        .headers(parse_headers)
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

    // 6. Transform to VideoParseResult
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

    // 7. Fetch 4K/原画 variants via more-size endpoint when token present
    if let Some(first_video) = videos.first_mut() {
        if let Some(token) = final_data.get("moreSizeToken").and_then(|v| v.as_str()) {
            match fetch_more_size_variants(&client, raw_input.trim(), token).await {
                Ok(extra) if !extra.is_empty() => {
                    let mut fullinfo = first_video.video_fullinfo.take().unwrap_or_default();
                    // 用高度做去重键：主解析变体按 type 推断高度，more-size 变体按高度去重
                    for (height, q) in extra {
                        let dup = fullinfo.iter().any(|e| quality_label_height(&e.r#type) == height);
                        if !dup {
                            fullinfo.push(q);
                        }
                    }
                    sort_quality(&mut fullinfo);
                    first_video.video_fullinfo = Some(fullinfo);
                }
                _ => {}
            }
        }
    }

    let pics: Option<Vec<String>> = final_data.get("pics").and_then(|p| p.as_array()).map(|arr| {
        arr.iter().filter_map(|item| item.as_str().map(|s| s.to_string())).collect()
    });

    let audio_url = final_data.get("music").and_then(|m| m.get("url")).and_then(|u| u.as_str()).map(|s| s.to_string())
        .or_else(|| final_data.get("music_url").and_then(|u| u.as_str()).map(|s| s.to_string()));

    let platform = platform_str.to_string();

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
        for (i, v) in res.videos.iter().enumerate() {
            println!("--- Video {} ---", i);
            println!("  default url: {}", v.url);
            if let Some(full) = &v.video_fullinfo {
                for q in full {
                    println!("  quality: {} | size: {:?} | url: {}", q.r#type, q.formatted_size, q.url);
                }
            } else {
                println!("  (no video_fullinfo)");
            }
        }
        assert!(!res.title.is_empty());
        assert!(!res.videos.is_empty());
    }
}
