# 多提供商 AI 图像生成系统

## 📋 概述

本项目现已支持多个 AI 图像生成服务提供商，让您可以根据需求、预算和质量要求选择最合适的方案。

### 支持的提供商

| 提供商 | 模型 | 优势 | 成本 |
|--------|------|------|------|
| **Replicate** | FLUX Schnell, Stable Diffusion XL | ⚡ 快速生成<br>💰 成本低<br>🎨 高质量 | ~$0.003-0.008/image |
| **OpenAI** | DALL-E 3, GPT-image-1 | 🎯 提示词理解强<br>💎 一致性好<br>🏢 企业级 | ~$0.040-0.080/image |

---

## 🚀 快速开始

### 1. 安装依赖

依赖已自动安装（Replicate SDK 已包含在 package.json）：

```bash
npm install
```

### 2. 配置 API 密钥

#### 方案 A: 使用 Replicate（推荐）

1. 访问 [Replicate](https://replicate.com/account/api-tokens) 获取 API Token
2. 在 `.env` 文件中添加：

```env
IMAGE_PROVIDER=replicate
REPLICATE_API_TOKEN=r8_your_token_here
```

#### 方案 B: 使用 OpenAI

1. 访问 [OpenAI API Keys](https://platform.openai.com/api-keys) 获取密钥
2. 在 `.env` 文件中添加：

```env
IMAGE_PROVIDER=openai
OPENAI_API_KEY=sk-your_key_here
```

#### 方案 C: 同时配置（自动回退）

配置两个提供商，系统会在主提供商失败时自动切换：

```env
IMAGE_PROVIDER=replicate
REPLICATE_API_TOKEN=r8_your_token_here
OPENAI_API_KEY=sk-your_key_here
```

### 3. 生成图像

#### 使用默认提供商（根据 .env 配置）

```bash
npm run generate-favicon-multi
```

#### 强制使用 Replicate

```bash
npm run generate-favicon-replicate
```

#### 强制使用 OpenAI

```bash
npm run generate-favicon-openai
```

---

## 📊 提供商对比

### Replicate

**🎨 FLUX Schnell（推荐）**
- ⚡ 生成速度：5-10 秒
- 💎 图像质量：优秀
- 💰 成本：~$0.003/image
- ✅ 最佳性价比

**🏆 Stable Diffusion XL（高质量）**
- ⚡ 生成速度：15-30 秒
- 💎 图像质量：卓越
- 💰 成本：~$0.008/image
- ✅ 最高质量

**优势**：
- ✅ 成本最低
- ✅ 速度快
- ✅ 模型选择多
- ✅ 社区活跃

**劣势**：
- ⚠️ 需要第三方服务
- ⚠️ 偶尔队列等待

---

### OpenAI

**🎨 DALL-E 3**
- ⚡ 生成速度：10-20 秒
- 💎 图像质量：优秀
- 💰 成本：~$0.040/image (标准) | ~$0.080/image (HD)
- ✅ 提示词理解最佳

**💎 GPT-image-1**
- ⚡ 生成速度：15-30 秒
- 💎 图像质量：卓越
- 💰 成本：~$0.060-0.100/image
- ✅ 最新模型
- ⚠️ 需要组织验证

**优势**：
- ✅ 提示词理解强
- ✅ 一致性好
- ✅ 企业级支持
- ✅ 官方服务稳定

**劣势**：
- ⚠️ 成本较高
- ⚠️ GPT-image-1 需验证

---

## 🎯 使用场景推荐

### 开发测试阶段
**推荐：Replicate (FLUX Schnell)**
```bash
npm run generate-favicon-replicate
```
- 快速迭代
- 成本低
- 质量足够好

### 生产环境
**推荐：Replicate (Stable Diffusion XL) 或 OpenAI (DALL-E 3)**
```bash
# Replicate SDXL（性价比）
npm run generate-favicon-replicate

# OpenAI DALL-E 3（稳定性）
npm run generate-favicon-openai
```

### 高端品牌项目
**推荐：OpenAI (GPT-image-1 或 DALL-E 3 HD)**
- 最高质量
- 品牌一致性强
- 提示词理解最佳

---

## ⚙️ 高级配置

### 修改模型选择

编辑 `scripts/generate-ai-favicon-multi-provider.js` 中的 CONFIG：

#### Replicate 模型选择

```javascript
replicate: {
    models: {
        // 选项 1: FLUX Schnell (最快)
        primary: 'black-forest-labs/flux-schnell',

        // 选项 2: FLUX Pro (最高质量，需付费)
        // primary: 'black-forest-labs/flux-pro',

        // 选项 3: Stable Diffusion XL
        // primary: 'stability-ai/sdxl:39ed52f2...',

        fallback: 'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b'
    }
}
```

#### OpenAI 模型选择

```javascript
openai: {
    models: {
        // 主模型
        primary: 'gpt-image-1',    // 或 'dall-e-3'
        fallback: 'dall-e-3'
    },
    quality: {
        gptImage: 'high',          // 'low', 'medium', 'high', 'auto'
        dalle: 'hd'                // 'standard', 'hd'
    },
    style: 'vivid'                 // 'natural', 'vivid'
}
```

---

## 🔧 故障排除

### 问题 1: "Replicate not initialized"

**解决方案**：
1. 检查 `.env` 文件中是否有 `REPLICATE_API_TOKEN`
2. 确认 API token 格式正确（以 `r8_` 开头）
3. 重启终端/编辑器

### 问题 2: "OpenAI 403 - Organization verification required"

**解决方案（GPT-image-1）**：
1. 访问 https://platform.openai.com/settings/organization/general
2. 点击 "Verify Organization"
3. 等待 15 分钟让权限生效
4. 或者暂时使用 `dall-e-3` 模型

### 问题 3: "Queue wait time too long" (Replicate)

**解决方案**：
1. 系统会自动重试
2. 或切换到 OpenAI：`npm run generate-favicon-openai`
3. 高峰期可能需要等待 1-2 分钟

### 问题 4: 图像质量不满意

**优化提示词**：
编辑 `scripts/generate-ai-favicon-multi-provider.js` 中的 `generateImagePrompt` 函数

**切换到更高质量模型**：
- Replicate: 使用 SDXL 而不是 FLUX Schnell
- OpenAI: 使用 HD 质量而不是 standard

---

## 💰 成本估算

### 生成一套完整的网站图标（3 张图）

| 提供商 | 模型 | 成本 |
|--------|------|------|
| **Replicate** | FLUX Schnell | ~$0.009 |
| **Replicate** | SDXL | ~$0.024 |
| **OpenAI** | DALL-E 3 (Standard) | ~$0.120 |
| **OpenAI** | DALL-E 3 (HD) | ~$0.240 |
| **OpenAI** | GPT-image-1 | ~$0.180-0.300 |

### 月度成本预估（假设每周生成 1 次）

| 提供商 | 模型 | 月成本 |
|--------|------|--------|
| **Replicate** | FLUX Schnell | $0.036 |
| **Replicate** | SDXL | $0.096 |
| **OpenAI** | DALL-E 3 | $0.48-0.96 |

**💡 建议**：开发使用 Replicate，生产环境可选择 OpenAI 获得更好的稳定性

---

## 📖 API 参考

### 环境变量

| 变量 | 必需 | 说明 | 示例 |
|------|------|------|------|
| `IMAGE_PROVIDER` | 否 | 主提供商选择 | `replicate` 或 `openai` |
| `REPLICATE_API_TOKEN` | 使用 Replicate 时必需 | Replicate API Token | `r8_xxx...` |
| `OPENAI_API_KEY` | 使用 OpenAI 时必需 | OpenAI API Key | `sk-xxx...` |

### NPM 脚本

| 脚本 | 说明 |
|------|------|
| `npm run generate-favicon-multi` | 使用默认提供商生成 |
| `npm run generate-favicon-replicate` | 强制使用 Replicate |
| `npm run generate-favicon-openai` | 强制使用 OpenAI |
| `npm run generate-favicon` | 处理成多种尺寸 |
| `npm run update-favicon` | 部署到网站 |

---

## 🎨 完整工作流程

### 1. 生成 AI 图像

```bash
# 使用 Replicate（快速、便宜）
npm run generate-favicon-replicate
```

生成以下文件：
- `favicon/favicon.png` (1024x1024)
- `favicon_io/site-logo.png` (1024x1024)
- `favicon_io/site-theme.png` (1024x1024)

### 2. 处理成多种尺寸

```bash
npm run generate-favicon
```

生成以下文件：
- `public/favicon.ico`
- `public/favicon-16x16.png`
- `public/favicon-32x32.png`
- `public/apple-touch-icon.png`
- 等等...

### 3. 部署到网站

```bash
npm run update-favicon
```

### 4. 清除缓存查看效果

```bash
npm run dev
```

在浏览器中硬刷新（Ctrl+Shift+R 或 Cmd+Shift+R）

---

## 🎓 最佳实践

### 1. 开发环境
```env
# .env.local
IMAGE_PROVIDER=replicate
REPLICATE_API_TOKEN=r8_your_token
```
- 使用 FLUX Schnell 快速迭代
- 成本低，适合测试

### 2. 生产环境
```env
# .env.production
IMAGE_PROVIDER=replicate
REPLICATE_API_TOKEN=r8_your_token
OPENAI_API_KEY=sk_your_key
```
- 配置两个提供商作为备份
- 主用 Replicate SDXL
- OpenAI 作为回退

### 3. 企业项目
```env
# .env
IMAGE_PROVIDER=openai
OPENAI_API_KEY=sk_your_key
```
- 使用 OpenAI 确保稳定性
- 选择 HD 质量
- 定期备份生成的图像

---

## 🔗 相关资源

### 官方文档
- [Replicate 文档](https://replicate.com/docs)
- [OpenAI 图像生成 API](https://platform.openai.com/docs/guides/images)
- [FLUX 模型](https://replicate.com/black-forest-labs/flux-schnell)
- [Stable Diffusion XL](https://replicate.com/stability-ai/sdxl)

### 获取 API 密钥
- [Replicate API Tokens](https://replicate.com/account/api-tokens)
- [OpenAI API Keys](https://platform.openai.com/api-keys)

### 成本计算
- [Replicate 定价](https://replicate.com/pricing)
- [OpenAI 定价](https://openai.com/pricing)

---

## 📝 更新日志

### v2.0.0 (2025-10-20)
- ✨ 新增多提供商支持
- ✨ 集成 Replicate API（FLUX, SDXL）
- ✨ 智能回退机制
- ✨ 成本优化选项
- 📚 完整文档

### v1.0.0
- 🎨 OpenAI DALL-E 3 支持
- 🎨 GPT-image-1 支持
- 🖼️ 主题适配图像生成

---

## 🤝 贡献

欢迎提交 Issue 或 Pull Request！

## 📄 许可证

MIT License
