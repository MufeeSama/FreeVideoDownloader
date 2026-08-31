use std::sync::atomic::{AtomicU16, Ordering};
use tokio::io::{AsyncReadExt, AsyncWriteExt};
use tokio::net::{TcpListener, TcpStream};

static PROXY_PORT: AtomicU16 = AtomicU16::new(0);

pub fn get_proxy_port() -> u16 {
    PROXY_PORT.load(Ordering::SeqCst)
}

pub async fn start_proxy_server() {
    let listener = match TcpListener::bind("127.0.0.1:0").await {
        Ok(l) => l,
        Err(e) => {
            eprintln!("[Proxy] Failed to bind local streaming proxy: {}", e);
            return;
        }
    };

    if let Ok(addr) = listener.local_addr() {
        let port = addr.port();
        PROXY_PORT.store(port, Ordering::SeqCst);
        println!("[Proxy] Local video streaming proxy listening on http://127.0.0.1:{}", port);
    }

    tokio::spawn(async move {
        loop {
            match listener.accept().await {
                Ok((stream, _)) => {
                    tokio::spawn(async move {
                        if let Err(e) = handle_connection(stream).await {
                            eprintln!("[Proxy] Connection error: {}", e);
                        }
                    });
                }
                Err(e) => {
                    eprintln!("[Proxy] Accept error: {}", e);
                }
            }
        }
    });
}

async fn handle_connection(mut stream: TcpStream) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    let mut buffer = [0u8; 4096];
    let n = stream.read(&mut buffer).await?;
    if n == 0 {
        return Ok(());
    }

    let request_str = String::from_utf8_lossy(&buffer[..n]);
    let mut lines = request_str.lines();
    let request_line = match lines.next() {
        Some(l) => l,
        None => return Ok(()),
    };

    let mut parts = request_line.split_whitespace();
    let method = parts.next().unwrap_or("GET");
    let path_and_query = parts.next().unwrap_or("/");

    if method == "OPTIONS" {
        let response = "HTTP/1.1 200 OK\r\nAccess-Control-Allow-Origin: *\r\nAccess-Control-Allow-Methods: GET, HEAD, OPTIONS\r\nAccess-Control-Allow-Headers: *\r\nContent-Length: 0\r\n\r\n";
        stream.write_all(response.as_bytes()).await?;
        return Ok(());
    }

    // Extract query parameters
    let (path, query) = if let Some(idx) = path_and_query.find('?') {
        (&path_and_query[..idx], &path_and_query[idx + 1..])
    } else {
        (path_and_query, "")
    };

    if !path.starts_with("/proxy") {
        let not_found = "HTTP/1.1 404 Not Found\r\nContent-Length: 0\r\n\r\n";
        stream.write_all(not_found.as_bytes()).await?;
        return Ok(());
    }

    let mut target_url = String::new();
    let mut platform = String::from("douyin");

    for pair in query.split('&') {
        if let Some((k, v)) = pair.split_once('=') {
            if k == "url" {
                target_url = url_decode(v);
            } else if k == "platform" {
                platform = url_decode(v);
            }
        }
    }

    if target_url.is_empty() {
        let bad_request = "HTTP/1.1 400 Bad Request\r\nContent-Length: 0\r\n\r\n";
        stream.write_all(bad_request.as_bytes()).await?;
        return Ok(());
    }

    // Extract Range header
    let mut range_header: Option<String> = None;
    for line in lines {
        if line.to_lowercase().starts_with("range:") {
            if let Some((_, val)) = line.split_once(':') {
                range_header = Some(val.trim().to_string());
            }
        }
    }

    // Determine referer
    let referer = match platform.to_lowercase().as_str() {
        "tiktok" => "https://www.tiktok.com/",
        "rednote" | "xhs" => "https://www.xiaohongshu.com/",
        "kuaishou" => "https://www.kuaishou.com/",
        "bilibili" => "https://www.bilibili.com/",
        _ => "https://www.douyin.com/",
    };

    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(30))
        .build()?;

    let mut req = client
        .get(&target_url)
        .header("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36")
        .header("Referer", referer)
        .header("Accept", "*/*");

    if let Some(ref r) = range_header {
        req = req.header("Range", r);
    }

    let mut resp = match req.send().await {
        Ok(r) => r,
        Err(e) => {
            eprintln!("[Proxy] Upstream request error for {}: {}", target_url, e);
            let err_resp = format!("HTTP/1.1 502 Bad Gateway\r\nContent-Length: {}\r\n\r\n{}", e.to_string().len(), e);
            stream.write_all(err_resp.as_bytes()).await?;
            return Ok(());
        }
    };

    let status = resp.status();
    let status_code = status.as_u16();
    let status_text = status.canonical_reason().unwrap_or("OK");

    let content_type = resp
        .headers()
        .get("content-type")
        .and_then(|v| v.to_str().ok())
        .unwrap_or("video/mp4");

    let content_length = resp
        .headers()
        .get("content-length")
        .and_then(|v| v.to_str().ok());

    let content_range = resp
        .headers()
        .get("content-range")
        .and_then(|v| v.to_str().ok());

    let mut response_headers = format!(
        "HTTP/1.1 {} {}\r\nAccess-Control-Allow-Origin: *\r\nAccept-Ranges: bytes\r\nContent-Type: {}\r\n",
        status_code, status_text, content_type
    );

    if let Some(cl) = content_length {
        response_headers.push_str(&format!("Content-Length: {}\r\n", cl));
    }
    if let Some(cr) = content_range {
        response_headers.push_str(&format!("Content-Range: {}\r\n", cr));
    }
    response_headers.push_str("Connection: close\r\n\r\n");

    stream.write_all(response_headers.as_bytes()).await?;

    if method == "HEAD" {
        return Ok(());
    }

    // Stream body chunks
    while let Some(chunk) = resp.chunk().await? {
        if stream.write_all(&chunk).await.is_err() {
            break;
        }
    }

    let _ = stream.shutdown().await;
    Ok(())
}

fn url_decode(s: &str) -> String {
    let mut result = Vec::new();
    let bytes = s.as_bytes();
    let mut i = 0;
    while i < bytes.len() {
        if bytes[i] == b'%' && i + 2 < bytes.len() {
            if let Ok(byte) = u8::from_str_radix(std::str::from_utf8(&bytes[i + 1..i + 3]).unwrap_or(""), 16) {
                result.push(byte);
                i += 3;
                continue;
            }
        } else if bytes[i] == b'+' {
            result.push(b' ');
            i += 1;
            continue;
        }
        result.push(bytes[i]);
        i += 1;
    }
    String::from_utf8_lossy(&result).to_string()
}
