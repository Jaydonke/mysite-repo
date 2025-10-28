#!/usr/bin/env node

/**
 * 修复损坏的文章图片
 * 检测 src/assets/images/articles 中的损坏图片并使用 DALL-E 重新生成
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import https from 'https';
import http from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 加载环境变量
dotenv.config({ path: path.join(__dirname, '../.env') });

const imagesDir = path.join(__dirname, '../src/assets/images/articles');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * 检查图片文件是否损坏
 */
function isImageCorrupted(imagePath) {
  try {
    if (!fs.existsSync(imagePath)) {
      return true;
    }

    const stats = fs.statSync(imagePath);
    if (stats.size < 1024) {
      return true;
    }

    const buffer = fs.readFileSync(imagePath);

    // 检查是否是有效的 PNG 文件
    const isPNG = buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47;

    // 检查是否是有效的 JPEG 文件
    const isJPEG = buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF;

    // 只要是有效的图片格式（PNG 或 JPEG）就认为没有损坏，不管扩展名是什么
    return !(isPNG || isJPEG);
  } catch (error) {
    log(`    ⚠️  Error checking ${path.basename(imagePath)}: ${error.message}`, 'yellow');
    return true;
  }
}

/**
 * 从文件夹名生成文章标题
 * 移除可能触发安全系统的敏感词汇
 */
function folderNameToTitle(folderName) {
  const title = folderName
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  // 替换敏感词汇以避免触发 OpenAI 安全系统
  return title
    .replace(/COVID[\s-]?19/gi, 'pandemic')
    .replace(/coronavirus/gi, 'pandemic')
    .replace(/\bvirus\b/gi, 'health crisis')
    .replace(/\bdisease\b/gi, 'health condition');
}

/**
 * 根据图片文件名获取提示词
 */
function getImagePrompt(fileName, articleTitle) {
  const prompts = {
    'cover.png': {
      name: 'Hero Image',
      prompt: `Create a professional hero image for an article titled "${articleTitle}". Style: modern, clean, professional blog header image. Colors: professional color scheme. Requirements: horizontal landscape format, high quality, photorealistic or modern illustration. No text or watermarks.`
    },
    'img_0.jpg': {
      name: 'Process Illustration',
      prompt: `Create an illustration showing a process or concept related to "${articleTitle}". Style: informative, clear, visual explanation. Colors: professional palette. Requirements: horizontal format, educational. No text or watermarks.`
    },
    'img_1.jpg': {
      name: 'Benefits Visualization',
      prompt: `Create a visualization showing benefits related to "${articleTitle}". Style: positive, engaging. Colors: bright and optimistic. Requirements: horizontal format, clear visual metaphors. No text or watermarks.`
    },
    'img_2.jpg': {
      name: 'Summary Graphic',
      prompt: `Create a summary graphic for "${articleTitle}". Style: comprehensive, conclusion-focused. Colors: professional. Requirements: horizontal format, summarizing visual elements. No text or watermarks.`
    }
  };

  return prompts[fileName] || {
    name: 'Article Image',
    prompt: `Create a professional image related to "${articleTitle}". Style: modern, clean. No text or watermarks.`
  };
}

/**
 * 下载图片
 */
function downloadImage(url, outputPath, maxRetries = 3) {
  return new Promise((resolve, reject) => {
    let attempts = 0;

    function attemptDownload() {
      attempts++;
      const protocol = url.startsWith('https') ? https : http;
      const file = fs.createWriteStream(outputPath);

      protocol.get(url, (response) => {
        if (response.statusCode !== 200) {
          file.close();
          try { fs.unlinkSync(outputPath); } catch (e) {}

          if (attempts < maxRetries) {
            setTimeout(attemptDownload, 2000);
          } else {
            reject(new Error(`HTTP ${response.statusCode}`));
          }
          return;
        }

        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve();
        });

        file.on('error', (err) => {
          file.close();
          try { fs.unlinkSync(outputPath); } catch (e) {}

          if (attempts < maxRetries) {
            setTimeout(attemptDownload, 2000);
          } else {
            reject(err);
          }
        });
      }).on('error', (err) => {
        file.close();
        try { fs.unlinkSync(outputPath); } catch (e) {}

        if (attempts < maxRetries) {
          setTimeout(attemptDownload, 2000);
        } else {
          reject(err);
        }
      });
    }

    attemptDownload();
  });
}

/**
 * 重新生成单张图片
 */
async function regenerateImage(openai, imagePath, folderName, fileName) {
  const articleTitle = folderNameToTitle(folderName);
  const imageInfo = getImagePrompt(fileName, articleTitle);

  try {
    log(`      🎨 Generating ${imageInfo.name} for "${articleTitle}"...`, 'blue');

    const imageResponse = await Promise.race([
      openai.images.generate({
        model: "dall-e-3",
        prompt: imageInfo.prompt,
        size: "1792x1024",
        quality: "standard",
        n: 1,
      }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('DALL-E timeout after 120s')), 120000)
      )
    ]);

    const imageUrl = imageResponse.data[0].url;
    await downloadImage(imageUrl, imagePath, 3);
    log(`      ✅ Successfully regenerated ${fileName}`, 'green');
    return true;
  } catch (error) {
    log(`      ❌ Failed to regenerate ${fileName}: ${error.message}`, 'red');
    return false;
  }
}

/**
 * 修复单个文件夹中的损坏图片
 */
async function fixFolderImages(openai, articlesDir, folderName) {
  const folderPath = path.join(articlesDir, folderName);
  const expectedImages = ['cover.png', 'img_0.jpg', 'img_1.jpg', 'img_2.jpg'];
  const corruptedImages = [];

  for (const imageName of expectedImages) {
    const imagePath = path.join(folderPath, imageName);
    if (isImageCorrupted(imagePath)) {
      corruptedImages.push(imageName);
    }
  }

  if (corruptedImages.length === 0) {
    log(`    ✅ All images OK`, 'green');
    return { folder: folderName, fixed: 0, failed: 0 };
  }

  log(`    ⚠️  Found ${corruptedImages.length} corrupted image(s): ${corruptedImages.join(', ')}`, 'yellow');

  let fixedCount = 0;
  let failedCount = 0;

  for (const imageName of corruptedImages) {
    const imagePath = path.join(folderPath, imageName);

    try {
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    } catch (e) {
      log(`      ⚠️  Could not delete corrupted file: ${e.message}`, 'yellow');
    }

    const success = await regenerateImage(openai, imagePath, folderName, imageName);
    if (success) {
      fixedCount++;
    } else {
      failedCount++;
    }

    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  return { folder: folderName, fixed: fixedCount, failed: failedCount };
}

/**
 * 主函数
 */
async function main() {
  log('\n====================================', 'bright');
  log('  修复损坏的文章图片', 'bright');
  log('====================================\n', 'bright');

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });

  log('✅ OpenAI client initialized', 'green');

  if (!fs.existsSync(imagesDir)) {
    log('❌ Articles directory not found', 'red');
    process.exit(1);
  }

  const folders = fs.readdirSync(imagesDir).filter(item => {
    const itemPath = path.join(imagesDir, item);
    return fs.statSync(itemPath).isDirectory();
  });

  if (folders.length === 0) {
    log('📭 No article folders found', 'yellow');
    process.exit(0);
  }

  log(`📊 Found ${folders.length} article folder(s)\n`, 'cyan');

  let totalFixed = 0;
  let totalFailed = 0;
  let foldersWithIssues = 0;

  for (let i = 0; i < folders.length; i++) {
    const folder = folders[i];
    log(`[${i + 1}/${folders.length}] Checking folder: ${folder}`, 'cyan');

    const result = await fixFolderImages(openai, imagesDir, folder);

    if (result.fixed > 0 || result.failed > 0) {
      foldersWithIssues++;
    }

    totalFixed += result.fixed;
    totalFailed += result.failed;
  }

  log('\n====================================', 'bright');
  log('  修复完成', 'bright');
  log('====================================\n', 'bright');

  log('📊 统计信息:', 'cyan');
  log(`   • 检查文件夹: ${folders.length}`, 'blue');
  log(`   • 有问题的文件夹: ${foldersWithIssues}`, 'yellow');
  log(`   • 成功修复图片: ${totalFixed}`, 'green');
  log(`   • 修复失败图片: ${totalFailed}`, totalFailed > 0 ? 'red' : 'blue');

  if (totalFailed > 0) {
    log('\n⚠️  警告: 部分图片修复失败', 'yellow');
    log('   构建可能仍会失败，请检查错误日志', 'yellow');
    process.exit(1);
  } else if (totalFixed > 0) {
    log('\n✅ 所有损坏的图片已成功修复', 'green');
  } else {
    log('\n✅ 没有发现损坏的图片', 'green');
  }
}

main().catch(error => {
  log(`\n❌ 致命错误: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
}); 