import { useState, useEffect, useRef, useCallback } from "react";
import { readText } from "@tauri-apps/plugin-clipboard-manager";

const URL_PATTERNS = [
  /https?:\/\/v\.douyin\.com\/[a-zA-Z0-9_\-]+/,
  /https?:\/\/www\.douyin\.com\/[^\s]+/,
  /https?:\/\/www\.tiktok\.com\/[^\s]+/,
  /https?:\/\/vt\.tiktok\.com\/[a-zA-Z0-9_\-]+/,
  /https?:\/\/xhslink\.com\/[a-zA-Z0-9_\-]+/,
  /https?:\/\/www\.xiaohongshu\.com\/[^\s]+/,
  /https?:\/\/v\.kuaishou\.com\/[a-zA-Z0-9_\-]+/,
  /https?:\/\/www\.kuaishou\.com\/[^\s]+/,
  /https?:\/\/b23\.tv\/[a-zA-Z0-9_\-]+/,
  /https?:\/\/www\.bilibili\.com\/video\/[^\s]+/,
  /https?:\/\/www\.instagram\.com\/[^\s]+/,
  /https?:\/\/[^\s]+/,
];

export function extractUrl(text: string): string | null {
  if (!text || typeof text !== "string") return null;
  for (const pattern of URL_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      return match[0];
    }
  }
  return null;
}

export function useClipboard(enabled: boolean = true) {
  const [detectedText, setDetectedText] = useState<string | null>(null);
  const lastProcessedText = useRef<string>("");

  const checkClipboard = useCallback(async () => {
    if (!enabled) return;
    try {
      let text = "";
      try {
        text = await readText();
      } catch {
        text = await navigator.clipboard.readText();
      }

      if (!text || text.trim() === "" || text === lastProcessedText.current) {
        return;
      }

      const foundUrl = extractUrl(text);
      if (foundUrl) {
        lastProcessedText.current = text;
        setDetectedText(text);
      }
    } catch {
      // ignore clipboard permission error if window not focused
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;

    // Check on window focus
    const onFocus = () => {
      checkClipboard();
    };

    window.addEventListener("focus", onFocus);
    const interval = setInterval(checkClipboard, 2000);

    return () => {
      window.removeEventListener("focus", onFocus);
      clearInterval(interval);
    };
  }, [enabled, checkClipboard]);

  const pasteFromClipboard = async (): Promise<string | null> => {
    try {
      let text = "";
      try {
        text = await readText();
      } catch {
        text = await navigator.clipboard.readText();
      }
      return text;
    } catch (e) {
      console.warn("Failed to paste from clipboard:", e);
      return null;
    }
  };

  const clearDetected = () => {
    setDetectedText(null);
  };

  return {
    detectedText,
    clearDetected,
    checkClipboard,
    pasteFromClipboard,
  };
}
