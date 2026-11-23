import React, { useState } from "react";
import { X, Download, ChevronLeft, ChevronRight, Images } from "lucide-react";

interface ImageGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  pics: string[];
  title: string;
  onDownloadSingle: (url: string, index: number) => void;
  onDownloadAll: () => void;
}

export const ImageGalleryModal: React.FC<ImageGalleryModalProps> = ({
  isOpen,
  onClose,
  pics,
  title,
  onDownloadSingle,
  onDownloadAll,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!isOpen || !pics || pics.length === 0) return null;

  const currentUrl = pics[currentIndex];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : pics.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < pics.length - 1 ? prev + 1 : 0));
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="图集画廊预览"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 animate-fade-in"
    >
      <div className="relative w-full max-w-4xl film-panel rounded-xl overflow-hidden shadow-2xl border border-[var(--card-border)] flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--card-border)] bg-[var(--raised-bg)]">
          <div className="flex items-center gap-2 truncate pr-4">
            <Images className="w-3.5 h-3.5 text-amber-600 dark:text-amber-500 shrink-0" aria-hidden="true" />
            <h3 className="text-xs font-medium text-[var(--text-primary)] truncate">
              {title}
            </h3>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-[var(--card-bg)] text-[var(--text-muted)] border border-[var(--card-border)] font-mono tabular-nums">
              {currentIndex + 1} / {pics.length}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭画廊预览"
            className="w-6 h-6 rounded flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--card-bg)] transition-colors"
          >
            <X className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>

        {/* Image Preview & Navigation */}
        <div className="relative flex-1 bg-black flex items-center justify-center min-h-[400px] max-h-[62vh] p-4 overflow-hidden select-none">
          <img
            src={currentUrl}
            alt={`${title} - 图片 ${currentIndex + 1}`}
            className="max-h-full max-w-full object-contain"
          />

          {pics.length > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrev}
                aria-label="查看上一张图片"
                className="absolute left-3 w-8 h-8 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center border border-white/20 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                aria-label="查看下一张图片"
                className="absolute right-3 w-8 h-8 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center border border-white/20 transition-colors"
              >
                <ChevronRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </>
          )}
        </div>

        {/* Thumbnail Strip */}
        {pics.length > 1 && (
          <div className="flex items-center gap-1.5 px-4 py-2 overflow-x-auto bg-[var(--bg-deep)] border-t border-[var(--card-border)]">
            {pics.map((url, idx) => (
              <button
                type="button"
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                aria-label={`切换到第 ${idx + 1} 张图片`}
                className={`relative w-10 h-10 rounded overflow-hidden shrink-0 border transition-all ${
                  currentIndex === idx
                    ? "border-amber-500 scale-105"
                    : "border-transparent opacity-60 hover:opacity-100"
                }`}
              >
                <img
                  src={url}
                  alt={`缩略图 ${idx + 1}`}
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-4 py-2.5 border-t border-[var(--card-border)] bg-[var(--raised-bg)]">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--card-bg)] border border-[var(--card-border)] rounded-md transition-colors"
          >
            关闭
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onDownloadSingle(currentUrl, currentIndex)}
              className="px-3 py-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--card-bg)] border border-[var(--card-border)] rounded-md flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" aria-hidden="true" />
              <span>下载当前原图</span>
            </button>
            {pics.length > 1 && (
              <button
                type="button"
                onClick={onDownloadAll}
                className="px-3.5 py-1.5 text-xs font-medium text-white bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600 dark:text-zinc-950 rounded-md flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" aria-hidden="true" />
                <span>批量下载全部 ({pics.length} 张)</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
