import React from "react";
import { Sparkles, X, ArrowRight } from "lucide-react";

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
      className="fixed bottom-6 right-6 z-50 animate-slide-up max-w-md w-full px-4"
    >
      <div className="glass-dropdown p-4 rounded-2xl shadow-2xl border border-violet-500/30 dark:border-violet-500/20 bg-white/95 dark:bg-slate-900/95">
        <div className="flex items-start justify-between gap-3">
          <div className="w-9 h-9 rounded-xl bg-violet-100 dark:bg-violet-950/80 flex items-center justify-center text-violet-600 dark:text-violet-400 shrink-0">
            <Sparkles className="w-5 h-5 animate-pulse" aria-hidden="true" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                检测到剪贴板短视频链接
              </h4>
              <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-ping" aria-hidden="true" />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 break-all font-mono bg-slate-100/60 dark:bg-slate-800/60 p-1.5 rounded-lg">
              {detectedText}
            </p>
          </div>

          <button
            type="button"
            onClick={onDismiss}
            aria-label="忽略并关闭提示"
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:outline-none transition-colors"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        <div className="flex items-center justify-end gap-2 mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80">
          <button
            type="button"
            onClick={onDismiss}
            className="px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:outline-none rounded-lg transition-colors"
          >
            忽略
          </button>
          <button
            type="button"
            onClick={() => {
              onParse(detectedText);
              onDismiss();
            }}
            className="px-4 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:outline-none rounded-lg shadow-sm shadow-violet-500/25 flex items-center gap-1.5 transition-transform active:scale-95"
          >
            <span>立即解析</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
};
