import { useState, useEffect, useCallback } from "react";
import { DownloadTaskRecord, StartDownloadParams, DownloadProgressPayload } from "../types";
import { tauriApi } from "../services/tauriApi";
import { toast } from "sonner";

export function useDownloadManager() {
  const [tasks, setTasks] = useState<DownloadTaskRecord[]>([]);
  const [history, setHistory] = useState<DownloadTaskRecord[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const refreshHistory = useCallback(async () => {
    setIsLoadingHistory(true);
    try {
      const records = await tauriApi.getHistory();
      setHistory(records);
    } catch (e) {
      console.warn("Failed to fetch history:", e);
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    refreshHistory();

    let unlistenProgress: (() => void) | undefined;
    let unlistenCompleted: (() => void) | undefined;
    let unlistenFailed: (() => void) | undefined;

    const setupListeners = async () => {
      unlistenProgress = await tauriApi.onDownloadProgress((payload: DownloadProgressPayload) => {
        setTasks((prev) => {
          const idx = prev.findIndex((t) => t.id === payload.task_id);
          if (idx !== -1) {
            const updated = [...prev];
            updated[idx] = {
              ...updated[idx],
              downloaded_bytes: payload.downloaded_bytes,
              total_bytes: payload.total_bytes,
              progress: payload.progress,
              speed: payload.speed,
              status: payload.status,
            };
            return updated;
          }
          return prev;
        });
      });

      unlistenCompleted = await tauriApi.onDownloadCompleted((data) => {
        setTasks((prev) => prev.filter((t) => t.id !== data.task_id));
        refreshHistory();
        toast.success("视频下载完成！", {
          description: data.save_path,
          action: {
            label: "在文件夹中打开",
            onClick: () => tauriApi.openInExplorer(data.save_path),
          },
        });
      });

      unlistenFailed = await tauriApi.onDownloadFailed((data) => {
        setTasks((prev) =>
          prev.map((t) =>
            t.id === data.task_id
              ? { ...t, status: "failed", error_message: data.error }
              : t
          )
        );
        refreshHistory();
        toast.error("下载遇到错误", {
          description: data.error,
        });
      });
    };

    setupListeners();

    return () => {
      if (unlistenProgress) unlistenProgress();
      if (unlistenCompleted) unlistenCompleted();
      if (unlistenFailed) unlistenFailed();
    };
  }, [refreshHistory]);

  const startDownload = async (params: StartDownloadParams) => {
    try {
      const record = await tauriApi.startDownload(params);
      setTasks((prev) => [record, ...prev]);
      toast.info(`已加入下载队列: ${params.title}`);
    } catch (e: any) {
      toast.error("启动下载失败", { description: String(e) });
    }
  };

  const cancelDownload = async (taskId: string) => {
    try {
      await tauriApi.cancelDownload(taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      toast.info("已取消下载");
    } catch (e: any) {
      toast.error("取消下载失败", { description: String(e) });
    }
  };

  const clearHistory = async () => {
    try {
      await tauriApi.clearHistory();
      setHistory([]);
      toast.success("已清空历史记录");
    } catch (e: any) {
      toast.error("清空历史记录失败", { description: String(e) });
    }
  };

  return {
    tasks,
    history,
    isLoadingHistory,
    startDownload,
    cancelDownload,
    clearHistory,
    refreshHistory,
  };
}
