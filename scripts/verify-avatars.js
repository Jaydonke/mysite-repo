#!/usr/bin/env node

/**
 * 重新验证已生成的头像质量
 * 检查：人数、文字、质量、清晰度
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import OpenAI from 'openai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  gray: '\x1b[90m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * 分析图片质量
 */
async function analyzeImage(imagePath, index, total) {
  try {
    log(`\n[${index}/${total}] 验证: ${path.basename(imagePath)}`, 'cyan');

    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');
    const dataUrl = `data:image/jpeg;base64,${base64Image}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Carefully analyze this professional headshot avatar image and provide a detailed assessment:

1. Person Count: Count EXACTLY how many DISTINCT people/faces are visible in this image. Look carefully for:
   - Multiple faces
   - Partial faces in background
   - Reflections showing other people
   - Any human figures
   Answer with ONLY a number.

2. Text/Labels: Are there ANY visible text, words, name labels, watermarks, or written characters ANYWHERE in the image?
   - Check corners for watermarks
   - Check for name tags or labels
   - Check for any text overlay
   Answer: YES or NO

3. Image Quality: Rate the overall professional quality and technical excellence (1-10)
   Consider: resolution, lighting, composition, professional appearance

4. Face Clarity: Is the main person's face clearly visible, well-focused, and properly lit?
   Answer: YES or NO

5. Background: Describe the background type and quality

6. Issues: List ANY problems you notice:
   - Blurry or out of focus
   - Text or watermarks
   - Multiple people
   - Unprofessional elements
   - Poor lighting
   - Any other quality issues

Provide your answer in this EXACT format:
PERSON_COUNT: [number]
HAS_TEXT: [YES/NO]
QUALITY_SCORE: [1-10]
FACE_CLEAR: [YES/NO]
BACKGROUND: [description]
ISSUES: [list issues separated by commas, or write NONE]`
            },
            {
              type: "image_url",
              image_url: {
                url: dataUrl
              }
            }
          ]
        }
      ],
      max_tokens: 500
    });

    const analysis = response.choices[0].message.content;
    const result = parseAnalysis(analysis);

    // 显示结果
    log(`  📊 分析结果:`, 'cyan');

    // 人数检测
    if (result.personCount === 1) {
      log(`     ✅ 人数: ${result.personCount}`, 'green');
    } else {
      log(`     ❌ 人数: ${result.personCount} (应该是1人!)`, 'red');
    }

    // 文字检测
    if (!result.hasText) {
      log(`     ✅ 包含文字: NO`, 'green');
    } else {
      log(`     ❌ 包含文字: YES (不应该有文字!)`, 'red');
    }

    // 质量评分
    const qualityColor = result.qualityScore >= 7 ? 'green' : 'yellow';
    log(`     ${result.qualityScore >= 7 ? '✅' : '⚠️'}  质量评分: ${result.qualityScore}/10`, qualityColor);

    // 面部清晰度
    if (result.faceClear) {
      log(`     ✅ 面部清晰: YES`, 'green');
    } else {
      log(`     ⚠️  面部清晰: NO`, 'yellow');
    }

    log(`     📍 背景: ${result.background}`, 'gray');

    // 问题列表
    if (result.issues.length > 0) {
      log(`     ⚠️  问题: ${result.issues.join(', ')}`, 'yellow');
    } else {
      log(`     ✅ 问题: 无`, 'green');
    }

    return {
      success: true,
      imagePath,
      ...result
    };

  } catch (error) {
    log(`  ❌ 验证失败: ${error.message}`, 'red');
    return {
      success: false,
      imagePath,
      error: error.message
    };
  }
}

/**
 * 解析分析结果
 */
function parseAnalysis(text) {
  const result = {
    personCount: 0,
    hasText: false,
    qualityScore: 0,
    faceClear: false,
    background: '',
    issues: []
  };

  const lines = text.split('\n');
  for (const line of lines) {
    if (line.includes('PERSON_COUNT:')) {
      const match = line.match(/PERSON_COUNT:\s*(\d+)/i);
      if (match) result.personCount = parseInt(match[1]);
    }
    if (line.includes('HAS_TEXT:')) {
      result.hasText = line.toUpperCase().includes('YES');
    }
    if (line.includes('QUALITY_SCORE:')) {
      const match = line.match(/QUALITY_SCORE:\s*(\d+)/i);
      if (match) result.qualityScore = parseInt(match[1]);
    }
    if (line.includes('FACE_CLEAR:')) {
      result.faceClear = line.toUpperCase().includes('YES');
    }
    if (line.includes('BACKGROUND:')) {
      result.background = line.split(':')[1]?.trim() || '';
    }
    if (line.includes('ISSUES:')) {
      const issuesText = line.split(':')[1]?.trim() || '';
      if (issuesText && issuesText.toUpperCase() !== 'NONE') {
        result.issues = issuesText.split(',').map(i => i.trim());
      }
    }
  }

  return result;
}

/**
 * 主函数
 */
async function main() {
  log('\n' + '='.repeat(70), 'bright');
  log('     🔍 重新验证30张头像质量', 'bright');
  log('='.repeat(70), 'bright');

  const testDir = path.join(__dirname, '../test-avatars');

  if (!fs.existsSync(testDir)) {
    log('\n❌ 错误: test-avatars 目录不存在', 'red');
    process.exit(1);
  }

  // 获取所有图片
  const files = fs.readdirSync(testDir)
    .filter(f => f.endsWith('.jpg'))
    .sort((a, b) => {
      const numA = parseInt(a.match(/\d+/)?.[0] || '0');
      const numB = parseInt(b.match(/\d+/)?.[0] || '0');
      return numA - numB;
    });

  log(`\n📋 找到 ${files.length} 张图片`, 'cyan');

  const results = {
    total: files.length,
    analyzed: 0,
    failed: 0,
    singlePerson: 0,
    multiplePeople: 0,
    hasText: 0,
    noText: 0,
    highQuality: 0,
    qualityScores: [],
    issues: [],
    problemImages: []
  };

  // 验证每张图片
  for (let i = 0; i < files.length; i++) {
    const imagePath = path.join(testDir, files[i]);
    const result = await analyzeImage(imagePath, i + 1, files.length);

    if (result.success) {
      results.analyzed++;

      // 统计人数
      if (result.personCount === 1) {
        results.singlePerson++;
      } else {
        results.multiplePeople++;
        results.problemImages.push({
          file: files[i],
          issue: `多人照片 (${result.personCount}人)`,
          ...result
        });
      }

      // 统计文字
      if (result.hasText) {
        results.hasText++;
        results.problemImages.push({
          file: files[i],
          issue: '包含文字',
          ...result
        });
      } else {
        results.noText++;
      }

      // 统计质量
      results.qualityScores.push(result.qualityScore);
      if (result.qualityScore >= 7) {
        results.highQuality++;
      } else {
        results.problemImages.push({
          file: files[i],
          issue: `质量评分低 (${result.qualityScore}/10)`,
          ...result
        });
      }

      // 收集问题
      if (result.issues.length > 0) {
        results.issues.push(...result.issues);
      }
    } else {
      results.failed++;
    }

    // 避免API限流
    if (i < files.length - 1) {
      log(`  ⏳ 等待2秒...`, 'gray');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  // 显示统计结果
  log('\n' + '='.repeat(70), 'cyan');
  log('📊 验证结果统计', 'bright');
  log('='.repeat(70), 'cyan');

  log(`\n✅ 成功验证: ${results.analyzed}/${results.total}`, 'green');
  if (results.failed > 0) {
    log(`❌ 验证失败: ${results.failed}`, 'red');
  }

  log(`\n👤 人数检测:`, 'cyan');
  if (results.singlePerson === results.analyzed) {
    log(`  ✅ 单人头像: ${results.singlePerson}/${results.analyzed} (100%)`, 'green');
  } else {
    log(`  ⚠️  单人头像: ${results.singlePerson}/${results.analyzed} (${(results.singlePerson/results.analyzed*100).toFixed(1)}%)`, 'yellow');
    log(`  ❌ 多人照片: ${results.multiplePeople}/${results.analyzed}`, 'red');
  }

  log(`\n📝 文字检测:`, 'cyan');
  if (results.noText === results.analyzed) {
    log(`  ✅ 无文字标签: ${results.noText}/${results.analyzed} (100%)`, 'green');
  } else {
    log(`  ⚠️  无文字标签: ${results.noText}/${results.analyzed} (${(results.noText/results.analyzed*100).toFixed(1)}%)`, 'yellow');
    log(`  ❌ 包含文字: ${results.hasText}/${results.analyzed}`, 'red');
  }

  if (results.qualityScores.length > 0) {
    const avgQuality = (results.qualityScores.reduce((a, b) => a + b, 0) / results.qualityScores.length).toFixed(1);
    log(`\n⭐ 质量评分:`, 'cyan');
    log(`  📊 平均分: ${avgQuality}/10`, parseFloat(avgQuality) >= 7 ? 'green' : 'yellow');
    log(`  ✅ 高质量(>=7): ${results.highQuality}/${results.analyzed} (${(results.highQuality/results.analyzed*100).toFixed(1)}%)`, 'blue');
  }

  if (results.issues.length > 0) {
    const issueCount = {};
    results.issues.forEach(issue => {
      issueCount[issue] = (issueCount[issue] || 0) + 1;
    });
    log(`\n⚠️  发现的问题类型:`, 'yellow');
    Object.entries(issueCount).forEach(([issue, count]) => {
      log(`  - ${issue}: ${count}次`, 'yellow');
    });
  }

  // 显示有问题的图片
  if (results.problemImages.length > 0) {
    log(`\n❌ 有问题的图片 (${results.problemImages.length}张):`, 'red');
    // 去重
    const uniqueProblems = {};
    results.problemImages.forEach(p => {
      if (!uniqueProblems[p.file]) {
        uniqueProblems[p.file] = [];
      }
      uniqueProblems[p.file].push(p.issue);
    });

    Object.entries(uniqueProblems).forEach(([file, issues]) => {
      log(`  📁 ${file}:`, 'yellow');
      issues.forEach(issue => {
        log(`     - ${issue}`, 'red');
      });
    });
  }

  // 最终评估
  log('\n' + '='.repeat(70), 'cyan');
  const passRate = results.analyzed > 0 ? (results.singlePerson / results.analyzed * 100) : 0;
  const noTextRate = results.analyzed > 0 ? (results.noText / results.analyzed * 100) : 0;

  if (passRate === 100 && noTextRate === 100 && results.highQuality === results.analyzed) {
    log('🎉 完美！所有头像质量优秀！', 'green');
  } else if (passRate === 100 && noTextRate === 100) {
    log('✅ 测试通过！所有头像符合基本要求', 'green');
  } else {
    log('⚠️  发现问题！部分头像需要重新生成', 'yellow');
  }

  log('='.repeat(70), 'cyan');
}

main().catch(error => {
  log(`\n❌ 错误: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
