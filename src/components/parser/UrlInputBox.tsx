import React, { useState } from "react";
import {
  Link2,
  Clipboard,
  Trash2,
  Film,
  Loader2,
  Layers,
  CornerDownLeft,
} from "lucide-react";

interface UrlInputBoxProps {
  value: string;
  onChange: (value: string) => void;
  onParse: () => void;
  onPaste: () => void;
  onClear: () => void;
  isLoading: boolean;
}

export const UrlInputBox: React.FC<UrlInputBoxProps> = ({
  value,
  onChange,
  onParse,
  onPaste,
  onClear,
  isLoading,
}) => {
  const [isBatchMode, setIsBatchMode] = useState(false);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isBatchMode && !isLoading && value.trim()) {
      e.preventDefault();
      onParse();
    }
  };

  const platforms = ["抖音", "小红书", "快手", "B站", "TikTok", "Instagram"];

  return (
    <div className="w-full film-panel p-5 rounded-2xl">
      {/* Header Info & Mode Switch */}
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-[var(--raised-bg)] border border-[var(--card-border)] flex items-center justify-center text-amber-600 dark:text-amber-500">
            <Link2 className="w-3.5 h-3.5" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-xs font-semibold text-[var(--text-primary)]">
              短视频与图集解析
            </h2>
            <p className="text-[11px] text-[var(--text-muted)]">
              粘贴包含视频链接的分享文案，提取无水印媒体
            </p>
          </div>
        </div>

        <button
          type="button"
          aria-pressed={isBatchMode}
          onClick={() => setIsBatchMode(!isBatchMode)}
          className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 focus-visible:ring-1 focus-visible:ring-amber-500 focus-visible:outline-none transition-colors ${
            isBatchMode
              ? "bg-[var(--text-primary)] text-[var(--bg-main)]"
              : "bg-[var(--raised-bg)] text-[var(--text-muted)] hover:text-[var(--text-primary)] border border-[var(--card-border)]"
          }`}
        >
          <Layers className="w-3 h-3" aria-hidden="true" />
          <span>{isBatchMode ? "批量模式" : "单链接"}</span>
        </button>
      </div>

      {/* Input Field with crisp border */}
      <label htmlFor="video-url-input" className="sr-only">
        短视频分享链接输入框
      </label>
      <div className="relative rounded-xl border border-[var(--card-border)] focus-within:border-amber-500/80 bg-[var(--raised-bg)] transition-colors overflow-hidden">
        {isBatchMode ? (
          <textarea
            id="video-url-input"
            name="videoUrl"
            rows={4}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            placeholder="粘贴多行链接（每行一条短视频分享链接）…"
            className="w-full px-3.5 py-2.5 bg-transparent text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none resize-none font-mono"
          />
        ) : (
          <input
            id="video-url-input"
            name="videoUrl"
            type="url"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            placeholder="粘贴分享文案（如：3.02 复制打开抖音… https://v.douyin.com/…）"
            className="w-full px-3.5 py-2.5 bg-transparent text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none"
          />
        )}
      </div>

      {/* Action Buttons & Platform Badges */}
      <div className="flex flex-wrap items-center justify-between gap-3 mt-3.5">
        {/* Supported Platform Badges */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] text-[var(--text-muted)]">支持:</span>
          {platforms.map((p) => (
            <span
              key={p}
              className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--raised-bg)] text-[var(--text-muted)] border border-[var(--card-border)]"
            >
              {p}
            </span>
          ))}
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-1.5 ml-auto">
          {value && (
            <button
              type="button"
              onClick={onClear}
              disabled={isLoading}
              aria-label="清空输入框内容"
              className="px-2.5 py-1.5 rounded-md text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--raised-bg)] focus-visible:ring-1 focus-visible:ring-amber-500 focus-visible:outline-none flex items-center gap-1 transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
              <span>清空</span>
            </button>
          )}

          <button
            type="button"
            onClick={onPaste}
            disabled={isLoading}
            aria-label="从剪贴板粘贴文本"
            className="px-3 py-1.5 rounded-md text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--raised-bg)] hover:bg-[var(--bg-deep)] border border-[var(--card-border)] focus-visible:ring-1 focus-visible:ring-amber-500 focus-visible:outline-none flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <Clipboard className="w-3.5 h-3.5" aria-hidden="true" />
            <span>粘贴</span>
          </button>

          <button
            type="button"
            onClick={onParse}
            disabled={isLoading || !value.trim()}
            aria-label={isLoading ? "正在解析提取视频资源" : "解析提取视频资源"}
            className="px-4 py-1.5 rounded-md text-xs font-medium text-white bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600 dark:text-zinc-950 focus-visible:ring-1 focus-visible:ring-amber-500 focus-visible:outline-none flex items-center gap-1.5 transition-colors disabled:opacity-50 disabled:pointer-events-none shadow-xs"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                <span>解析中…</span>
              </>
            ) : (
              <>
                <Film className="w-3.5 h-3.5" aria-hidden="true" />
                <span>解析提取</span>
                {!isBatchMode && (
                  <CornerDownLeft className="w-3 h-3 opacity-60 ml-0.5" aria-hidden="true" />
                )}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
