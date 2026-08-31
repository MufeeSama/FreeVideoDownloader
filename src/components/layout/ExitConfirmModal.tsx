import React from "react";
import { AlertTriangle, X, LogOut, ArrowRight } from "lucide-react";

interface ExitConfirmModalProps {
  isOpen: boolean;
  activeCount: number;
  isParsing: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ExitConfirmModal: React.FC<ExitConfirmModalProps> = ({
  isOpen,
  activeCount,
  isParsing,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="确认退出程序"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in"
    >
      <div className="relative w-full max-w-md glass-dropdown bg-white/95 dark:bg-slate-900/95 rounded-3xl overflow-hidden shadow-2xl border border-slate-200/80 dark:border-slate-800/80 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200/60 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/70 border border-amber-200/50 dark:border-amber-800/50 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <AlertTriangle className="w-4 h-4" aria-hidden="true" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              存在进行中的任务
            </h3>
          </div>
          <button
            type="button"
            onClick={onCancel}
            aria-label="取消并关闭"
            className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none transition-colors"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-3 text-xs">
          <p className="text-slate-700 dark:text-slate-300 font-medium text-sm">
            {activeCount > 0 && isParsing
              ? `当前正在解析短视频，且有 ${activeCount} 个下载任务正在进行中。`
              : activeCount > 0
              ? `当前有 ${activeCount} 个下载任务正在进行中。`
              : "当前正在解析短视频资源。"}
          </p>
          <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
            立即退出将导致未完成的下载和解析中断。您是否确定要强行退出？
          </p>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2.5 px-6 py-4 border-t border-slate-200/60 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/50">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none transition-colors flex items-center gap-1.5"
          >
            <span>继续运行</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 shadow-md shadow-rose-600/30 flex items-center gap-1.5 active:scale-95 focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 focus-visible:outline-none transition-all"
          >
            <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
            <span>强制退出</span>
          </button>
        </div>
      </div>
    </div>
  );
};
