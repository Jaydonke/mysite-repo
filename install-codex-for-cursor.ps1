# Codex CLI 自动安装脚本 for Cursor IDE
# 需要管理员权限运行

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Codex CLI for Cursor IDE 自动安装" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 检查管理员权限
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "❌ 错误: 需要管理员权限" -ForegroundColor Red
    Write-Host "请右键点击 PowerShell 并选择 '以管理员身份运行'" -ForegroundColor Yellow
    Read-Host "按 Enter 键退出"
    exit 1
}

Write-Host "✅ 管理员权限检查通过" -ForegroundColor Green
Write-Host ""

# 步骤 1: 检查 WSL2 状态
Write-Host "步骤 1: 检查 WSL2 状态..." -ForegroundColor Yellow

$wslStatus = wsl --status 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ WSL2 已安装" -ForegroundColor Green

    # 检查是否有已安装的发行版
    $distributions = wsl --list --quiet
    if ($distributions -match "Ubuntu") {
        Write-Host "✅ Ubuntu 已安装" -ForegroundColor Green
        $needInstallUbuntu = $false
    } else {
        Write-Host "⚠️  未找到 Ubuntu，准备安装..." -ForegroundColor Yellow
        $needInstallUbuntu = $true
    }
} else {
    Write-Host "⚠️  WSL2 未安装，准备安装..." -ForegroundColor Yellow
    $needInstallWSL = $true
    $needInstallUbuntu = $true
}

Write-Host ""

# 步骤 2: 安装 WSL2 和 Ubuntu（如果需要）
if ($needInstallWSL -or $needInstallUbuntu) {
    Write-Host "步骤 2: 安装 WSL2 + Ubuntu 22.04..." -ForegroundColor Yellow
    Write-Host "这可能需要 5-15 分钟，请耐心等待..." -ForegroundColor Cyan

    try {
        wsl --install -d Ubuntu-22.04

        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ WSL2 和 Ubuntu 安装成功" -ForegroundColor Green
            Write-Host ""
            Write-Host "========================================" -ForegroundColor Cyan
            Write-Host "  需要重启计算机以完成安装" -ForegroundColor Yellow
            Write-Host "========================================" -ForegroundColor Cyan
            Write-Host ""
            Write-Host "重启后，请运行第二部分安装脚本:" -ForegroundColor Green
            Write-Host "  1. 打开 Ubuntu（从开始菜单）" -ForegroundColor White
            Write-Host "  2. 设置用户名和密码" -ForegroundColor White
            Write-Host "  3. 运行以下命令:" -ForegroundColor White
            Write-Host ""
            Write-Host "  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -" -ForegroundColor Cyan
            Write-Host "  sudo apt-get install -y nodejs" -ForegroundColor Cyan
            Write-Host "  npm install -g @openai/codex" -ForegroundColor Cyan
            Write-Host ""

            $reboot = Read-Host "是否现在重启? (Y/N)"
            if ($reboot -eq "Y" -or $reboot -eq "y") {
                Write-Host "正在重启..." -ForegroundColor Yellow
                shutdown /r /t 10
            } else {
                Write-Host "请稍后手动重启计算机" -ForegroundColor Yellow
            }

            Read-Host "按 Enter 键退出"
            exit 0
        } else {
            throw "WSL 安装失败"
        }
    } catch {
        Write-Host "❌ 安装失败: $_" -ForegroundColor Red
        Write-Host ""
        Write-Host "手动安装步骤:" -ForegroundColor Yellow
        Write-Host "1. 在 PowerShell (管理员) 中运行:" -ForegroundColor White
        Write-Host "   wsl --install -d Ubuntu-22.04" -ForegroundColor Cyan
        Write-Host "2. 重启计算机" -ForegroundColor White
        Write-Host "3. 查看 WSL2_QUICK_START.md 获取详细说明" -ForegroundColor White
        Read-Host "按 Enter 键退出"
        exit 1
    }
} else {
    Write-Host "步骤 2: WSL2 和 Ubuntu 已安装，跳过" -ForegroundColor Green
}

Write-Host ""

# 步骤 3: 在 WSL2 中安装 Node.js 和 Codex
Write-Host "步骤 3: 在 WSL2 中安装 Node.js 和 Codex CLI..." -ForegroundColor Yellow
Write-Host "正在创建安装脚本..." -ForegroundColor Cyan

# 创建 WSL 安装脚本
$wslInstallScript = @'
#!/bin/bash
set -e

echo "========================================="
echo "  WSL2 环境配置 - Node.js + Codex CLI"
echo "========================================="
echo ""

# 检查是否已安装 Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "✅ Node.js 已安装: $NODE_VERSION"
else
    echo "📦 安装 Node.js 20.x..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs

    if [ $? -eq 0 ]; then
        echo "✅ Node.js 安装成功: $(node --version)"
    else
        echo "❌ Node.js 安装失败"
        exit 1
    fi
fi

echo ""

# 检查是否已安装 Codex
if command -v codex &> /dev/null; then
    CODEX_VERSION=$(codex --version 2>&1 || echo "未知版本")
    echo "✅ Codex CLI 已安装: $CODEX_VERSION"
else
    echo "📦 安装 Codex CLI..."
    npm install -g @openai/codex

    if [ $? -eq 0 ]; then
        echo "✅ Codex CLI 安装成功"
    else
        echo "❌ Codex CLI 安装失败"
        echo "尝试使用淘宝镜像..."
        npm config set registry https://registry.npmmirror.com
        npm install -g @openai/codex
        npm config set registry https://registry.npmjs.org
    fi
fi

echo ""

# 配置环境
echo "⚙️  配置环境..."

# 添加别名到 .bashrc
if ! grep -q "alias cx=" ~/.bashrc; then
    cat >> ~/.bashrc << 'EOF'

# Codex CLI 快捷命令
alias cx='codex'
alias cxg='codex generate'
alias cxr='codex review'
alias cxe='codex explain'
EOF
    echo "✅ 已添加 Codex 快捷命令到 .bashrc"
fi

# 创建 Codex 配置目录
mkdir -p ~/.config/codex

echo ""
echo "========================================="
echo "  安装完成！"
echo "========================================="
echo ""
echo "下一步："
echo "1. 设置 OpenAI API 密钥："
echo "   export OPENAI_API_KEY='your-api-key-here'"
echo "   echo 'export OPENAI_API_KEY=\"your-api-key-here\"' >> ~/.bashrc"
echo ""
echo "2. 测试 Codex："
echo "   codex --version"
echo "   codex 'Hello, Codex!'"
echo ""
echo "3. 在 Cursor IDE 中："
echo "   - 按 Ctrl + \` 打开终端"
echo "   - 选择 'Ubuntu (WSL)'"
echo "   - 直接使用 codex 命令"
echo ""
echo "查看完整文档: CURSOR_CODEX_INTEGRATION.md"
echo ""
'@

# 将脚本写入临时文件
$tempScript = "$env:TEMP\install-codex-wsl.sh"
$wslInstallScript | Out-File -FilePath $tempScript -Encoding UTF8 -NoNewline

Write-Host "执行 WSL 安装脚本..." -ForegroundColor Cyan
Write-Host ""

try {
    # 在 WSL 中执行脚本
    wsl bash -c "cat > /tmp/install-codex.sh << 'EOF'
$wslInstallScript
EOF
chmod +x /tmp/install-codex.sh
/tmp/install-codex.sh"

    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Green
        Write-Host "  安装成功完成！" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Green
        Write-Host ""
    } else {
        throw "WSL 脚本执行失败"
    }
} catch {
    Write-Host "❌ 安装过程出现错误: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "请手动执行以下步骤:" -ForegroundColor Yellow
    Write-Host "1. 打开 Ubuntu (WSL)" -ForegroundColor White
    Write-Host "2. 运行以下命令:" -ForegroundColor White
    Write-Host ""
    Write-Host "curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -" -ForegroundColor Cyan
    Write-Host "sudo apt-get install -y nodejs" -ForegroundColor Cyan
    Write-Host "npm install -g @openai/codex" -ForegroundColor Cyan
    Write-Host ""
}

# 步骤 4: 配置 Cursor IDE
Write-Host ""
Write-Host "步骤 4: 配置 Cursor IDE 集成..." -ForegroundColor Yellow

$projectRoot = Get-Location
$vscodeDir = Join-Path $projectRoot ".vscode"

if (-not (Test-Path $vscodeDir)) {
    New-Item -ItemType Directory -Path $vscodeDir | Out-Null
    Write-Host "✅ 创建 .vscode 目录" -ForegroundColor Green
}

# 创建 tasks.json
$tasksJson = @'
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Codex: Interactive Mode",
      "type": "shell",
      "command": "wsl",
      "args": ["bash", "-c", "codex"],
      "presentation": {
        "reveal": "always",
        "panel": "new"
      }
    },
    {
      "label": "Codex: Ask Question",
      "type": "shell",
      "command": "wsl",
      "args": ["bash", "-c", "codex '${input:question}'"],
      "presentation": {
        "reveal": "always",
        "panel": "new"
      }
    },
    {
      "label": "Codex: Generate Code",
      "type": "shell",
      "command": "wsl",
      "args": ["bash", "-c", "codex generate '${input:codePrompt}'"],
      "presentation": {
        "reveal": "always",
        "panel": "new"
      }
    }
  ],
  "inputs": [
    {
      "id": "question",
      "type": "promptString",
      "description": "输入您的问题"
    },
    {
      "id": "codePrompt",
      "type": "promptString",
      "description": "描述您想生成的代码"
    }
  ]
}
'@

$tasksPath = Join-Path $vscodeDir "tasks.json"
$tasksJson | Out-File -FilePath $tasksPath -Encoding UTF8
Write-Host "✅ 创建 tasks.json 配置文件" -ForegroundColor Green

# 创建 settings.json（如果不存在）
$settingsPath = Join-Path $vscodeDir "settings.json"
if (-not (Test-Path $settingsPath)) {
    $settingsJson = @'
{
  "terminal.integrated.defaultProfile.windows": "Ubuntu (WSL)"
}
'@
    $settingsJson | Out-File -FilePath $settingsPath -Encoding UTF8
    Write-Host "✅ 配置 Cursor 默认终端为 WSL" -ForegroundColor Green
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  🎉 安装和配置全部完成！" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 下一步操作:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. 设置 OpenAI API 密钥:" -ForegroundColor White
Write-Host "   在 Cursor 中打开终端 (Ctrl + \`)" -ForegroundColor Cyan
Write-Host "   选择 'Ubuntu (WSL)'" -ForegroundColor Cyan
Write-Host "   运行: export OPENAI_API_KEY='your-api-key-here'" -ForegroundColor Cyan
Write-Host "   持久化: echo 'export OPENAI_API_KEY=\"your-key\"' >> ~/.bashrc" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. 测试 Codex:" -ForegroundColor White
Write-Host "   codex 'Hello, Codex!'" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. 使用 Cursor 任务:" -ForegroundColor White
Write-Host "   按 Ctrl+Shift+P → 输入 'Tasks: Run Task'" -ForegroundColor Cyan
Write-Host "   选择 'Codex: Interactive Mode'" -ForegroundColor Cyan
Write-Host ""
Write-Host "4. 查看完整文档:" -ForegroundColor White
Write-Host "   CURSOR_CODEX_INTEGRATION.md" -ForegroundColor Cyan
Write-Host ""
Write-Host "🚀 开始享受 AI 辅助编程！" -ForegroundColor Green
Write-Host ""

Read-Host "按 Enter 键退出"
