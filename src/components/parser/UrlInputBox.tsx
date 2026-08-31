import React, { useState } from "react";
import {
  Link2,
  Clipboard,
  Trash2,
  Sparkles,
  Loader2,
  Layers,
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
    { name: "抖音", color: "from-black to-slate-800" },
    { name: "TikTok", color: "from-cyan-500 to-pink-500" },
    { name: "小红书", color: "from-red-500 to-rose-600" },
    { name: "快手", color: "from-amber-500 to-orange-500" },
    { name: "B站", color: "from-blue-400 to-pink-400" },
    { name: "Instagram", color: "from-purple-500 to-pink-500" },
  ];

  return (
    <div className="w-full glass-panel p-6 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200/80 dark:border-slate-800/80 transition-all">
      {/* Header Info & Mode Switch */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-violet-100 dark:bg-violet-950/80 flex items-center justify-center text-violet-600 dark:text-violet-400">
            <Link2 className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              短视频 / 图集解析提取
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              支持抖音、小红书、TikTok、快手等多平台分享链接或复制文案
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsBatchMode(!isBatchMode)}
          className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all ${
            isBatchMode
              ? "bg-violet-600 text-white shadow-md shadow-violet-500/30"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>{isBatchMode ? "批量解析模式" : "单链接模式"}</span>
        </button>
      </div>

      {/* Input Field */}
      <div className="relative rounded-2xl border-2 border-slate-200 dark:border-slate-800 focus-within:border-violet-500 dark:focus-within:border-violet-500 transition-all bg-white/50 dark:bg-slate-900/50 overflow-hidden">
        {isBatchMode ? (
          <textarea
            rows={4}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="粘贴多行链接（每行一个短视频分享链接）..."
            className="w-full px-4 py-3 bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none resize-none font-mono"
          />
        ) : (
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="在此粘贴包含视频链接的分享文本（例如：3.02 复制打开抖音... https://v.douyin.com/...）"
            className="w-full px-4 py-3.5 bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none"
          />
        )}
      </div>

      {/* Action Buttons & Platform Badges */}
      <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
        {/* Supported Platform Badges */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] text-slate-400 font-medium mr-1">支持平台:</span>
          {platforms.map((p) => (
            <span
              key={p.name}
              className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700/50"
            >
              {p.name}
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
              className="px-3 py-2 rounded-xl text-xs font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>清空</span>
            </button>
          )}

          <button
            type="button"
            onClick={onPaste}
            disabled={isLoading}
            className="px-3.5 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <Clipboard className="w-3.5 h-3.5" />
            <span>粘贴剪贴板</span>
          </button>

          <button
            type="button"
            onClick={onParse}
            disabled={isLoading || !value.trim()}
            className="px-6 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-md shadow-violet-500/25 flex items-center gap-2 transition-all transform active:scale-95 disabled:opacity-50 disabled:pointer-events-none glow-accent"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>解析中...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>解析提取</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
