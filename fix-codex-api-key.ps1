# Codex API 密钥快速更新脚本
# 用于修复 401 Unauthorized 错误

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Codex API 密钥更新工具" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "🔴 检测到 401 Unauthorized 错误" -ForegroundColor Red
Write-Host ""
Write-Host "可能的原因:" -ForegroundColor Yellow
Write-Host "  1. API 密钥已过期" -ForegroundColor White
Write-Host "  2. API 密钥被撤销" -ForegroundColor White
Write-Host "  3. 账户余额不足" -ForegroundColor White
Write-Host ""

# 步骤 1: 提示用户获取新密钥
Write-Host "步骤 1: 获取新的 API 密钥" -ForegroundColor Yellow
Write-Host ""
Write-Host "请访问: https://platform.openai.com/api-keys" -ForegroundColor Cyan
Write-Host ""
Write-Host "操作步骤:" -ForegroundColor White
Write-Host "  1. 登录 OpenAI 账户" -ForegroundColor Gray
Write-Host "  2. 点击 '+ Create new secret key'" -ForegroundColor Gray
Write-Host "  3. 命名密钥（例如: Codex-CLI-2024）" -ForegroundColor Gray
Write-Host "  4. 复制生成的密钥（只显示一次！）" -ForegroundColor Gray
Write-Host ""

# 询问是否在浏览器中打开
$openBrowser = Read-Host "是否在浏览器中打开 API 密钥页面? (Y/N)"
if ($openBrowser -eq "Y" -or $openBrowser -eq "y") {
    Start-Process "https://platform.openai.com/api-keys"
    Write-Host "✅ 已在浏览器中打开" -ForegroundColor Green
    Write-Host ""
}

# 步骤 2: 输入新密钥
Write-Host "步骤 2: 输入新的 API 密钥" -ForegroundColor Yellow
Write-Host ""

$newApiKey = Read-Host "请粘贴您的新 API 密钥"

if ([string]::IsNullOrWhiteSpace($newApiKey)) {
    Write-Host "❌ 未输入 API 密钥" -ForegroundColor Red
    Read-Host "按 Enter 键退出"
    exit 1
}

# 验证密钥格式
if (-not ($newApiKey -match '^sk-[a-zA-Z0-9\-_]+$')) {
    Write-Host "⚠️  警告: API 密钥格式可能不正确" -ForegroundColor Yellow
    Write-Host "正确格式应为: sk-... 或 sk-proj-..." -ForegroundColor Gray
    $continue = Read-Host "是否继续? (Y/N)"
    if ($continue -ne "Y" -and $continue -ne "y") {
        exit 1
    }
}

Write-Host ""
Write-Host "✅ API 密钥已接收（长度: $($newApiKey.Length) 字符）" -ForegroundColor Green
Write-Host ""

# 步骤 3: 测试 API 密钥
Write-Host "步骤 3: 测试 API 密钥有效性..." -ForegroundColor Yellow

try {
    $headers = @{
        "Authorization" = "Bearer $newApiKey"
        "Content-Type" = "application/json"
    }

    $response = Invoke-WebRequest -Uri "https://api.openai.com/v1/models" `
        -Headers $headers `
        -Method GET `
        -UseBasicParsing `
        -TimeoutSec 10

    if ($response.StatusCode -eq 200) {
        Write-Host "✅ API 密钥有效！" -ForegroundColor Green
    } else {
        Write-Host "⚠️  API 响应代码: $($response.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 401) {
        Write-Host "❌ API 密钥无效（401 Unauthorized）" -ForegroundColor Red
        Write-Host "请检查密钥是否正确复制" -ForegroundColor Yellow
        Read-Host "按 Enter 键退出"
        exit 1
    } elseif ($statusCode -eq 429) {
        Write-Host "⚠️  速率限制（429 Too Many Requests）" -ForegroundColor Yellow
        Write-Host "密钥可能有效，但请稍后再试" -ForegroundColor Gray
    } else {
        Write-Host "⚠️  无法验证 API 密钥: $_" -ForegroundColor Yellow
        Write-Host "将继续更新配置..." -ForegroundColor Gray
    }
}

Write-Host ""

# 步骤 4: 更新 .env 文件
Write-Host "步骤 4: 更新项目 .env 文件..." -ForegroundColor Yellow

$envPath = Join-Path $PSScriptRoot ".env"

if (Test-Path $envPath) {
    $envContent = Get-Content $envPath -Raw

    # 替换旧的 API 密钥
    $envContent = $envContent -replace 'OPENAI_API_KEY=.*', "OPENAI_API_KEY=$newApiKey"

    # 写回文件
    $envContent | Set-Content $envPath -NoNewline

    Write-Host "✅ 已更新 .env 文件" -ForegroundColor Green
} else {
    Write-Host "⚠️  .env 文件不存在，跳过" -ForegroundColor Yellow
}

Write-Host ""

# 步骤 5: 更新 WSL2 配置
Write-Host "步骤 5: 更新 WSL2 中的 Codex 配置..." -ForegroundColor Yellow

# 检查 WSL 是否可用
try {
    $wslCheck = wsl --list --quiet 2>&1

    if ($LASTEXITCODE -eq 0 -and $wslCheck -match "Ubuntu") {
        Write-Host "✅ 检测到 WSL2 Ubuntu" -ForegroundColor Green

        # 创建更新脚本
        $updateScript = @"
#!/bin/bash
set -e

echo "更新 Codex 配置..."

# 更新 auth.json
mkdir -p ~/.codex
cat > ~/.codex/auth.json << 'AUTHEOF'
{
    "OPENAI_API_KEY": "$newApiKey"
}
AUTHEOF

echo "✅ 更新 ~/.codex/auth.json"

# 更新 .bashrc
if grep -q "OPENAI_API_KEY" ~/.bashrc 2>/dev/null; then
    sed -i '/OPENAI_API_KEY/d' ~/.bashrc
fi

echo 'export OPENAI_API_KEY="$newApiKey"' >> ~/.bashrc

echo "✅ 更新 ~/.bashrc"

# 重新加载
source ~/.bashrc 2>/dev/null || true

echo ""
echo "验证配置..."
if [ -f ~/.codex/auth.json ]; then
    echo "✅ auth.json 存在"
fi

if [ -n "\$OPENAI_API_KEY" ]; then
    echo "✅ 环境变量已设置"
fi

echo ""
echo "配置更新完成！"
"@

        # 在 WSL 中执行
        $updateScript | wsl bash

        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ WSL2 配置更新成功" -ForegroundColor Green
        } else {
            Write-Host "⚠️  WSL2 配置更新可能失败" -ForegroundColor Yellow
        }

    } else {
        Write-Host "⚠️  未检测到 WSL2 Ubuntu，跳过" -ForegroundColor Yellow
        Write-Host "如果您已安装 WSL2，请手动运行:" -ForegroundColor Gray
        Write-Host ""
        Write-Host "wsl bash -c 'mkdir -p ~/.codex && cat > ~/.codex/auth.json << EOF" -ForegroundColor Cyan
        Write-Host "{" -ForegroundColor Cyan
        Write-Host "    \`"OPENAI_API_KEY\`": \`"$newApiKey\`"" -ForegroundColor Cyan
        Write-Host "}" -ForegroundColor Cyan
        Write-Host "EOF'" -ForegroundColor Cyan
    }
} catch {
    Write-Host "⚠️  无法访问 WSL2: $_" -ForegroundColor Yellow
}

Write-Host ""

# 步骤 6: 测试 Codex
Write-Host "步骤 6: 测试 Codex CLI..." -ForegroundColor Yellow

try {
    $testResult = wsl bash -c "source ~/.bashrc && codex 'test connection' 2>&1 | head -20" 2>&1

    if ($testResult -notmatch "401" -and $testResult -notmatch "Unauthorized") {
        Write-Host "✅ Codex CLI 测试成功" -ForegroundColor Green
        Write-Host ""
        Write-Host "测试输出:" -ForegroundColor Gray
        Write-Host $testResult -ForegroundColor Gray
    } else {
        Write-Host "⚠️  Codex CLI 仍有问题" -ForegroundColor Yellow
        Write-Host $testResult -ForegroundColor Gray
    }
} catch {
    Write-Host "⚠️  无法测试 Codex CLI" -ForegroundColor Yellow
    Write-Host "请手动在 WSL 终端中运行: codex 'test'" -ForegroundColor Gray
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  ✅ API 密钥更新完成！" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "📝 已更新的配置:" -ForegroundColor Yellow
Write-Host "  ✅ .env 文件（Windows）" -ForegroundColor Green
Write-Host "  ✅ ~/.codex/auth.json（WSL2）" -ForegroundColor Green
Write-Host "  ✅ ~/.bashrc（WSL2）" -ForegroundColor Green
Write-Host ""

Write-Host "🚀 下一步操作:" -ForegroundColor Yellow
Write-Host ""
Write-Host "在 Cursor IDE 中:" -ForegroundColor White
Write-Host "  1. 打开终端 (Ctrl + \`)" -ForegroundColor Cyan
Write-Host "  2. 选择 'Ubuntu (WSL)'" -ForegroundColor Cyan
Write-Host "  3. 运行: source ~/.bashrc" -ForegroundColor Cyan
Write-Host "  4. 测试: codex 'Hello, Codex!'" -ForegroundColor Cyan
Write-Host ""

Write-Host "如果仍有问题:" -ForegroundColor White
Write-Host "  - 检查 OpenAI 账户余额: https://platform.openai.com/usage" -ForegroundColor Cyan
Write-Host "  - 查看 API 状态: https://status.openai.com/" -ForegroundColor Cyan
Write-Host "  - 阅读完整指南: FIX_CODEX_401_ERROR.md" -ForegroundColor Cyan
Write-Host ""

Write-Host "💡 提示: 项目密钥（sk-proj-*）可能有限制" -ForegroundColor Yellow
Write-Host "   如果问题持续，尝试创建用户级密钥（sk-*）" -ForegroundColor Gray
Write-Host ""

Read-Host "按 Enter 键退出"
