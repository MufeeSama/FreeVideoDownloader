import React from "react";
import { DownloadTaskRecord } from "../../types";
import { TaskItem } from "./TaskItem";
import { ArrowDownCircle } from "lucide-react";

interface DownloadQueueProps {
  tasks: DownloadTaskRecord[];
  onCancel: (id: string) => void;
}

export const DownloadQueue: React.FC<DownloadQueueProps> = ({ tasks, onCancel }) => {
  if (tasks.length === 0) return null;

  return (
    <section
      role="region"
      aria-label="正在下载队列"
      aria-live="polite"
      className="w-full film-panel p-5 rounded-2xl animate-slide-up"
    >
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-[var(--raised-bg)] border border-[var(--card-border)] flex items-center justify-center text-amber-600 dark:text-amber-500">
            <ArrowDownCircle className="w-3.5 h-3.5" aria-hidden="true" />
          </div>
          <h3 className="text-xs font-semibold text-[var(--text-primary)]">
            当前下载任务 ({tasks.length})
          </h3>
        </div>
      </div>

      <div className="space-y-2.5">
        {tasks.map((t) => (
          <TaskItem key={t.id} task={t} onCancel={onCancel} />
        ))}
      </div>
    </section>
  );
};
