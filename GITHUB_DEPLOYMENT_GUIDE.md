# GitHub 代码推送与部署指南

本文档详细说明了该项目如何将网站代码推送到 GitHub 仓库。

---

## 📋 目录

1. [部署流程概览](#部署流程概览)
2. [核心部署脚本](#核心部署脚本)
3. [完整自动化流程](#完整自动化流程)
4. [手动部署步骤](#手动部署步骤)
5. [相关 npm 命令](#相关-npm-命令)
6. [技术细节](#技术细节)

---

## 🚀 部署流程概览

该项目使用 **GitHub CLI (gh)** 进行自动化的 GitHub 仓库创建和代码推送。

### 主要特点

✅ **全自动化** - 从创建仓库到推送代码，一条命令完成
✅ **多网站支持** - 支持从 config.csv 读取多个网站配置
✅ **私有仓库** - 默认创建私有 GitHub 仓库
✅ **干净代码** - 排除 node_modules、.git 等无需推送的文件
✅ **安全备份** - 使用临时目录，不影响原项目

---

## 🔧 核心部署脚本

### 1. `scripts/deploy-and-template.js`

这是核心的 GitHub 部署脚本，执行以下操作：

#### **工作流程**

```
1. 读取配置 (config.csv) 获取网站名称
   ↓
2. 检查 GitHub CLI 是否已安装
   ↓
3. 创建新的 GitHub 私有仓库
   ↓
4. 创建临时目录
   ↓
5. 复制项目文件到临时目录（排除不需要的文件）
   ↓
6. 在临时目录初始化 Git 仓库
   ↓
7. 提交所有文件
   ↓
8. 推送到新的 GitHub 仓库
   ↓
9. 清理临时目录
   ↓
10. 显示成功信息和仓库链接
```

#### **关键代码片段**

```javascript
// 1. 创建新的私有 GitHub 仓库
execSync(`gh repo create ${siteName} --private --description "${repoDescription}"`);

// 2. 复制文件（排除特定目录）
const exclude = ['.git', 'node_modules', 'dist', '.astro', '.temp-deploy', 'newarticle', 'scheduledarticle'];
execSync(`robocopy "${currentDir}" "${tempDir}" /E /NFL /NDL /NJH /NJS /nc /ns /np /XD ${excludeDirs}`);

// 3. 在临时目录初始化 Git 并推送
execSync('git init', { cwd: tempDir });
execSync('git add .', { cwd: tempDir });
execSync(`git commit -m "Initial commit from ${siteName}"`, { cwd: tempDir });
execSync('git branch -M main', { cwd: tempDir });
execSync(`git remote add origin ${repoUrl}`, { cwd: tempDir });
execSync('git push -u origin main', { cwd: tempDir });
```

#### **生成的仓库 URL 格式**

```
https://github.com/paladinGG/${siteName}.git
```

例如：`https://github.com/paladinGG/SoulNestor.git`

---

### 2. `scripts/reset-site.js`

这是完整的网站重置和部署自动化脚本，包含 16 个自动化任务。

#### **任务列表**

| 步骤 | 任务名称 | 命令 | 说明 |
|------|---------|------|------|
| 1 | 清空HTML文章 | `node scripts/clear-html-articles.js` | 清理临时文章文件 |
| 2 | 删除所有现有文章 | `npm run delete-all-articles` | 清除旧的文章内容 |
| 3 | 更新主题配置 | `npm run update-theme-fixed` | 应用新主题样式 |
| 4 | 更新文章配置 | `npm run update-articles-full` | 生成文章配置 |
| 5 | **生成文章** | `npm run generate-articles` | AI 生成文章内容 |
| 6 | 同步配置 | `npm run sync-config` | 同步配置到模板 |
| 7 | 添加文章到网站 | `npm run add-articles-improved` | 集成新文章 |
| 8 | 生成新主题方向 | `npm run generate-new-topics` | 创建未来主题 |
| 9 | 生成定时文章 | `npm run generate-articles -- -s -k 25 -c 15` | 生成 15 篇定时文章 |
| 10 | 设置定时发布 | `npm run schedule-articles` | 配置发布时间 |
| 11 | **生成AI图标** | `npm run generate-ai-favicon` | DALL-E 3 生成图标 |
| 12 | 生成图标文件 | `npm run generate-favicon` | 多尺寸图标生成 |
| 13 | **更新网站图标** | `npm run update-favicon` | 部署图标到网站 |
| 14 | 修复损坏图片 | `npm run fix-images` | 检测并修复图片 |
| 15 | **构建网站** | `npm run build` | 验证并构建网站 |
| 16 | **创建GitHub仓库并推送** | `npm run deploy-template` | 推送到 GitHub |

#### **多网站支持**

`reset-site.js` 支持从 `config.csv` 读取多个网站配置，并依次为每个网站执行完整流程：

```javascript
// 为每个配置运行一次完整流程
for (let i = 0; i < configs.length; i++) {
  const config = configs[i];

  log(`处理网站 ${i + 1}/${configCount}`);
  log(`主题: ${config.theme}`);
  log(`域名: ${config.domain}`);
  log(`名称: ${config.siteName}`);

  // 设置当前配置索引
  setCurrentIndex(i + 1);

  // 运行所有 16 个任务
  await runSingleSite();
}
```

---

## 📦 完整自动化流程

### 一键部署命令

```bash
# 方式 1: 仅部署到 GitHub
npm run deploy-template

# 方式 2: 完整流程（生成内容 + 部署）
npm run reset-site
```

### `npm run reset-site` 完整流程

```
开始
  ↓
读取 config.csv (多网站配置)
  ↓
为每个网站循环执行：
  ├─ 清理旧内容
  ├─ 更新主题配置
  ├─ 生成 AI 文章内容
  ├─ 添加文章到网站
  ├─ 生成定时发布文章
  ├─ 生成 AI 图标 (DALL-E 3)
  ├─ 处理多尺寸图标
  ├─ 更新网站图标
  ├─ 修复损坏图片
  ├─ 构建网站验证
  └─ 创建 GitHub 仓库并推送 ✅
  ↓
完成所有网站
```

---

## 🔨 手动部署步骤

如果需要手动控制部署过程：

### 1. 前置条件

```bash
# 安装 GitHub CLI
# Windows
winget install GitHub.cli

# Mac
brew install gh

# 验证安装
gh --version

# 登录 GitHub
gh auth login
```

### 2. 配置网站信息

编辑 `config.csv` 或 `config.template.js`：

```javascript
export const CURRENT_WEBSITE_CONTENT = {
  "siteName": "SoulNestor",      // 仓库名称
  "domain": "soulnestor.com",
  "theme": "Mental Health & Mindfulness"
};
```

### 3. 生成网站内容

```bash
# 更新主题
npm run update-theme-fixed

# 生成文章
npm run generate-articles

# 生成图标
npm run generate-ai-favicon
npm run generate-favicon
npm run update-favicon

# 构建网站
npm run build
```

### 4. 部署到 GitHub

```bash
# 运行部署脚本
npm run deploy-template
```

或手动执行：

```bash
# 创建 GitHub 仓库
gh repo create SoulNestor --private --description "SoulNestor - Mental Health Blog"

# 初始化 Git（如果还没有）
git init
git add .
git commit -m "Initial commit"

# 推送到 GitHub
git branch -M main
git remote add origin https://github.com/paladinGG/SoulNestor.git
git push -u origin main
```

---

## 📝 相关 npm 命令

### 图标相关

```bash
# 生成 AI 图标（DALL-E 3 或 Replicate）
npm run generate-ai-favicon

# 处理多尺寸图标
npm run generate-favicon

# 部署图标到网站
npm run update-favicon
```

### 网站内容

```bash
# 更新主题配置
npm run update-theme-fixed

# 生成文章
npm run generate-articles

# 添加文章到网站
npm run add-articles-improved

# 构建网站
npm run build
```

### 部署相关

```bash
# 仅部署到 GitHub
npm run deploy-template

# 完整流程（推荐）
npm run reset-site
```

### 开发服务器

```bash
# 启动开发服务器
npm run dev

# 清除缓存后启动
npm run dev:fresh

# 预览构建结果
npm run preview
```

---

## 🔍 技术细节

### 1. GitHub CLI 配置

**位置**: `scripts/deploy-and-template.js:29-32`

```javascript
const GH_CLI = process.platform === 'win32'
  ? '"C:\\Program Files\\GitHub CLI\\gh.exe"'
  : 'gh';
```

跨平台支持：
- Windows: `"C:\Program Files\GitHub CLI\gh.exe"`
- macOS/Linux: `gh`

### 2. 排除文件列表

**位置**: `scripts/deploy-and-template.js:120`

```javascript
const exclude = [
  '.git',              // 旧的 Git 历史
  'node_modules',      // Node.js 依赖（大文件）
  'dist',              // 构建输出（可重新生成）
  '.astro',            // Astro 缓存
  '.temp-deploy',      // 部署临时文件
  'newarticle',        // 新文章草稿
  'scheduledarticle'   // 定时发布文章
];
```

### 3. 临时目录策略

**位置**: `scripts/deploy-and-template.js:104`

```javascript
const tempDir = path.join('D:\\temp', `deploy-${siteName}-${Date.now()}`);
```

**优势**：
- ✅ 不影响原项目
- ✅ 每次部署独立目录
- ✅ 时间戳避免冲突
- ✅ 完成后自动清理

### 4. 仓库命名规则

**位置**: `scripts/deploy-and-template.js:93`

```javascript
let repoUrl = `https://github.com/paladinGG/${siteName}.git`;
```

**格式**：`https://github.com/{username}/{siteName}.git`

**示例**：
- SoulNestor → `https://github.com/paladinGG/SoulNestor.git`
- Arkanivo → `https://github.com/paladinGG/Arkanivo.git`
- Mytholyra → `https://github.com/paladinGG/Mytholyra.git`

### 5. Git 提交流程

**位置**: `scripts/deploy-and-template.js:140-146`

```javascript
// 在临时目录初始化 Git
execSync('git init', { cwd: tempDir });                                    // 初始化 Git 仓库
execSync('git add .', { cwd: tempDir });                                   // 添加所有文件
execSync(`git commit -m "Initial commit from ${siteName}"`, { cwd: tempDir }); // 提交
execSync('git branch -M main', { cwd: tempDir });                          // 重命名主分支
execSync(`git remote add origin ${repoUrl}`, { cwd: tempDir });            // 添加远程仓库
execSync('git push -u origin main', { cwd: tempDir });                     // 推送到 GitHub
```

### 6. 错误处理

**位置**: `scripts/deploy-and-template.js:94-100`

```javascript
try {
  execSync(`gh repo create ${siteName} --private --description "${repoDescription}"`);
  log(`✅ 创建私有仓库 ${siteName} 成功`, 'green');
} catch (error) {
  // 仓库已存在，继续推送
  log('⚠️  仓库可能已存在，将直接推送到仓库', 'yellow');
}
```

**智能容错**：
- 如果仓库已存在，不报错，直接推送
- 允许覆盖更新已有仓库

### 7. 文件复制优化 (Windows)

**位置**: `scripts/deploy-and-template.js:125-135`

```javascript
execSync(`robocopy "${currentDir}" "${tempDir}" /E /NFL /NDL /NJH /NJS /nc /ns /np /XD ${excludeDirs}`, {
  stdio: 'inherit'
});
```

**robocopy 参数说明**：
- `/E` - 复制子目录（包括空目录）
- `/NFL` - 不记录文件列表
- `/NDL` - 不记录目录列表
- `/NJH` - 不显示任务头
- `/NJS` - 不显示任务摘要
- `/nc /ns /np` - 不显示类、大小、进度
- `/XD` - 排除指定目录

**返回码处理**：
```javascript
// robocopy 返回码 ≤7 表示成功或部分成功
if (error.status && error.status <= 7) {
  // 成功
} else {
  throw error;
}
```

---

## 📊 完整部署流程图

```
┌─────────────────────────────────────────┐
│   用户执行: npm run reset-site         │
└──────────────┬──────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│   读取 config.csv (多网站配置)         │
└──────────────┬──────────────────────────┘
               ↓
       ┌───────────────┐
       │ 为每个网站：   │
       └───────┬───────┘
               ↓
┌──────────────────────────────────────────┐
│  步骤 1-4: 清理和配置                    │
│  • 清空旧文章                            │
│  • 删除现有内容                          │
│  • 更新主题配置                          │
│  • 生成文章配置                          │
└──────────────┬───────────────────────────┘
               ↓
┌──────────────────────────────────────────┐
│  步骤 5-10: 内容生成                     │
│  • AI 生成文章 (OpenAI GPT-4)           │
│  • 同步配置到模板                        │
│  • 添加文章到网站                        │
│  • 生成新主题方向                        │
│  • 生成定时发布文章                      │
│  • 设置发布时间                          │
└──────────────┬───────────────────────────┘
               ↓
┌──────────────────────────────────────────┐
│  步骤 11-13: 图标生成                    │
│  • AI 生成图标 (DALL-E 3)               │
│  • 背景移除 (Enhanced Sharp)            │
│  • 多尺寸处理 (16x16 ~ 512x512)         │
│  • 部署到 public/ 和 src/assets/        │
│  • 清除缓存                              │
└──────────────┬───────────────────────────┘
               ↓
┌──────────────────────────────────────────┐
│  步骤 14-15: 验证和构建                  │
│  • 修复损坏图片                          │
│  • 构建网站 (Astro build)               │
│  • 生成 Pagefind 搜索索引               │
└──────────────┬───────────────────────────┘
               ↓
┌──────────────────────────────────────────┐
│  步骤 16: GitHub 部署                    │
│  (npm run deploy-template)              │
└──────────────┬───────────────────────────┘
               ↓
       ┌───────────────┐
       │ deploy-and-    │
       │ template.js    │
       └───────┬───────┘
               ↓
┌──────────────────────────────────────────┐
│  1. 检查 GitHub CLI                      │
└──────────────┬───────────────────────────┘
               ↓
┌──────────────────────────────────────────┐
│  2. 创建 GitHub 私有仓库                 │
│     gh repo create ${siteName} --private │
└──────────────┬───────────────────────────┘
               ↓
┌──────────────────────────────────────────┐
│  3. 创建临时目录                         │
│     D:\temp\deploy-${siteName}-${time}  │
└──────────────┬───────────────────────────┘
               ↓
┌──────────────────────────────────────────┐
│  4. 复制文件（排除大文件）               │
│     robocopy /E /XD node_modules .git    │
└──────────────┬───────────────────────────┘
               ↓
┌──────────────────────────────────────────┐
│  5. 在临时目录初始化 Git                 │
│     git init                             │
│     git add .                            │
│     git commit -m "Initial commit"       │
└──────────────┬───────────────────────────┘
               ↓
┌──────────────────────────────────────────┐
│  6. 推送到 GitHub                        │
│     git branch -M main                   │
│     git remote add origin ${repoUrl}     │
│     git push -u origin main              │
└──────────────┬───────────────────────────┘
               ↓
┌──────────────────────────────────────────┐
│  7. 清理临时目录                         │
│     rmdir /s /q "${tempDir}"            │
└──────────────┬───────────────────────────┘
               ↓
┌──────────────────────────────────────────┐
│  ✅ 完成！                               │
│  🔗 https://github.com/paladinGG/...    │
└──────────────────────────────────────────┘
```

---

## 🎯 实际使用示例

### 场景 1: 快速部署单个网站

```bash
# 1. 编辑 config.template.js 设置网站信息
# siteName: "SoulNestor"
# theme: "Mental Health & Mindfulness"

# 2. 一键部署（假设已生成内容）
npm run deploy-template

# 输出:
# ====================================
#   创建新的私有仓库
# ====================================
#
# ▶ 读取当前配置...
#    主题: Mental Health & Mindfulness
#    域名: soulnestor.com
#    网站名: SoulNestor
#
# [1/2] 创建新的私有仓库: SoulNestor
# ✅ 创建私有仓库 SoulNestor 成功
#
# [2/2] 准备干净的代码副本
#    创建临时目录...
#    复制项目文件 (这可能需要几分钟)...
#
# 推送代码到新仓库
# ✅ 代码已成功推送
#
# ====================================
#          ✨ 全部完成！
# ====================================
#
# 📋 摘要:
#    ✅ 创建私有仓库: SoulNestor
#    ✅ 代码已成功推送
#    🔗 仓库地址: https://github.com/paladinGG/SoulNestor.git
```

### 场景 2: 完整流程（从零开始）

```bash
# 一键完成所有步骤（生成内容 + 部署）
npm run reset-site

# 这将依次执行:
# [1/16] 清空HTML文章 ✅
# [2/16] 删除所有现有文章 ✅
# [3/16] 更新主题配置 ✅
# [4/16] 更新文章配置并重置追踪 ✅
# [5/16] 生成文章 ✅
# [6/16] 同步配置到模板 ✅
# [7/16] 添加新文章到网站 ✅
# [8/16] 生成新主题方向 ✅
# [9/16] 生成15篇定时发布文章 ✅
# [10/16] 设置文章定时发布 ✅
# [11/16] 生成AI图标 ✅
# [12/16] 生成图标文件 ✅
# [13/16] 更新网站图标 ✅
# [14/16] 修复损坏的图片 ✅
# [15/16] 构建网站 ✅
# [16/16] 创建GitHub私有仓库并推送 ✅
#
# ✅ 网站 "SoulNestor" 重置完成！
```

### 场景 3: 多网站批量部署

编辑 `config.csv`:

```csv
theme,domain,siteName
Mental Health & Mindfulness,soulnestor.com,SoulNestor
Cryptocurrency & Blockchain,cryptoarkanivo.com,Arkanivo
Fantasy & Mythology,mytholyra.com,Mytholyra
```

运行:

```bash
npm run reset-site

# 输出:
# 📋 找到 3 个网站配置
#
# ====================================
#   处理网站 1/3
# ====================================
#    主题: Mental Health & Mindfulness
#    域名: soulnestor.com
#    网站名: SoulNestor
#
# [执行 16 个步骤...]
# ✅ 网站 "SoulNestor" 重置完成！
#
# ====================================
#   处理网站 2/3
# ====================================
#    主题: Cryptocurrency & Blockchain
#    域名: cryptoarkanivo.com
#    网站名: Arkanivo
#
# [执行 16 个步骤...]
# ✅ 网站 "Arkanivo" 重置完成！
#
# [... 继续处理第 3 个网站 ...]
#
# ====================================
#     所有网站处理完成
# ====================================
# ✅ 成功处理 3 个网站配置
```

---

## ⚠️ 注意事项

### 1. GitHub CLI 必须安装

```bash
# 检查是否已安装
gh --version

# 如果未安装，访问:
# https://cli.github.com/
```

### 2. GitHub 认证必须完成

```bash
# 登录 GitHub
gh auth login

# 验证登录状态
gh auth status
```

### 3. 仓库名称不能重复

如果仓库已存在，脚本会跳过创建步骤，直接推送更新：

```bash
⚠️  仓库可能已存在，将直接推送到仓库
```

### 4. 临时目录空间要求

临时目录 `D:\temp\` 需要足够空间（约 100-500 MB，取决于项目大小）。

### 5. robocopy 返回码

robocopy 返回码 0-7 都表示成功，脚本已正确处理。

---

## 🔗 相关文档

- **主配置文件**: [config.template.js](config.template.js)
- **图标生成**: [FINAL_TEST_REPORT.md](FINAL_TEST_REPORT.md)
- **背景移除优化**: [BACKGROUND_REMOVAL_OPTIMIZATION.md](BACKGROUND_REMOVAL_OPTIMIZATION.md)
- **系统检验**: [FAVICON_SYSTEM_INSPECTION_REPORT.md](FAVICON_SYSTEM_INSPECTION_REPORT.md)
- **GitHub CLI 文档**: https://cli.github.com/manual/

---

## 📚 常见问题

### Q1: 如何更改 GitHub 用户名？

编辑 `scripts/deploy-and-template.js:93`：

```javascript
let repoUrl = `https://github.com/YOUR_USERNAME/${siteName}.git`;
```

### Q2: 如何更改为公开仓库？

编辑 `scripts/deploy-and-template.js:95`，移除 `--private`：

```javascript
execSync(`gh repo create ${siteName} --public --description "${repoDescription}"`);
```

### Q3: 如何添加更多排除文件？

编辑 `scripts/deploy-and-template.js:120`：

```javascript
const exclude = [
  '.git',
  'node_modules',
  'dist',
  '.astro',
  '.temp-deploy',
  'newarticle',
  'scheduledarticle',
  'YOUR_FOLDER'  // 添加你的目录
];
```

### Q4: 推送失败怎么办？

检查以下几点：
1. GitHub CLI 已登录：`gh auth status`
2. 网络连接正常
3. 仓库名称没有特殊字符
4. 有足够的 GitHub 存储空间

手动清理后重试：

```bash
# 删除远程仓库（如果需要）
gh repo delete YOUR_USERNAME/YOUR_REPO --yes

# 重新运行部署
npm run deploy-template
```

---

## 🎉 总结

该项目的 GitHub 部署系统具有以下优势：

✅ **全自动化** - 一键完成从内容生成到代码推送
✅ **智能化** - AI 生成文章和图标
✅ **多网站支持** - config.csv 批量管理
✅ **安全可靠** - 私有仓库 + 临时目录策略
✅ **灵活配置** - 支持手动和自动两种模式
✅ **错误容错** - 智能处理仓库已存在等情况

**推荐使用方式**：

```bash
# 完整自动化（推荐）
npm run reset-site

# 仅部署现有代码
npm run deploy-template
```

---

**文档生成时间**: 2025-10-22
**项目版本**: 7.2.0
**GitHub CLI 要求**: >= 2.0.0
