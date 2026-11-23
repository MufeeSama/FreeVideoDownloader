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
      className="w-full film-panel p-5 rounded-2xl animate-slide-up"
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded bg-[var(--raised-bg)] border border-[var(--card-border)] flex items-center justify-center text-amber-600 dark:text-amber-500">
            <History className="w-3.5 h-3.5" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-[var(--text-primary)]">
              下载历史记录
            </h3>
            <p className="text-[11px] text-[var(--text-muted)] font-mono">
              共 {history.length} 条记录
            </p>
          </div>
        </div>

        {history.length > 0 && (
          <button
            type="button"
            onClick={onClearHistory}
            aria-label="清空所有下载历史记录"
            className="text-xs text-[#e5484d] hover:bg-[#e5484d]/10 px-2.5 py-1 rounded-md border border-[#e5484d]/20 flex items-center gap-1 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
            <span>清空记录</span>
          </button>
        )}
      </div>

      {/* Filter & Search Bar */}
      {history.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-3.5">
          <div className="relative flex-1 min-w-[180px]">
            <label htmlFor="search-history-input" className="sr-only">
              搜索下载历史记录
            </label>
            <Search className="w-3.5 h-3.5 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
            <input
              id="search-history-input"
              name="searchHistory"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoComplete="off"
              spellCheck={false}
              placeholder="搜索任务名称或平台…"
              className="w-full pl-8 pr-3 py-1.5 rounded-md text-xs bg-[var(--raised-bg)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] border border-[var(--card-border)] focus:outline-none focus:border-amber-500/80 transition-colors"
            />
          </div>

          <div className="flex items-center gap-0.5 p-0.5 rounded-md bg-[var(--raised-bg)] border border-[var(--card-border)]">
            <button
              type="button"
              aria-pressed={filterType === "all"}
              onClick={() => setFilterType("all")}
              className={`px-2.5 py-1 text-xs rounded font-medium transition-colors ${
                filterType === "all"
                  ? "bg-[var(--card-bg)] text-[var(--text-primary)] border border-[var(--card-border)]"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              }`}
            >
              全部
            </button>
            <button
              type="button"
              aria-pressed={filterType === "video"}
              onClick={() => setFilterType("video")}
              className={`px-2 py-1 text-xs rounded font-medium flex items-center gap-1 transition-colors ${
                filterType === "video"
                  ? "bg-[var(--card-bg)] text-[var(--text-primary)] border border-[var(--card-border)]"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              }`}
            >
              <Film className="w-3 h-3" aria-hidden="true" />
              <span>视频</span>
            </button>
            <button
              type="button"
              aria-pressed={filterType === "image"}
              onClick={() => setFilterType("image")}
              className={`px-2 py-1 text-xs rounded font-medium flex items-center gap-1 transition-colors ${
                filterType === "image"
                  ? "bg-[var(--card-bg)] text-[var(--text-primary)] border border-[var(--card-border)]"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              }`}
            >
              <Image className="w-3 h-3" aria-hidden="true" />
              <span>图集</span>
            </button>
            <button
              type="button"
              aria-pressed={filterType === "audio"}
              onClick={() => setFilterType("audio")}
              className={`px-2 py-1 text-xs rounded font-medium flex items-center gap-1 transition-colors ${
                filterType === "audio"
                  ? "bg-[var(--card-bg)] text-[var(--text-primary)] border border-[var(--card-border)]"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
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
        <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
          {filteredHistory.map((item) => (
            <TaskItem key={item.id} task={item} isHistory />
          ))}
        </div>
      ) : (
        <div className="py-12 flex flex-col items-center justify-center text-[var(--text-muted)] rounded-xl border border-dashed border-[var(--card-border)]">
          <div className="w-10 h-10 rounded bg-[var(--raised-bg)] border border-[var(--card-border)] flex items-center justify-center mb-2 text-[var(--text-muted)]">
            <Inbox className="w-5 h-5 stroke-[1.5]" aria-hidden="true" />
          </div>
          <p className="text-xs font-medium text-[var(--text-secondary)]">暂无下载记录</p>
          <p className="text-[11px] text-[var(--text-muted)] mt-0.5">解析下载完成的视频和图集将展示在此处</p>
        </div>
      )}
    </section>
  );
};
