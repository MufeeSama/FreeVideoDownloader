import React from "react";
import { Link2, X, ArrowRight } from "lucide-react";

interface ClipboardModalProps {
  detectedText: string | null;
  onParse: (text: string) => void;
  onDismiss: () => void;
}

export const ClipboardModal: React.FC<ClipboardModalProps> = ({
  detectedText,
  onParse,
  onDismiss,
}) => {
  if (!detectedText) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-5 right-5 z-50 animate-slide-up max-w-sm w-full px-3"
    >
      <div className="film-panel p-3.5 rounded-xl shadow-xl border border-[var(--card-border)] bg-[var(--card-bg)]">
        <div className="flex items-start justify-between gap-2.5">
          <div className="w-7 h-7 rounded bg-[var(--raised-bg)] border border-[var(--card-border)] flex items-center justify-center text-amber-600 dark:text-amber-500 shrink-0">
            <Link2 className="w-3.5 h-3.5" aria-hidden="true" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              <h4 className="text-xs font-semibold text-[var(--text-primary)]">
                剪贴板链接
              </h4>
            </div>
            <p className="text-[11px] text-[var(--text-secondary)] line-clamp-2 break-all font-mono bg-[var(--raised-bg)] border border-[var(--card-border)] p-1.5 rounded">
              {detectedText}
            </p>
          </div>

          <button
            type="button"
            onClick={onDismiss}
            aria-label="忽略并关闭"
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1 rounded hover:bg-[var(--raised-bg)] transition-colors"
          >
            <X className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>

        <div className="flex items-center justify-end gap-2 mt-2.5 pt-2 border-t border-[var(--card-border)]">
          <button
            type="button"
            onClick={onDismiss}
            className="px-2.5 py-1 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded transition-colors"
          >
            忽略
          </button>
          <button
            type="button"
            onClick={() => {
              onParse(detectedText);
              onDismiss();
            }}
            className="px-3 py-1 text-xs font-medium text-white bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600 dark:text-zinc-950 rounded flex items-center gap-1 transition-colors"
          >
            <span>一键提取</span>
            <ArrowRight className="w-3 h-3" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
};
