import React, { useState, useEffect } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import {
  Minus,
  Square,
  X,
  Sun,
  Moon,
  Film,
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
      className="h-10 w-full flex items-center justify-between px-3 select-none border-b border-[var(--card-border)] bg-[#fdfbf7] dark:bg-[#12110f] z-50 fixed top-0 left-0 right-0"
    >
      {/* Left: App Logo & Title */}
      <div className="flex items-center gap-2 pointer-events-none" data-tauri-drag-region>
        <div className="w-5 h-5 rounded bg-[#efe9df] dark:bg-[#262421] border border-[var(--card-border)] flex items-center justify-center text-amber-600 dark:text-amber-500">
          <Film className="w-3 h-3" aria-hidden="true" />
        </div>
        <span className="text-xs font-medium text-[var(--text-primary)]">
          Free Video Downloader
        </span>
        <span className="text-[10px] font-mono text-[var(--text-muted)]">
          v1.0
        </span>
      </div>

      {/* Right: Actions & Window Controls */}
      <div className="flex items-center gap-0.5">
        {/* Open Download Directory Button */}
        <button
          type="button"
          onClick={onOpenFolder}
          title="打开下载目录"
          aria-label="打开下载目录"
          className="w-7 h-7 flex items-center justify-center rounded text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--raised-bg)] focus-visible:ring-1 focus-visible:ring-amber-500 focus-visible:outline-none transition-colors"
        >
          <FolderOpen className="w-3.5 h-3.5" aria-hidden="true" />
        </button>

        {/* Theme Switcher Button */}
        <button
          type="button"
          onClick={onToggleTheme}
          title={isDark ? "浅色主题" : "深色主题"}
          aria-label={isDark ? "浅色主题" : "深色主题"}
          className="w-7 h-7 flex items-center justify-center rounded text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--raised-bg)] focus-visible:ring-1 focus-visible:ring-amber-500 focus-visible:outline-none transition-colors"
        >
          {isDark ? (
            <Sun className="w-3.5 h-3.5" aria-hidden="true" />
          ) : (
            <Moon className="w-3.5 h-3.5" aria-hidden="true" />
          )}
        </button>

        {/* Settings Button */}
        <button
          type="button"
          onClick={onOpenSettings}
          title="设置"
          aria-label="设置"
          className="w-7 h-7 flex items-center justify-center rounded text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--raised-bg)] focus-visible:ring-1 focus-visible:ring-amber-500 focus-visible:outline-none transition-colors mr-1"
        >
          <Settings className="w-3.5 h-3.5" aria-hidden="true" />
        </button>

        <div className="h-3 w-[1px] bg-[var(--card-border)] mr-1" aria-hidden="true" />

        {/* Minimize Button */}
        <button
          type="button"
          onClick={handleMinimize}
          title="最小化"
          aria-label="最小化"
          className="w-7 h-7 flex items-center justify-center rounded text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--raised-bg)] focus-visible:ring-1 focus-visible:ring-amber-500 focus-visible:outline-none transition-colors"
        >
          <Minus className="w-3.5 h-3.5" aria-hidden="true" />
        </button>

        {/* Maximize / Restore Button */}
        <button
          type="button"
          onClick={handleToggleMaximize}
          title={isMaximized ? "还原" : "最大化"}
          aria-label={isMaximized ? "还原" : "最大化"}
          className="w-7 h-7 flex items-center justify-center rounded text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--raised-bg)] focus-visible:ring-1 focus-visible:ring-amber-500 focus-visible:outline-none transition-colors"
        >
          <Square className="w-3 h-3" aria-hidden="true" />
        </button>

        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          title="关闭"
          aria-label="关闭"
          className="w-7 h-7 flex items-center justify-center rounded text-[var(--text-muted)] hover:text-white hover:bg-[#e5484d] dark:hover:bg-[#e5484d] focus-visible:ring-1 focus-visible:ring-[#e5484d] focus-visible:outline-none transition-colors"
        >
          <X className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
      </div>
    </header>
  );
};
