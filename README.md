# Free Video Downloader 桌面端无水印视频下载器

<div align="center">

![Free Video Downloader](https://img.shields.io/badge/Tauri-v2.0-blue?style=for-the-badge&logo=tauri)
![React](https://img.shields.io/badge/React-18.3-61dafb?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178c6?style=for-the-badge&logo=typescript)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8?style=for-the-badge&logo=tailwindcss)
![Rust](https://img.shields.io/badge/Rust-Tokio_Async-orange?style=for-the-badge&logo=rust)

基于 **Tauri v2 + React 18 + TypeScript + Vite + Tailwind CSS** 构建的高性能跨平台桌面端短视频无水印下载工具。

</div>

---

## ✨ 核心特性

- ⚡ **深度协议逆向解析**：完整还原 HelloTik 的动态网关签名鉴权（Gate Auth）、AES-256-GCM 请求信封加密与 AES-256-CBC 响应密文解密机制，秒级提取直链。
- 🎬 **多清晰度自选下载**：支持 540p、720p、1080p、4K超高清/原画等多个清晰度档位自由选择与一键下载。
- 🖼️ **图集与实况 LivePhoto**：完整支持小红书、抖音等图文作品的高清原图瀑布流画廊预览、单张下载与一键打包下载全部图集。
- 🎵 **背景音乐一键提取**：自动分离短视频 BGM，支持独立保存为 MP3 音频文件。
- 📋 **剪贴板智能监听**：在抖音、小红书等客户端复制分享文本后，桌面应用智能识别并浮窗提示“一键解析”，省去手动粘贴步骤。
- 🚀 **Tokio 高性能流式下载引擎**：Rust 原生异步分块流式写入、支持断点续传（HTTP `Range`）与实时下载网速（MB/s）计算。
- 📁 **智能归档与文件管理**：支持按「原作者」或「下载日期」自动分层建立子文件夹，下载完成后支持在系统资源管理器中一键定位高亮文件。
- 🎨 **极简毛玻璃无边框美学**：自定义现代无边框磨砂顶栏，支持深色极夜 / 浅色明亮 / 跟随系统主题自适应切换。

---

## 🌐 支持平台

| 平台 | 视频解析 | 图集/LivePhoto | 音频提取 | 多清晰度 |
|---|:---:|:---:|:---:|:---:|
| **抖音 (Douyin)** | ✅ | ✅ | ✅ | ✅ (540p/720p/1080p/超高清) |
| **小红书 (Rednote)** | ✅ | ✅ | ✅ | ✅ |
| **TikTok** | ✅ | ✅ | ✅ | ✅ |
| **快手 (Kuaishou)** | ✅ | ✅ | ✅ | ✅ |
| **Bilibili (B站)** | ✅ | ✅ | ✅ | ✅ |
| **Instagram** | ✅ | ✅ | ✅ | ✅ |

---

## 🛠️ 技术架构

```
FreeVideoDownloader/
├── src-tauri/               # Rust 后端核心
│   ├── src/
│   │   ├── commands.rs      # Tauri v2 IPC 命令处理层
│   │   ├── downloader.rs    # Tokio 异步流式下载器与断点续传
│   │   ├── models.rs        # 数据结构与接口传输实体
│   │   ├── parser.rs        # HelloTik 端到端加解密逆向引擎 (AES-GCM / CBC / SHA256)
│   │   ├── storage.rs       # 本地配置与下载历史持久化、文件名清洗
│   │   ├── lib.rs           # Tauri 插件注册与 AppState 注入
│   │   └── main.rs          # 桌面启动入口
│   ├── capabilities/        # Tauri v2 权限与安全策略配置
│   ├── Cargo.toml           # Rust 依赖声明
│   └── tauri.conf.json      # Tauri 窗口与构建配置
├── src/                     # React 前端工程
│   ├── components/
│   │   ├── download/        # 实时下载队列与历史记录面板
│   │   ├── layout/          # 自定义无边框毛玻璃顶栏 (TitleBar)
│   │   ├── media/           # 媒体结果卡片、清晰度标签、内置播放器与画廊
│   │   ├── parser/          # 智能输入框与剪贴板监听弹窗
│   │   └── settings/        # 偏好设置面板 (下载目录/归档规则/主题)
│   ├── hooks/               # useClipboard, useDownloadManager, useTheme
│   ├── services/            # tauriApi IPC 桥接与事件订阅
│   ├── types/               # 全局 TypeScript 类型定义
│   ├── App.tsx              # 应用主界面组织
│   └── index.css            # 全局样式与 Tailwind 指令
├── package.json
└── vite.config.ts
```

---

## 🚀 快速开始与本地开发

### 环境准备
- **Node.js**: >= 18.0.0
- **Rust**: >= 1.75.0 (`rustc --version`)
- **包管理器**: `npm` 或 `pnpm`

### 安装与运行
```bash
# 1. 克隆项目
git clone https://github.com/your-username/FreeVideoDownloader.git
cd FreeVideoDownloader

# 2. 安装前端依赖
npm install

# 3. 启动本地桌面端开发模式
npm run tauri dev
```

### 构建打包发布
```bash
# 构建 Windows 安装包 (MSI / EXE / NSIS)
npm run tauri build
```

---

## 📄 免责声明

本工具仅供技术交流与个人学习研究使用。视频与图片版权均归原平台及创作者所有，请勿用于任何商业盈利或侵犯他人知识产权之行为。
