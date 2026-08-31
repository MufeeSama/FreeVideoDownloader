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
      aria-label="图集高清画廊预览"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in"
    >
      <div className="relative w-full max-w-4xl glass-panel bg-slate-900/95 rounded-3xl overflow-hidden shadow-2xl border border-slate-700/60 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center gap-2 truncate pr-4">
            <Images className="w-4 h-4 text-violet-400 shrink-0" aria-hidden="true" />
            <h3 className="text-sm font-semibold text-slate-100 truncate">
              {title}
            </h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono tabular-nums">
              {currentIndex + 1} / {pics.length}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭画廊预览"
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:outline-none transition-colors"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {/* Image Preview & Navigation */}
        <div className="relative flex-1 bg-black flex items-center justify-center min-h-[420px] max-h-[65vh] p-4 overflow-hidden select-none">
          <img
            src={currentUrl}
            alt={`${title} - 图片 ${currentIndex + 1}`}
            className="max-h-full max-w-full object-contain rounded-xl shadow-lg"
          />

          {pics.length > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrev}
                aria-label="查看上一张图片"
                className="absolute left-4 w-10 h-10 rounded-full bg-slate-900/70 hover:bg-slate-800 text-white flex items-center justify-center backdrop-blur-sm focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:outline-none transition-transform border border-slate-700/50 hover:scale-105"
              >
                <ChevronLeft className="w-5 h-5" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                aria-label="查看下一张图片"
                className="absolute right-4 w-10 h-10 rounded-full bg-slate-900/70 hover:bg-slate-800 text-white flex items-center justify-center backdrop-blur-sm focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:outline-none transition-transform border border-slate-700/50 hover:scale-105"
              >
                <ChevronRight className="w-5 h-5" aria-hidden="true" />
              </button>
            </>
          )}
        </div>

        {/* Thumbnail Strip */}
        {pics.length > 1 && (
          <div className="flex items-center gap-2 px-5 py-2.5 overflow-x-auto bg-slate-950/60 border-t border-slate-800/60">
            {pics.map((url, idx) => (
              <button
                type="button"
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                aria-label={`切换到第 ${idx + 1} 张图片`}
                className={`relative w-12 h-12 rounded-lg overflow-hidden shrink-0 border-2 focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:outline-none transition-all ${
                  currentIndex === idx
                    ? "border-violet-500 scale-105 shadow-md shadow-violet-500/30"
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
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-800 bg-slate-900/80">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:outline-none rounded-xl transition-colors"
          >
            关闭
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onDownloadSingle(currentUrl, currentIndex)}
              className="px-4 py-1.5 text-xs font-semibold text-violet-300 bg-violet-950/70 hover:bg-violet-900/80 focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:outline-none border border-violet-700/50 rounded-xl flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" aria-hidden="true" />
              <span>下载当前原图</span>
            </button>
            {pics.length > 1 && (
              <button
                type="button"
                onClick={onDownloadAll}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-violet-600 hover:bg-violet-500 focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:outline-none rounded-xl shadow-md shadow-violet-600/30 flex items-center gap-1.5 transition-transform active:scale-95"
              >
                <Download className="w-3.5 h-3.5" aria-hidden="true" />
                <span>批量下载全部 ({pics.length}张)</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
