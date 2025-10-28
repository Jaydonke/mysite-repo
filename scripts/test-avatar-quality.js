#!/usr/bin/env node

/**
 * 测试作者头像生成质量
 * 验证：
 * 1. 图片只包含一个人（避免多人合照）
 * 2. 没有文字标签或水印
 * 3. 图片质量和尺寸符合要求
 * 4. 生成速度和成功率
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import https from 'https';

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
 * 下载图片
 */
async function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        const fileStream = fs.createWriteStream(filepath);
        response.pipe(fileStream);
        fileStream.on('finish', () => {
          fileStream.close();
          resolve();
        });
        fileStream.on('error', reject);
      } else {
        reject(new Error(`Failed: ${response.statusCode}`));
      }
    }).on('error', reject);
  });
}

/**
 * 使用 GPT-4 Vision 分析图片质量
 */
async function analyzeImageQuality(imagePath) {
  try {
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
              text: `Analyze this professional headshot avatar image and provide a structured assessment:

1. Person Count: How many people are in the image? (Answer with just a number)
2. Text/Labels: Are there any visible text, name labels, or watermarks? (Answer: YES or NO)
3. Image Quality: Rate the professional quality (1-10)
4. Face Clarity: Is the face clear and well-lit? (Answer: YES or NO)
5. Background: Describe the background (professional, neutral, distracting, etc.)
6. Issues: List any quality issues (blurry, text overlay, multiple people, etc.)

Provide your answer in this exact format:
PERSON_COUNT: [number]
HAS_TEXT: [YES/NO]
QUALITY_SCORE: [1-10]
FACE_CLEAR: [YES/NO]
BACKGROUND: [description]
ISSUES: [list or NONE]`
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
    return parseAnalysis(analysis);

  } catch (error) {
    log(`  ⚠️  Vision分析失败: ${error.message}`, 'yellow');
    return null;
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
 * 快速检测图片人数（用于重试判断）
 */
async function detectPersonCount(imagePath) {
  try {
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
              text: `Count how many people are in this image. Answer with ONLY a number (1, 2, 3, etc.).`
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
      max_tokens: 10
    });

    const answer = response.choices[0].message.content.trim();
    const personCount = parseInt(answer.match(/\d+/)?.[0] || '0');
    return personCount;

  } catch (error) {
    log(`  ⚠️  人数检测失败: ${error.message}`, 'yellow');
    return -1; // 返回-1表示检测失败，跳过验证
  }
}

/**
 * 测试单个头像生成（带多人检测和自动重试）
 */
async function testSingleAvatar(testPrompt, index, total) {
  const testDir = path.join(__dirname, '../test-avatars');
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true });
  }

  const imagePath = path.join(testDir, `test-avatar-${index + 1}.jpg`);
  const MAX_RETRIES = 3; // 最多重试3次

  let attempt = 0;
  let lastError = null;
  let totalGenerationTime = 0;

  while (attempt < MAX_RETRIES) {
    try {
      attempt++;

      if (attempt === 1) {
        log(`\n[${index + 1}/${total}] 测试头像生成...`, 'cyan');
        log(`  提示词: ${testPrompt.substring(0, 80)}...`, 'gray');
      } else {
        log(`\n  🔄 第 ${attempt} 次尝试...`, 'yellow');
      }

      const startTime = Date.now();

      // 生成图片
      log(`  🎨 调用 DALL-E API...`, 'blue');
      const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: testPrompt,
        n: 1,
        size: "1024x1024",
        quality: "standard",
        style: "natural"
      });

      const imageUrl = response.data[0].url;
      const generationTime = Date.now() - startTime;
      totalGenerationTime += generationTime;

      // 下载图片到临时位置
      log(`  📥 下载图片...`, 'blue');
      const tempPath = imagePath + '.tmp';
      await downloadImage(imageUrl, tempPath);

      const stats = fs.statSync(tempPath);
      const fileSize = (stats.size / 1024).toFixed(1);

      log(`  ✅ 图片已生成 (${fileSize}KB, ${(generationTime / 1000).toFixed(1)}s)`, 'green');

      // 🔍 快速检测人数
      log(`  🔍 检测图片人数...`, 'blue');
      const personCount = await detectPersonCount(tempPath);

      if (personCount > 1) {
        fs.unlinkSync(tempPath);
        log(`  ⚠️  检测到 ${personCount} 人，不符合单人头像要求`, 'yellow');

        if (attempt < MAX_RETRIES) {
          log(`  🔄 将重新生成...`, 'yellow');
          await new Promise(resolve => setTimeout(resolve, 2000));
          continue; // 重试
        } else {
          throw new Error(`After ${MAX_RETRIES} attempts, still generating multi-person images`);
        }
      } else if (personCount === 1) {
        log(`  ✅ 确认为单人头像`, 'green');
      } else if (personCount === -1) {
        log(`  ⚠️  人数检测失败，继续完整质量分析`, 'yellow');
      }

      // 移动到最终位置
      fs.renameSync(tempPath, imagePath);

      // 完整质量分析
      log(`  🔍 分析图片质量...`, 'blue');
      const analysis = await analyzeImageQuality(imagePath);

      if (analysis) {
        log(`  📊 分析结果:`, 'cyan');
        log(`     - 人数: ${analysis.personCount}`, analysis.personCount === 1 ? 'green' : 'red');
        log(`     - 包含文字: ${analysis.hasText ? 'YES' : 'NO'}`, analysis.hasText ? 'red' : 'green');
        log(`     - 质量评分: ${analysis.qualityScore}/10`, analysis.qualityScore >= 7 ? 'green' : 'yellow');
        log(`     - 面部清晰: ${analysis.faceClear ? 'YES' : 'NO'}`, analysis.faceClear ? 'green' : 'yellow');
        log(`     - 背景: ${analysis.background}`, 'gray');

        if (analysis.issues.length > 0) {
          log(`     - 问题: ${analysis.issues.join(', ')}`, 'yellow');
        } else {
          log(`     - 问题: 无`, 'green');
        }
      }

      log(`  💾 图片已保存: ${imagePath}`, 'gray');

      return {
        success: true,
        generationTime: totalGenerationTime,
        fileSize: stats.size,
        analysis,
        imagePath,
        attempts: attempt
      };

    } catch (err) {
      lastError = err;

      if (attempt < MAX_RETRIES) {
        log(`  ⚠️  生成失败: ${err.message}`, 'yellow');
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }
  }

  // 所有重试都失败
  log(`  ❌ 失败: ${lastError?.message || 'All retry attempts failed'}`, 'red');
  return {
    success: false,
    error: lastError?.message || 'All retry attempts failed',
    attempts: attempt
  };
}

/**
 * 主测试函数
 */
async function main() {
  log('\n' + '='.repeat(70), 'bright');
  log('     🧪 作者头像生成质量测试', 'bright');
  log('='.repeat(70), 'bright');

  // 检查 API Key
  if (!process.env.OPENAI_API_KEY) {
    log('\n❌ 错误: 未找到 OPENAI_API_KEY', 'red');
    process.exit(1);
  }

  // 解析参数
  const args = process.argv.slice(2);
  let testCount = 3; // 默认测试3次

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--count' || args[i] === '-c') {
      testCount = parseInt(args[++i]) || 3;
    } else if (args[i] === '--help' || args[i] === '-h') {
      log('\n使用方法:', 'yellow');
      log('  node scripts/test-avatar-quality.js [options]', 'white');
      log('\n选项:', 'yellow');
      log('  --count, -c   测试次数 (默认: 3)', 'white');
      log('  --help, -h    显示帮助', 'white');
      log('\n示例:', 'yellow');
      log('  node scripts/test-avatar-quality.js', 'cyan');
      log('  node scripts/test-avatar-quality.js -c 5', 'cyan');
      process.exit(0);
    }
  }

  // 测试用的提示词模板 - 强化版，明确禁止多角度/多姿势
  const testPrompts = [
    "A single professional headshot portrait photograph. ONE person only: East Asian female meditation teacher in her 30s, calm and centered expression, wearing comfortable wellness attire, peaceful natural setting, soft lighting. This is a standard author profile photo showing ONE individual in a SINGLE continuous frame - NOT a collage, NOT multiple photos, NOT side-by-side views, NOT before-and-after comparison, NOT different angles of the same person. Simple unified portrait with ONE subject appearing ONCE. No other people, no text, no labels, no watermarks. High-quality portrait photography.",

    "A single professional headshot portrait photograph. ONE person only: Caucasian male psychiatrist in his 40s, warm and approachable expression, wearing medical professional attire, clinical setting, professional lighting. This is a standard author profile photo showing ONE individual in a SINGLE continuous frame - NOT a collage, NOT multiple photos, NOT side-by-side views, NOT before-and-after comparison, NOT different angles of the same person. Simple unified portrait with ONE subject appearing ONCE. No other people, no text, no labels, no watermarks. High-quality portrait photography.",

    "A single professional headshot portrait photograph. ONE person only: Hispanic female therapist in her 35s, compassionate and understanding expression, wearing professional casual attire, neutral background, natural lighting. This is a standard author profile photo showing ONE individual in a SINGLE continuous frame - NOT a collage, NOT multiple photos, NOT side-by-side views, NOT before-and-after comparison, NOT different angles of the same person. Simple unified portrait with ONE subject appearing ONCE. No other people, no text, no labels, no watermarks. High-quality portrait photography.",

    "A single professional headshot portrait photograph. ONE person only: African male life coach in his 30s, encouraging and supportive expression, wearing business casual attire, neutral background, natural lighting. This is a standard author profile photo showing ONE individual in a SINGLE continuous frame - NOT a collage, NOT multiple photos, NOT side-by-side views, NOT before-and-after comparison, NOT different angles of the same person. Simple unified portrait with ONE subject appearing ONCE. No other people, no text, no labels, no watermarks. High-quality portrait photography.",

    "A single professional headshot portrait photograph. ONE person only: South Asian female psychologist in her 40s, warm and approachable expression, wearing professional attire, neutral background, natural lighting. This is a standard author profile photo showing ONE individual in a SINGLE continuous frame - NOT a collage, NOT multiple photos, NOT side-by-side views, NOT before-and-after comparison, NOT different angles of the same person. Simple unified portrait with ONE subject appearing ONCE. No other people, no text, no labels, no watermarks. High-quality portrait photography."
  ];

  log(`\n📋 测试配置:`, 'cyan');
  log(`  - 测试次数: ${testCount}`, 'blue');
  log(`  - 模型: DALL-E-3`, 'blue');
  log(`  - 质量检测: GPT-4o-mini Vision`, 'blue');

  const results = {
    total: testCount,
    success: 0,
    failed: 0,
    singlePerson: 0,
    multiplePeople: 0,
    hasText: 0,
    noText: 0,
    highQuality: 0, // >=7分
    totalGenerationTime: 0,
    totalFileSize: 0,
    qualityScores: [],
    issues: [],
    retries: 0,
    multiPersonRetries: 0
  };

  // 执行测试
  for (let i = 0; i < testCount; i++) {
    const prompt = testPrompts[i % testPrompts.length];
    const result = await testSingleAvatar(prompt, i, testCount);

    if (result.success) {
      results.success++;
      results.totalGenerationTime += result.generationTime;
      results.totalFileSize += result.fileSize;

      // 统计重试次数
      if (result.attempts > 1) {
        const retryCount = result.attempts - 1;
        results.retries += retryCount;
        results.multiPersonRetries += retryCount;
      }

      if (result.analysis) {
        // 统计人数
        if (result.analysis.personCount === 1) {
          results.singlePerson++;
        } else {
          results.multiplePeople++;
        }

        // 统计文字
        if (result.analysis.hasText) {
          results.hasText++;
        } else {
          results.noText++;
        }

        // 统计质量
        results.qualityScores.push(result.analysis.qualityScore);
        if (result.analysis.qualityScore >= 7) {
          results.highQuality++;
        }

        // 收集问题
        if (result.analysis.issues.length > 0) {
          results.issues.push(...result.analysis.issues);
        }
      }
    } else {
      results.failed++;
    }

    // 避免API限流
    if (i < testCount - 1) {
      log(`\n  ⏳ 等待3秒...`, 'gray');
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }

  // 显示统计结果
  log('\n' + '='.repeat(70), 'cyan');
  log('📊 测试结果统计', 'bright');
  log('='.repeat(70), 'cyan');

  log(`\n✅ 成功率: ${results.success}/${results.total} (${(results.success / results.total * 100).toFixed(1)}%)`, 'green');

  if (results.success > 0) {
    const avgTime = (results.totalGenerationTime / results.success / 1000).toFixed(1);
    const avgSize = (results.totalFileSize / results.success / 1024).toFixed(1);
    log(`⏱️  平均生成时间: ${avgTime}s`, 'blue');
    log(`📦 平均文件大小: ${avgSize}KB`, 'blue');
  }

  if (results.retries > 0) {
    log(`\n🔄 重试统计:`, 'yellow');
    log(`  - 因多人头像重试: ${results.multiPersonRetries} 次`, 'yellow');
    log(`  - 总重试次数: ${results.retries} 次`, 'yellow');
    log(`  - 重试后成功率: ${((results.success / (results.success + results.retries)) * 100).toFixed(1)}%`, 'green');
  }

  log(`\n👤 人数检测:`, 'cyan');
  log(`  - 单人头像: ${results.singlePerson}/${results.success} ✅`, results.singlePerson === results.success ? 'green' : 'yellow');
  log(`  - 多人照片: ${results.multiplePeople}/${results.success} ${results.multiplePeople > 0 ? '⚠️' : ''}`, results.multiplePeople > 0 ? 'red' : 'green');

  log(`\n📝 文字检测:`, 'cyan');
  log(`  - 无文字标签: ${results.noText}/${results.success} ✅`, results.noText === results.success ? 'green' : 'yellow');
  log(`  - 包含文字: ${results.hasText}/${results.success} ${results.hasText > 0 ? '⚠️' : ''}`, results.hasText > 0 ? 'red' : 'green');

  if (results.qualityScores.length > 0) {
    const avgQuality = (results.qualityScores.reduce((a, b) => a + b, 0) / results.qualityScores.length).toFixed(1);
    log(`\n⭐ 质量评分:`, 'cyan');
    log(`  - 平均分: ${avgQuality}/10`, parseFloat(avgQuality) >= 7 ? 'green' : 'yellow');
    log(`  - 高质量(>=7): ${results.highQuality}/${results.success}`, 'blue');
    log(`  - 分数分布: ${results.qualityScores.join(', ')}`, 'gray');
  }

  if (results.issues.length > 0) {
    const issueCount = {};
    results.issues.forEach(issue => {
      issueCount[issue] = (issueCount[issue] || 0) + 1;
    });
    log(`\n⚠️  发现的问题:`, 'yellow');
    Object.entries(issueCount).forEach(([issue, count]) => {
      log(`  - ${issue}: ${count}次`, 'yellow');
    });
  }

  // 最终评估
  log('\n' + '='.repeat(70), 'cyan');
  const passRate = results.success > 0 ? (results.singlePerson / results.success * 100) : 0;
  const noTextRate = results.success > 0 ? (results.noText / results.success * 100) : 0;

  if (passRate === 100 && noTextRate === 100) {
    log('🎉 测试通过！所有头像均符合要求！', 'green');
  } else if (passRate >= 80 && noTextRate >= 80) {
    log('✅ 测试基本通过，但有少量问题需要注意', 'yellow');
  } else {
    log('⚠️  测试未通过，需要改进提示词', 'red');
  }

  log(`\n📁 测试图片保存在: ${path.join(__dirname, '../test-avatars')}`, 'cyan');
  log('='.repeat(70), 'cyan');
}

main().catch(error => {
  log(`\n❌ 错误: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
