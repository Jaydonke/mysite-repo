# 作者库重置功能说明

## 📋 概述

在 `reset-site.js` 脚本中已集成**作者库自动重置**功能。每次执行网站重置时，系统将自动：

1. ✅ **清除现有作者库** - 删除所有旧的作者目录和头像
2. ✅ **创建30个全新作者** - 生成多样化的专业作者资料
3. ✅ **生成AI头像** - 使用DALL-E 3为每位作者创建专业头像

---

## 🔄 重置流程

### **完整的 reset-site.js 执行顺序**

```bash
npm run reset-site
```

执行后将按以下顺序运行：

1. **清空HTML文章** - 清空 newarticle 和 scheduledarticle 文件夹
2. **删除所有现有文章** - 清理网站中的现有文章内容
3. **🆕 创建全新作者库** - 清除现有作者并生成30个新作者
4. **🆕 生成AI作者头像** - 使用DALL-E为所有新作者生成专业头像
5. **更新主题配置** - 更新网站主题配置和样式
6. **更新文章配置** - 生成新文章配置，重置位置追踪
7. **生成文章** - 使用AI生成所有配置的文章内容
8. **同步配置到模板** - 同步配置文件到网站模板
9. **添加新文章到网站** - 将生成的文章添加到网站中
10. **生成新主题方向** - 为未来文章生成新的主题和方向
11. **生成定时发布文章** - 生成后15篇新主题文章
12. **设置文章定时发布** - 配置文章的定时发布时间
13. **生成AI图标** - 使用AI生成网站图标
14. **生成图标文件** - 生成所有尺寸的favicon文件
15. **更新网站图标** - 将生成的图标应用到网站
16. **修复损坏的图片** - 检测并重新生成损坏的文章图片
17. **构建网站** - 构建网站以验证所有内容正确
18. **部署到GitHub** - 推送到新的GitHub私有仓库

---

## 👥 新增的作者库步骤详解

### **步骤 3: 创建全新作者库**

**命令**: `node scripts/create-30-diverse-authors.js`

**功能**:
- 📦 **备份现有作者** - 自动备份到 `backup-authors-[timestamp]` 目录
- 🗑️ **删除旧作者目录** - 清空 `src/content/authors/` 中的所有作者
- 🗑️ **删除旧头像目录** - 清空 `src/assets/images/authors/` 中的所有头像
- 👤 **创建30个新作者** - 生成包含以下信息的作者：
  - 作者姓名（Dr. Sarah Chen, Marcus Williams 等）
  - 职业头衔（Clinical Psychologist, Meditation Teacher 等）
  - 专业简介（150-200字）
  - 社交媒体链接（LinkedIn, Twitter）
  - 占位符头像（1x1像素透明PNG）

**输出示例**:
```
💾 备份现有作者数据...
✅ 作者数据已备份到: backup-authors-1729673825477

🗑️  删除旧的作者目录...
✅ 已删除 30 个旧作者目录

🗑️  删除旧的作者头像...
✅ 已删除 30 个旧头像目录

👥 创建30个新作者...
  1. ✅ Dr. Sarah Chen (sarah-chen)
  2. ✅ Marcus Williams (marcus-williams)
  3. ✅ Aisha Patel (aisha-patel)
  ...
  30. ✅ Maya Desai (maya-desai)

📊 创建结果:
  ✅ 成功: 30 个作者
  📝 总计: 30 个作者
```

**创建的作者文件结构**:
```
src/content/authors/sarah-chen/index.mdx
---
name: Dr. Sarah Chen
job: Clinical Psychologist & Wellness Expert
avatar: '@assets/images/authors/sarah-chen/avatar.jpg'
bio: Specializes in cognitive behavioral therapy and mindfulness-based stress reduction...
social:
  linkedin: https://linkedin.com/in/sarah-chen
  twitter: https://twitter.com/sarah_chen
---
```

---

### **步骤 4: 生成AI作者头像**

**命令**: `node scripts/generate-author-avatars.js`

**功能**:
- 🎨 **调用DALL-E 3 API** - 为每位作者生成专业头像
- 📥 **下载高质量图片** - 1024x1024px PNG格式
- 💾 **保存到作者目录** - 替换占位符头像
- ✅ **验证文件大小** - 确保图片有效（>1KB）

**生成特点**:
- **专业形象** - 商务休闲装，专业表情
- **多样化** - 涵盖不同种族、性别、年龄
- **高质量** - 自然光照，中性背景
- **个性化提示词** - 每位作者都有定制的DALL-E提示词

**提示词示例**:
```javascript
{
  slug: 'sarah-chen',
  name: 'Dr. Sarah Chen',
  gender: 'female',
  ethnicity: 'East Asian',
  age: '35-45',
  profession: 'Clinical Psychologist',
  prompt: 'Professional headshot of an Asian female clinical psychologist in her 40s,
           warm and approachable expression, wearing professional attire,
           neutral background, natural lighting, high-quality portrait photography'
}
```

**输出示例**:
```
🎨 开始生成作者头像
========================================================================

📊 任务信息:
  - 总作者数: 30
  - 并发数: 1
  - 开始位置: 1

[1/30] 生成头像: Dr. Sarah Chen
  专业: Clinical Psychologist
  提示词: Professional headshot of an Asian female clinical psychologist...
  🎨 调用DALL-E API...
  📥 下载图片...
  ✅ 成功! (256.3KB)

[2/30] 生成头像: Marcus Williams
  专业: Meditation Teacher
  🎨 调用DALL-E API...
  📥 下载图片...
  ✅ 成功! (248.7KB)

...

========================================================================
📈 生成结果统计:
========================================================================

✅ 成功: 30 个头像
⏭️  跳过: 0 个头像 (已存在)
❌ 失败: 0 个头像
📊 总计: 30 个作者

🎉 头像生成完成！
📁 头像位置: src/assets/images/authors/{author-slug}/avatar.jpg
```

---

## 🎯 30位新作者一览

每次重置后生成的作者列表（固定名单）：

| # | 作者名称 | 职业 | 专长领域 |
|---|----------|------|----------|
| 1 | Dr. Sarah Chen | Clinical Psychologist & Wellness Expert | CBT, 正念减压 |
| 2 | Marcus Williams | Meditation Teacher & Mindfulness Coach | 内观冥想 |
| 3 | Aisha Patel | Holistic Health Practitioner | 阿育吠陀，自然疗法 |
| 4 | David Thompson | Stress Management Consultant | 职场压力管理 |
| 5 | Yuki Tanaka | Yoga Instructor & Movement Therapist | 瑜伽，身体疗法 |
| 6 | Jennifer Rodriguez | Nutritional Therapist | 营养与心理健康 |
| 7 | Dr. Rahman Ali | Psychiatrist & Sleep Medicine Specialist | 睡眠医学 |
| 8 | Elena Petrov | Art Therapist & Creative Wellness Coach | 艺术疗法 |
| 9 | James O'Connor | Life Coach & Personal Development Expert | 个人发展 |
| 10 | Priya Sharma | Mindful Parenting Educator | 正念育儿 |
| 11 | Michael Jenkins | Exercise Physiologist & Wellness Coach | 运动心理学 |
| 12 | Sofia Morales | Trauma-Informed Therapist | 创伤治疗 |
| 13 | Kevin Zhang | Digital Wellness Advocate | 数字健康 |
| 14 | Dr. Lisa Mueller | Neuroscientist & Brain Health Researcher | 神经科学 |
| 15 | Jordan Davis | LGBTQ+ Mental Health Specialist | LGBTQ+心理健康 |
| 16 | Anna Kowalski | Grief Counselor & End-of-Life Doula | 悲伤辅导 |
| 17 | Carlos Santiago | Community Mental Health Worker | 社区心理健康 |
| 18 | Mei-Ling Wong | Traditional Chinese Medicine Practitioner | 中医，针灸 |
| 19 | Tyler Anderson | Occupational Therapist | 职业疗法 |
| 20 | Fatima Hassan | Positive Psychology Researcher | 积极心理学 |
| 21 | Ryan Cooper | Breathwork Facilitator | 呼吸疗法 |
| 22 | Isabella Rossi | Music Therapist | 音乐疗法 |
| 23 | Daniel Kim | Corporate Wellness Director | 企业健康 |
| 24 | Olivia Bennett | Nature Therapy Guide | 自然疗法 |
| 25 | Ahmed Abdullah | Addiction Recovery Counselor | 成瘾康复 |
| 26 | Rachel Goldstein | Eating Disorder Specialist | 饮食障碍 |
| 27 | Samuel Brown | Veteran Mental Health Advocate | 退伍军人心理健康 |
| 28 | Dr. Nina Ivanova | Neuropsychologist | 神经心理学 |
| 29 | Ethan Parker | Teen & Adolescent Counselor | 青少年心理咨询 |
| 30 | Maya Desai | Self-Compassion Teacher | 自我关怀 |

---

## ✨ 作者多样性亮点

### **种族多样性**
- 🌏 东亚裔 (4): Sarah Chen, Yuki Tanaka, Kevin Zhang, Mei-Ling Wong
- 🌏 南亚裔 (3): Aisha Patel, Priya Sharma, Maya Desai
- 🌍 非洲裔 (3): Marcus Williams, Michael Jenkins, Samuel Brown
- 🌎 拉丁裔 (3): Jennifer Rodriguez, Sofia Morales, Carlos Santiago
- 🌍 中东裔 (3): Dr. Rahman Ali, Fatima Hassan, Ahmed Abdullah
- 🌍 东欧裔 (3): Elena Petrov, Anna Kowalski, Dr. Nina Ivanova
- 🌍 地中海裔 (1): Isabella Rossi
- 🌍 高加索裔 (10): David Thompson, James O'Connor, 等

### **性别平衡**
- 👩 女性: 16 位 (53%)
- 👨 男性: 14 位 (47%)

### **专业领域分布**
- 🧠 临床心理学/精神病学: 4 位
- 🧘 冥想/瑜伽教练: 5 位
- 💊 营养/健康教练: 3 位
- 🏃 运动/健身专家: 2 位
- 🎨 替代疗法: 5 位（艺术、音乐、自然等）
- 👨‍⚕️ 治疗师/咨询师: 8 位
- 📊 研究人员/专家: 3 位

### **年龄分布**
- 25-35岁: 12 位（年轻专家）
- 35-45岁: 12 位（中年专家）
- 45-55岁: 6 位（资深专家）

---

## ⚠️ 重要说明

### **关键任务失败处理**

作者库重置步骤（步骤3和步骤4）被标记为**关键任务**。如果失败，脚本将停止执行：

```javascript
// 如果是关键任务失败，停止执行
if (i < 5) {  // 前5个任务是关键任务（清空文章、删除文章、创建作者、生成头像、更新主题）
  log('❌ 关键任务失败，停止执行', 'red');
  return false;
}
```

**前5个关键任务**:
1. 清空HTML文章
2. 删除所有现有文章
3. **创建全新作者库** ⭐
4. **生成AI作者头像** ⭐
5. 更新主题配置

### **备份机制**

每次创建新作者库时，系统自动备份现有作者到：
```
backup-authors-[timestamp]/
```

如需恢复，只需将备份目录复制回原位置。

### **API成本**

- **DALL-E 3 调用**: 30次（每位作者1次）
- **成本估算**: ~$1.20（$0.040/张 × 30）
- **图片质量**: Standard (1024x1024px)

如果头像已存在且大小>5KB，将自动跳过生成。

---

## 🛠️ 单独执行作者库重置

如果只想重置作者库而不重置整个网站：

### **方法1: 创建新作者（不生成头像）**
```bash
node scripts/create-30-diverse-authors.js
```

### **方法2: 生成头像（为现有作者）**
```bash
node scripts/generate-author-avatars.js
```

### **方法3: 完整重置（创建+头像）**
```bash
node scripts/create-30-diverse-authors.js && node scripts/generate-author-avatars.js
```

---

## 📖 相关文档

- [AUTHOR_SYSTEM_STRUCTURE.md](AUTHOR_SYSTEM_STRUCTURE.md) - 完整的作者系统架构说明
- [scripts/create-30-diverse-authors.js](scripts/create-30-diverse-authors.js) - 作者创建脚本
- [scripts/generate-author-avatars.js](scripts/generate-author-avatars.js) - 头像生成脚本
- [scripts/randomize-authors.js](scripts/randomize-authors.js) - 作者随机分配脚本

---

## 🎓 总结

通过在 `reset-site.js` 中集成作者库重置功能，现在每次重置网站时都会：

✅ **自动清除旧作者** - 删除所有现有作者数据和头像
✅ **生成30个新作者** - 创建多样化的专业作者资料
✅ **AI生成头像** - 使用DALL-E 3创建高质量专业头像
✅ **备份保护** - 自动备份现有数据防止意外丢失
✅ **智能跳过** - 已存在的有效头像不会重复生成

这确保每个新网站都有一套全新、专业、多样化的作者团队，为内容增添权威性和可信度。
