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
    <div className="w-full glass-panel p-6 rounded-3xl shadow-xl border border-slate-200/80 dark:border-slate-800/80 animate-slide-up">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-violet-100 dark:bg-violet-950/80 flex items-center justify-center text-violet-600 dark:text-violet-400">
            <History className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            下载历史记录 ({history.length})
          </h3>
        </div>

        {history.length > 0 && (
          <button
            type="button"
            onClick={onClearHistory}
            className="text-xs text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>清空记录</span>
          </button>
        )}
      </div>

      {/* Filter & Search Bar */}
      {history.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="搜索历史任务名称或平台..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl text-xs bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-violet-500"
            />
          </div>

          <div className="flex items-center gap-1 p-0.5 rounded-xl bg-slate-100 dark:bg-slate-800">
            <button
              onClick={() => setFilterType("all")}
              className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all ${
                filterType === "all"
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
              }`}
            >
              全部
            </button>
            <button
              onClick={() => setFilterType("video")}
              className={`px-2 py-1 text-xs rounded-lg font-medium flex items-center gap-1 transition-all ${
                filterType === "video"
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
              }`}
            >
              <Film className="w-3 h-3" />
              <span>视频</span>
            </button>
            <button
              onClick={() => setFilterType("image")}
              className={`px-2 py-1 text-xs rounded-lg font-medium flex items-center gap-1 transition-all ${
                filterType === "image"
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
              }`}
            >
              <Image className="w-3 h-3" />
              <span>图集</span>
            </button>
            <button
              onClick={() => setFilterType("audio")}
              className={`px-2 py-1 text-xs rounded-lg font-medium flex items-center gap-1 transition-all ${
                filterType === "audio"
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
              }`}
            >
              <Music className="w-3 h-3" />
              <span>音频</span>
            </button>
          </div>
        </div>
      )}

      {/* Task List or Empty State */}
      {filteredHistory.length > 0 ? (
        <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
          {filteredHistory.map((item) => (
            <TaskItem key={item.id} task={item} isHistory />
          ))}
        </div>
      ) : (
        <div className="py-12 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
          <Inbox className="w-10 h-10 stroke-[1.2] mb-2 opacity-50" />
          <p className="text-xs">暂无下载历史记录</p>
        </div>
      )}
    </div>
  );
};
