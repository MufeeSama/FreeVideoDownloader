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
}

export const TitleBar: React.FC<TitleBarProps> = ({
  isDark,
  onToggleTheme,
  onOpenSettings,
  onOpenFolder,
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
    try {
      await getCurrentWindow().close();
    } catch (e) {
      console.warn(e);
    }
  };

  return (
    <header
      data-tauri-drag-region
      className="h-10 w-full flex items-center justify-between px-3 select-none border-b border-slate-200/50 dark:border-slate-800/50 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl z-50 fixed top-0 left-0 right-0"
    >
      {/* Left: App Logo & Title */}
      <div className="flex items-center gap-2 pointer-events-none" data-tauri-drag-region>
        <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center text-white shadow-sm shadow-violet-500/30">
          <Video className="w-3.5 h-3.5" />
        </div>
        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 tracking-wide">
          Free Video Downloader
        </span>
        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-violet-100 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 font-medium">
          v1.0
        </span>
      </div>

      {/* Right: Actions & Window Controls */}
      <div className="flex items-center gap-1">
        {/* Open Download Directory Button */}
        <button
          onClick={onOpenFolder}
          title="打开默认下载目录"
          className="w-7 h-7 flex items-center justify-center rounded-md text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <FolderOpen className="w-3.5 h-3.5" />
        </button>

        {/* Theme Switcher Button */}
        <button
          onClick={onToggleTheme}
          title={isDark ? "切换为浅色主题" : "切换为深色主题"}
          className="w-7 h-7 flex items-center justify-center rounded-md text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          {isDark ? (
            <Sun className="w-3.5 h-3.5 text-amber-400" />
          ) : (
            <Moon className="w-3.5 h-3.5 text-slate-600" />
          )}
        </button>

        {/* Settings Button */}
        <button
          onClick={onOpenSettings}
          title="设置"
          className="w-7 h-7 flex items-center justify-center rounded-md text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors mr-2"
        >
          <Settings className="w-3.5 h-3.5" />
        </button>

        <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-800 mr-1" />

        {/* Minimize Button */}
        <button
          onClick={handleMinimize}
          title="最小化"
          className="w-7 h-7 flex items-center justify-center rounded-md text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>

        {/* Maximize / Restore Button */}
        <button
          onClick={handleToggleMaximize}
          title={isMaximized ? "还原" : "最大化"}
          className="w-7 h-7 flex items-center justify-center rounded-md text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <Square className="w-3 h-3" />
        </button>

        {/* Close Button */}
        <button
          onClick={handleClose}
          title="关闭"
          className="w-7 h-7 flex items-center justify-center rounded-md text-slate-500 hover:text-white hover:bg-rose-500 dark:text-slate-400 dark:hover:bg-rose-600 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
};
