#!/usr/bin/env node

/**
 * 图标背景去除能力测试脚本
 * ==========================================
 * 测试多次生成图标，验证背景去除功能的稳定性和效果
 *
 * 功能:
 * - 多次运行图标生成流程
 * - 验证背景是否成功去除
 * - 检测透明度和背景色
 * - 生成详细的测试报告
 * - 保留每次测试的结果用于对比
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
  testRounds: 3,  // 测试轮数
  outputDir: path.join(__dirname, '../test-results'),
  faviconDir: path.join(__dirname, '../favicon'),
  faviconIoDir: path.join(__dirname, '../favicon_io'),
  resultFile: 'test-report.json',

  // 需要检查的文件
  filesToCheck: [
    { path: 'favicon/favicon.png', name: 'Favicon', type: 'icon' },
    { path: 'favicon_io/site-logo.png', name: 'Site Logo', type: 'logo' },
    { path: 'favicon_io/site-theme.png', name: 'Site Theme', type: 'theme' }
  ]
};

/**
 * 分析图片的背景透明度和颜色分布
 */
async function analyzeImageBackground(imagePath) {
  try {
    const image = sharp(imagePath);
    const metadata = await image.metadata();
    const { data, info } = await image
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const width = info.width;
    const height = info.height;
    const channels = info.channels;

    let totalPixels = 0;
    let transparentPixels = 0;
    let semiTransparentPixels = 0;
    let whitePixels = 0;
    let grayPixels = 0;
    let coloredPixels = 0;
    let opaquePixels = 0;

    const colorDistribution = {
      red: 0,
      green: 0,
      blue: 0,
      cyan: 0,
      magenta: 0,
      yellow: 0,
      orange: 0,
      other: 0
    };

    // 分析每个像素
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * channels;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        const a = channels === 4 ? data[idx + 3] : 255;

        totalPixels++;

        // 检测透明度
        if (a === 0) {
          transparentPixels++;
        } else if (a < 255) {
          semiTransparentPixels++;
        } else {
          opaquePixels++;
        }

        // 只分析不透明像素的颜色
        if (a > 128) {
          // 检测白色
          if (r > 240 && g > 240 && b > 240) {
            whitePixels++;
          }
          // 检测灰色
          else if (Math.abs(r - g) < 30 && Math.abs(g - b) < 30 && Math.abs(r - b) < 30) {
            grayPixels++;
          }
          // 检测彩色
          else {
            coloredPixels++;

            // 颜色分类
            if (r > 200 && g < 150 && b < 100) {
              colorDistribution.red++;
            } else if (g > 200 && r < 150 && b < 150) {
              colorDistribution.green++;
            } else if (b > 200 && r < 150 && g < 150) {
              colorDistribution.blue++;
            } else if (r > 200 && g > 100 && g < 180 && b < 100) {
              colorDistribution.orange++;
            } else if (g > 200 && b > 200 && r < 150) {
              colorDistribution.cyan++;
            } else if (r > 200 && b > 200 && g < 150) {
              colorDistribution.magenta++;
            } else if (r > 200 && g > 200 && b < 150) {
              colorDistribution.yellow++;
            } else {
              colorDistribution.other++;
            }
          }
        }
      }
    }

    const transparentPercentage = (transparentPixels / totalPixels * 100).toFixed(2);
    const whitePercentage = (whitePixels / totalPixels * 100).toFixed(2);
    const grayPercentage = (grayPixels / totalPixels * 100).toFixed(2);
    const coloredPercentage = (coloredPixels / totalPixels * 100).toFixed(2);

    // 找出主要颜色
    const dominantColor = Object.keys(colorDistribution).reduce((a, b) =>
      colorDistribution[a] > colorDistribution[b] ? a : b
    );

    return {
      width,
      height,
      hasAlpha: metadata.hasAlpha,
      channels: metadata.channels,
      totalPixels,
      transparentPixels,
      semiTransparentPixels,
      opaquePixels,
      whitePixels,
      grayPixels,
      coloredPixels,
      transparentPercentage: parseFloat(transparentPercentage),
      whitePercentage: parseFloat(whitePercentage),
      grayPercentage: parseFloat(grayPercentage),
      coloredPercentage: parseFloat(coloredPercentage),
      dominantColor,
      colorDistribution
    };
  } catch (error) {
    log(`❌ 分析图片失败: ${error.message}`, 'red');
    return null;
  }
}

/**
 * 评估背景去除质量
 */
function evaluateBackgroundRemoval(analysis, imageType) {
  const scores = {
    transparency: 0,  // 透明度得分 (0-40)
    purity: 0,        // 纯净度得分 (0-30)
    color: 0,         // 颜色质量得分 (0-30)
    total: 0
  };

  const issues = [];
  const recommendations = [];

  // 1. 透明度评分 (40分)
  if (analysis.transparentPercentage > 70) {
    scores.transparency = 40;
  } else if (analysis.transparentPercentage > 50) {
    scores.transparency = 30;
    issues.push(`透明背景占比偏低: ${analysis.transparentPercentage}%`);
  } else if (analysis.transparentPercentage > 30) {
    scores.transparency = 20;
    issues.push(`背景去除不完整: ${analysis.transparentPercentage}%`);
    recommendations.push('建议调整背景去除参数，提高容差值');
  } else {
    scores.transparency = 10;
    issues.push(`背景去除失败: 仅${analysis.transparentPercentage}%透明`);
    recommendations.push('需要检查rembg是否正常工作');
  }

  // 2. 纯净度评分 (30分) - 检测灰色和白色残留
  const artifactPercentage = analysis.grayPercentage + analysis.whitePercentage;
  if (artifactPercentage < 5) {
    scores.purity = 30;
  } else if (artifactPercentage < 15) {
    scores.purity = 20;
    issues.push(`存在少量背景残留: ${artifactPercentage.toFixed(2)}%`);
  } else if (artifactPercentage < 30) {
    scores.purity = 10;
    issues.push(`背景残留较多: ${artifactPercentage.toFixed(2)}%`);
    recommendations.push('可能需要增强deep clean功能');
  } else {
    scores.purity = 5;
    issues.push(`严重背景残留: ${artifactPercentage.toFixed(2)}%`);
    recommendations.push('背景去除算法需要改进');
  }

  // 3. 颜色质量评分 (30分)
  if (analysis.coloredPercentage > 15) {
    scores.color = 30;
  } else if (analysis.coloredPercentage > 8) {
    scores.color = 20;
    issues.push(`彩色内容偏少: ${analysis.coloredPercentage}%`);
  } else if (analysis.coloredPercentage > 3) {
    scores.color = 10;
    issues.push(`图标颜色内容不足: ${analysis.coloredPercentage}%`);
    recommendations.push('可能需要调整AI生成提示词');
  } else {
    scores.color = 5;
    issues.push(`几乎没有彩色内容: ${analysis.coloredPercentage}%`);
    recommendations.push('检查图标是否正常生成');
  }

  scores.total = scores.transparency + scores.purity + scores.color;

  // 评级
  let grade = 'F';
  if (scores.total >= 90) grade = 'A+';
  else if (scores.total >= 85) grade = 'A';
  else if (scores.total >= 80) grade = 'A-';
  else if (scores.total >= 75) grade = 'B+';
  else if (scores.total >= 70) grade = 'B';
  else if (scores.total >= 65) grade = 'B-';
  else if (scores.total >= 60) grade = 'C+';
  else if (scores.total >= 55) grade = 'C';
  else if (scores.total >= 50) grade = 'C-';
  else if (scores.total >= 45) grade = 'D';

  return {
    scores,
    grade,
    issues,
    recommendations
  };
}

/**
 * 保存测试结果图片
 */
async function saveTestResult(sourcePath, testRound, fileName) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const resultDir = path.join(TEST_CONFIG.outputDir, `round-${testRound}`);

  if (!fs.existsSync(resultDir)) {
    fs.mkdirSync(resultDir, { recursive: true });
  }

  const destPath = path.join(resultDir, `${fileName}-${timestamp}.png`);
  fs.copyFileSync(sourcePath, destPath);

  return destPath;
}

/**
 * 运行单轮测试
 */
async function runTestRound(roundNumber) {
  log(`\n${'='.repeat(60)}`, 'bright');
  log(`  测试轮次 ${roundNumber}/${TEST_CONFIG.testRounds}`, 'bright');
  log(`${'='.repeat(60)}`, 'bright');

  const roundResults = {
    round: roundNumber,
    timestamp: new Date().toISOString(),
    files: [],
    summary: {
      totalScore: 0,
      averageGrade: '',
      passedFiles: 0,
      totalFiles: 0
    }
  };

  try {
    // 1. 运行图标生成
    log('\n🎨 步骤1: 生成AI图标...', 'cyan');
    try {
      execSync('npm run generate-ai-favicon', { stdio: 'inherit' });
      log('✅ AI图标生成完成', 'green');
    } catch (error) {
      log('❌ AI图标生成失败', 'red');
      throw error;
    }

    // 2. 运行favicon处理
    log('\n🎨 步骤2: 处理favicon文件...', 'cyan');
    try {
      execSync('npm run generate-favicon', { stdio: 'inherit' });
      log('✅ Favicon处理完成', 'green');
    } catch (error) {
      log('❌ Favicon处理失败', 'red');
      throw error;
    }

    // 3. 分析生成的图片
    log('\n🔍 步骤3: 分析图片质量...', 'cyan');

    for (const fileConfig of TEST_CONFIG.filesToCheck) {
      const filePath = path.join(__dirname, '..', fileConfig.path);

      if (!fs.existsSync(filePath)) {
        log(`⚠️  文件不存在: ${fileConfig.name}`, 'yellow');
        continue;
      }

      log(`\n📊 分析 ${fileConfig.name}...`, 'blue');

      // 分析图片
      const analysis = await analyzeImageBackground(filePath);
      if (!analysis) {
        log(`❌ 分析失败: ${fileConfig.name}`, 'red');
        continue;
      }

      // 评估质量
      const evaluation = evaluateBackgroundRemoval(analysis, fileConfig.type);

      // 保存测试结果
      const savedPath = await saveTestResult(filePath, roundNumber, fileConfig.type);

      // 显示结果
      log(`  尺寸: ${analysis.width}x${analysis.height}`, 'gray');
      log(`  透明像素: ${analysis.transparentPercentage}%`, analysis.transparentPercentage > 70 ? 'green' : 'yellow');
      log(`  白色/灰色残留: ${(analysis.whitePercentage + analysis.grayPercentage).toFixed(2)}%`,
        (analysis.whitePercentage + analysis.grayPercentage) < 15 ? 'green' : 'red');
      log(`  彩色内容: ${analysis.coloredPercentage}%`, analysis.coloredPercentage > 10 ? 'green' : 'yellow');
      log(`  主色调: ${analysis.dominantColor}`, 'cyan');
      log(`  评分: ${evaluation.scores.total}/100 (${evaluation.grade})`,
        evaluation.scores.total >= 70 ? 'green' : (evaluation.scores.total >= 50 ? 'yellow' : 'red'));

      if (evaluation.issues.length > 0) {
        log(`  问题:`, 'red');
        evaluation.issues.forEach(issue => log(`    - ${issue}`, 'red'));
      }

      if (evaluation.recommendations.length > 0) {
        log(`  建议:`, 'yellow');
        evaluation.recommendations.forEach(rec => log(`    - ${rec}`, 'yellow'));
      }

      // 记录结果
      roundResults.files.push({
        name: fileConfig.name,
        path: fileConfig.path,
        savedPath,
        analysis,
        evaluation
      });

      roundResults.summary.totalScore += evaluation.scores.total;
      roundResults.summary.totalFiles++;
      if (evaluation.scores.total >= 70) {
        roundResults.summary.passedFiles++;
      }
    }

    // 计算平均分
    if (roundResults.summary.totalFiles > 0) {
      const avgScore = roundResults.summary.totalScore / roundResults.summary.totalFiles;
      roundResults.summary.averageScore = avgScore;

      if (avgScore >= 90) roundResults.summary.averageGrade = 'A+';
      else if (avgScore >= 85) roundResults.summary.averageGrade = 'A';
      else if (avgScore >= 80) roundResults.summary.averageGrade = 'A-';
      else if (avgScore >= 75) roundResults.summary.averageGrade = 'B+';
      else if (avgScore >= 70) roundResults.summary.averageGrade = 'B';
      else if (avgScore >= 65) roundResults.summary.averageGrade = 'B-';
      else if (avgScore >= 60) roundResults.summary.averageGrade = 'C+';
      else if (avgScore >= 55) roundResults.summary.averageGrade = 'C';
      else if (avgScore >= 50) roundResults.summary.averageGrade = 'C-';
      else roundResults.summary.averageGrade = 'D';
    }

    // 显示本轮总结
    log(`\n📊 第${roundNumber}轮测试总结:`, 'cyan');
    log(`  平均得分: ${roundResults.summary.averageScore?.toFixed(2)}/100 (${roundResults.summary.averageGrade})`,
      roundResults.summary.averageScore >= 70 ? 'green' : 'yellow');
    log(`  通过率: ${roundResults.summary.passedFiles}/${roundResults.summary.totalFiles} ` +
      `(${(roundResults.summary.passedFiles / roundResults.summary.totalFiles * 100).toFixed(1)}%)`,
      roundResults.summary.passedFiles === roundResults.summary.totalFiles ? 'green' : 'yellow');

    return roundResults;

  } catch (error) {
    log(`\n❌ 第${roundNumber}轮测试失败: ${error.message}`, 'red');
    roundResults.error = error.message;
    return roundResults;
  }
}

/**
 * 生成测试报告
 */
function generateTestReport(allResults) {
  log(`\n${'='.repeat(60)}`, 'bright');
  log(`  测试报告`, 'bright');
  log(`${'='.repeat(60)}`, 'bright');

  const report = {
    testDate: new Date().toISOString(),
    totalRounds: TEST_CONFIG.testRounds,
    completedRounds: allResults.filter(r => !r.error).length,
    failedRounds: allResults.filter(r => r.error).length,
    rounds: allResults,
    overallStatistics: {
      averageScore: 0,
      averageTransparency: 0,
      averagePurity: 0,
      averageColor: 0,
      successRate: 0
    }
  };

  // 计算总体统计
  let totalScores = 0;
  let totalTransparency = 0;
  let totalPurity = 0;
  let totalColor = 0;
  let totalFiles = 0;
  let passedFiles = 0;

  allResults.forEach(round => {
    if (!round.error && round.files) {
      round.files.forEach(file => {
        totalScores += file.evaluation.scores.total;
        totalTransparency += file.evaluation.scores.transparency;
        totalPurity += file.evaluation.scores.purity;
        totalColor += file.evaluation.scores.color;
        totalFiles++;
        if (file.evaluation.scores.total >= 70) passedFiles++;
      });
    }
  });

  if (totalFiles > 0) {
    report.overallStatistics.averageScore = (totalScores / totalFiles).toFixed(2);
    report.overallStatistics.averageTransparency = (totalTransparency / totalFiles).toFixed(2);
    report.overallStatistics.averagePurity = (totalPurity / totalFiles).toFixed(2);
    report.overallStatistics.averageColor = (totalColor / totalFiles).toFixed(2);
    report.overallStatistics.successRate = ((passedFiles / totalFiles) * 100).toFixed(2);
  }

  // 显示报告
  log(`\n📊 整体统计:`, 'cyan');
  log(`  完成轮次: ${report.completedRounds}/${report.totalRounds}`,
    report.completedRounds === report.totalRounds ? 'green' : 'yellow');
  log(`  总体平均分: ${report.overallStatistics.averageScore}/100`,
    report.overallStatistics.averageScore >= 70 ? 'green' : 'yellow');
  log(`  透明度平均分: ${report.overallStatistics.averageTransparency}/40`, 'blue');
  log(`  纯净度平均分: ${report.overallStatistics.averagePurity}/30`, 'blue');
  log(`  颜色质量平均分: ${report.overallStatistics.averageColor}/30`, 'blue');
  log(`  成功率: ${report.overallStatistics.successRate}%`,
    report.overallStatistics.successRate >= 80 ? 'green' : 'yellow');

  // 保存报告
  const reportPath = path.join(TEST_CONFIG.outputDir, TEST_CONFIG.resultFile);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  log(`\n💾 详细报告已保存: ${reportPath}`, 'green');

  // 最终评价
  log(`\n🎯 最终评价:`, 'bright');
  const avgScore = parseFloat(report.overallStatistics.averageScore);
  if (avgScore >= 90) {
    log(`  优秀 (A+) - 背景去除功能表现出色！`, 'green');
  } else if (avgScore >= 80) {
    log(`  良好 (A) - 背景去除功能运行良好`, 'green');
  } else if (avgScore >= 70) {
    log(`  合格 (B) - 背景去除功能基本满足要求`, 'blue');
  } else if (avgScore >= 60) {
    log(`  待改进 (C) - 背景去除功能需要优化`, 'yellow');
  } else {
    log(`  需修复 (D/F) - 背景去除功能存在严重问题`, 'red');
  }

  return report;
}

/**
 * 主函数
 */
async function main() {
  log('\n====================================', 'bright');
  log('  图标背景去除能力测试', 'bright');
  log('====================================', 'bright');
  log(`将进行 ${TEST_CONFIG.testRounds} 轮测试，验证背景去除功能\n`, 'cyan');

  // 确保输出目录存在
  if (!fs.existsSync(TEST_CONFIG.outputDir)) {
    fs.mkdirSync(TEST_CONFIG.outputDir, { recursive: true });
  }

  const allResults = [];

  // 运行多轮测试
  for (let i = 1; i <= TEST_CONFIG.testRounds; i++) {
    const result = await runTestRound(i);
    allResults.push(result);

    // 在轮次之间等待一下
    if (i < TEST_CONFIG.testRounds) {
      log(`\n⏸️  等待 3 秒后开始下一轮测试...`, 'yellow');
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }

  // 生成测试报告
  const report = generateTestReport(allResults);

  log(`\n${'='.repeat(60)}`, 'green');
  log(`  测试完成！`, 'green');
  log(`${'='.repeat(60)}`, 'green');
  log(`\n📁 测试结果保存在: ${TEST_CONFIG.outputDir}`, 'cyan');
  log(`📄 查看详细报告: ${path.join(TEST_CONFIG.outputDir, TEST_CONFIG.resultFile)}`, 'cyan');
}

// 运行脚本
main().catch(error => {
  log(`\n❌ 致命错误: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
