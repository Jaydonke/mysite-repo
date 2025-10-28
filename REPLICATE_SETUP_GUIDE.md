# Replicate API 设置指南

## 🚀 5 分钟快速设置

### 步骤 1: 注册 Replicate 账户

1. 访问 [Replicate 官网](https://replicate.com)
2. 点击右上角 "Sign up" 注册（可使用 GitHub 账户）
3. 免费注册，包含 $5 试用额度

### 步骤 2: 获取 API Token

1. 登录后访问：https://replicate.com/account/api-tokens
2. 点击 "Create token" 创建新 token
3. 复制生成的 token（格式：`r8_xxxxx...`）

### 步骤 3: 配置到项目

打开项目根目录的 `.env` 文件，添加以下内容：

```env
# Replicate Configuration
IMAGE_PROVIDER=replicate
REPLICATE_API_TOKEN=r8_your_token_here_粘贴您的token
```

### 步骤 4: 测试运行

```bash
npm run generate-favicon-multi
```

---

## ✅ 验证配置

运行后您应该看到：

```
====================================
   Multi-Provider Image Generator
====================================
Provider: REPLICATE
Generates favicon, site-logo, and site-theme with transparent backgrounds

📚 Loading configuration...
✅ Loaded config for: SoulNestor (General)
  Primary Color: #10B981
  Secondary Color: #047857

🎨 [1/3] Generating favicon image...
📡 Using provider: REPLICATE
🎨 Generating with Replicate FLUX-SCHNELL...
✅ Generated with Replicate FLUX-SCHNELL
...
```

---

## 💰 费用说明

### 免费额度
- 新用户：$5 免费额度
- 足够生成 1000+ 张图像（使用 FLUX Schnell）

### 实际成本
- **FLUX Schnell**: ~$0.003/image（推荐）
- **Stable Diffusion XL**: ~$0.008/image
- **一套完整图标（3张）**: ~$0.009-0.024

### 对比 OpenAI
- Replicate: $0.009/套
- OpenAI: $0.120-0.240/套
- **节省 90%+ 成本！**

---

## 🎨 支持的模型

### 1. FLUX Schnell（默认）
```javascript
// 已配置为默认模型
'black-forest-labs/flux-schnell'
```
- ⚡ 最快：5-10秒
- 💰 最便宜：$0.003/image
- 🎨 质量：优秀
- ✅ 推荐用于开发和生产

### 2. Stable Diffusion XL（备用）
```javascript
// 配置为回退模型
'stability-ai/sdxl'
```
- ⚡ 速度：15-30秒
- 💰 成本：$0.008/image
- 🎨 质量：卓越
- ✅ 需要最高质量时使用

---

## 🔧 常见问题

### Q1: 找不到 .env 文件？

**A:** 在项目根目录创建 `.env` 文件：

```bash
# Windows
type nul > .env

# 然后用编辑器打开添加配置
```

### Q2: Token 格式错误？

**A:** 确保 token 是完整的，格式如下：
```
REPLICATE_API_TOKEN=r8_aBcDeFgHiJkLmNoPqRsTuVwXyZ123456789
```

注意：
- 以 `r8_` 开头
- 没有引号
- 没有空格

### Q3: 仍然使用 OpenAI？

**A:** 检查以下几点：
1. `.env` 文件中 `IMAGE_PROVIDER=replicate`
2. `REPLICATE_API_TOKEN` 已正确配置
3. 重启终端或编辑器
4. 重新运行命令

### Q4: 生成失败？

**A:** 可能的原因和解决方案：

**余额不足：**
```bash
# 检查账户余额
# 访问：https://replicate.com/account/billing
```

**网络问题：**
```bash
# 稍后重试，或启用 OpenAI 作为备份
```

在 `.env` 中同时配置两个提供商：
```env
IMAGE_PROVIDER=replicate
REPLICATE_API_TOKEN=r8_your_token
OPENAI_API_KEY=sk_your_key  # 备用
```

### Q5: 如何查看使用量？

**A:** 访问 Replicate 控制台：
1. https://replicate.com/account/billing
2. 查看 "Usage" 选项卡
3. 查看详细的使用记录和费用

---

## 📊 生成速度对比

实际测试结果：

| 提供商 | 模型 | 单张用时 | 三张总用时 |
|--------|------|----------|-----------|
| **Replicate** | FLUX Schnell | 5-8秒 | 15-25秒 |
| **Replicate** | SDXL | 15-20秒 | 45-60秒 |
| **OpenAI** | DALL-E 3 | 10-15秒 | 30-45秒 |
| **OpenAI** | GPT-image-1 | 20-30秒 | 60-90秒 |

**推荐：FLUX Schnell** - 最快且质量完全足够！

---

## 🎯 完整配置示例

### 最小配置（仅 Replicate）

```env
# .env
IMAGE_PROVIDER=replicate
REPLICATE_API_TOKEN=r8_aBcDeFgHiJkLmNoPqRsTuVwXyZ123456789
```

### 推荐配置（双提供商备份）

```env
# .env

# Primary Provider (推荐使用 Replicate)
IMAGE_PROVIDER=replicate

# Replicate Configuration
REPLICATE_API_TOKEN=r8_aBcDeFgHiJkLmNoPqRsTuVwXyZ123456789

# OpenAI Backup (optional, but recommended)
OPENAI_API_KEY=sk-aBcDeFgHiJkLmNoPqRsTuVwXyZ123456789

# Other Keys (if needed)
# UNSPLASH_ACCESS_KEY=your_key_here
```

---

## 🚀 立即开始

1. **获取 Token**：https://replicate.com/account/api-tokens
2. **配置 .env**：添加 `REPLICATE_API_TOKEN`
3. **运行生成**：`npm run generate-favicon-multi`
4. **享受超快速度和低成本！** ⚡💰

---

## 📞 需要帮助？

- **Replicate 文档**：https://replicate.com/docs
- **FLUX 模型**：https://replicate.com/black-forest-labs/flux-schnell
- **SDXL 模型**：https://replicate.com/stability-ai/sdxl
- **完整使用指南**：查看 `MULTI_PROVIDER_IMAGE_GENERATION.md`

---

## ⭐ 为什么选择 Replicate？

✅ **成本低** - 比 OpenAI 便宜 90%+
✅ **速度快** - FLUX Schnell 仅需 5-8 秒
✅ **质量高** - 完全满足生产环境需求
✅ **灵活性** - 多种模型可选
✅ **易用性** - 5 分钟即可设置完成
✅ **稳定性** - 企业级基础设施

**立即设置，开始享受高效AI图像生成！** 🎉
