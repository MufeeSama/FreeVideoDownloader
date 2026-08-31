import React, { useState, useEffect } from "react";
import { X, Download, Film, Loader2, AlertCircle } from "lucide-react";
import { tauriApi } from "../../services/tauriApi";

interface VideoPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  platform?: string;
  title: string;
  onDownload: () => void;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  isOpen,
  onClose,
  videoUrl,
  platform = "douyin",
  title,
  onDownload,
}) => {
  const [streamUrl, setStreamUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen && videoUrl) {
      setIsLoading(true);
      setHasError(false);
      tauriApi
        .getVideoProxyUrl(videoUrl, platform)
        .then((proxyUrl) => {
          setStreamUrl(proxyUrl);
        })
        .catch(() => {
          setStreamUrl(videoUrl);
        });
    } else {
      setStreamUrl("");
      setIsLoading(false);
      setHasError(false);
    }
  }, [isOpen, videoUrl, platform]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="无水印视频预览播放器"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in"
    >
      <div className="relative w-full max-w-3xl glass-dropdown bg-slate-900/95 rounded-3xl overflow-hidden shadow-2xl border border-slate-700/60 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center gap-2 truncate pr-4">
            <Film className="w-4 h-4 text-indigo-400 shrink-0" aria-hidden="true" />
            <h3 className="text-sm font-semibold text-slate-100 truncate">
              {title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭视频预览"
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 active:scale-95 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none transition-colors"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {/* Video Player Area */}
        <div className="relative flex-1 bg-black flex items-center justify-center min-h-[380px] max-h-[60vh] overflow-hidden">
          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 z-10 gap-2">
              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" aria-hidden="true" />
              <span className="text-xs text-slate-300">正在建立高速流媒体缓冲…</span>
            </div>
          )}

          {hasError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-10 gap-3 px-6 text-center">
              <AlertCircle className="w-10 h-10 text-rose-500" aria-hidden="true" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-white">视频预览加载受限</p>
                <p className="text-xs text-slate-400">平台源地址已启用严格防盗链，您可以直接点击下方立即下载离线播放</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  onDownload();
                  onClose();
                }}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-md"
              >
                直接下载原画视频
              </button>
            </div>
          )}

          {streamUrl && (
            <video
              key={streamUrl}
              src={streamUrl}
              controls
              autoPlay
              playsInline
              onCanPlay={() => setIsLoading(false)}
              onError={() => {
                setIsLoading(false);
                setHasError(true);
              }}
              className="max-h-full max-w-full rounded-b-xl"
            />
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-800 bg-slate-900/80">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" aria-hidden="true" />
            <span className="text-xs text-slate-400 font-mono">
              无水印直链原生流式播放
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 active:scale-95 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none rounded-xl transition-colors"
            >
              关闭
            </button>
            <button
              type="button"
              onClick={() => {
                onDownload();
                onClose();
              }}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:scale-95 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:outline-none rounded-xl shadow-md shadow-indigo-600/30 flex items-center gap-1.5 transition-all glow-accent"
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
