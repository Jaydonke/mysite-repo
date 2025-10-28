# Codex CLI 完整安装和配置脚本
# 包含 API 密钥自动配置

param(
    [switch]$SkipWSLInstall
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Codex CLI 完整配置向导" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 读取项目的 .env 文件获取 API 密钥
$envFile = Join-Path $PSScriptRoot ".env"
$apiKey = $null

if (Test-Path $envFile) {
    Write-Host "✅ 找到 .env 文件，读取 API 密钥..." -ForegroundColor Green
    $envContent = Get-Content $envFile
    foreach ($line in $envContent) {
        if ($line -match '^OPENAI_API_KEY=(.+)$') {
            $apiKey = $Matches[1]
            Write-Host "✅ 成功读取 API 密钥" -ForegroundColor Green
            break
        }
    }
} else {
    Write-Host "⚠️  未找到 .env 文件" -ForegroundColor Yellow
}

if (-not $apiKey) {
    Write-Host "请输入您的 OpenAI API 密钥:" -ForegroundColor Yellow
    $apiKey = Read-Host "API Key"
}

Write-Host ""

# 检查管理员权限
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin -and -not $SkipWSLInstall) {
    Write-Host "❌ 需要管理员权限来安装 WSL2" -ForegroundColor Red
    Write-Host "请以管理员身份运行 PowerShell，然后执行:" -ForegroundColor Yellow
    Write-Host "  .\setup-codex-complete.ps1" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "或者如果 WSL2 已安装，使用:" -ForegroundColor Yellow
    Write-Host "  .\setup-codex-complete.ps1 -SkipWSLInstall" -ForegroundColor Cyan
    Read-Host "按 Enter 键退出"
    exit 1
}

# 步骤 1: 检查 WSL2
Write-Host "步骤 1: 检查 WSL2 状态..." -ForegroundColor Yellow

$wslInstalled = $false
$ubuntuInstalled = $false

try {
    $wslVersion = wsl --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        $wslInstalled = $true
        Write-Host "✅ WSL2 已安装" -ForegroundColor Green

        $distributions = wsl --list --quiet 2>&1
        if ($distributions -match "Ubuntu") {
            $ubuntuInstalled = $true
            Write-Host "✅ Ubuntu 已安装" -ForegroundColor Green
        }
    }
} catch {
    Write-Host "⚠️  WSL2 未安装" -ForegroundColor Yellow
}

Write-Host ""

# 步骤 2: 安装 WSL2（如果需要）
if (-not $wslInstalled -or -not $ubuntuInstalled) {
    if ($SkipWSLInstall) {
        Write-Host "❌ WSL2/Ubuntu 未安装，但跳过安装步骤" -ForegroundColor Red
        Write-Host "请先安装 WSL2:" -ForegroundColor Yellow
        Write-Host "  wsl --install -d Ubuntu-22.04" -ForegroundColor Cyan
        exit 1
    }

    Write-Host "步骤 2: 安装 WSL2 + Ubuntu 22.04..." -ForegroundColor Yellow
    Write-Host "这可能需要 5-15 分钟..." -ForegroundColor Cyan

    try {
        wsl --install -d Ubuntu-22.04

        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ WSL2 + Ubuntu 安装成功" -ForegroundColor Green
            Write-Host ""
            Write-Host "========================================" -ForegroundColor Cyan
            Write-Host "  需要重启计算机" -ForegroundColor Yellow
            Write-Host "========================================" -ForegroundColor Cyan
            Write-Host ""
            Write-Host "重启后的步骤:" -ForegroundColor Green
            Write-Host "1. 打开 'Ubuntu' 应用（从开始菜单）" -ForegroundColor White
            Write-Host "2. 设置用户名和密码" -ForegroundColor White
            Write-Host "3. 重新运行此脚本:" -ForegroundColor White
            Write-Host "   .\setup-codex-complete.ps1 -SkipWSLInstall" -ForegroundColor Cyan
            Write-Host ""

            $reboot = Read-Host "是否现在重启? (Y/N)"
            if ($reboot -eq "Y" -or $reboot -eq "y") {
                shutdown /r /t 10
            }
            exit 0
        }
    } catch {
        Write-Host "❌ 安装失败: $_" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "步骤 2: WSL2 已安装，跳过" -ForegroundColor Green
}

Write-Host ""

# 步骤 3: 在 WSL 中安装 Node.js 和 Codex
Write-Host "步骤 3: 在 WSL2 中安装 Node.js 和 Codex CLI..." -ForegroundColor Yellow

$installScript = @"
#!/bin/bash
set -e

echo "========================================="
echo "  安装 Node.js 和 Codex CLI"
echo "========================================="
echo ""

# 检查并安装 Node.js
if command -v node &> /dev/null; then
    echo "✅ Node.js 已安装: \$(node --version)"
else
    echo "📦 安装 Node.js 20.x..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
    echo "✅ Node.js 安装成功: \$(node --version)"
fi

echo ""

# 检查并安装 Codex CLI
if command -v codex &> /dev/null; then
    echo "✅ Codex CLI 已安装"
else
    echo "📦 安装 Codex CLI..."

    # 尝试标准安装
    if ! npm install -g @openai/codex 2>/dev/null; then
        echo "⚠️  标准安装失败，尝试使用淘宝镜像..."
        npm config set registry https://registry.npmmirror.com
        npm install -g @openai/codex
        npm config set registry https://registry.npmjs.org
    fi

    echo "✅ Codex CLI 安装成功"
fi

echo ""
echo "✅ 所有软件包安装完成"
"@

try {
    # 在 WSL 中执行安装
    $installScript | wsl bash

    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Node.js 和 Codex CLI 安装成功" -ForegroundColor Green
    } else {
        throw "安装失败"
    }
} catch {
    Write-Host "❌ 安装出错: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "请手动在 WSL Ubuntu 中运行:" -ForegroundColor Yellow
    Write-Host "curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -" -ForegroundColor Cyan
    Write-Host "sudo apt-get install -y nodejs" -ForegroundColor Cyan
    Write-Host "npm install -g @openai/codex" -ForegroundColor Cyan
    exit 1
}

Write-Host ""

# 步骤 4: 配置 API 密钥
Write-Host "步骤 4: 配置 Codex API 密钥..." -ForegroundColor Yellow

$configScript = @"
#!/bin/bash
set -e

# 创建 Codex 配置目录
mkdir -p ~/.codex

# 创建 auth.json 文件
cat > ~/.codex/auth.json << 'AUTHEOF'
{
    "OPENAI_API_KEY": "$apiKey"
}
AUTHEOF

# 同时配置环境变量
if ! grep -q "OPENAI_API_KEY" ~/.bashrc 2>/dev/null; then
    echo '' >> ~/.bashrc
    echo '# OpenAI API Key for Codex' >> ~/.bashrc
    echo 'export OPENAI_API_KEY="$apiKey"' >> ~/.bashrc
fi

# 创建快捷命令别名
if ! grep -q "alias cx=" ~/.bashrc 2>/dev/null; then
    echo '' >> ~/.bashrc
    echo '# Codex CLI 快捷命令' >> ~/.bashrc
    echo 'alias cx="codex"' >> ~/.bashrc
    echo 'alias cxg="codex generate"' >> ~/.bashrc
    echo 'alias cxr="codex review"' >> ~/.bashrc
    echo 'alias cxe="codex explain"' >> ~/.bashrc
fi

echo "✅ API 密钥配置完成"
echo "✅ 环境变量已添加到 ~/.bashrc"
echo "✅ 快捷命令别名已创建"
"@

try {
    $configScript | wsl bash

    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ API 密钥配置成功" -ForegroundColor Green
    } else {
        throw "配置失败"
    }
} catch {
    Write-Host "❌ 配置出错: $_" -ForegroundColor Red
}

Write-Host ""

# 步骤 5: 验证配置
Write-Host "步骤 5: 验证 Codex 配置..." -ForegroundColor Yellow

$verifyScript = @"
#!/bin/bash

echo "检查配置文件..."
if [ -f ~/.codex/auth.json ]; then
    echo "✅ auth.json 存在"
    echo "内容:"
    cat ~/.codex/auth.json | grep -v "$apiKey" | head -5 || echo "{配置文件包含 API 密钥}"
else
    echo "❌ auth.json 不存在"
fi

echo ""
echo "检查环境变量..."
source ~/.bashrc
if [ -n "\$OPENAI_API_KEY" ]; then
    echo "✅ OPENAI_API_KEY 已设置"
else
    echo "⚠️  OPENAI_API_KEY 未设置"
fi

echo ""
echo "检查 Codex CLI..."
if command -v codex &> /dev/null; then
    echo "✅ Codex CLI 可用"
    codex --version 2>&1 || echo "Codex CLI 已安装"
else
    echo "❌ Codex CLI 未找到"
fi
"@

Write-Host ""
$verifyScript | wsl bash
Write-Host ""

# 步骤 6: 配置 Cursor IDE
Write-Host "步骤 6: 配置 Cursor IDE 集成..." -ForegroundColor Yellow

$vscodeDir = Join-Path $PSScriptRoot ".vscode"
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
      "args": ["bash", "-ic", "codex"],
      "presentation": {
        "reveal": "always",
        "panel": "new",
        "focus": true
      },
      "problemMatcher": []
    },
    {
      "label": "Codex: Ask Question",
      "type": "shell",
      "command": "wsl",
      "args": ["bash", "-ic", "codex '${input:question}'"],
      "presentation": {
        "reveal": "always",
        "panel": "new"
      },
      "problemMatcher": []
    },
    {
      "label": "Codex: Generate Code",
      "type": "shell",
      "command": "wsl",
      "args": ["bash", "-ic", "codex generate '${input:codePrompt}'"],
      "presentation": {
        "reveal": "always",
        "panel": "new"
      },
      "problemMatcher": []
    },
    {
      "label": "Codex: Review Current File",
      "type": "shell",
      "command": "wsl",
      "args": ["bash", "-ic", "codex review \"$(cat '${file}')\""],
      "presentation": {
        "reveal": "always",
        "panel": "new"
      },
      "problemMatcher": []
    },
    {
      "label": "Codex: Explain Code",
      "type": "shell",
      "command": "wsl",
      "args": ["bash", "-ic", "codex explain '${selectedText}'"],
      "presentation": {
        "reveal": "always",
        "panel": "new"
      },
      "problemMatcher": []
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
$tasksJson | Out-File -FilePath $tasksPath -Encoding UTF8 -NoNewline
Write-Host "✅ 创建 tasks.json" -ForegroundColor Green

# 更新或创建 settings.json
$settingsPath = Join-Path $vscodeDir "settings.json"
$settings = @{
    "terminal.integrated.defaultProfile.windows" = "Ubuntu (WSL)"
    "terminal.integrated.profiles.windows" = @{
        "Ubuntu (WSL)" = @{
            "path" = "wsl.exe"
            "args" = @("-d", "Ubuntu")
        }
    }
}

if (Test-Path $settingsPath) {
    $existingSettings = Get-Content $settingsPath -Raw | ConvertFrom-Json
    foreach ($key in $settings.Keys) {
        $existingSettings | Add-Member -NotePropertyName $key -NotePropertyValue $settings[$key] -Force
    }
    $existingSettings | ConvertTo-Json -Depth 10 | Out-File -FilePath $settingsPath -Encoding UTF8 -NoNewline
    Write-Host "✅ 更新 settings.json" -ForegroundColor Green
} else {
    $settings | ConvertTo-Json -Depth 10 | Out-File -FilePath $settingsPath -Encoding UTF8 -NoNewline
    Write-Host "✅ 创建 settings.json" -ForegroundColor Green
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  🎉 安装和配置全部完成！" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 配置摘要:" -ForegroundColor Yellow
Write-Host "  ✅ WSL2 + Ubuntu 已安装" -ForegroundColor Green
Write-Host "  ✅ Node.js 已安装" -ForegroundColor Green
Write-Host "  ✅ Codex CLI 已安装" -ForegroundColor Green
Write-Host "  ✅ API 密钥已配置到 ~/.codex/auth.json" -ForegroundColor Green
Write-Host "  ✅ 环境变量已配置到 ~/.bashrc" -ForegroundColor Green
Write-Host "  ✅ Cursor IDE 集成已配置" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 立即开始使用:" -ForegroundColor Yellow
Write-Host ""
Write-Host "方法 1 - 在 Cursor 终端中直接使用:" -ForegroundColor White
Write-Host "  1. 按 Ctrl + \` 打开终端" -ForegroundColor Cyan
Write-Host "  2. 选择 'Ubuntu (WSL)'" -ForegroundColor Cyan
Write-Host "  3. 运行命令:" -ForegroundColor Cyan
Write-Host "     codex" -ForegroundColor Green
Write-Host "     codex 'TypeScript 泛型是什么?'" -ForegroundColor Green
Write-Host "     cx 'Hello Codex!'" -ForegroundColor Green
Write-Host ""
Write-Host "方法 2 - 使用 Cursor 任务:" -ForegroundColor White
Write-Host "  1. 按 Ctrl+Shift+P" -ForegroundColor Cyan
Write-Host "  2. 输入 'Tasks: Run Task'" -ForegroundColor Cyan
Write-Host "  3. 选择 'Codex: Interactive Mode'" -ForegroundColor Cyan
Write-Host ""
Write-Host "📚 可用的快捷命令:" -ForegroundColor Yellow
Write-Host "  cx       - codex (交互模式)" -ForegroundColor Cyan
Write-Host "  cxg      - codex generate (生成代码)" -ForegroundColor Cyan
Write-Host "  cxr      - codex review (代码审查)" -ForegroundColor Cyan
Write-Host "  cxe      - codex explain (解释代码)" -ForegroundColor Cyan
Write-Host ""
Write-Host "📖 查看完整文档:" -ForegroundColor Yellow
Write-Host "  CURSOR_CODEX_INTEGRATION.md" -ForegroundColor Cyan
Write-Host "  CURSOR_CODEX_QUICKSTART.md" -ForegroundColor Cyan
Write-Host ""
Write-Host "✨ 享受 AI 辅助编程！" -ForegroundColor Green
Write-Host ""

Read-Host "按 Enter 键退出"
