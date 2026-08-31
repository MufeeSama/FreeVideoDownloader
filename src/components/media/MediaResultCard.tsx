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
        return { name: "抖音", color: "bg-slate-950 text-white" };
      case "tiktok":
        return { name: "TikTok", color: "bg-gradient-to-r from-cyan-500 to-pink-500 text-white" };
      case "rednote":
        return { name: "小红书", color: "bg-red-500 text-white" };
      case "kuaishou":
        return { name: "快手", color: "bg-amber-500 text-white" };
      case "bilibili":
        return { name: "Bilibili", color: "bg-sky-500 text-white" };
      default:
        return { name: "社交短视频", color: "bg-indigo-600 text-white" };
    }
  };

  const platformInfo = getPlatformLabel(result.platform);

  return (
    <div className="w-full glass-panel p-6 rounded-3xl shadow-xl border border-slate-200/80 dark:border-slate-800/80 animate-slide-up">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left: Media Cover / Preview Poster with acrylic hover overlay */}
        <div className="relative w-full md:w-56 h-64 md:h-72 rounded-2xl overflow-hidden bg-slate-950 shrink-0 shadow-lg group border border-slate-800/50">
          {result.cover ? (
            <img
              src={result.cover}
              alt={result.title}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-500">
              <Film className="w-12 h-12" aria-hidden="true" />
            </div>
          )}

          {/* Platform Tag */}
          <div className="absolute top-3 left-3">
            <span
              className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md shadow-md backdrop-blur-md ${platformInfo.color}`}
            >
              {platformInfo.name}
            </span>
          </div>

          {/* Hover Play / View Overlay */}
          <div className="absolute inset-0 bg-slate-950/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-[3px]">
            {activeVideoUrl && (
              <button
                type="button"
                onClick={() => setIsVideoModalOpen(true)}
                title="播放预览视频"
                aria-label="播放预览无水印视频"
                className="w-12 h-12 rounded-full bg-white text-slate-900 flex items-center justify-center shadow-2xl active:scale-95 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none transition-transform hover:scale-110"
              >
                <Play className="w-5 h-5 fill-current ml-0.5 text-indigo-600" aria-hidden="true" />
              </button>
            )}

            {result.pics && result.pics.length > 0 && (
              <button
                type="button"
                onClick={() => setIsGalleryModalOpen(true)}
                title="浏览全部图集"
                aria-label={`浏览全部图集，共 ${result.pics.length} 张`}
                className="w-12 h-12 rounded-full bg-white text-slate-900 flex items-center justify-center shadow-2xl active:scale-95 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none transition-transform hover:scale-110"
              >
                <Images className="w-5 h-5 text-indigo-600" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>

        {/* Right: Content Details, Quality & Download Controls */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            {/* Author and Status info */}
            <div className="flex items-center gap-2 mb-2.5">
              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/90 px-2.5 py-1 rounded-lg border border-slate-200/50 dark:border-slate-700/50">
                <User className="w-3.5 h-3.5 text-indigo-500" aria-hidden="true" />
                <span>{result.author || "原作者作品"}</span>
              </div>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/50 dark:border-emerald-800/40 px-2 py-0.5 rounded-md font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
                <span>无水印已就绪</span>
              </span>
            </div>

            {/* Video Title */}
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 leading-snug mb-4 line-clamp-3 select-text text-pretty break-words tracking-tight">
              {result.title}
            </h3>

            {/* Quality Options Section */}
            {qualityList.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-500" aria-hidden="true" />
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
              <div className="mb-4 p-3 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-medium text-indigo-900 dark:text-indigo-200">
                  <Images className="w-4 h-4 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
                  <span>检测到高清图集 ({result.pics.length} 张原图)</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsGalleryModalOpen(true)}
                  aria-label={`查看图集画廊，共 ${result.pics.length} 张`}
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none rounded-lg px-2 py-1 flex items-center gap-1 transition-colors"
                >
                  <span>查看画廊</span>
                  <ExternalLink className="w-3 h-3" aria-hidden="true" />
                </button>
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
                className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 hover:from-indigo-500 hover:to-violet-500 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:outline-none shadow-md shadow-indigo-500/25 flex items-center gap-2 transition-all active:scale-95 glow-accent"
              >
                <Download className="w-4 h-4" aria-hidden="true" />
                <span>下载无水印视频 ({currentQuality?.type || "高清"})</span>
              </button>
            )}

            {result.pics && result.pics.length > 0 && (
              <button
                type="button"
                onClick={() => onDownloadAllImages(result.pics!)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-100/80 dark:bg-indigo-950/80 hover:bg-indigo-200/80 dark:hover:bg-indigo-900/80 active:scale-95 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none flex items-center gap-1.5 transition-colors border border-indigo-200/50 dark:border-indigo-800/50"
              >
                <Download className="w-3.5 h-3.5" aria-hidden="true" />
                <span>下载全部图集</span>
              </button>
            )}

            {result.audio_url && (
              <button
                type="button"
                onClick={() => onDownloadAudio(result.audio_url!)}
                title="提取并下载 MP3 背景音乐"
                aria-label="提取并下载 MP3 背景音乐"
                className="px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 active:scale-95 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none flex items-center gap-1.5 transition-colors border border-slate-200/40 dark:border-slate-700/40"
              >
                <Music className="w-3.5 h-3.5 text-pink-500" aria-hidden="true" />
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
                className="px-3 py-2.5 rounded-xl text-xs font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 active:scale-95 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none flex items-center gap-1.5 transition-colors ml-auto border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
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
