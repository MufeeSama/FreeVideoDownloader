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
      className="w-full glass-panel p-6 rounded-3xl shadow-xl border border-slate-200/80 dark:border-slate-800/80 animate-slide-up"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-violet-100 dark:bg-violet-950/80 flex items-center justify-center text-violet-600 dark:text-violet-400">
            <ArrowDownCircle className="w-4 h-4 animate-bounce" aria-hidden="true" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            当前正在下载 ({tasks.length})
          </h3>
        </div>
      </div>

      <div className="space-y-3">
        {tasks.map((t) => (
          <TaskItem key={t.id} task={t} onCancel={onCancel} />
        ))}
      </div>
    </section>
  );
};
