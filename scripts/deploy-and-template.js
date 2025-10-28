#!/usr/bin/env node

/**
 * 创建新的私有 GitHub 仓库脚本
 * 1. 读取 config 获取网站名称
 * 2. 创建新的私有 GitHub 仓库
 * 3. 推送当前代码到新仓库
 */

import { execSync, spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getCurrentConfig } from './utils/current-config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

// GitHub CLI 路径
const GH_CLI = process.platform === 'win32'
  ? '"C:\\Program Files\\GitHub CLI\\gh.exe"'
  : 'gh';

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function execCommand(command, description, silent = false) {
  log(`\n▶ ${description}`, 'cyan');
  try {
    const result = execSync(command, {
      stdio: silent ? 'pipe' : 'inherit',
      encoding: 'utf8'
    });
    log(`✅ ${description} 成功`, 'green');
    return result;
  } catch (error) {
    log(`❌ ${description} 失败`, 'red');
    throw error;
  }
}

async function main() {
  log('\n====================================', 'bright');
  log('  创建新的私有仓库', 'bright');
  log('====================================\n', 'bright');

  try {
    // 步骤 1: 读取当前活动配置获取网站名称
    log('\n📖 读取当前配置...', 'cyan');

    let siteName = 'astrotemp';
    let theme = '';
    let domain = '';

    try {
      const config = getCurrentConfig();
      theme = config.theme;
      domain = config.domain;
      siteName = config.siteName;
      log(`   主题: ${theme}`, 'blue');
      log(`   域名: ${domain}`, 'blue');
      log(`   网站名: ${siteName}`, 'blue');
    } catch (error) {
      log(`   ⚠️  无法读取配置，使用默认名称: ${siteName}`, 'yellow');
    }

    // 步骤 2: 检查 gh CLI
    log('\n检查环境...', 'bright');
    try {
      execSync(`${GH_CLI} --version`, { stdio: 'ignore' });
      log('✅ GitHub CLI 已安装', 'green');
    } catch (error) {
      log('❌ GitHub CLI (gh) 未安装', 'red');
      log('   请访问 https://cli.github.com/ 安装 GitHub CLI', 'yellow');
      process.exit(1);
    }

    // 步骤 2: 创建新的私有仓库
    log(`\n[1/2] 创建新的私有仓库: ${siteName}`, 'bright');
    const repoDescription = `${siteName} - Astro Blog Site`;

    let repoUrl = `https://github.com/Jaydonke/${siteName}.git`;
    try {
      execSync(`${GH_CLI} repo create ${siteName} --private --description "${repoDescription}"`, { stdio: 'pipe' });
      log(`✅ 创建私有仓库 ${siteName} 成功`, 'green');
    } catch (error) {
      //仓库已存在，继续
      log('⚠️  仓库可能已存在，将直接推送到仓库', 'yellow');
    }

    // 步骤 3: 创建临时目录并推送干净的代码
    log(`\n[2/2] 准备干净的代码副本`, 'bright');
    const tempDir = path.join('D:\\temp', `deploy-${siteName}-${Date.now()}`);

    try {
      // 删除旧的临时目录
      if (fs.existsSync(tempDir)) {
        log(`   清理旧的临时目录...`, 'cyan');
        execSync(`rmdir /s /q "${tempDir}"`, { stdio: 'ignore' });
      }

      // 创建新的临时目录
      log(`   创建临时目录...`, 'cyan');
      fs.mkdirSync(tempDir, { recursive: true });

      // 复制文件（排除 .git, node_modules, dist）
      log(`   复制项目文件 (这可能需要几分钟)...`, 'cyan');
      const currentDir = path.join(__dirname, '..');
      const exclude = ['.git', 'node_modules', 'dist', '.astro', '.temp-deploy', 'newarticle', 'scheduledarticle'];

      // 使用 robocopy
      const excludeDirs = exclude.join(' ');
      try {
        execSync(`robocopy "${currentDir}" "${tempDir}" /E /NFL /NDL /NJH /NJS /nc /ns /np /XD ${excludeDirs}`, {
          stdio: 'inherit'
        });
      } catch (error) {
        // robocopy 返回码 <=7 表示成功或部分成功
        if (error.status && error.status <= 7) {
          // 成功
        } else {
          throw error;
        }
      }

      // 步骤 4: 初始化新仓库并推送
      log(`\n推送代码到新仓库`, 'cyan');

      // 在临时目录初始化 git
      execSync('git init', { cwd: tempDir, stdio: 'inherit' });
      execSync('git add .', { cwd: tempDir, stdio: 'inherit' });
      execSync(`git commit -m "Update from ${siteName} - ${new Date().toISOString()}"`, { cwd: tempDir, stdio: 'inherit' });
      execSync('git branch -M main', { cwd: tempDir, stdio: 'inherit' });
      execSync(`git remote add origin ${repoUrl}`, { cwd: tempDir, stdio: 'inherit' });

      // 尝试推送，如果失败则使用强制推送
      try {
        execSync('git push -u origin main', { cwd: tempDir, stdio: 'inherit' });
        log(`✅ 代码推送成功`, 'green');
      } catch (pushError) {
        log(`⚠️  直接推送失败，使用强制推送覆盖远程仓库...`, 'yellow');
        try {
          // 强制推送（覆盖远程内容）
          execSync('git push -u origin main --force', { cwd: tempDir, stdio: 'inherit' });
          log(`✅ 强制推送成功 (远程内容已覆盖)`, 'green');
        } catch (forcePushError) {
          log(`❌ 强制推送失败: ${forcePushError.message}`, 'red');
          throw forcePushError;
        }
      }

      // 清理临时目录
      log(`   清理临时目录...`, 'cyan');
      execSync(`rmdir /s /q "${tempDir}"`, { stdio: 'ignore' });

      // 完成
      log('\n====================================', 'bright');
      log('         ✨ 全部完成！', 'bright');
      log('====================================', 'bright');
      log(`\n📋 摘要:`, 'cyan');
      log(`   ✅ 创建私有仓库: ${siteName}`, 'green');
      log(`   ✅ 代码已成功推送`, 'green');
      log(`   🔗 仓库地址: ${repoUrl}`, 'blue');
      log(`\n💡 提示:`, 'yellow');
      log(`   访问仓库: ${GH_CLI} repo view ${siteName} --web`, 'blue');
      log(`   这是一个干净的副本，不包含 Git 历史记录\n`, 'yellow');

    } catch (error) {
      // 清理临时目录
      if (fs.existsSync(tempDir)) {
        try {
          execSync(`rmdir /s /q "${tempDir}"`, { stdio: 'ignore' });
        } catch (e) {
          log(`   ⚠️  无法清理临时目录: ${tempDir}`, 'yellow');
        }
      }
      throw error;
    }

  } catch (error) {
    log('\n❌ 脚本执行失败', 'red');
    log(`错误信息: ${error.message}`, 'red');
    process.exit(1);
  }
}

main().catch(error => {
  log(`\n❌ 致命错误: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
