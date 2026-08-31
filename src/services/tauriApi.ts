import { invoke } from "@tauri-apps/api/core";
import { listen, UnlistenFn } from "@tauri-apps/api/event";
import { open as openDialog } from "@tauri-apps/plugin-dialog";
import {
  AppSettings,
  DownloadProgressPayload,
  DownloadTaskRecord,
  StartDownloadParams,
  VideoParseResult,
} from "../types";

export const tauriApi = {
  // 解析视频/图集/音频
  async parseVideo(rawInput: string): Promise<VideoParseResult> {
    return await invoke<VideoParseResult>("parse_video", { rawInput });
  },

  // 获取视频代理播放直链 (解除防盗链并支持 Range 拖拽快进)
  async getVideoProxyUrl(url: string, platform: string = "douyin"): Promise<string> {
    try {
      return await invoke<string>("get_video_proxy_url", { url, platform });
    } catch {
      return url;
    }
  },

  // 启动下载任务
  async startDownload(params: StartDownloadParams): Promise<DownloadTaskRecord> {
    return await invoke<DownloadTaskRecord>("start_download", { params });
  },

  // 取消下载任务
  async cancelDownload(taskId: string): Promise<void> {
    return await invoke<void>("cancel_download", { taskId });
  },

  // 获取下载历史
  async getHistory(): Promise<DownloadTaskRecord[]> {
    return await invoke<DownloadTaskRecord[]>("get_download_history");
  },

  // 清空下载历史
  async clearHistory(): Promise<void> {
    return await invoke<void>("clear_download_history");
  },

  // 获取用户设置
  async getSettings(): Promise<AppSettings> {
    return await invoke<AppSettings>("get_app_settings");
  },

  // 保存用户设置
  async saveSettings(settings: AppSettings): Promise<void> {
    return await invoke<void>("save_app_settings", { settings });
  },

  // 在资源管理器中定位高亮文件
  async openInExplorer(filePath: string): Promise<void> {
    return await invoke<void>("open_in_explorer", { filePath });
  },

  // 打开指定目录
  async openFolder(folderPath: string): Promise<void> {
    return await invoke<void>("open_folder", { folderPath });
  },

  // 获取预估保存路径
  async getSuggestedSavePath(
    title: string,
    author?: string,
    quality?: string,
    mediaType: string = "video"
  ): Promise<string> {
    return await invoke<string>("get_suggested_save_path", {
      title,
      author,
      quality,
      mediaType,
    });
  },

  // 选择本地文件夹
  async selectDirectory(defaultPath?: string): Promise<string | null> {
    try {
      const selected = await openDialog({
        directory: true,
        multiple: false,
        defaultPath,
        title: "选择默认下载保存文件夹",
      });
      if (typeof selected === "string") {
        return selected;
      }
      return null;
    } catch (e) {
      console.error("Failed to open directory dialog:", e);
      return null;
    }
  },

  // 监听下载进度
  async onDownloadProgress(
    callback: (payload: DownloadProgressPayload) => void
  ): Promise<UnlistenFn> {
    return await listen<DownloadProgressPayload>("download://progress", (event) => {
      callback(event.payload);
    });
  },

  // 监听下载完成
  async onDownloadCompleted(
    callback: (data: { task_id: string; save_path: string }) => void
  ): Promise<UnlistenFn> {
    return await listen<{ task_id: string; save_path: string }>(
      "download://completed",
      (event) => {
        callback(event.payload);
      }
    );
  },

  // 监听下载失败
  async onDownloadFailed(
    callback: (data: { task_id: string; error: string }) => void
  ): Promise<UnlistenFn> {
    return await listen<{ task_id: string; error: string }>(
      "download://failed",
      (event) => {
        callback(event.payload);
      }
    );
  },
};
