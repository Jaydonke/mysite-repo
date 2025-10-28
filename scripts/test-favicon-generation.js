#!/usr/bin/env node

/**
 * 图标生成测试脚本
 * 多次测试图标生成，检查背景透明度和移除效果
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// 测试配置
const TEST_CONFIG = {
  testRounds: 3,           // 测试轮数
  siteName: 'SoulNestor',  // 网站名称
  faviconDir: path.join(__dirname, '../public/favicon'),
  aiGeneratedDir: path.join(__dirname, '../public/ai-generated'),
  reportDir: path.join(__dirname, '../test-reports'),
  transparencyThreshold: 50  // 透明度阈值（百分比）
};

/**
 * 分析图片透明度
 */
async function analyzeImageTransparency(imagePath) {
  try {
    if (!fs.existsSync(imagePath)) {
      return { error: 'File not found' };
    }

    const stats = fs.statSync(imagePath);
    const { data, info } = await sharp(imagePath)
      .raw()
      .toBuffer({ resolveWithObject: true });

    const { width, height, channels } = info;

    // 检查是否有alpha通道
    if (channels < 4) {
      return {
        hasAlpha: false,
        transparencyPercent: 0,
        fileSize: stats.size,
        dimensions: `${width}x${height}`,
        warning: 'No alpha channel'
      };
    }

    // 统计像素
    let totalPixels = 0;
    let transparentPixels = 0;
    let semiTransparentPixels = 0;
    let opaquePixels = 0;

    // 背景色采样（边缘像素）
    const edgeColors = [];
    const sampleSize = 10;

    for (let i = 0; i < data.length; i += channels) {
      const x = (i / channels) % width;
      const y = Math.floor((i / channels) / width);
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];

      totalPixels++;

      // 采样边缘像素
      if (x < sampleSize || x >= width - sampleSize ||
          y < sampleSize || y >= height - sampleSize) {
        edgeColors.push({ r, g, b, a });
      }

      // 统计透明度
      if (a === 0) {
        transparentPixels++;
      } else if (a < 255) {
        semiTransparentPixels++;
      } else {
        opaquePixels++;
      }
    }

    // 计算透明度百分比
    const transparencyPercent = ((transparentPixels + semiTransparentPixels * 0.5) / totalPixels * 100).toFixed(2);

    // 分析背景色
    const avgEdgeColor = {
      r: Math.round(edgeColors.reduce((sum, c) => sum + c.r, 0) / edgeColors.length),
      g: Math.round(edgeColors.reduce((sum, c) => sum + c.g, 0) / edgeColors.length),
      b: Math.round(edgeColors.reduce((sum, c) => sum + c.b, 0) / edgeColors.length),
      a: Math.round(edgeColors.reduce((sum, c) => sum + c.a, 0) / edgeColors.length)
    };

    // 判断背景类型
    let backgroundType = 'unknown';
    const brightness = (avgEdgeColor.r + avgEdgeColor.g + avgEdgeColor.b) / 3;

    if (avgEdgeColor.a < 10) {
      backgroundType = 'transparent';
    } else if (brightness > 200) {
      backgroundType = 'white/light';
    } else if (avgEdgeColor.g > avgEdgeColor.r + 30 && avgEdgeColor.g > avgEdgeColor.b + 30) {
      backgroundType = 'green';
    } else if (avgEdgeColor.b > avgEdgeColor.r + 30 && avgEdgeColor.b > avgEdgeColor.g + 30) {
      backgroundType = 'blue';
    } else {
      backgroundType = 'colored';
    }

    return {
      hasAlpha: true,
      fileSize: stats.size,
      dimensions: `${width}x${height}`,
      totalPixels,
      transparentPixels,
      semiTransparentPixels,
      opaquePixels,
      transparencyPercent: parseFloat(transparencyPercent),
      backgroundType,
      avgEdgeColor,
      edgeBrightness: brightness.toFixed(1)
    };
  } catch (error) {
    return { error: error.message };
  }
}

/**
 * 执行单次图标生成测试
 */
async function runSingleTest(roundNumber) {
  log(`\n${'='.repeat(70)}`, 'cyan');
  log(`🧪 测试轮次 ${roundNumber}/${TEST_CONFIG.testRounds}`, 'bright');
  log('='.repeat(70), 'cyan');

  const testResult = {
    round: roundNumber,
    timestamp: new Date().toISOString(),
    success: false,
    images: {},
    errors: []
  };

  try {
    // 步骤1: 生成AI图标
    log(`\n[1/3] 生成AI图标...`, 'cyan');
    try {
      execSync('npm run generate-ai-favicon', {
        stdio: 'inherit',
        cwd: path.join(__dirname, '..')
      });
      log(`✅ AI图标生成成功`, 'green');
    } catch (error) {
      testResult.errors.push('AI图标生成失败');
      log(`❌ AI图标生成失败: ${error.message}`, 'red');
      throw error;
    }

    // 步骤2: 生成图标文件
    log(`\n[2/3] 生成图标文件...`, 'cyan');
    try {
      execSync('npm run generate-favicon', {
        stdio: 'inherit',
        cwd: path.join(__dirname, '..')
      });
      log(`✅ 图标文件生成成功`, 'green');
    } catch (error) {
      testResult.errors.push('图标文件生成失败');
      log(`❌ 图标文件生成失败: ${error.message}`, 'red');
      throw error;
    }

    // 步骤3: 更新网站图标
    log(`\n[3/3] 更新网站图标...`, 'cyan');
    try {
      execSync('npm run update-favicon', {
        stdio: 'inherit',
        cwd: path.join(__dirname, '..')
      });
      log(`✅ 网站图标更新成功`, 'green');
    } catch (error) {
      testResult.errors.push('网站图标更新失败');
      log(`❌ 网站图标更新失败: ${error.message}`, 'red');
      throw error;
    }

    testResult.success = true;

    // 步骤4: 分析图标透明度
    log(`\n[4/4] 分析图标透明度...`, 'cyan');
    log('='.repeat(70), 'blue');

    const imagesToAnalyze = [
      {
        name: 'Site Theme',
        path: path.join(__dirname, '../public/ai-generated', `${TEST_CONFIG.siteName}-site-theme.png`)
      },
      {
        name: 'Site Logo',
        path: path.join(__dirname, '../public/ai-generated', `${TEST_CONFIG.siteName}-site-logo.png`)
      },
      {
        name: 'Favicon Source',
        path: path.join(__dirname, '../favicon/favicon.png')
      },
      {
        name: 'apple-touch-icon.png',
        path: path.join(__dirname, '../public/favicon/apple-touch-icon.png')
      },
      {
        name: 'favicon-32x32.png',
        path: path.join(__dirname, '../public/favicon/favicon-32x32.png')
      },
      {
        name: 'favicon-16x16.png',
        path: path.join(__dirname, '../public/favicon/favicon-16x16.png')
      }
    ];

    for (const image of imagesToAnalyze) {
      log(`\n📊 分析: ${image.name}`, 'yellow');
      const analysis = await analyzeImageTransparency(image.path);

      testResult.images[image.name] = analysis;

      if (analysis.error) {
        log(`  ❌ 错误: ${analysis.error}`, 'red');
        continue;
      }

      log(`  📏 尺寸: ${analysis.dimensions}`, 'gray');
      log(`  💾 大小: ${(analysis.fileSize / 1024).toFixed(1)}KB`, 'gray');

      if (analysis.hasAlpha) {
        const transparencyColor = analysis.transparencyPercent >= TEST_CONFIG.transparencyThreshold ? 'green' : 'red';
        log(`  🎨 透明度: ${analysis.transparencyPercent}%`, transparencyColor);
        log(`  📊 背景类型: ${analysis.backgroundType}`, 'blue');
        log(`  🔍 边缘亮度: ${analysis.edgeBrightness}`, 'gray');
        log(`  🎯 透明像素: ${analysis.transparentPixels.toLocaleString()}`, 'gray');
        log(`  ⚡ 半透明像素: ${analysis.semiTransparentPixels.toLocaleString()}`, 'gray');
        log(`  ⬜ 不透明像素: ${analysis.opaquePixels.toLocaleString()}`, 'gray');

        // 警告检查
        if (analysis.transparencyPercent < TEST_CONFIG.transparencyThreshold) {
          log(`  ⚠️  警告: 透明度低于阈值 ${TEST_CONFIG.transparencyThreshold}%`, 'yellow');
        }

        if (analysis.backgroundType !== 'transparent' && analysis.avgEdgeColor.a > 100) {
          log(`  ⚠️  警告: 检测到${analysis.backgroundType}背景未完全移除`, 'yellow');
          log(`  🎨 边缘颜色: RGB(${analysis.avgEdgeColor.r}, ${analysis.avgEdgeColor.g}, ${analysis.avgEdgeColor.b}) Alpha(${analysis.avgEdgeColor.a})`, 'yellow');
        }
      } else {
        log(`  ⚠️  ${analysis.warning}`, 'yellow');
      }
    }

    return testResult;

  } catch (error) {
    testResult.success = false;
    testResult.errors.push(error.message);
    return testResult;
  }
}

/**
 * 生成测试报告
 */
function generateTestReport(results) {
  log(`\n${'='.repeat(70)}`, 'cyan');
  log(`📈 测试报告汇总`, 'bright');
  log('='.repeat(70), 'cyan');

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const reportPath = path.join(TEST_CONFIG.reportDir, `favicon-test-${timestamp}.json`);

  // 确保报告目录存在
  if (!fs.existsSync(TEST_CONFIG.reportDir)) {
    fs.mkdirSync(TEST_CONFIG.reportDir, { recursive: true });
  }

  // 统计成功率
  const successCount = results.filter(r => r.success).length;
  const successRate = (successCount / results.length * 100).toFixed(1);

  log(`\n📊 测试统计:`, 'yellow');
  log(`  总测试轮数: ${results.length}`, 'blue');
  log(`  成功: ${successCount}`, 'green');
  log(`  失败: ${results.length - successCount}`, 'red');
  log(`  成功率: ${successRate}%`, successRate >= 100 ? 'green' : 'yellow');

  // 分析透明度趋势
  log(`\n🎨 透明度分析:`, 'yellow');

  const imageNames = new Set();
  results.forEach(r => {
    Object.keys(r.images).forEach(name => imageNames.add(name));
  });

  const transparencyStats = {};

  imageNames.forEach(imageName => {
    const transparencies = results
      .map(r => r.images[imageName])
      .filter(img => img && img.transparencyPercent !== undefined)
      .map(img => img.transparencyPercent);

    if (transparencies.length > 0) {
      const avg = transparencies.reduce((a, b) => a + b, 0) / transparencies.length;
      const min = Math.min(...transparencies);
      const max = Math.max(...transparencies);

      transparencyStats[imageName] = {
        average: avg.toFixed(2),
        min: min.toFixed(2),
        max: max.toFixed(2),
        samples: transparencies.length
      };

      const statusColor = avg >= TEST_CONFIG.transparencyThreshold ? 'green' : 'red';
      log(`\n  📄 ${imageName}:`, 'cyan');
      log(`     平均透明度: ${avg.toFixed(2)}%`, statusColor);
      log(`     范围: ${min.toFixed(2)}% - ${max.toFixed(2)}%`, 'gray');
      log(`     样本数: ${transparencies.length}`, 'gray');
    }
  });

  // 背景类型统计
  log(`\n🔍 背景移除检测:`, 'yellow');

  imageNames.forEach(imageName => {
    const backgroundTypes = results
      .map(r => r.images[imageName])
      .filter(img => img && img.backgroundType)
      .map(img => img.backgroundType);

    if (backgroundTypes.length > 0) {
      const typeCounts = {};
      backgroundTypes.forEach(type => {
        typeCounts[type] = (typeCounts[type] || 0) + 1;
      });

      log(`\n  📄 ${imageName}:`, 'cyan');
      Object.entries(typeCounts).forEach(([type, count]) => {
        const percentage = (count / backgroundTypes.length * 100).toFixed(1);
        const statusColor = type === 'transparent' ? 'green' : 'yellow';
        log(`     ${type}: ${count}次 (${percentage}%)`, statusColor);
      });
    }
  });

  // 问题汇总
  const allWarnings = [];
  results.forEach((r, idx) => {
    Object.entries(r.images).forEach(([name, img]) => {
      if (img.transparencyPercent !== undefined && img.transparencyPercent < TEST_CONFIG.transparencyThreshold) {
        allWarnings.push(`轮次${idx + 1} - ${name}: 透明度${img.transparencyPercent}%低于阈值`);
      }
      if (img.backgroundType && img.backgroundType !== 'transparent' && img.avgEdgeColor && img.avgEdgeColor.a > 100) {
        allWarnings.push(`轮次${idx + 1} - ${name}: 检测到${img.backgroundType}背景未完全移除`);
      }
    });
  });

  if (allWarnings.length > 0) {
    log(`\n⚠️  发现问题:`, 'yellow');
    allWarnings.forEach((warning, idx) => {
      log(`  ${idx + 1}. ${warning}`, 'yellow');
    });
  } else {
    log(`\n✅ 未发现问题，所有图标背景移除效果良好！`, 'green');
  }

  // 保存报告
  const report = {
    timestamp: new Date().toISOString(),
    testConfig: TEST_CONFIG,
    totalTests: results.length,
    successCount,
    successRate: parseFloat(successRate),
    transparencyStats,
    warnings: allWarnings,
    detailedResults: results
  };

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  log(`\n💾 详细报告已保存:`, 'cyan');
  log(`  ${reportPath}`, 'gray');

  return report;
}

/**
 * 主函数
 */
async function main() {
  const args = process.argv.slice(2);

  // 解析参数
  if (args.includes('--help') || args.includes('-h')) {
    log('\n🧪 图标生成测试脚本', 'bright');
    log('='.repeat(50), 'cyan');
    log('\n使用方法:', 'yellow');
    log('  node scripts/test-favicon-generation.js [options]', 'white');
    log('\n选项:', 'yellow');
    log('  --rounds, -r <n>     测试轮数 (默认: 3)', 'white');
    log('  --threshold, -t <n>  透明度阈值百分比 (默认: 50)', 'white');
    log('  --help, -h           显示帮助', 'white');
    log('\n示例:', 'yellow');
    log('  node scripts/test-favicon-generation.js', 'cyan');
    log('  node scripts/test-favicon-generation.js -r 5', 'cyan');
    log('  node scripts/test-favicon-generation.js -r 5 -t 60', 'cyan');
    process.exit(0);
  }

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--rounds' || args[i] === '-r') {
      TEST_CONFIG.testRounds = parseInt(args[++i]) || 3;
    } else if (args[i] === '--threshold' || args[i] === '-t') {
      TEST_CONFIG.transparencyThreshold = parseInt(args[++i]) || 50;
    }
  }

  log('\n🧪 图标生成多轮测试', 'bright');
  log('='.repeat(70), 'cyan');
  log(`\n配置:`, 'yellow');
  log(`  测试轮数: ${TEST_CONFIG.testRounds}`, 'blue');
  log(`  透明度阈值: ${TEST_CONFIG.transparencyThreshold}%`, 'blue');
  log(`  网站名称: ${TEST_CONFIG.siteName}`, 'blue');

  const results = [];

  for (let i = 1; i <= TEST_CONFIG.testRounds; i++) {
    const result = await runSingleTest(i);
    results.push(result);

    // 轮次间隔
    if (i < TEST_CONFIG.testRounds) {
      log(`\n⏳ 等待5秒后进行下一轮测试...`, 'gray');
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }

  // 生成报告
  const report = generateTestReport(results);

  // 最终评估
  log(`\n${'='.repeat(70)}`, 'cyan');
  log(`🎯 最终评估`, 'bright');
  log('='.repeat(70), 'cyan');

  if (report.warnings.length === 0 && report.successRate === 100) {
    log(`\n✅ 测试通过！所有图标生成正常，背景移除效果良好。`, 'green');
  } else if (report.successRate >= 80) {
    log(`\n⚠️  测试基本通过，但存在一些问题需要关注。`, 'yellow');
  } else {
    log(`\n❌ 测试失败，存在严重问题需要修复。`, 'red');
  }

  log(`\n📋 总结:`, 'cyan');
  log(`  成功率: ${report.successRate}%`, report.successRate >= 100 ? 'green' : 'yellow');
  log(`  问题数: ${report.warnings.length}`, report.warnings.length === 0 ? 'green' : 'yellow');
}

// 运行脚本
main().catch(error => {
  log(`\n❌ 未预期的错误: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
