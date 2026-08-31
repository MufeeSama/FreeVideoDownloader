export interface VideoQualityInfo {
  type: string; // e.g. "540p", "720p", "1080p", "超高清"
  url: string;
  size?: number;
  formatted_size?: string;
}

export interface VideoItem {
  url: string;
  video_fullinfo?: VideoQualityInfo[];
}

export interface VideoParseResult {
  title: string;
  author?: string;
  cover: string;
  avatar?: string;
  platform: string; // "douyin" | "tiktok" | "rednote" | "kuaishou" | "bilibili" | "other"
  videos: VideoItem[];
  pics?: string[];
  audio_url?: string;
  source_url: string;
}

export type TaskStatus = 'downloading' | 'completed' | 'failed' | 'paused' | 'cancelled';

export interface DownloadTaskRecord {
  id: string;
  title: string;
  platform: string;
  media_type: 'video' | 'image' | 'audio';
  quality?: string;
  download_url: string;
  save_path: string;
  total_bytes: number;
  downloaded_bytes: number;
  progress: number;
  speed?: number; // bytes / second for live progress
  status: TaskStatus;
  error_message?: string;
  created_at: number;
  completed_at?: number;
}

export interface DownloadProgressPayload {
  task_id: string;
  downloaded_bytes: number;
  total_bytes: number;
  progress: number;
  speed: number; // bytes / second
  status: TaskStatus;
  error?: string;
}

export interface AppSettings {
  default_download_dir: string;
  auto_organize_by_author: boolean;
  auto_organize_by_date: boolean;
  naming_template: string;
  auto_monitor_clipboard: boolean;
  max_concurrent_downloads: number;
  theme: 'dark' | 'light' | 'system';
  close_to_tray: boolean;
}

export interface StartDownloadParams {
  url: string;
  title: string;
  platform: string;
  media_type: 'video' | 'image' | 'audio';
  quality?: string;
  author?: string;
  custom_save_path?: string;
}
