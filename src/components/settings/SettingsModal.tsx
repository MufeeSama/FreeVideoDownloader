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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg glass-panel bg-white/95 dark:bg-slate-900/95 rounded-3xl overflow-hidden shadow-2xl border border-slate-200/80 dark:border-slate-800/80 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200/60 dark:border-slate-800/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-violet-100 dark:bg-violet-950/80 flex items-center justify-center text-violet-600 dark:text-violet-400">
              <Settings className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              偏好设置
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Settings Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Download Path */}
          <div className="space-y-2">
            <label className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Folder className="w-4 h-4 text-violet-500" />
              默认下载保存路径
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={settings.default_download_dir}
                className="flex-1 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 font-mono text-[11px] focus:outline-none"
              />
              <button
                type="button"
                onClick={handleSelectFolder}
                className="px-3 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-medium flex items-center gap-1 shrink-0 transition-colors"
              >
                <FolderOpen className="w-3.5 h-3.5" />
                <span>更改目录</span>
              </button>
            </div>
          </div>

          {/* Smart Organization */}
          <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
            <h4 className="font-semibold text-slate-800 dark:text-slate-200">
              文件归档与命名规则
            </h4>

            <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100/80 dark:hover:bg-slate-800 cursor-pointer transition-colors">
              <div>
                <span className="font-medium text-slate-800 dark:text-slate-200">
                  按原作者自动分类文件夹
                </span>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  在下载目录下以视频作者昵称创建独立子文件夹
                </p>
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
                className="w-4 h-4 rounded text-violet-600 focus:ring-violet-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100/80 dark:hover:bg-slate-800 cursor-pointer transition-colors">
              <div>
                <span className="font-medium text-slate-800 dark:text-slate-200">
                  按下载日期自动分类文件夹
                </span>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  按 YYYY-MM-DD 年月日建立分层文件夹
                </p>
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
                className="w-4 h-4 rounded text-violet-600 focus:ring-violet-500"
              />
            </label>
          </div>

          {/* Smart Clipboard */}
          <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
            <h4 className="font-semibold text-slate-800 dark:text-slate-200">
              智能特性
            </h4>

            <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100/80 dark:hover:bg-slate-800 cursor-pointer transition-colors">
              <div>
                <span className="font-medium text-slate-800 dark:text-slate-200">
                  剪贴板短视频链接智能监听
                </span>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  从抖音/小红书等平台复制分享链接时自动提示一键解析
                </p>
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
                className="w-4 h-4 rounded text-violet-600 focus:ring-violet-500"
              />
            </label>
          </div>

          {/* Theme Selection */}
          <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
            <h4 className="font-semibold text-slate-800 dark:text-slate-200">
              外观主题偏好
            </h4>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "light", name: "浅色明亮", icon: <Sun className="w-4 h-4" /> },
                { id: "dark", name: "深色极夜", icon: <Moon className="w-4 h-4" /> },
                { id: "system", name: "跟随系统", icon: <Monitor className="w-4 h-4" /> },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() =>
                    setSettings({ ...settings, theme: item.id as any })
                  }
                  className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition-all ${
                    settings.theme === item.id
                      ? "border-violet-500 bg-violet-50/60 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 font-semibold"
                      : "border-slate-200/80 dark:border-slate-700/80 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  }`}
                >
                  {item.icon}
                  <span className="text-xs">{item.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-slate-200/60 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/50">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-violet-600 hover:bg-violet-500 shadow-md shadow-violet-600/30 flex items-center gap-1.5 transition-all"
          >
            <Check className="w-4 h-4" />
            <span>保存配置</span>
          </button>
        </div>
      </div>
    </div>
  );
};
