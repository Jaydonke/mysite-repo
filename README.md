# AstroTemp - AI驱动的多主题网站自动化生成系统

一键生成完整的SEO优化内容网站，支持多主题批量部署到GitHub。

## 🌟 核心特性

- 🤖 **完全AI驱动** - 从配置到内容，全自动生成
- 🎯 **一键多主题部署** - 同时生成多个独立网站并部署到GitHub
- ✍️ **智能内容生成** - 每个网站40篇高质量文章（25篇发布 + 15篇定时）
- 🔗 **SEO全自动优化** - 内链、元数据、sitemap自动生成
- 👥 **14位AI作者** - 智能随机分配，确保内容多样性
- 📅 **定时发布系统** - 自动安排未来45天的内容发布
- 🎨 **AI图标生成** - DALL-E自动生成独特网站图标

## 📋 目录

- [快速开始](#-快速开始)
- [一键重置网站](#-一键重置网站)
- [多主题批量部署](#-多主题批量部署)
- [工作流程详解](#-工作流程详解)
- [配置说明](#-配置说明)
- [常用命令](#-常用命令)
- [故障排除](#-故障排除)

## 🚀 快速开始

### 环境要求

```bash
Node.js 18+
npm 或 yarn
OpenAI API密钥
GitHub CLI (用于自动部署)
Git
```

### 初始安装

```bash
# 1. 克隆项目
git clone <your-repo-url>
cd astrotemp

# 2. 安装依赖
npm install

# 3. 配置环境变量
# 创建 .env 文件
OPENAI_API_KEY=你的OpenAI密钥
UNSPLASH_ACCESS_KEY=你的Unsplash密钥（可选）

# 4. 安装 GitHub CLI（用于自动部署）
# Windows: winget install GitHub.cli
# Mac: brew install gh
# Linux: 查看 https://cli.github.com/

# 5. 登录 GitHub CLI
gh auth login
```

## 🎯 一键重置网站

### 单主题模式

```bash
# 1. 编辑 config.txt（3行配置）
theme: Travel & Adventure
domain: TravelExplorer.com
siteName: TravelExplorer

# 2. 运行重置命令
npm run reset-site

# 等待15-30分钟，完整网站生成完毕！
```

### 多主题批量模式

```bash
# 1. 编辑 config.csv（支持多行主题）
theme,domain,siteName
Travel & Adventure,TravelExplorer.com,TravelExplorer
Mental Health & Mindfulness,SoulNestor.com,SoulNestor
Automotive & Mobility,Vehivio.com,Vehivio

# 2. 运行批量重置
npm run reset-site

# 系统会：
# ✅ 为每个主题生成独立网站
# ✅ 切换配置索引处理每个网站
# ✅ 显示总体进度和每个网站的详细状态
```

## 🎪 多主题批量部署

### 自动部署到GitHub

```bash
# 运行部署脚本
npm run deploy-template

# 脚本会自动：
# 1. 读取当前网站配置
# 2. 创建私有GitHub仓库（以siteName命名）
# 3. 推送干净代码（不含历史记录）
# 4. 自动排除 .git, node_modules, dist 等

# 部署特点：
# ✅ 全新Git仓库，无历史包袱
# ✅ 不包含构建文件和依赖
# ✅ 自动创建私有仓库
# ✅ 支持仓库已存在时直接推送
```

### 完整工作流程

```bash
# 1. 批量生成多个网站
npm run reset-site

# 2. 为每个网站部署到GitHub
# 切换到第一个网站配置
echo 1 > .current-config-index
npm run deploy-template

# 切换到第二个网站配置
echo 2 > .current-config-index
npm run deploy-template

# 切换到第三个网站配置
echo 3 > .current-config-index
npm run deploy-template

# 提示：可以编写批处理脚本自动化这个过程
```

## 📋 工作流程详解

### Reset-Site 完整流程（16步）

reset-site 会按顺序执行以下步骤：

#### 第1步：清空HTML文章
```bash
清空 newarticle/ 和 scheduledarticle/ 文件夹
```

#### 第2步：删除所有现有文章
```bash
删除 src/content/blog/ 中的所有文章
自动创建备份到 backups/
```

#### 第3步：更新主题配置 ⭐ 关键步骤
```bash
使用AI根据 config.txt/config.csv 生成完整配置
- 网站标题、描述、导航
- 页脚信息、社交媒体链接
- 8个主题分类
- SEO元数据
更新到 config.template.js
```

#### 第4步：更新文章配置并重置追踪 ⭐ 关键步骤
```bash
AI生成40篇文章的配置列表
- 标题、分类、关键词
- 确保内容分布均匀
- 重置位置追踪避免重复
```

#### 第5步：生成前25篇文章 ⭐ 关键步骤
```bash
使用OpenAI生成文章HTML内容
- 完整的文章正文
- SEO优化的结构
- 图片占位符
保存到 newarticle/
```

#### 第6步：同步配置到模板
```bash
应用 config.template.js 到网站配置
```

#### 第7步：添加新文章到网站
```bash
智能处理并添加文章：
- HTML转MDX格式
- 下载并本地化图片
- 转换YouTube链接
- 智能分配作者（14位轮换）
- 生成SEO友好的slug
```

#### 第8步：生成新主题方向
```bash
AI分析已有内容，生成新的主题方向
为定时发布的文章提供灵感
```

#### 第9步：生成后15篇定时文章
```bash
生成剩余15篇文章
使用新主题方向
保存到 scheduledarticle/
```

#### 第10步：设置定时发布
```bash
配置文章的发布时间：
- 从今天+3天开始
- 每3天发布一篇
- 共15篇，覆盖45天
```

#### 第11-13步：生成和更新图标
```bash
11. AI生成网站图标（DALL-E）
12. 生成所有尺寸的favicon
13. 更新到 public/ 目录
```

#### 第14步：修复损坏的图片
```bash
检测并重新生成损坏的图片文件
```

#### 第15步：构建网站
```bash
运行 npm run build
生成生产环境的静态文件
```

#### 第16步：部署到GitHub
```bash
自动创建私有仓库并推送代码
（可选步骤，需要GitHub CLI）
```

### 关键步骤说明

- **步骤1-3** 为关键步骤，失败会停止执行
- **步骤4-16** 为非关键步骤，失败会继续执行并在最后报告

## ⚙️ 配置说明

### config.csv - 多主题配置（推荐）

```csv
theme,domain,siteName
Travel & Adventure,TravelExplorer.com,TravelExplorer
Health & Wellness,HealthHub.com,HealthHub
Tech Innovation,TechVista.com,TechVista
```

**特点：**
- 支持多行配置
- 自动为每个主题生成独立网站
- 使用逗号分隔字段

### config.txt - 单主题配置

```txt
theme: Travel & Adventure
domain: TravelExplorer.com
siteName: TravelExplorer
```

**优先级：**
- 如果 config.csv 存在且有多行，使用 config.csv
- 否则使用 config.txt

### config.template.js - 自动生成的完整配置

```javascript
export const CURRENT_WEBSITE_CONTENT = {
  // 网站基本信息（AI自动生成）
  title: "网站标题",
  description: "网站描述",
  navigation: { /* 导航菜单 */ },
  footer: { /* 页脚信息 */ },
  seo: { /* SEO配置 */ },
  social: { /* 社交媒体 */ }
};

export const ARTICLE_CONFIGS = [
  // 40篇文章配置（AI自动生成）
  {
    title: "文章标题",
    category: "分类",
    keywords: ["关键词"]
  }
];
```

**重要：** 不要手动编辑此文件，由AI自动更新！

### .current-config-index - 配置索引

```bash
# 当前使用的配置行号（从1开始）
1
```

用于多主题模式下切换不同配置。

### 作者配置

```bash
# 编辑 author/name.txt
random  # 智能随机模式（推荐）

# 或指定作者
laura-stevens
```

**智能随机特性：**
- ✅ 避免连续重复同一作者
- ✅ 14位作者均匀分布
- ✅ 每3个作者重置记录

## 🛠️ 常用命令

### 核心命令

```bash
# 🌟 一键重置和生成
npm run reset-site          # 完整网站重置

# 🚀 开发和构建
npm run dev                 # 开发服务器
npm run build               # 构建生产版本
npm run preview             # 预览构建结果
npm run clear-cache         # 清理缓存

# 📦 部署
npm run deploy-template     # 部署到GitHub
```

### 内容生成

```bash
# 主题和配置
npm run update-theme-fixed      # AI生成主题配置
npm run update-articles-full    # AI生成文章配置
npm run sync-config             # 同步配置

# 文章生成
npm run generate-articles              # 生成文章（默认25篇）
npm run generate-articles -- -c 10     # 生成10篇
npm run generate-articles -- -s -k 10 -c 5  # 跳过前10篇，生成后5篇

# 主题方向
npm run generate-new-topics     # 生成新内容方向
```

### 文章管理

```bash
# 手动添加
npm run add-articles-improved   # 添加HTML文章
npm run delete-all-articles     # 删除所有文章
npm run clear-html              # 清空HTML文件夹

# 定时发布
npm run schedule-articles       # 设置定时发布
npm run preview-scheduled       # 查看定时文章

# 作者管理
node scripts/randomize-authors.js analyze    # 分析作者分布
node scripts/randomize-authors.js randomize  # 随机分配作者
```

### 资源和优化

```bash
# 图标
npm run generate-ai-favicon     # AI生成图标
npm run generate-favicon        # 生成各尺寸favicon
npm run update-favicon          # 更新网站图标

# 内链和SEO
npm run manage-links analyze    # 分析内链
npm run manage-links report     # 生成内链报告

# 图片修复
npm run fix-images              # 修复损坏图片
npm run localize-images         # 本地化图片
npm run clear-image-cache       # 清理图片缓存
```

## 🔧 故障排除

### Reset-Site 问题

#### 运行失败
```bash
# 1. 检查环境变量
cat .env  # 确保 OPENAI_API_KEY 存在

# 2. 清理并重试
npm run clear-cache
npm run reset-site

# 3. 检查OpenAI配额
# 访问 https://platform.openai.com/account/usage

# 4. 单步执行失败的步骤
npm run update-theme-fixed        # 如果步骤3失败
npm run update-articles-full      # 如果步骤4失败
npm run generate-articles         # 如果步骤5失败
```

#### AI生成质量不满意
```bash
# 1. 编辑 config.txt 使主题描述更具体
theme: Luxury Travel & Adventure Tourism

# 2. 重新生成配置
npm run update-theme-fixed
npm run update-articles-full

# 3. 重新生成文章
npm run generate-articles
```

### 部署问题

#### GitHub CLI未安装
```bash
# Windows
winget install GitHub.cli

# Mac
brew install gh

# Linux
# 查看 https://cli.github.com/
```

#### 仓库已存在
```bash
# 脚本会自动检测并直接推送
# 如需强制重建：
gh repo delete siteName --yes
npm run deploy-template
```

### 配置问题

#### 多主题配置切换
```bash
# 查看当前配置索引
cat .current-config-index

# 手动切换到第2个配置
echo 2 > .current-config-index

# 验证配置
cat config.csv | sed -n '2p'
```

#### config.csv格式错误
```bash
# 正确格式（逗号分隔，无空格）
theme,domain,siteName
Travel,example.com,Example

# 错误格式
theme, domain, siteName  # ❌ 有空格
Travel|example.com|Example  # ❌ 错误分隔符
```

### 构建和性能

#### 内存不足
```bash
# Windows
set NODE_OPTIONS=--max-old-space-size=4096
npm run generate-articles

# Linux/Mac
export NODE_OPTIONS="--max-old-space-size=4096"
npm run generate-articles
```

#### 构建失败
```bash
# 完全清理
rm -rf node_modules .astro dist
npm install
npm run build
```

### 图片问题

#### 图片显示404
```bash
npm run fix-missing-images
npm run localize-images
```

#### 图片未下载
```bash
npm run clear-image-cache
npm run add-articles-improved
```

## 📁 项目结构

```
astrotemp/
├── 📂 src/
│   ├── 📂 content/
│   │   ├── 📂 blog/              # 文章内容 (MDX)
│   │   ├── 📂 authors/           # 作者信息
│   │   └── 📂 categories/        # 分类配置
│   ├── 📂 assets/images/         # 文章图片
│   ├── 📂 lib/rehype/            # 内链处理
│   └── config.js                 # 网站配置（自动生成）
│
├── 📂 scripts/                   # 自动化脚本
│   ├── reset-site.js             # 🌟 一键重置
│   ├── deploy-and-template.js    # 🚀 GitHub部署
│   ├── generate-articles.js      # ✍️ AI生成文章
│   ├── update-theme-config-fixed.js           # 🎨 AI主题配置
│   ├── update-article-config-with-categories.js  # 📝 文章配置
│   └── ...更多脚本
│
├── 📂 config/                    # 配置文件
├── 📂 newarticle/               # 新文章HTML
├── 📂 scheduledarticle/         # 定时文章HTML
├── 📂 author/                   # 作者配置
├── 📂 backups/                  # 自动备份
│
├── config.csv                   # 多主题配置（推荐）
├── config.txt                   # 单主题配置
├── config.template.js           # AI生成的完整配置
├── .current-config-index        # 当前配置索引
├── .env                         # 环境变量
└── package.json                # 项目配置
```

## 🏆 系统优势

### 完全自动化
- ✅ 编辑3行配置，运行1个命令
- ✅ AI生成所有内容和配置
- ✅ 40篇高质量文章自动生成
- ✅ 零手动干预从配置到部署

### 多主题批量生成
- ✅ 一次运行生成多个网站
- ✅ 每个网站独立配置和内容
- ✅ 自动切换配置索引
- ✅ 支持批量部署到GitHub

### 智能内容管理
- ✅ 主题感知的AI生成
- ✅ 8个分类内容均匀分布
- ✅ 14位作者智能轮换
- ✅ SEO全自动优化

### 强大的错误处理
- ✅ 自动备份机制
- ✅ 关键步骤失败保护
- ✅ 详细的错误报告
- ✅ 支持单步重试

## 💡 使用场景

### 场景1：批量生成利基网站

```bash
# 1. 准备多个主题配置
# config.csv:
# Travel,TravelSite.com,TravelSite
# Health,HealthSite.com,HealthSite
# Tech,TechSite.com,TechSite

# 2. 一键生成所有网站
npm run reset-site

# 3. 批量部署到GitHub
# 手动切换配置并部署
for i in 1 2 3; do
  echo $i > .current-config-index
  npm run deploy-template
done
```

### 场景2：测试不同主题

```bash
# 1. 快速生成网站原型
npm run reset-site

# 2. 查看效果
npm run dev

# 3. 不满意？更改config.txt重新生成
npm run reset-site
```

### 场景3：内容网站自动化

```bash
# 1. 生成初始网站
npm run reset-site

# 2. 定时文章自动发布（45天内容）
# 无需额外操作，系统自动处理

# 3. 需要更多内容？继续生成
npm run generate-new-topics
npm run generate-articles -- -s -k 40 -c 20
```

## 📚 技术栈

- 🚀 **Astro** - 现代静态网站生成器
- ⚛️ **React** - 交互组件
- 🎨 **Tailwind CSS** - 实用优先的CSS
- 🤖 **OpenAI GPT-4** - AI内容生成
- 🖼️ **DALL-E** - AI图标生成
- 🔍 **Pagefind** - 快速搜索
- 📊 **Gray Matter** - Frontmatter解析
- 🚢 **GitHub CLI** - 自动部署

## 📖 快速参考

### 最快开始（单网站）
1. 编辑 `config.txt`（3行）
2. 运行 `npm run reset-site`
3. 等待15-30分钟

### 批量生成（多网站）
1. 编辑 `config.csv`（多行主题）
2. 运行 `npm run reset-site`
3. 等待30-90分钟

### 部署到GitHub
1. 确保已安装 GitHub CLI
2. 运行 `gh auth login`
3. 运行 `npm run deploy-template`

---

## ⚠️ 重要说明

### 排除文件配置

部署脚本自动排除以下文件/文件夹：
- `.git` - Git历史
- `node_modules` - 依赖包
- `dist` - 构建输出
- `.astro` - Astro缓存
- `newarticle`, `scheduledarticle` - HTML源文件

**建议添加：** `blogsmith-pro-v7.2.0` 到排除列表

### Git仓库大小优化

- 每次部署都是全新Git仓库
- 不包含任何历史记录
- 仅包含必要的源文件
- 平均仓库大小：50-100MB

### OpenAI使用成本

每个网站生成（40篇文章）：
- GPT-4: 约$5-10
- DALL-E: 约$1-2
- 总计: 约$6-12

---

*AstroTemp - 让内容网站生成变得简单、快速、可扩展*

**最后更新：2025年10月**
