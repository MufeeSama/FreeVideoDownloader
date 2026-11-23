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
        return <ImageIcon className="w-3.5 h-3.5 text-[var(--text-muted)]" aria-hidden="true" />;
      case "audio":
        return <Music className="w-3.5 h-3.5 text-[var(--text-muted)]" aria-hidden="true" />;
      default:
        return <Film className="w-3.5 h-3.5 text-[var(--text-muted)]" aria-hidden="true" />;
    }
  };

  return (
    <div className="p-3.5 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] flex flex-col gap-2 transition-colors">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="w-7 h-7 rounded bg-[var(--raised-bg)] border border-[var(--card-border)] flex items-center justify-center shrink-0">
            {getIcon()}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-medium text-[var(--text-primary)] truncate">
              {task.title}
            </h4>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[10px] font-mono text-[var(--text-muted)]">
                {task.platform.toUpperCase()}
              </span>
              {task.quality && (
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-[var(--raised-bg)] text-[var(--text-muted)] font-mono border border-[var(--card-border)]">
                  {task.quality}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Status / Action Controls */}
        <div className="flex items-center gap-1.5">
          {isHistory ? (
            <>
              {task.status === "completed" && (
                <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  <CheckCircle2 className="w-3 h-3" aria-hidden="true" />
                  <span>已完成</span>
                </span>
              )}
              {task.status === "failed" && (
                <span className="text-xs text-[#e5484d] flex items-center gap-1 font-mono bg-[#e5484d]/10 px-2 py-0.5 rounded border border-[#e5484d]/20">
                  <AlertCircle className="w-3 h-3" aria-hidden="true" />
                  <span>失败</span>
                </span>
              )}
              <button
                type="button"
                onClick={() => tauriApi.openInExplorer(task.save_path)}
                title="在资源管理器中定位"
                aria-label={`在资源管理器中定位 ${task.title}`}
                className="p-1.5 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--raised-bg)] transition-colors"
              >
                <FolderOpen className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </>
          ) : (
            <>
              <span className="text-xs font-mono tabular-nums text-amber-600 dark:text-amber-500 flex items-center gap-1 bg-[var(--raised-bg)] px-2 py-0.5 rounded border border-[var(--card-border)]">
                <Loader2 className="w-3 h-3 animate-spin" aria-hidden="true" />
                <span>{formatSpeed(task.speed)}</span>
              </span>
              {onCancel && (
                <button
                  type="button"
                  onClick={() => onCancel(task.id)}
                  title="取消任务"
                  aria-label={`取消下载任务 ${task.title}`}
                  className="p-1 rounded text-[var(--text-muted)] hover:text-[#e5484d] hover:bg-[var(--raised-bg)] transition-colors"
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
        <div className="space-y-1">
          <div className="w-full h-1.5 rounded bg-[var(--raised-bg)] border border-[var(--card-border)] overflow-hidden">
            <div
              className="h-full bg-amber-600 dark:bg-amber-500 rounded transition-[width] duration-150"
              style={{ width: `${Math.min(100, Math.max(0, task.progress || 0))}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)] font-mono tabular-nums">
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
