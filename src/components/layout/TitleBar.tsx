import React, { useState, useEffect } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import {
  Minus,
  Square,
  X,
  Sun,
  Moon,
  Video,
  Settings,
  FolderOpen,
} from "lucide-react";
import { ThemeMode } from "../../hooks/useTheme";

interface TitleBarProps {
  theme: ThemeMode;
  isDark: boolean;
  onToggleTheme: () => void;
  onOpenSettings: () => void;
  onOpenFolder: () => void;
  onClose?: () => void;
}

export const TitleBar: React.FC<TitleBarProps> = ({
  isDark,
  onToggleTheme,
  onOpenSettings,
  onOpenFolder,
  onClose,
}) => {
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    let unlisten: (() => void) | undefined;
    const checkMaximized = async () => {
      try {
        const appWindow = getCurrentWindow();
        setIsMaximized(await appWindow.isMaximized());
        unlisten = await appWindow.onResized(async () => {
          setIsMaximized(await appWindow.isMaximized());
        });
      } catch (e) {
        console.warn("Not in Tauri window environment:", e);
      }
    };
    checkMaximized();
    return () => {
      if (unlisten) unlisten();
    };
  }, []);

  const handleMinimize = async () => {
    try {
      await getCurrentWindow().minimize();
    } catch (e) {
      console.warn(e);
    }
  };

  const handleToggleMaximize = async () => {
    try {
      await getCurrentWindow().toggleMaximize();
    } catch (e) {
      console.warn(e);
    }
  };

  const handleClose = async () => {
    if (onClose) {
      onClose();
      return;
    }
    try {
      await getCurrentWindow().close();
    } catch (e) {
      console.warn(e);
    }
  };


  return (
    <header
      data-tauri-drag-region
      className="h-11 w-full flex items-center justify-between px-3.5 select-none border-b border-slate-200/60 dark:border-slate-800/60 bg-white/65 dark:bg-slate-900/65 backdrop-blur-2xl z-50 fixed top-0 left-0 right-0"
    >
      {/* Left: App Logo & Title */}
      <div className="flex items-center gap-2.5 pointer-events-none" data-tauri-drag-region>
        <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-indigo-600 via-violet-600 to-indigo-500 flex items-center justify-center text-white shadow-sm shadow-indigo-500/30">
          <Video className="w-3.5 h-3.5" aria-hidden="true" />
        </div>
        <span className="text-xs font-semibold tracking-tight text-slate-800 dark:text-slate-200">
          Free Video Downloader
        </span>
        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-medium border border-indigo-200/40 dark:border-indigo-800/40">
          v1.0
        </span>
      </div>

      {/* Right: Actions & Window Controls */}
      <div className="flex items-center gap-1">
        {/* Open Download Directory Button */}
        <button
          type="button"
          onClick={onOpenFolder}
          title="打开默认下载目录"
          aria-label="打开默认下载目录"
          className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 active:scale-95 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none transition-colors"
        >
          <FolderOpen className="w-3.5 h-3.5" aria-hidden="true" />
        </button>

        {/* Theme Switcher Button */}
        <button
          type="button"
          onClick={onToggleTheme}
          title={isDark ? "切换为浅色主题" : "切换为深色主题"}
          aria-label={isDark ? "切换为浅色主题" : "切换为深色主题"}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 active:scale-95 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none transition-colors"
        >
          {isDark ? (
            <Sun className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
          ) : (
            <Moon className="w-3.5 h-3.5 text-slate-600" aria-hidden="true" />
          )}
        </button>

        {/* Settings Button */}
        <button
          type="button"
          onClick={onOpenSettings}
          title="偏好设置"
          aria-label="偏好设置"
          className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 active:scale-95 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none transition-colors mr-1.5"
        >
          <Settings className="w-3.5 h-3.5" aria-hidden="true" />
        </button>

        <div className="h-3.5 w-[1px] bg-slate-200 dark:bg-slate-800 mr-1" aria-hidden="true" />

        {/* Minimize Button */}
        <button
          type="button"
          onClick={handleMinimize}
          title="最小化窗口"
          aria-label="最小化窗口"
          className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 active:scale-95 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none transition-colors"
        >
          <Minus className="w-3.5 h-3.5" aria-hidden="true" />
        </button>

        {/* Maximize / Restore Button */}
        <button
          type="button"
          onClick={handleToggleMaximize}
          title={isMaximized ? "还原窗口" : "最大化窗口"}
          aria-label={isMaximized ? "还原窗口" : "最大化窗口"}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 active:scale-95 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none transition-colors"
        >
          <Square className="w-3 h-3" aria-hidden="true" />
        </button>

        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          title="关闭窗口"
          aria-label="关闭窗口"
          className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-500 hover:text-white hover:bg-rose-500 dark:text-slate-400 dark:hover:bg-rose-600 active:scale-95 focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:outline-none transition-colors"
        >
          <X className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
      </div>
    </header>
  );
};
