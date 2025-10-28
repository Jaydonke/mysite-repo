# 图标背景去除能力测试 - 快速指南

## 🚀 快速开始

测试图标生成功能，验证背景去除能力：

```bash
npm run test-background-removal
```

## 📋 测试内容

脚本会自动测试以下3个图片的背景去除效果：

1. **Favicon** (`favicon/favicon.png`) - 网站图标
2. **Site Logo** (`favicon_io/site-logo.png`) - 网站Logo
3. **Site Theme** (`favicon_io/site-theme.png`) - 主题图片

## 🎯 评分标准

每个图片从100分制评分：

- **透明度** (40分) - 背景是否透明
- **纯净度** (30分) - 是否有残留
- **颜色质量** (30分) - 彩色内容占比

| 分数 | 等级 | 说明 |
|------|------|------|
| 90+ | A+ | 优秀 |
| 80-89 | A/A- | 良好 |
| 70-79 | B+/B/B- | 合格 |
| 60-69 | C+/C/C- | 待改进 |
| <60 | D/F | 需修复 |

## 📊 测试输出

### 实时输出示例

```
====================================
  测试轮次 1/3
====================================

🎨 步骤1: 生成AI图标...
✅ AI图标生成完成

🎨 步骤2: 处理favicon文件...
✅ Favicon处理完成

🔍 步骤3: 分析图片质量...

📊 分析 Favicon...
  尺寸: 1024x1024
  透明像素: 85.3%
  白色/灰色残留: 3.2%
  彩色内容: 18.5%
  主色调: orange
  评分: 92/100 (A+)
```

### 保存的文件

测试结果自动保存到 `test-results/` 目录：

```
test-results/
├── round-1/          # 第1轮测试结果
├── round-2/          # 第2轮测试结果
├── round-3/          # 第3轮测试结果
└── test-report.json  # 详细报告
```

## 🔧 修改测试轮数

编辑 `scripts/test-favicon-background-removal.js`:

```javascript
const TEST_CONFIG = {
  testRounds: 5,  // 改为5轮
  // ...
};
```

## ⚡ 测试流程

每轮测试执行：

1. 生成AI图标 (`npm run generate-ai-favicon`)
2. 处理图标文件 (`npm run generate-favicon`)
3. 分析图片质量（透明度、残留、颜色）
4. 保存结果并评分
5. 生成测试报告

## 📈 查看报告

测试完成后查看详细报告：

```bash
# 查看JSON报告
cat test-results/test-report.json

# 或者在浏览器中打开
start test-results/test-report.json
```

## 🛠️ 常见问题

### 背景去除效果不好？

1. **检查 rembg 是否安装**:
   ```bash
   pip install rembg
   ```

2. **查看测试报告**:
   - 检查"透明像素"百分比
   - 查看"白色/灰色残留"数据
   - 阅读"建议"部分

3. **调整参数**:
   - 修改 `enhanced-background-removal-color.js` 中的容差值
   - 优化 `deepCleanImage` 中的颜色阈值

### 测试时间太长？

- 默认3轮测试需要约 5-10 分钟
- 每轮需要调用 OpenAI API 生成3张图片
- 可以减少测试轮数节省时间

### API 额度消耗？

- 每轮测试约消耗 $0.12-0.18
- 3轮测试约 $0.36-0.54
- 使用 GPT-image-1 或 DALL-E 3

## 📚 相关脚本

- `generate-ai-favicon.js` - AI图标生成
- `generate-favicon.js` - 图标尺寸处理
- `update-favicon.js` - 部署到网站
- `enhanced-background-removal.js` - 背景去除算法
- `test-favicon-generation.js` - 另一个测试脚本

## 💡 最佳实践

1. ✅ 修改背景去除代码后运行测试
2. ✅ 保留测试结果用于对比
3. ✅ 观察多轮测试的稳定性
4. ✅ 根据报告调整参数
5. ✅ 修复后再次测试验证

## 📖 详细文档

查看完整文档: [docs/TEST_BACKGROUND_REMOVAL.md](docs/TEST_BACKGROUND_REMOVAL.md)

---

**注意**: 此测试会实际调用 OpenAI API 并消耗额度。请确保 `.env` 文件中配置了有效的 `OPENAI_API_KEY`。
