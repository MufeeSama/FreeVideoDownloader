import { useState } from "react";
import { TitleBar } from "./components/layout/TitleBar";
import { UrlInputBox } from "./components/parser/UrlInputBox";
import { ClipboardModal } from "./components/parser/ClipboardModal";
import { MediaResultCard } from "./components/media/MediaResultCard";
import { DownloadQueue } from "./components/download/DownloadQueue";
import { HistoryList } from "./components/download/HistoryList";
import { SettingsModal } from "./components/settings/SettingsModal";
import { useTheme } from "./hooks/useTheme";
import { useClipboard } from "./hooks/useClipboard";
import { useDownloadManager } from "./hooks/useDownloadManager";
import { tauriApi } from "./services/tauriApi";
import { VideoParseResult } from "./types";
import { Toaster, toast } from "sonner";
import { Sparkles, History as HistoryIcon, Download } from "lucide-react";

export default function App() {
  const { theme, isDark, setTheme, toggleTheme } = useTheme();
  const [inputText, setInputText] = useState("");
  const [isParsing, setIsParsing] = useState(false);
  const [parseResult, setParseResult] = useState<VideoParseResult | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"downloader" | "history">("downloader");

  const {
    tasks,
    history,
    isLoadingHistory,
    startDownload,
    cancelDownload,
    clearHistory,
  } = useDownloadManager();

  const {
    detectedText,
    clearDetected,
    pasteFromClipboard,
  } = useClipboard(true);

  // 执行短视频链接解析
  const handleParse = async (urlToParse?: string) => {
    const raw = (urlToParse || inputText).trim();
    if (!raw) {
      toast.warning("请输入或粘贴包含视频链接的分享文本");
      return;
    }

    setIsParsing(true);
    try {
      const result = await tauriApi.parseVideo(raw);
      setParseResult(result);
      toast.success("解析成功！已提取无水印媒体资源");
    } catch (e: any) {
      toast.error("解析失败", {
        description: String(e) || "请检查网络或链接是否有效",
      });
    } finally {
      setIsParsing(false);
    }
  };

  // 粘贴剪贴板文本到输入框
  const handlePaste = async () => {
    const text = await pasteFromClipboard();
    if (text) {
      setInputText(text);
      toast.info("已粘贴剪贴板内容");
    }
  };

  // 清空输入与结果
  const handleClear = () => {
    setInputText("");
    setParseResult(null);
  };

  // 打开默认下载文件夹
  const handleOpenDownloadFolder = async () => {
    try {
      const settings = await tauriApi.getSettings();
      await tauriApi.openFolder(settings.default_download_dir);
    } catch (e) {
      console.warn("Failed to open folder:", e);
    }
  };

  // 下载视频
  const handleDownloadVideo = (url: string, quality: string) => {
    if (!parseResult) return;
    startDownload({
      url,
      title: parseResult.title,
      platform: parseResult.platform,
      media_type: "video",
      quality,
      author: parseResult.author,
    });
  };

  // 下载单张图片
  const handleDownloadImage = (url: string, index: number) => {
    if (!parseResult) return;
    startDownload({
      url,
      title: `${parseResult.title}_图${index + 1}`,
      platform: parseResult.platform,
      media_type: "image",
      quality: "原图",
      author: parseResult.author,
    });
  };

  // 批量下载所有图集
  const handleDownloadAllImages = (pics: string[]) => {
    if (!parseResult) return;
    pics.forEach((url, index) => {
      startDownload({
        url,
        title: `${parseResult.title}_图${index + 1}`,
        platform: parseResult.platform,
        media_type: "image",
        quality: "原图",
        author: parseResult.author,
      });
    });
    toast.success(`已添加 ${pics.length} 张图片到下载队列`);
  };

  // 提取音频
  const handleDownloadAudio = (url: string) => {
    if (!parseResult) return;
    startDownload({
      url,
      title: `${parseResult.title}_背景音乐`,
      platform: parseResult.platform,
      media_type: "audio",
      quality: "MP3",
      author: parseResult.author,
    });
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-50 dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 overflow-hidden font-sans select-none ambient-bg">
      {/* Hidden main h1 for screen readers and SEO semantics */}
      <h1 className="sr-only">Free Video Downloader - 社交平台无水印短视频图集下载器</h1>

      {/* Custom TitleBar */}
      <TitleBar
        theme={theme}
        isDark={isDark}
        onToggleTheme={toggleTheme}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenFolder={handleOpenDownloadFolder}
      />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pt-16 pb-8 px-6 max-w-5xl w-full mx-auto space-y-6">
        {/* Navigation Tabs */}
        <nav aria-label="页面功能导航" className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-200/50 dark:bg-slate-800/50 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50">
            <button
              type="button"
              aria-pressed={activeTab === "downloader"}
              onClick={() => setActiveTab("downloader")}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 active:scale-95 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none transition-all ${
                activeTab === "downloader"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              <Sparkles className="w-4 h-4" aria-hidden="true" />
              <span>视频提取下载</span>
            </button>
            <button
              type="button"
              aria-pressed={activeTab === "history"}
              onClick={() => setActiveTab("history")}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 active:scale-95 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none transition-all ${
                activeTab === "history"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              <HistoryIcon className="w-4 h-4" aria-hidden="true" />
              <span>下载历史记录</span>
              {history.length > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono tabular-nums">
                  {history.length}
                </span>
              )}
            </button>
          </div>

          {tasks.length > 0 && (
            <div
              role="status"
              aria-live="polite"
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-800/60 text-indigo-600 dark:text-indigo-400 text-xs font-semibold shadow-sm"
            >
              <Download className="w-3.5 h-3.5 animate-bounce" aria-hidden="true" />
              <span className="tabular-nums">正在下载 {tasks.length} 个任务</span>
            </div>
          )}
        </nav>

        {/* Tab Content: Downloader */}
        {activeTab === "downloader" && (
          <div className="space-y-6">
            {/* URL Input Box */}
            <UrlInputBox
              value={inputText}
              onChange={setInputText}
              onParse={() => handleParse()}
              onPaste={handlePaste}
              onClear={handleClear}
              isLoading={isParsing}
            />

            {/* Parse Result Card */}
            {parseResult && (
              <MediaResultCard
                result={parseResult}
                onDownloadVideo={handleDownloadVideo}
                onDownloadImage={handleDownloadImage}
                onDownloadAllImages={handleDownloadAllImages}
                onDownloadAudio={handleDownloadAudio}
              />
            )}

            {/* Active Download Queue */}
            <DownloadQueue tasks={tasks} onCancel={cancelDownload} />
          </div>
        )}

        {/* Tab Content: History */}
        {activeTab === "history" && (
          <HistoryList
            history={history}
            onClearHistory={clearHistory}
            isLoading={isLoadingHistory}
          />
        )}
      </main>

      {/* Smart Clipboard Popup Modal */}
      <ClipboardModal
        detectedText={detectedText}
        onParse={(text) => {
          setInputText(text);
          handleParse(text);
        }}
        onDismiss={clearDetected}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onThemeChange={(newTheme) => setTheme(newTheme)}
      />

      {/* Sonner Toaster */}
      <Toaster
        position="top-center"
        richColors
        closeButton
        theme={isDark ? "dark" : "light"}
      />
    </div>
  );
}
