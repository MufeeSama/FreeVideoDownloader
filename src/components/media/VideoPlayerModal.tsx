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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 animate-fade-in"
    >
      <div className="relative w-full max-w-3xl film-panel rounded-xl overflow-hidden shadow-xl border border-[var(--card-border)] flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--card-border)] bg-[var(--raised-bg)]">
          <div className="flex items-center gap-2 truncate pr-4">
            <Film className="w-3.5 h-3.5 text-amber-600 dark:text-amber-500 shrink-0" aria-hidden="true" />
            <h3 className="text-xs font-medium text-[var(--text-primary)] truncate">
              {title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭视频预览"
            className="w-6 h-6 rounded flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--card-bg)] transition-colors"
          >
            <X className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>

        {/* Video Player Area */}
        <div className="relative flex-1 bg-black flex items-center justify-center min-h-[360px] max-h-[60vh] overflow-hidden">
          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 z-10 gap-2">
              <Loader2 className="w-6 h-6 text-amber-500 animate-spin" aria-hidden="true" />
              <span className="text-xs text-[var(--text-muted)]">正在缓冲流媒体…</span>
            </div>
          )}

          {hasError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-10 gap-2.5 px-6 text-center">
              <AlertCircle className="w-8 h-8 text-[#e5484d]" aria-hidden="true" />
              <div className="space-y-1">
                <p className="text-xs font-medium text-white">视频直链受限</p>
                <p className="text-xs text-[var(--text-muted)]">源平台启用了防盗链验证，建议直接下载离线观看</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  onDownload();
                  onClose();
                }}
                className="px-3.5 py-1.5 rounded-md bg-amber-600 hover:bg-amber-700 text-xs font-medium text-white"
              >
                直接下载视频
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
              className="max-h-full max-w-full"
            />
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-4 py-2.5 border-t border-[var(--card-border)] bg-[var(--raised-bg)]">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
            <span className="text-xs text-[var(--text-muted)] font-mono">
              原生流式预览
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--card-bg)] border border-[var(--card-border)] rounded-md transition-colors"
            >
              关闭
            </button>
            <button
              type="button"
              onClick={() => {
                onDownload();
                onClose();
              }}
              className="px-3.5 py-1.5 text-xs font-medium text-white bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600 dark:text-zinc-950 rounded-md flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" aria-hidden="true" />
              <span>下载此视频</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
