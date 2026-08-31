import React, { useState } from "react";
import {
  Link2,
  Clipboard,
  Trash2,
  Sparkles,
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

  const platforms = [
    { name: "抖音", dot: "bg-rose-500" },
    { name: "TikTok", dot: "bg-cyan-400" },
    { name: "小红书", dot: "bg-red-500" },
    { name: "快手", dot: "bg-amber-500" },
    { name: "B站", dot: "bg-sky-400" },
    { name: "Instagram", dot: "bg-fuchsia-500" },
  ];

  return (
    <div className="w-full glass-panel p-6 rounded-3xl shadow-xl transition-shadow border border-slate-200/80 dark:border-slate-800/80">
      {/* Header Info & Mode Switch */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200/50 dark:border-indigo-800/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm">
            <Link2 className="w-4 h-4" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              短视频与高清图集解析
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              粘贴包含视频链接的分享文案或直链，秒级提取无水印资源
            </p>
          </div>
        </div>

        <button
          type="button"
          aria-pressed={isBatchMode}
          onClick={() => setIsBatchMode(!isBatchMode)}
          className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 active:scale-95 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none transition-all ${
            isBatchMode
              ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/30"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-700/70"
          }`}
        >
          <Layers className="w-3.5 h-3.5" aria-hidden="true" />
          <span>{isBatchMode ? "批量解析模式" : "单链接模式"}</span>
        </button>
      </div>

      {/* Input Field with subtle inner shadow & focus glow */}
      <label htmlFor="video-url-input" className="sr-only">
        短视频分享链接输入框
      </label>
      <div className="relative rounded-2xl border-2 border-slate-200/90 dark:border-slate-800 focus-within:border-indigo-500 dark:focus-within:border-indigo-500 focus-within:shadow-[0_0_20px_-4px_rgba(99,102,241,0.25)] transition-all bg-white/60 dark:bg-slate-900/60 overflow-hidden">
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
            placeholder="粘贴多行链接（每行一个短视频分享链接）…"
            className="w-full px-4 py-3 bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none resize-none font-mono"
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
            placeholder="在此粘贴分享文案（如：3.02 复制打开抖音… https://v.douyin.com/…）"
            className="w-full px-4 py-3.5 bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none"
          />
        )}
      </div>

      {/* Action Buttons & Platform Badges */}
      <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
        {/* Supported Platform Badges with colored indicator dot */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] text-slate-400 font-medium mr-1">支持平台:</span>
          {platforms.map((p) => (
            <span
              key={p.name}
              className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-slate-100/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700/50 flex items-center gap-1.5"
            >
              <span className={`w-1.5 h-1.5 rounded-full ${p.dot}`} aria-hidden="true" />
              <span>{p.name}</span>
            </span>
          ))}
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2 ml-auto">
          {value && (
            <button
              type="button"
              onClick={onClear}
              disabled={isLoading}
              aria-label="清空输入框内容"
              className="px-3 py-2 rounded-xl text-xs font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 active:scale-95 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none flex items-center gap-1.5 transition-colors disabled:opacity-50"
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
            className="px-3.5 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 active:scale-95 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <Clipboard className="w-3.5 h-3.5" aria-hidden="true" />
            <span>粘贴剪贴板</span>
          </button>

          <button
            type="button"
            onClick={onParse}
            disabled={isLoading || !value.trim()}
            aria-label={isLoading ? "正在解析提取视频资源" : "解析提取视频资源"}
            className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 hover:from-indigo-500 hover:to-violet-500 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:outline-none shadow-md shadow-indigo-500/25 flex items-center gap-2 transition-all disabled:opacity-50 disabled:pointer-events-none glow-accent"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                <span>解析中…</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
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
