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

  const isIdle = activeCount === 0 && !isParsing;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="确认退出程序"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 animate-fade-in"
    >
      <div className="relative w-full max-w-sm film-panel rounded-xl overflow-hidden shadow-xl border border-[var(--card-border)] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--card-border)] bg-[var(--raised-bg)]">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-[var(--card-bg)] border border-[var(--card-border)] flex items-center justify-center text-amber-600 dark:text-amber-500">
              <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
            </div>
            <h3 className="text-xs font-semibold text-[var(--text-primary)]">
              {isIdle ? "退出程序" : "任务进行中"}
            </h3>
          </div>
          <button
            type="button"
            onClick={onCancel}
            aria-label="取消并关闭"
            className="w-6 h-6 rounded flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--card-bg)] transition-colors"
          >
            <X className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-2 text-xs">
          {isIdle ? (
            <p className="text-[var(--text-primary)] font-medium">
              确定要退出程序吗？
            </p>
          ) : (
            <>
              <p className="text-[var(--text-primary)] font-medium">
                {activeCount > 0 && isParsing
                  ? `当前正在解析，且有 ${activeCount} 个任务在下载中。`
                  : activeCount > 0
                  ? `当前有 ${activeCount} 个下载任务正在进行中。`
                  : "当前正在解析媒体资源。"}
              </p>
              <p className="text-[var(--text-muted)] leading-relaxed">
                立即退出将导致下载和解析中断，是否确认退出？
              </p>
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 px-4 py-2.5 border-t border-[var(--card-border)] bg-[var(--raised-bg)]">
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 rounded-md text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--card-bg)] border border-[var(--card-border)] transition-colors flex items-center gap-1"
          >
            <span>继续运行</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="px-3 py-1.5 rounded-md text-xs font-medium text-white bg-[#e5484d] hover:bg-[#dc2626] flex items-center gap-1 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
            <span>确认退出</span>
          </button>
        </div>
      </div>
    </div>
  );
};
