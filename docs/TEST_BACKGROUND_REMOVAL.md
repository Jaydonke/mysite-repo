# 图标背景去除能力测试脚本

## 概述

`test-favicon-background-removal.js` 是一个专门用于测试和验证图标生成过程中背景去除能力的测试脚本。它会多次运行图标生成流程，并详细分析每次生成的图片质量。

## 功能特性

### 🎯 测试内容

1. **透明度检测** - 检测背景是否成功转为透明
2. **背景残留分析** - 检测是否存在灰色/白色背景残留
3. **颜色质量评估** - 验证图标的彩色内容是否充足
4. **多轮测试** - 运行多次生成流程验证稳定性
5. **详细报告** - 生成包含评分、问题和建议的测试报告

### 📊 评分系统

每个图片从三个维度进行评分（总分100分）：

- **透明度得分** (40分) - 背景透明程度
- **纯净度得分** (30分) - 背景残留程度
- **颜色质量得分** (30分) - 彩色内容占比

### 📈 评级标准

| 分数范围 | 等级 | 说明 |
|---------|------|------|
| 90+ | A+ | 优秀 - 背景去除功能表现出色 |
| 85-89 | A | 良好 - 背景去除功能运行良好 |
| 80-84 | A- | 良好 - 背景去除功能运行良好 |
| 75-79 | B+ | 合格 - 背景去除功能基本满足要求 |
| 70-74 | B | 合格 - 背景去除功能基本满足要求 |
| 65-69 | B- | 合格 - 背景去除功能基本满足要求 |
| 60-64 | C+ | 待改进 - 背景去除功能需要优化 |
| 55-59 | C | 待改进 - 背景去除功能需要优化 |
| 50-54 | C- | 待改进 - 背景去除功能需要优化 |
| <50 | D/F | 需修复 - 背景去除功能存在严重问题 |

## 使用方法

### 快速开始

```bash
npm run test-background-removal
```

### 测试流程

脚本会自动执行以下步骤（默认3轮）：

1. **生成AI图标** - 调用 `generate-ai-favicon`
2. **处理图标文件** - 调用 `generate-favicon`
3. **分析图片质量** - 检测三个关键图片：
   - `favicon/favicon.png` - 网站图标
   - `favicon_io/site-logo.png` - 网站Logo
   - `favicon_io/site-theme.png` - 网站主题图

### 自定义测试轮数

在脚本中修改 `TEST_CONFIG.testRounds`:

```javascript
const TEST_CONFIG = {
  testRounds: 5,  // 改为5轮测试
  // ...
};
```

## 测试结果

### 输出文件

测试完成后会在 `test-results/` 目录下生成：

```
test-results/
├── round-1/
│   ├── icon-2025-01-23T12-30-45.png
│   ├── logo-2025-01-23T12-30-45.png
│   └── theme-2025-01-23T12-30-45.png
├── round-2/
│   └── ...
├── round-3/
│   └── ...
└── test-report.json  # 详细测试报告
```

### 控制台输出示例

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

📊 本轮测试总结:
  平均得分: 88.5/100 (A)
  通过率: 3/3 (100%)
```

### 测试报告 JSON 格式

```json
{
  "testDate": "2025-01-23T12:30:45.123Z",
  "totalRounds": 3,
  "completedRounds": 3,
  "failedRounds": 0,
  "rounds": [
    {
      "round": 1,
      "timestamp": "2025-01-23T12:30:45.123Z",
      "files": [
        {
          "name": "Favicon",
          "path": "favicon/favicon.png",
          "savedPath": "test-results/round-1/icon-2025-01-23T12-30-45.png",
          "analysis": {
            "width": 1024,
            "height": 1024,
            "transparentPercentage": 85.3,
            "whitePercentage": 2.1,
            "grayPercentage": 1.1,
            "coloredPercentage": 18.5,
            "dominantColor": "orange"
          },
          "evaluation": {
            "scores": {
              "transparency": 40,
              "purity": 30,
              "color": 30,
              "total": 92
            },
            "grade": "A+",
            "issues": [],
            "recommendations": []
          }
        }
      ],
      "summary": {
        "totalScore": 276,
        "averageScore": 92,
        "averageGrade": "A+",
        "passedFiles": 3,
        "totalFiles": 3
      }
    }
  ],
  "overallStatistics": {
    "averageScore": "88.50",
    "averageTransparency": "38.33",
    "averagePurity": "26.67",
    "averageColor": "28.00",
    "successRate": "100.00"
  }
}
```

## 问题诊断

### 常见问题及解决方案

#### 1. 透明度低 (<70%)

**问题**: 背景没有被正确去除

**可能原因**:
- rembg (AI背景去除工具) 未安装或不工作
- 图片背景太复杂

**解决方案**:
```bash
# 安装 rembg
pip install rembg

# 或者运行安装脚本
npm run install-rembg
```

#### 2. 背景残留多 (>15%)

**问题**: 存在灰色或白色背景残留

**可能原因**:
- deep clean 功能不够强
- 颜色检测阈值需要调整

**解决方案**:
- 调整 `deepCleanImage` 中的颜色阈值
- 修改背景去除的容差参数

#### 3. 彩色内容不足 (<10%)

**问题**: 生成的图标颜色太少

**可能原因**:
- AI生成的图标太简单
- 提示词不够清晰

**解决方案**:
- 优化 `generateImagePrompt` 中的提示词
- 确保提示词包含明确的颜色要求

## 技术细节

### 图片分析算法

脚本使用 Sharp 库逐像素分析图片：

```javascript
// 透明度检测
if (a === 0) {
  transparentPixels++;
}

// 白色检测
if (r > 240 && g > 240 && b > 240) {
  whitePixels++;
}

// 灰色检测
if (Math.abs(r - g) < 30 && Math.abs(g - b) < 30) {
  grayPixels++;
}

// 颜色分类
if (r > 200 && g > 50 && g < 180 && b < 100) {
  colorDistribution.orange++;
}
```

### 背景去除技术栈

1. **Primary**: Python rembg (AI模型)
2. **Fallback 1**: enhanced-background-removal-color.js (颜色容差算法)
3. **Fallback 2**: enhanced-background-removal.js (基础算法)
4. **Post-processing**: deep clean (去除残留)

## 配置选项

在脚本中可以调整以下配置：

```javascript
const TEST_CONFIG = {
  testRounds: 3,  // 测试轮数
  outputDir: path.join(__dirname, '../test-results'),  // 输出目录

  // 需要检查的文件
  filesToCheck: [
    { path: 'favicon/favicon.png', name: 'Favicon', type: 'icon' },
    { path: 'favicon_io/site-logo.png', name: 'Site Logo', type: 'logo' },
    { path: 'favicon_io/site-theme.png', name: 'Site Theme', type: 'theme' }
  ]
};
```

## 性能注意事项

- 每轮测试需要调用 OpenAI API 生成3张图片
- 完整的3轮测试大约需要 5-10 分钟
- 会消耗 OpenAI API 额度（每轮约 $0.12-0.18）

## 最佳实践

1. **定期测试** - 修改背景去除代码后运行测试
2. **保留历史** - 保存测试结果用于对比
3. **分析趋势** - 观察多轮测试的稳定性
4. **调优参数** - 根据测试结果调整算法参数
5. **验证修复** - 修复问题后再次测试确认

## 相关脚本

- `generate-ai-favicon.js` - AI图标生成（含背景去除）
- `generate-favicon.js` - 图标尺寸处理
- `update-favicon.js` - 图标部署
- `enhanced-background-removal.js` - 背景去除算法
- `enhanced-background-removal-color.js` - 高级背景去除

## 故障排除

### rembg 安装问题

如果 rembg 安装失败：

```bash
# Windows
python -m pip install --upgrade pip
pip install rembg

# macOS/Linux
pip3 install rembg
```

### Sharp 相关错误

如果出现 Sharp 错误：

```bash
npm rebuild sharp
```

### 测试卡住

如果测试卡住不动：

1. 检查 OpenAI API key 是否有效
2. 检查网络连接
3. 查看是否有进程占用文件

## 贡献

如果你发现背景去除算法的问题或有改进建议，请：

1. 运行测试获取详细数据
2. 保存测试报告
3. 提交 issue 并附上测试结果

## 许可

MIT License
