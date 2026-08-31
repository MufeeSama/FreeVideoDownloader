import React from "react";
import { DownloadTaskRecord } from "../../types";
import {
  Film,
  Image as ImageIcon,
  Music,
  X,
  CheckCircle2,
  AlertCircle,
  FolderOpen,
  Loader2,
} from "lucide-react";
import { tauriApi } from "../../services/tauriApi";

interface TaskItemProps {
  task: DownloadTaskRecord;
  onCancel?: (id: string) => void;
  isHistory?: boolean;
}

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onCancel,
  isHistory = false,
}) => {
  const formatSpeed = (bytesPerSec?: number) => {
    if (!bytesPerSec || bytesPerSec <= 0) return "0.00 MB/s";
    const mb = bytesPerSec / (1024 * 1024);
    return `${mb.toFixed(2)} MB/s`;
  };

  const formatBytes = (bytes?: number) => {
    if (!bytes || bytes <= 0) return "0 MB";
    const mb = bytes / (1024 * 1024);
    if (mb > 1) {
      return `${mb.toFixed(1)} MB`;
    }
    return `${(bytes / 1024).toFixed(0)} KB`;
  };

  const getIcon = () => {
    switch (task.media_type) {
      case "image":
        return <ImageIcon className="w-4 h-4 text-emerald-500" aria-hidden="true" />;
      case "audio":
        return <Music className="w-4 h-4 text-pink-500" aria-hidden="true" />;
      default:
        return <Film className="w-4 h-4 text-indigo-500" aria-hidden="true" />;
    }
  };

  return (
    <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col gap-2.5 transition-all hover:border-indigo-500/40">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200/50 dark:border-slate-700/50 flex items-center justify-center shrink-0">
            {getIcon()}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate tracking-tight">
              {task.title}
            </h4>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] font-mono text-slate-400">
                {task.platform.toUpperCase()}
              </span>
              {task.quality && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-medium border border-indigo-200/40 dark:border-indigo-800/40">
                  {task.quality}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Status / Action Controls */}
        <div className="flex items-center gap-2">
          {isHistory ? (
            <>
              {task.status === "completed" && (
                <span className="text-xs text-emerald-500 flex items-center gap-1 font-medium bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-200/40 dark:border-emerald-800/30">
                  <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>已完成</span>
                </span>
              )}
              {task.status === "failed" && (
                <span className="text-xs text-rose-500 flex items-center gap-1 font-medium bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-md border border-rose-200/40 dark:border-rose-800/30">
                  <AlertCircle className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>失败</span>
                </span>
              )}
              <button
                type="button"
                onClick={() => tauriApi.openInExplorer(task.save_path)}
                title="在资源管理器中定位"
                aria-label={`在资源管理器中定位 ${task.title}`}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none transition-colors"
              >
                <FolderOpen className="w-4 h-4" aria-hidden="true" />
              </button>
            </>
          ) : (
            <>
              <span className="text-xs font-mono tabular-nums text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 rounded-md border border-indigo-200/40 dark:border-indigo-800/40">
                <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                <span>{formatSpeed(task.speed)}</span>
              </span>
              {onCancel && (
                <button
                  type="button"
                  onClick={() => onCancel(task.id)}
                  title="取消任务"
                  aria-label={`取消下载任务 ${task.title}`}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 active:scale-95 focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:outline-none transition-colors"
                >
                  <X className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Progress Bar & Details */}
      {!isHistory && (
        <div className="space-y-1.5">
          <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden relative">
            <div
              className="h-full bg-gradient-to-r from-indigo-600 via-violet-500 to-indigo-500 rounded-full transition-all duration-200 animate-shimmer"
              style={{ width: `${Math.min(100, Math.max(0, task.progress || 0))}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono tabular-nums">
            <span>
              {formatBytes(task.downloaded_bytes)} / {formatBytes(task.total_bytes)}
            </span>
            <span>{(task.progress || 0).toFixed(1)}%</span>
          </div>
        </div>
      )}
    </div>
  );
};
