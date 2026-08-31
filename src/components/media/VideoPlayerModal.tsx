import React from "react";
import { X, Download, Film } from "lucide-react";

interface VideoPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  title: string;
  onDownload: () => void;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  isOpen,
  onClose,
  videoUrl,
  title,
  onDownload,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="无水印视频预览播放器"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
    >
      <div className="relative w-full max-w-3xl glass-panel bg-slate-900/95 rounded-3xl overflow-hidden shadow-2xl border border-slate-700/60 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center gap-2 truncate pr-4">
            <Film className="w-4 h-4 text-violet-400 shrink-0" aria-hidden="true" />
            <h3 className="text-sm font-semibold text-slate-100 truncate">
              {title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭视频预览"
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:outline-none transition-colors"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {/* Video Player */}
        <div className="relative flex-1 bg-black flex items-center justify-center min-h-[380px] max-h-[60vh]">
          <video
            src={videoUrl}
            controls
            autoPlay
            className="max-h-full max-w-full rounded-b-xl"
          />
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-800 bg-slate-900/80">
          <span className="text-xs text-slate-400 font-mono truncate max-w-md">
            无水印直链播放预览
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:outline-none rounded-xl transition-colors"
            >
              关闭
            </button>
            <button
              type="button"
              onClick={() => {
                onDownload();
                onClose();
              }}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-violet-600 hover:bg-violet-500 focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:outline-none rounded-xl shadow-md shadow-violet-600/30 flex items-center gap-1.5 transition-transform active:scale-95"
            >
              <Download className="w-3.5 h-3.5" aria-hidden="true" />
              <span>立即下载</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
