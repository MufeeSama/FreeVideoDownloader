import React, { useState } from "react";
import { DownloadTaskRecord } from "../../types";
import { TaskItem } from "./TaskItem";
import { History, Trash2, Search, Film, Image, Music, Inbox } from "lucide-react";

interface HistoryListProps {
  history: DownloadTaskRecord[];
  onClearHistory: () => void;
  isLoading?: boolean;
}

export const HistoryList: React.FC<HistoryListProps> = ({
  history,
  onClearHistory,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");

  const filteredHistory = history.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.platform.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;
    if (filterType === "all") return true;
    return item.media_type === filterType;
  });

  return (
    <section
      role="region"
      aria-label="下载历史记录"
      className="w-full glass-panel p-6 rounded-3xl shadow-xl border border-slate-200/80 dark:border-slate-800/80 animate-slide-up"
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200/50 dark:border-indigo-800/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <History className="w-4 h-4" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              下载历史记录
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              共保存 {history.length} 条已解析下载的媒体记录
            </p>
          </div>
        </div>

        {history.length > 0 && (
          <button
            type="button"
            onClick={onClearHistory}
            aria-label="清空所有下载历史记录"
            className="text-xs text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 active:scale-95 focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:outline-none px-2.5 py-1.5 rounded-xl border border-rose-200/40 dark:border-rose-800/30 flex items-center gap-1.5 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
            <span>清空记录</span>
          </button>
        )}
      </div>

      {/* Filter & Search Bar */}
      {history.length > 0 && (
        <div className="flex flex-wrap items-center gap-2.5 mb-4">
          <div className="relative flex-1 min-w-[200px]">
            <label htmlFor="search-history-input" className="sr-only">
              搜索下载历史记录
            </label>
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" aria-hidden="true" />
            <input
              id="search-history-input"
              name="searchHistory"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoComplete="off"
              spellCheck={false}
              placeholder="搜索历史任务名称或平台…"
              className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-slate-100/90 dark:bg-slate-800/90 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 border border-slate-200/60 dark:border-slate-700/60 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none transition-colors"
            />
          </div>

          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50">
            <button
              type="button"
              aria-pressed={filterType === "all"}
              onClick={() => setFilterType("all")}
              className={`px-3 py-1 text-xs rounded-lg font-medium active:scale-95 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none transition-all ${
                filterType === "all"
                  ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm font-semibold"
                  : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
              }`}
            >
              全部
            </button>
            <button
              type="button"
              aria-pressed={filterType === "video"}
              onClick={() => setFilterType("video")}
              className={`px-2.5 py-1 text-xs rounded-lg font-medium flex items-center gap-1.5 active:scale-95 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none transition-all ${
                filterType === "video"
                  ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm font-semibold"
                  : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
              }`}
            >
              <Film className="w-3 h-3" aria-hidden="true" />
              <span>视频</span>
            </button>
            <button
              type="button"
              aria-pressed={filterType === "image"}
              onClick={() => setFilterType("image")}
              className={`px-2.5 py-1 text-xs rounded-lg font-medium flex items-center gap-1.5 active:scale-95 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none transition-all ${
                filterType === "image"
                  ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm font-semibold"
                  : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
              }`}
            >
              <Image className="w-3 h-3" aria-hidden="true" />
              <span>图集</span>
            </button>
            <button
              type="button"
              aria-pressed={filterType === "audio"}
              onClick={() => setFilterType("audio")}
              className={`px-2.5 py-1 text-xs rounded-lg font-medium flex items-center gap-1.5 active:scale-95 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none transition-all ${
                filterType === "audio"
                  ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm font-semibold"
                  : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
              }`}
            >
              <Music className="w-3 h-3" aria-hidden="true" />
              <span>音频</span>
            </button>
          </div>
        </div>
      )}

      {/* Task List or Empty State */}
      {filteredHistory.length > 0 ? (
        <div className="space-y-2.5 max-h-[400px] overflow-y-auto pr-1">
          {filteredHistory.map((item) => (
            <TaskItem key={item.id} task={item} isHistory />
          ))}
        </div>
      ) : (
        <div className="py-14 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800/80">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800/80 flex items-center justify-center mb-3">
            <Inbox className="w-6 h-6 stroke-[1.5] text-slate-400" aria-hidden="true" />
          </div>
          <p className="text-xs font-medium text-slate-600 dark:text-slate-400">暂无下载历史记录</p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">解析下载的视频和图集将自动记录在这里</p>
        </div>
      )}
    </section>
  );
};
