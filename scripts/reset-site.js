#!/usr/bin/env node

/**
 * 网站内容重置脚本
 * 依次执行所有必要的步骤来重置网站内容
 * 支持从 config.csv 读取多行主题，为每个主题创建独立网站
 */

import { execSync } from 'child_process';
import { readAllConfigs } from './utils/config-reader.js';
import { setCurrentIndex } from './utils/current-config.js';

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

const tasks = [
  {
    name: '清空HTML文章',
    command: 'node scripts/clear-html-articles.js',
    description: '清空newarticle和scheduledarticle文件夹中的HTML文件'
  },
  {
    name: '删除所有现有文章',
    command: 'npm run delete-all-articles',
    description: '清理网站中的现有文章内容'
  },
  {
    name: '创建全新作者库',
    command: 'npm run create-authors',
    description: '清除现有作者并生成30个新的多样化作者'
  },
  {
    name: '生成AI作者头像',
    command: 'npm run generate-author-avatars',
    description: '使用DALL-E为所有新作者生成专业头像'
  },
  {
    name: '更新主题配置',
    command: 'npm run update-theme-fixed',
    description: '更新网站主题配置和样式'
  },
  {
    name: '更新文章配置并重置追踪',
    command: 'npm run update-articles-full',
    description: '生成新文章配置，重置位置追踪系统'
  },
  {
    name: '生成文章',
    command: 'npm run generate-articles',
    description: '使用AI生成所有配置的文章内容'
  },
  {
    name: '同步配置到模板',
    command: 'npm run sync-config',
    description: '同步配置文件到网站模板'
  },
  {
    name: '添加新文章到网站',
    command: 'npm run add-articles-improved',
    description: '将生成的文章添加到网站中'
  },
  {
    name: '随机分配作者到文章',
    command: 'npm run randomize-authors',
    description: '为所有文章智能随机分配作者，避免连续重复'
  },
  {
    name: '生成新主题方向',
    command: 'npm run generate-new-topics',
    description: '为未来文章生成新的主题和方向'
  },
  {
    name: '生成15篇定时发布文章',
    command: 'npm run generate-articles -- -s -k 25 -c 15',
    description: '跳过前25篇，生成后15篇新主题文章到定时发布目录'
  },
  {
    name: '设置文章定时发布',
    command: 'npm run schedule-articles',
    description: '配置文章的定时发布时间'
  },
  {
    name: '生成AI图标',
    command: 'npm run generate-ai-favicon',
    description: '使用AI生成网站图标'
  },
  {
    name: '生成图标文件',
    command: 'npm run generate-favicon',
    description: '生成所有尺寸的favicon文件'
  },
  {
    name: '更新网站图标',
    command: 'npm run update-favicon',
    description: '将生成的图标应用到网站'
  },
  {
    name: '修复损坏的图片',
    command: 'npm run fix-images',
    description: '检测并重新生成损坏的文章图片'
  },
  {
    name: '构建网站',
    command: 'npm run build',
    description: '构建网站以验证所有内容正确'
  },
  {
    name: '创建GitHub私有仓库并推送',
    command: 'npm run deploy-template',
    description: '将网站代码推送到新的GitHub私有仓库'
  }
];

async function runTask(task, index, total) {
  log(`\n[${index}/${total}] ${task.name}`, 'cyan');
  log(`   ${task.description}`, 'blue');

  try {
    execSync(task.command, { stdio: 'inherit' });
    log(`   ✅ ${task.name} 完成`, 'green');
    return true;
  } catch (error) {
    log(`   ❌ ${task.name} 失败`, 'red');
    log(`   错误: ${error.message}`, 'red');
    return false;
  }
}

async function runSingleSite() {
  const startTime = Date.now();
  let successCount = 0;
  let failedTasks = [];

  for (let i = 0; i < tasks.length; i++) {
    const success = await runTask(tasks[i], i + 1, tasks.length);
    if (success) {
      successCount++;
    } else {
      failedTasks.push(tasks[i].name);
      log(`\n⚠️  任务失败，是否继续执行后续任务？`, 'yellow');

      // 如果是关键任务失败，停止执行
      if (i < 5) {  // 前5个任务是关键任务（清空文章、删除文章、创建作者、生成头像、更新主题）
        log('❌ 关键任务失败，停止执行', 'red');
        return false;
      }
    }
  }

  const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(1);

  log(`\n📊 执行统计:`, 'cyan');
  log(`   ✅ 成功: ${successCount}/${tasks.length}`, 'green');

  if (failedTasks.length > 0) {
    log(`   ❌ 失败: ${failedTasks.length}`, 'red');
    log(`   失败任务: ${failedTasks.join(', ')}`, 'yellow');
  }

  log(`   ⏱️  用时: ${elapsedTime}秒`, 'blue');

  return successCount === tasks.length;
}

async function main() {
  log('\n====================================', 'bright');
  log('      网站内容重置脚本', 'bright');
  log('====================================', 'bright');

  try {
    // 读取所有配置
    const configs = readAllConfigs();
    const configCount = configs.length;

    if (configCount === 0) {
      log('\n⚠️  config.csv 中没有找到配置，请添加至少一行数据', 'yellow');
      process.exit(1);
    }

    log(`\n📋 找到 ${configCount} 个网站配置`, 'cyan');

    // 为每个配置运行一次完整流程
    for (let i = 0; i < configs.length; i++) {
      const config = configs[i];

      log('\n====================================', 'bright');
      log(`  处理网站 ${i + 1}/${configCount}`, 'bright');
      log('====================================', 'bright');
      log(`   主题: ${config.theme}`, 'blue');
      log(`   域名: ${config.domain}`, 'blue');
      log(`   名称: ${config.siteName}`, 'blue');
      log('', 'reset');

      // 设置当前配置索引（基于1的索引）
      setCurrentIndex(i + 1);
      log(`📌 设置当前配置索引为 ${i + 1}`, 'cyan');

      const success = await runSingleSite();

      if (success) {
        log(`\n✅ 网站 "${config.siteName}" 重置完成！`, 'green');
      } else {
        log(`\n⚠️  网站 "${config.siteName}" 重置部分失败`, 'yellow');
      }

      // 如果不是最后一个，询问是否继续
      if (i < configs.length - 1) {
        log(`\n⏸️  按 Ctrl+C 中止，或等待 3 秒后继续下一个网站...`, 'yellow');
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }

    log('\n====================================', 'bright');
    log('    所有网站处理完成', 'bright');
    log('====================================', 'bright');
    log(`\n✅ 成功处理 ${configCount} 个网站配置`, 'green');

  } catch (error) {
    log(`\n❌ 错误: ${error.message}`, 'red');
    process.exit(1);
  }
}

// 运行脚本
main().catch(error => {
  log(`\n❌ 致命错误: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});