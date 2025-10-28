#!/usr/bin/env node

/**
 * 为30个作者生成专业头像（使用免费图片服务）
 * 使用This Person Does Not Exist API生成逼真的AI人像
 * 无需API密钥，完全免费
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import http from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const authorsDir = path.join(__dirname, '../src/content/authors');
const assetsDir = path.join(__dirname, '../src/assets/images/authors');

// 颜色输出
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

// 30个作者的slug列表
const authorSlugs = [
  'sarah-chen',
  'marcus-williams',
  'aisha-patel',
  'david-thompson',
  'yuki-tanaka',
  'jennifer-rodriguez',
  'rahman-ali',
  'elena-petrov',
  'james-oconnor',
  'priya-sharma',
  'michael-jenkins',
  'sofia-morales',
  'kevin-zhang',
  'lisa-mueller',
  'jordan-davis',
  'anna-kowalski',
  'carlos-santiago',
  'mei-ling-wong',
  'tyler-anderson',
  'fatima-hassan',
  'ryan-cooper',
  'isabella-rossi',
  'daniel-kim',
  'olivia-bennett',
  'ahmed-abdullah',
  'rachel-goldstein',
  'samuel-brown',
  'nina-ivanova',
  'ethan-parker',
  'maya-desai'
];

/**
 * 下载图片从URL到本地
 */
async function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;

    const request = protocol.get(url, (response) => {
      // 处理重定向
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        downloadImage(response.headers.location, filepath)
          .then(resolve)
          .catch(reject);
        return;
      }

      if (response.statusCode === 200) {
        const fileStream = fs.createWriteStream(filepath);
        response.pipe(fileStream);

        fileStream.on('finish', () => {
          fileStream.close();

          // 验证文件大小
          const stats = fs.statSync(filepath);
          if (stats.size < 1000) {
            fs.unlinkSync(filepath);
            reject(new Error('Downloaded file too small'));
          } else {
            resolve(stats.size);
          }
        });

        fileStream.on('error', (err) => {
          fs.unlink(filepath, () => {});
          reject(err);
        });
      } else {
        reject(new Error(`HTTP ${response.statusCode}`));
      }
    });

    request.on('error', reject);

    // 30秒超时
    request.setTimeout(30000, () => {
      request.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

/**
 * 为单个作者生成头像
 */
async function generateAvatar(slug, index, total, retries = 3) {
  const avatarPath = path.join(assetsDir, slug, 'avatar.jpg');

  try {
    log(`\n[${index + 1}/${total}] 生成头像: ${slug}`, 'cyan');

    // 检查文件是否已存在且大小合理
    if (fs.existsSync(avatarPath)) {
      const stats = fs.statSync(avatarPath);
      if (stats.size > 5000) { // 如果大于5KB，认为是有效图片
        log(`  ⏭️  头像已存在，跳过`, 'yellow');
        return { success: true, skipped: true };
      }
    }

    // 使用多个免费AI头像生成服务（带随机种子确保不同图片）
    const services = [
      // This Person Does Not Exist - 最流行的AI人脸生成
      `https://thispersondoesnotexist.com/`,
      // 备用：使用时间戳作为随机参数
      `https://i.pravatar.cc/1024?img=${index + 1}`,
      // UI Faces - 真实感照片
      `https://uifaces.co/our-content/donated/placeholder.jpg`,
    ];

    let lastError;

    // 尝试每个服务
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        // 轮流使用不同服务
        const serviceIndex = attempt % services.length;
        const imageUrl = services[serviceIndex] + (serviceIndex === 0 ? `?t=${Date.now()}` : '');

        log(`  🎨 尝试 #${attempt + 1}: ${services[serviceIndex].split('//')[1].split('/')[0]}...`, 'blue');

        const size = await downloadImage(imageUrl, avatarPath);

        log(`  ✅ 成功! (${(size / 1024).toFixed(1)}KB)`, 'green');

        // 添加小延迟避免过快请求
        await new Promise(resolve => setTimeout(resolve, 1000));

        return {
          success: true,
          size: size,
          attempts: attempt + 1
        };

      } catch (error) {
        lastError = error;
        log(`  ⚠️  尝试 #${attempt + 1} 失败: ${error.message}`, 'yellow');

        if (attempt < retries - 1) {
          const delay = (attempt + 1) * 2000; // 递增延迟
          log(`  ⏳ 等待 ${delay/1000}秒后重试...`, 'gray');
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    // 所有尝试都失败
    throw lastError || new Error('All attempts failed');

  } catch (error) {
    log(`  ❌ 失败: ${error.message}`, 'red');
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 批量生成所有作者头像
 */
async function generateAllAvatars(options = {}) {
  const {
    startFrom = 0,
    maxCount = 30
  } = options;

  log('\n🎨 开始生成作者头像（使用免费AI图片服务）', 'bright');
  log('=' .repeat(70), 'cyan');

  const slugs = authorSlugs.slice(startFrom, startFrom + maxCount);
  const total = slugs.length;

  log(`\n📊 任务信息:`, 'yellow');
  log(`  - 总作者数: ${total}`, 'blue');
  log(`  - 开始位置: ${startFrom + 1}`, 'blue');
  log(`  - 图片来源: This Person Does Not Exist + Pravatar`, 'blue');

  const results = {
    success: 0,
    failed: 0,
    skipped: 0,
    errors: []
  };

  // 串行处理，避免过多并发请求
  for (let i = 0; i < slugs.length; i++) {
    const slug = slugs[i];
    const result = await generateAvatar(slug, i, total);

    if (result.success) {
      if (result.skipped) {
        results.skipped++;
      } else {
        results.success++;
      }
    } else {
      results.failed++;
      results.errors.push({
        author: slug,
        error: result.error
      });
    }

    // 每个作者之间添加短暂延迟
    if (i < slugs.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  // 显示结果统计
  log('\n' + '=' .repeat(70), 'cyan');
  log('📈 生成结果统计:', 'bright');
  log('=' .repeat(70), 'cyan');

  log(`\n✅ 成功: ${results.success} 个头像`, 'green');
  log(`⏭️  跳过: ${results.skipped} 个头像 (已存在)`, 'yellow');
  log(`❌ 失败: ${results.failed} 个头像`, results.failed > 0 ? 'red' : 'gray');
  log(`📊 总计: ${total} 个作者`, 'blue');

  if (results.errors.length > 0) {
    log(`\n❌ 失败详情:`, 'red');
    results.errors.forEach((err, i) => {
      log(`  ${i + 1}. ${err.author}: ${err.error}`, 'red');
    });

    log(`\n💡 提示: 失败的头像可以手动重试:`, 'yellow');
    log(`   node scripts/generate-author-avatars-free.js -s <位置> -n 1`, 'cyan');
  }

  if (results.success > 0 || results.skipped > 0) {
    log(`\n🎉 头像生成完成！`, 'green');
    log(`\n📁 头像位置: src/assets/images/authors/{author-slug}/avatar.jpg`, 'cyan');
  }

  return results;
}

/**
 * 主函数
 */
async function main() {
  const args = process.argv.slice(2);

  // 解析参数
  const options = {
    startFrom: 0,
    maxCount: 30
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--start' || args[i] === '-s') {
      options.startFrom = parseInt(args[++i]) || 0;
    } else if (args[i] === '--count' || args[i] === '-n') {
      options.maxCount = parseInt(args[++i]) || 30;
    } else if (args[i] === '--help' || args[i] === '-h') {
      log('\n🎨 作者头像生成工具（免费版本）', 'bright');
      log('=' .repeat(50), 'cyan');
      log('\n特点:', 'yellow');
      log('  ✅ 完全免费，无需API密钥', 'green');
      log('  ✅ 使用AI生成的逼真人像', 'green');
      log('  ✅ 自动重试机制', 'green');
      log('\n使用方法:', 'yellow');
      log('  node scripts/generate-author-avatars-free.js [options]', 'white');
      log('\n选项:', 'yellow');
      log('  --start, -s       起始位置 (默认: 0)', 'white');
      log('  --count, -n       生成数量 (默认: 30)', 'white');
      log('  --help, -h        显示帮助', 'white');
      log('\n示例:', 'yellow');
      log('  # 生成所有30个头像', 'cyan');
      log('  node scripts/generate-author-avatars-free.js', 'cyan');
      log('\n  # 只生成前10个', 'cyan');
      log('  node scripts/generate-author-avatars-free.js -n 10', 'cyan');
      log('\n  # 从第11个开始生成5个', 'cyan');
      log('  node scripts/generate-author-avatars-free.js -s 10 -n 5', 'cyan');
      process.exit(0);
    }
  }

  // 确保目录存在
  if (!fs.existsSync(assetsDir)) {
    log('\n❌ 错误: 作者资源目录不存在', 'red');
    log(`请确认路径: ${assetsDir}`, 'yellow');
    process.exit(1);
  }

  try {
    await generateAllAvatars(options);
  } catch (error) {
    log(`\n❌ 致命错误: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  }
}

// 运行脚本
main().catch(error => {
  log(`\n❌ 未预期的错误: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
