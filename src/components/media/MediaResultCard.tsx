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
  Sparkles,
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
        return { name: "抖音", color: "bg-slate-900 text-white" };
      case "tiktok":
        return { name: "TikTok", color: "bg-gradient-to-r from-cyan-500 to-pink-500 text-white" };
      case "rednote":
        return { name: "小红书", color: "bg-red-500 text-white" };
      case "kuaishou":
        return { name: "快手", color: "bg-orange-500 text-white" };
      case "bilibili":
        return { name: "Bilibili", color: "bg-sky-500 text-white" };
      default:
        return { name: "社交短视频", color: "bg-violet-600 text-white" };
    }
  };

  const platformInfo = getPlatformLabel(result.platform);

  return (
    <div className="w-full glass-panel p-6 rounded-3xl shadow-xl border border-slate-200/80 dark:border-slate-800/80 animate-slide-up">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left: Media Cover / Preview Trigger */}
        <div className="relative w-full md:w-56 h-64 md:h-72 rounded-2xl overflow-hidden bg-slate-900 shrink-0 shadow-lg group">
          {result.cover ? (
            <img
              src={result.cover}
              alt={result.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-500">
              <Film className="w-12 h-12" />
            </div>
          )}

          {/* Platform Tag */}
          <div className="absolute top-2.5 left-2.5">
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-md shadow-md ${platformInfo.color}`}
            >
              {platformInfo.name}
            </span>
          </div>

          {/* Hover Play / View Overlay */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-[2px]">
            {activeVideoUrl && (
              <button
                type="button"
                onClick={() => setIsVideoModalOpen(true)}
                className="w-12 h-12 rounded-full bg-white/90 hover:bg-white text-slate-900 flex items-center justify-center shadow-xl transition-all transform hover:scale-110"
                title="播放预览视频"
              >
                <Play className="w-5 h-5 fill-current ml-0.5 text-violet-600" />
              </button>
            )}

            {result.pics && result.pics.length > 0 && (
              <button
                type="button"
                onClick={() => setIsGalleryModalOpen(true)}
                className="w-12 h-12 rounded-full bg-white/90 hover:bg-white text-slate-900 flex items-center justify-center shadow-xl transition-all transform hover:scale-110"
                title="浏览全部图集"
              >
                <Images className="w-5 h-5 text-violet-600" />
              </button>
            )}
          </div>
        </div>

        {/* Right: Content Details, Quality & Download Controls */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            {/* Author and Source info */}
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center gap-1 text-xs font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded-lg">
                <User className="w-3.5 h-3.5 text-violet-500" />
                <span>{result.author || "原作者作品"}</span>
              </div>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md font-medium">
                无水印已就绪
              </span>
            </div>

            {/* Video Title */}
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 leading-snug mb-4 line-clamp-3 select-text">
              {result.title}
            </h3>

            {/* Quality Options Section */}
            {qualityList.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-violet-500" />
                    清晰度选项:
                  </span>
                  <span className="text-[11px] text-slate-400">
                    点击选择需要下载的清晰度
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
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
              <div className="mb-4 p-3 rounded-2xl bg-violet-50/60 dark:bg-violet-950/30 border border-violet-100 dark:border-violet-900/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-medium text-violet-900 dark:text-violet-200">
                    <Images className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                    <span>检测到高清图集 ({result.pics.length} 张原图)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsGalleryModalOpen(true)}
                    className="text-xs font-semibold text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1"
                  >
                    <span>查看画廊</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Action Button Bar */}
          <div className="flex flex-wrap items-center gap-2.5 pt-4 border-t border-slate-200/80 dark:border-slate-800/80">
            {activeVideoUrl && (
              <button
                type="button"
                onClick={() =>
                  onDownloadVideo(activeVideoUrl, currentQuality?.type || "1080p")
                }
                className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-md shadow-violet-500/25 flex items-center gap-2 transition-all transform active:scale-95 glow-accent"
              >
                <Download className="w-4 h-4" />
                <span>下载无水印视频 ({currentQuality?.type || "高清"})</span>
              </button>
            )}

            {result.pics && result.pics.length > 0 && (
              <button
                type="button"
                onClick={() => onDownloadAllImages(result.pics!)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-violet-700 dark:text-violet-300 bg-violet-100 dark:bg-violet-950/80 hover:bg-violet-200 dark:hover:bg-violet-900 flex items-center gap-1.5 transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>下载全部图集</span>
              </button>
            )}

            {result.audio_url && (
              <button
                type="button"
                onClick={() => onDownloadAudio(result.audio_url!)}
                className="px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center gap-1.5 transition-colors"
                title="提取并下载 MP3 背景音乐"
              >
                <Music className="w-3.5 h-3.5 text-pink-500" />
                <span>提取音频</span>
              </button>
            )}

            {/* Direct URL Copy */}
            {activeVideoUrl && (
              <button
                type="button"
                onClick={() => handleCopy(activeVideoUrl, "无水印视频直链")}
                className="px-3 py-2.5 rounded-xl text-xs font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 transition-colors ml-auto"
                title="复制无水印直链"
              >
                {copiedLink ? (
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
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
