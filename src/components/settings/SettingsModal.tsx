import React, { useState, useEffect } from "react";
import { AppSettings } from "../../types";
import { tauriApi } from "../../services/tauriApi";
import {
  X,
  Folder,
  Settings,
  FolderOpen,
  Check,
  Moon,
  Sun,
  Monitor,
  FolderTree,
  Calendar,
  ClipboardPaste,
} from "lucide-react";
import { toast } from "sonner";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onThemeChange: (theme: "dark" | "light" | "system") => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onThemeChange,
}) => {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      tauriApi.getSettings().then((s) => setSettings(s)).catch((e) => console.warn(e));
    }
  }, [isOpen]);

  if (!isOpen || !settings) return null;

  const handleSelectFolder = async () => {
    const selected = await tauriApi.selectDirectory(settings.default_download_dir);
    if (selected) {
      setSettings({ ...settings, default_download_dir: selected });
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await tauriApi.saveSettings(settings);
      onThemeChange(settings.theme);
      toast.success("配置已保存");
      onClose();
    } catch (e: any) {
      toast.error("保存失败", { description: String(e) });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="偏好设置"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 animate-fade-in"
    >
      <div className="relative w-full max-w-md film-panel rounded-xl overflow-hidden shadow-xl border border-[var(--card-border)] flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--card-border)] bg-[var(--raised-bg)]">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-[var(--card-bg)] border border-[var(--card-border)] flex items-center justify-center text-amber-600 dark:text-amber-500">
              <Settings className="w-3.5 h-3.5" aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-[var(--text-primary)]">
                偏好设置
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭偏好设置"
            className="w-6 h-6 rounded flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--card-bg)] transition-colors"
          >
            <X className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>

        {/* Settings Body */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1 text-xs">
          {/* Download Path */}
          <div className="space-y-1.5">
            <label
              htmlFor="default-download-path"
              className="font-medium text-[var(--text-primary)] flex items-center gap-1.5 cursor-pointer"
            >
              <Folder className="w-3.5 h-3.5 text-amber-600 dark:text-amber-500" aria-hidden="true" />
              <span>保存路径</span>
            </label>
            <div className="flex items-center gap-1.5">
              <input
                id="default-download-path"
                name="downloadPath"
                type="text"
                readOnly
                aria-label="当前默认下载保存路径"
                value={settings.default_download_dir}
                className="flex-1 px-3 py-1.5 rounded-md bg-[var(--raised-bg)] border border-[var(--card-border)] text-[var(--text-secondary)] font-mono text-[11px] focus:outline-none"
              />
              <button
                type="button"
                onClick={handleSelectFolder}
                aria-label="选择新的默认下载目录"
                className="px-2.5 py-1.5 rounded-md bg-[var(--raised-bg)] hover:bg-[var(--bg-deep)] border border-[var(--card-border)] text-[var(--text-primary)] text-xs font-medium flex items-center gap-1 shrink-0 transition-colors"
              >
                <FolderOpen className="w-3.5 h-3.5" aria-hidden="true" />
                <span>选择</span>
              </button>
            </div>
          </div>

          {/* Smart Organization */}
          <div className="space-y-2 pt-2.5 border-t border-[var(--card-border)]">
            <h4 className="font-medium text-[var(--text-primary)]">
              归档分类
            </h4>

            <label className="flex items-center justify-between p-2.5 rounded-lg bg-[var(--raised-bg)] border border-[var(--card-border)] cursor-pointer transition-colors">
              <div className="flex items-center gap-2">
                <FolderTree className="w-3.5 h-3.5 text-[var(--text-muted)]" aria-hidden="true" />
                <div>
                  <span className="font-medium text-[var(--text-primary)]">
                    按原作者建立子目录
                  </span>
                  <p className="text-[10px] text-[var(--text-muted)]">
                    以创作者昵称归纳下载文件
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.auto_organize_by_author}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    auto_organize_by_author: e.target.checked,
                  })
                }
                className="w-3.5 h-3.5 accent-amber-600 rounded"
              />
            </label>

            <label className="flex items-center justify-between p-2.5 rounded-lg bg-[var(--raised-bg)] border border-[var(--card-border)] cursor-pointer transition-colors">
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-[var(--text-muted)]" aria-hidden="true" />
                <div>
                  <span className="font-medium text-[var(--text-primary)]">
                    按下载日期建立子目录
                  </span>
                  <p className="text-[10px] text-[var(--text-muted)]">
                    按 YYYY-MM-DD 归档
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.auto_organize_by_date}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    auto_organize_by_date: e.target.checked,
                  })
                }
                className="w-3.5 h-3.5 accent-amber-600 rounded"
              />
            </label>
          </div>

          {/* Smart Clipboard */}
          <div className="space-y-2 pt-2.5 border-t border-[var(--card-border)]">
            <h4 className="font-medium text-[var(--text-primary)]">
              系统监听
            </h4>

            <label className="flex items-center justify-between p-2.5 rounded-lg bg-[var(--raised-bg)] border border-[var(--card-border)] cursor-pointer transition-colors">
              <div className="flex items-center gap-2">
                <ClipboardPaste className="w-3.5 h-3.5 text-[var(--text-muted)]" aria-hidden="true" />
                <div>
                  <span className="font-medium text-[var(--text-primary)]">
                    剪贴板短视频链接监听
                  </span>
                  <p className="text-[10px] text-[var(--text-muted)]">
                    复制分享链接时提示快捷解析
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.auto_monitor_clipboard}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    auto_monitor_clipboard: e.target.checked,
                  })
                }
                className="w-3.5 h-3.5 accent-amber-600 rounded"
              />
            </label>
          </div>

          {/* Theme Selection */}
          <div className="space-y-2 pt-2.5 border-t border-[var(--card-border)]">
            <h4 className="font-medium text-[var(--text-primary)]">
              外观主题
            </h4>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "light", name: "暖调浅色", icon: <Sun className="w-3.5 h-3.5" /> },
                { id: "dark", name: "暖黑深色", icon: <Moon className="w-3.5 h-3.5" /> },
                { id: "system", name: "跟随系统", icon: <Monitor className="w-3.5 h-3.5" /> },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={settings.theme === item.id}
                  onClick={() =>
                    setSettings({ ...settings, theme: item.id as any })
                  }
                  className={`p-2 rounded-md border flex flex-col items-center gap-1 transition-colors ${
                    settings.theme === item.id
                      ? "border-amber-500 bg-[var(--card-bg)] text-amber-600 dark:text-amber-400 font-medium"
                      : "border-[var(--card-border)] bg-[var(--raised-bg)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  {item.icon}
                  <span className="text-[11px]">{item.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-4 py-2.5 border-t border-[var(--card-border)] bg-[var(--raised-bg)]">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-md text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--card-bg)] border border-[var(--card-border)] transition-colors"
          >
            取消
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isLoading}
            className="px-3.5 py-1.5 rounded-md text-xs font-medium text-white bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600 dark:text-zinc-950 flex items-center gap-1 transition-colors"
          >
            <Check className="w-3.5 h-3.5" aria-hidden="true" />
            <span>保存</span>
          </button>
        </div>
      </div>
    </div>
  );
};
