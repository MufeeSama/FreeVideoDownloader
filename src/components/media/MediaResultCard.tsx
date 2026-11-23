import React, { useState } from "react";
import {
  Download,
  Play,
  Copy,
  Images,
  Music,
  User,
  Check,
  Film,
  ExternalLink,
} from "lucide-react";

import { VideoParseResult, VideoQualityInfo } from "../../types";
import { QualityBadge } from "./QualityBadge";
import { VideoPlayerModal } from "./VideoPlayerModal";
import { ImageGalleryModal } from "./ImageGalleryModal";
import { toast } from "sonner";

interface MediaResultCardProps {
  result: VideoParseResult;
  onDownloadVideo: (url: string, quality: string) => void;
  onDownloadImage: (url: string, index: number) => void;
  onDownloadAllImages: (pics: string[]) => void;
  onDownloadAudio: (url: string) => void;
}

export const MediaResultCard: React.FC<MediaResultCardProps> = ({
  result,
  onDownloadVideo,
  onDownloadImage,
  onDownloadAllImages,
  onDownloadAudio,
}) => {
  const [selectedQualityIndex, setSelectedQualityIndex] = useState<number>(0);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const mainVideo = result.videos && result.videos.length > 0 ? result.videos[0] : null;
  const qualityList: VideoQualityInfo[] = mainVideo?.video_fullinfo && mainVideo.video_fullinfo.length > 0
    ? mainVideo.video_fullinfo
    : mainVideo
    ? [{ type: "默认高清", url: mainVideo.url }]
    : [];

  const currentQuality = qualityList[selectedQualityIndex] || qualityList[0];
  const activeVideoUrl = currentQuality?.url || mainVideo?.url || "";

  const handleCopy = (text: string, label: string = "链接") => {
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    toast.success(`已复制${label}到剪贴板`);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const getPlatformLabel = (p: string) => {
    switch (p) {
      case "douyin":
        return "抖音";
      case "tiktok":
        return "TikTok";
      case "rednote":
        return "小红书";
      case "kuaishou":
        return "快手";
      case "bilibili":
        return "B站";
      default:
        return "短视频";
    }
  };

  const platformName = getPlatformLabel(result.platform);

  return (
    <div className="w-full film-panel p-5 rounded-2xl animate-slide-up">
      <div className="flex flex-col md:flex-row gap-5">
        {/* Left: Media Cover / Preview Poster with calm overlay */}
        <div className="relative w-full md:w-52 h-60 md:h-64 rounded-xl overflow-hidden bg-black/40 shrink-0 border border-[var(--card-border)] group">
          {result.cover ? (
            <img
              src={result.cover}
              alt={result.title}
              loading="lazy"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[var(--text-muted)]">
              <Film className="w-10 h-10" aria-hidden="true" />
            </div>
          )}

          {/* Platform Tag */}
          <div className="absolute top-2.5 left-2.5">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/60 text-white backdrop-blur-xs border border-white/10">
              {platformName}
            </span>
          </div>

          {/* Hover Play / View Overlay */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2.5">
            {activeVideoUrl && (
              <button
                type="button"
                onClick={() => setIsVideoModalOpen(true)}
                title="播放预览视频"
                aria-label="播放预览无水印视频"
                className="w-10 h-10 rounded-full bg-[var(--card-bg)] text-[var(--text-primary)] border border-[var(--card-border)] flex items-center justify-center hover:scale-105 transition-transform"
              >
                <Play className="w-4 h-4 fill-current ml-0.5 text-amber-600 dark:text-amber-500" aria-hidden="true" />
              </button>
            )}

            {result.pics && result.pics.length > 0 && (
              <button
                type="button"
                onClick={() => setIsGalleryModalOpen(true)}
                title="浏览图集"
                aria-label={`浏览全部图集，共 ${result.pics.length} 张`}
                className="w-10 h-10 rounded-full bg-[var(--card-bg)] text-[var(--text-primary)] border border-[var(--card-border)] flex items-center justify-center hover:scale-105 transition-transform"
              >
                <Images className="w-4 h-4 text-amber-600 dark:text-amber-500" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>

        {/* Right: Content Details, Quality & Download Controls */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            {/* Author and Status info */}
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] bg-[var(--raised-bg)] px-2 py-0.5 rounded border border-[var(--card-border)]">
                <User className="w-3.5 h-3.5 text-[var(--text-muted)]" aria-hidden="true" />
                <span>{result.author || "原作者作品"}</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                无水印已就绪
              </span>
            </div>

            {/* Video Title */}
            <h3 className="text-sm font-medium text-[var(--text-primary)] leading-normal mb-3.5 line-clamp-2 select-text">
              {result.title}
            </h3>

            {/* Quality Options Section */}
            {qualityList.length > 0 && (
              <div className="mb-3.5">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-[var(--text-muted)]">
                    画质规格
                  </span>
                  <span className="text-[10px] text-[var(--text-muted)]">
                    选择对应档位下载
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {qualityList.map((q, idx) => (
                    <QualityBadge
                      key={idx}
                      type={q.type}
                      sizeText={q.formatted_size}
                      selected={selectedQualityIndex === idx}
                      onClick={() => setSelectedQualityIndex(idx)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Album / Pics Info */}
            {result.pics && result.pics.length > 0 && (
              <div className="mb-3.5 p-2.5 rounded-lg bg-[var(--raised-bg)] border border-[var(--card-border)] flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                  <Images className="w-3.5 h-3.5 text-amber-600 dark:text-amber-500" aria-hidden="true" />
                  <span>包含高清图集 ({result.pics.length} 张原图)</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsGalleryModalOpen(true)}
                  aria-label={`查看图集画廊，共 ${result.pics.length} 张`}
                  className="text-xs font-medium text-amber-600 dark:text-amber-500 hover:underline flex items-center gap-1"
                >
                  <span>浏览图集</span>
                  <ExternalLink className="w-3 h-3" aria-hidden="true" />
                </button>
              </div>
            )}
          </div>

          {/* Action Button Bar */}
          <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-[var(--card-border)]">
            {activeVideoUrl && (
              <button
                type="button"
                onClick={() =>
                  onDownloadVideo(activeVideoUrl, currentQuality?.type || "1080p")
                }
                className="px-4 py-2 rounded-md text-xs font-medium text-white bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600 dark:text-zinc-950 flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <Download className="w-3.5 h-3.5" aria-hidden="true" />
                <span>下载视频 ({currentQuality?.type || "高清"})</span>
              </button>
            )}

            {result.pics && result.pics.length > 0 && (
              <button
                type="button"
                onClick={() => onDownloadAllImages(result.pics!)}
                className="px-3.5 py-2 rounded-md text-xs font-medium text-[var(--text-primary)] bg-[var(--raised-bg)] hover:bg-[var(--bg-deep)] border border-[var(--card-border)] flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" aria-hidden="true" />
                <span>下载图集</span>
              </button>
            )}

            {result.audio_url && (
              <button
                type="button"
                onClick={() => onDownloadAudio(result.audio_url!)}
                title="提取并下载 MP3 音频"
                aria-label="提取并下载 MP3 音频"
                className="px-3 py-2 rounded-md text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--raised-bg)] hover:bg-[var(--bg-deep)] border border-[var(--card-border)] flex items-center gap-1.5 transition-colors"
              >
                <Music className="w-3.5 h-3.5 text-[var(--text-muted)]" aria-hidden="true" />
                <span>提取音频</span>
              </button>
            )}

            {/* Direct URL Copy */}
            {activeVideoUrl && (
              <button
                type="button"
                onClick={() => handleCopy(activeVideoUrl, "无水印视频直链")}
                title="复制无水印直链"
                aria-label="复制无水印视频直链到剪贴板"
                className="px-2.5 py-2 rounded-md text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--raised-bg)] flex items-center gap-1.5 transition-colors ml-auto"
              >
                {copiedLink ? (
                  <Check className="w-3.5 h-3.5 text-emerald-500" aria-hidden="true" />
                ) : (
                  <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                )}
                <span>{copiedLink ? "已复制" : "复制直链"}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Video Player Modal */}
      <VideoPlayerModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        videoUrl={activeVideoUrl}
        platform={result.platform}
        title={result.title}
        onDownload={() =>
          onDownloadVideo(activeVideoUrl, currentQuality?.type || "1080p")
        }
      />

      {/* Image Gallery Modal */}
      {result.pics && (
        <ImageGalleryModal
          isOpen={isGalleryModalOpen}
          onClose={() => setIsGalleryModalOpen(false)}
          pics={result.pics}
          title={result.title}
          onDownloadSingle={(url, idx) => onDownloadImage(url, idx)}
          onDownloadAll={() => onDownloadAllImages(result.pics!)}
        />
      )}
    </div>
  );
};
