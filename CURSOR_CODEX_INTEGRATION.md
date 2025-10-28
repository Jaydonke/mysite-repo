# Cursor IDE 集成 Codex CLI 完整指南

## 🎯 目标

在 Cursor IDE 中使用 OpenAI Codex CLI 进行 AI 辅助编程

---

## 📋 前置要求

- ✅ Windows 11 或 Windows 10 (版本 2004+)
- ✅ Cursor IDE 已安装
- ✅ OpenAI API 密钥

---

## 🚀 完整安装步骤

### 步骤 1: 安装 WSL2 + Ubuntu

**在 PowerShell（管理员）中执行**：

```powershell
# 一键安装 WSL2 和 Ubuntu 22.04
wsl --install -d Ubuntu-22.04
```

**等待安装完成后，重启计算机**：

```powershell
shutdown /r /t 0
```

---

### 步骤 2: 初始化 Ubuntu（重启后）

**打开 PowerShell 或在开始菜单搜索 "Ubuntu"**：

```bash
# WSL2 会提示创建用户
Enter new UNIX username: your_username
New password: ********
Retype new password: ********
```

---

### 步骤 3: 在 WSL2 中安装 Node.js 和 Codex CLI

**在 Ubuntu 终端中运行**：

```bash
# 1. 更新系统
sudo apt update && sudo apt upgrade -y

# 2. 安装 Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. 验证 Node.js 安装
node --version    # 应显示 v20.x.x
npm --version     # 应显示 10.x.x

# 4. 全局安装 Codex CLI
npm install -g @openai/codex

# 5. 验证 Codex 安装
codex --version
```

---

### 步骤 4: 配置 OpenAI API 密钥

**在 WSL2 Ubuntu 中**：

```bash
# 方法 1: 环境变量（推荐）
echo 'export OPENAI_API_KEY="your-api-key-here"' >> ~/.bashrc
source ~/.bashrc

# 方法 2: Codex 配置文件
mkdir -p ~/.config/codex
cat > ~/.config/codex/config.json << 'EOF'
{
  "apiKey": "your-api-key-here",
  "model": "gpt-4",
  "temperature": 0.7
}
EOF

# 验证配置
echo $OPENAI_API_KEY
```

**获取 API 密钥**：
1. 访问：https://platform.openai.com/api-keys
2. 点击 "Create new secret key"
3. 复制密钥并替换上面的 `your-api-key-here`

---

### 步骤 5: 在 Cursor 中集成 Codex CLI

#### 方法 A: 使用 Cursor 内置终端 ⭐ 推荐

1. **在 Cursor 中打开 WSL2 终端**：
   - 快捷键：`` Ctrl + ` ``（打开终端）
   - 点击终端右侧下拉菜单 → 选择 "Ubuntu (WSL)"

2. **在终端中直接使用 Codex**：
   ```bash
   # 启动 Codex 交互式模式
   codex

   # 或单次查询
   codex "如何在 TypeScript 中创建泛型函数？"

   # 生成代码
   codex generate "创建一个 React 组件用于显示用户列表"
   ```

#### 方法 B: 配置 Cursor 任务 (tasks.json)

**创建 `.vscode/tasks.json`**（Cursor 兼容 VSCode 配置）：

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Codex: Ask Question",
      "type": "shell",
      "command": "wsl",
      "args": [
        "bash",
        "-c",
        "codex '${input:question}'"
      ],
      "presentation": {
        "reveal": "always",
        "panel": "new"
      }
    },
    {
      "label": "Codex: Generate Code",
      "type": "shell",
      "command": "wsl",
      "args": [
        "bash",
        "-c",
        "codex generate '${input:codePrompt}'"
      ],
      "presentation": {
        "reveal": "always",
        "panel": "new"
      }
    },
    {
      "label": "Codex: Explain Selected Code",
      "type": "shell",
      "command": "wsl",
      "args": [
        "bash",
        "-c",
        "codex explain '${selectedText}'"
      ],
      "presentation": {
        "reveal": "always",
        "panel": "new"
      }
    },
    {
      "label": "Codex: Interactive Mode",
      "type": "shell",
      "command": "wsl",
      "args": ["bash", "-c", "codex"],
      "presentation": {
        "reveal": "always",
        "panel": "new"
      },
      "isBackground": false
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
```

**使用任务**：
1. 按 `Ctrl + Shift + P`
2. 输入 "Tasks: Run Task"
3. 选择 "Codex: Ask Question" 或其他任务

#### 方法 C: 配置键盘快捷键 (keybindings.json)

**创建 `.vscode/keybindings.json`**：

```json
[
  {
    "key": "ctrl+shift+c ctrl+shift+a",
    "command": "workbench.action.tasks.runTask",
    "args": "Codex: Ask Question"
  },
  {
    "key": "ctrl+shift+c ctrl+shift+g",
    "command": "workbench.action.tasks.runTask",
    "args": "Codex: Generate Code"
  },
  {
    "key": "ctrl+shift+c ctrl+shift+e",
    "command": "workbench.action.tasks.runTask",
    "args": "Codex: Explain Selected Code"
  },
  {
    "key": "ctrl+shift+c ctrl+shift+i",
    "command": "workbench.action.tasks.runTask",
    "args": "Codex: Interactive Mode"
  }
]
```

**快捷键说明**：
- `Ctrl+Shift+C` `Ctrl+Shift+A` - 提问
- `Ctrl+Shift+C` `Ctrl+Shift+G` - 生成代码
- `Ctrl+Shift+C` `Ctrl+Shift+E` - 解释选中代码
- `Ctrl+Shift+C` `Ctrl+Shift+I` - 交互模式

#### 方法 D: 创建自定义脚本（高级）

**在项目根目录创建 `scripts/codex-helper.sh`**：

```bash
#!/bin/bash

# Codex Helper Script for Cursor IDE

case "$1" in
  ask)
    codex "$2"
    ;;
  generate)
    codex generate "$2"
    ;;
  explain)
    codex explain "$2"
    ;;
  review)
    codex "请审查以下代码并提供改进建议: $2"
    ;;
  refactor)
    codex "请重构以下代码: $2"
    ;;
  debug)
    codex "请帮我调试这段代码: $2"
    ;;
  *)
    echo "用法: codex-helper.sh {ask|generate|explain|review|refactor|debug} 'prompt'"
    exit 1
    ;;
esac
```

**赋予执行权限**：
```bash
chmod +x scripts/codex-helper.sh
```

**在 Cursor 终端中使用**：
```bash
./scripts/codex-helper.sh ask "如何优化这个函数？"
./scripts/codex-helper.sh generate "创建一个排序算法"
./scripts/codex-helper.sh review "$(cat src/utils/helper.ts)"
```

---

### 步骤 6: 配置 Cursor 默认使用 WSL2

1. **打开 Cursor 设置**：
   - `Ctrl + ,` 或 `File > Preferences > Settings`

2. **搜索 "terminal integrated default profile"**

3. **设置默认终端为 WSL**：
   ```json
   {
     "terminal.integrated.defaultProfile.windows": "Ubuntu (WSL)"
   }
   ```

4. **配置 WSL 工作目录**：
   ```json
   {
     "terminal.integrated.cwd": "${workspaceFolder}"
   }
   ```

---

## 🎮 使用示例

### 场景 1: 快速提问

**在 Cursor 内置终端（WSL2）中**：

```bash
# 直接提问
codex "TypeScript 中如何定义接口？"

# 查询最佳实践
codex "React Hooks 使用注意事项"

# 调试帮助
codex "为什么这个正则表达式不工作: /^\d{3}-\d{2}-\d{4}$/"
```

### 场景 2: 生成代码片段

```bash
# 生成函数
codex generate "创建一个防抖函数"

# 生成组件
codex generate "创建一个带分页的表格组件"

# 生成测试
codex generate "为这个函数创建单元测试: $(cat src/utils/format.ts)"
```

### 场景 3: 代码审查

```bash
# 审查当前文件
codex review "$(cat src/components/Header.tsx)"

# 审查 Git diff
codex review "$(git diff HEAD~1)"
```

### 场景 4: 重构建议

```bash
# 重构代码
codex refactor "$(cat src/legacy-code.js)"

# 转换代码
codex "将以下 JavaScript 转换为 TypeScript: $(cat old.js)"
```

---

## 🛠️ 高级配置

### 自定义 Codex 行为

**编辑 `~/.config/codex/config.json`**：

```json
{
  "apiKey": "your-api-key-here",
  "model": "gpt-4-turbo-preview",
  "temperature": 0.3,
  "maxTokens": 2000,
  "topP": 1,
  "frequencyPenalty": 0,
  "presencePenalty": 0,
  "systemPrompt": "你是一个专业的编程助手，专注于提供清晰、高效的代码解决方案。",
  "language": "zh-CN",
  "outputFormat": "markdown"
}
```

### 配置多个模型预设

```json
{
  "profiles": {
    "quick": {
      "model": "gpt-3.5-turbo",
      "temperature": 0.5,
      "maxTokens": 500
    },
    "detailed": {
      "model": "gpt-4",
      "temperature": 0.3,
      "maxTokens": 3000
    },
    "creative": {
      "model": "gpt-4",
      "temperature": 0.9,
      "maxTokens": 2000
    }
  },
  "defaultProfile": "detailed"
}
```

**使用不同配置**：
```bash
codex --profile quick "快速问题"
codex --profile creative "创意代码生成"
```

---

## 🔄 工作流集成

### Git Hooks 集成

**创建 `.git/hooks/pre-commit`**：

```bash
#!/bin/bash

# 使用 Codex 审查提交的代码
echo "使用 Codex 审查代码..."

FILES=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(js|ts|tsx|jsx)$')

if [ -n "$FILES" ]; then
  for FILE in $FILES; do
    echo "审查: $FILE"
    CONTENT=$(cat "$FILE")
    REVIEW=$(wsl bash -c "codex review '$CONTENT'")
    echo "$REVIEW"
  done
fi
```

### NPM Scripts 集成

**在 `package.json` 中添加**：

```json
{
  "scripts": {
    "codex:ask": "wsl bash -c 'codex'",
    "codex:review": "wsl bash -c 'codex review \"$(git diff)\"'",
    "codex:test-gen": "wsl bash -c 'codex generate \"为所有组件生成测试\"'"
  }
}
```

**使用**：
```bash
npm run codex:ask
npm run codex:review
```

---

## 📊 性能优化

### 加速 WSL2 启动

**在 `~/.bashrc` 中添加**：

```bash
# Codex 快捷命令
alias cx='codex'
alias cxg='codex generate'
alias cxr='codex review'
alias cxe='codex explain'

# 预加载环境变量
export OPENAI_API_KEY="your-api-key"
export CODEX_MODEL="gpt-4"
```

### 缓存常用响应

**创建本地缓存脚本**：

```bash
#!/bin/bash
# ~/.local/bin/codex-cached

CACHE_DIR="$HOME/.cache/codex"
mkdir -p "$CACHE_DIR"

QUERY_HASH=$(echo "$1" | md5sum | cut -d' ' -f1)
CACHE_FILE="$CACHE_DIR/$QUERY_HASH.txt"

if [ -f "$CACHE_FILE" ]; then
  cat "$CACHE_FILE"
else
  codex "$1" | tee "$CACHE_FILE"
fi
```

---

## 🐛 故障排除

### 问题 1: Codex 命令未找到

**解决方案**：
```bash
# 检查 Codex 是否安装
npm list -g @openai/codex

# 重新安装
npm install -g @openai/codex

# 验证 PATH
echo $PATH | grep npm
```

### 问题 2: API 密钥未识别

**解决方案**：
```bash
# 检查环境变量
echo $OPENAI_API_KEY

# 重新加载配置
source ~/.bashrc

# 或直接指定
OPENAI_API_KEY="your-key" codex "test"
```

### 问题 3: Cursor 无法连接到 WSL2

**解决方案**：
```bash
# 检查 WSL2 状态
wsl --status

# 重启 WSL2
wsl --shutdown
wsl

# 在 Cursor 中重新选择 WSL 终端
```

### 问题 4: 网络连接错误

**解决方案**：
```bash
# 测试 API 连接
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"

# 如果失败，配置代理
export HTTP_PROXY="http://proxy:port"
export HTTPS_PROXY="http://proxy:port"
```

---

## 🎓 学习资源

### Codex CLI 命令参考

```bash
# 基础命令
codex "question"              # 提问
codex generate "prompt"       # 生成代码
codex explain "code"          # 解释代码
codex review "code"           # 审查代码
codex refactor "code"         # 重构建议

# 高级选项
codex --model gpt-4 "query"   # 指定模型
codex --temp 0.8 "query"      # 设置温度
codex --max-tokens 1000       # 限制输出长度
codex --format json           # 指定输出格式
```

### Cursor 快捷键

- `` Ctrl + ` `` - 打开/关闭终端
- `Ctrl + Shift + P` - 命令面板
- `Ctrl + Shift + T` - 运行任务
- `F1` - 显示所有命令

---

## 🚀 快速启动检查清单

- [ ] WSL2 已安装 (`wsl --version`)
- [ ] Ubuntu 22.04 已安装 (`wsl --list`)
- [ ] Node.js 已安装 (`node --version`)
- [ ] Codex CLI 已安装 (`codex --version`)
- [ ] OpenAI API 密钥已配置 (`echo $OPENAI_API_KEY`)
- [ ] Cursor 默认终端设为 WSL2
- [ ] 测试 Codex 正常工作 (`codex "hello"`)

---

## 💡 最佳实践

1. **使用 WSL2 终端**：在 Cursor 中始终使用 WSL2 终端运行 Codex
2. **配置别名**：创建短命令别名提高效率（`cx`, `cxg` 等）
3. **版本控制**：将 Codex 配置加入 `.gitignore`（保护 API 密钥）
4. **安全管理**：使用环境变量而非硬编码 API 密钥
5. **性能优化**：对常用查询使用缓存机制
6. **团队协作**：共享 tasks.json 配置，但不包含 API 密钥

---

## 🎯 下一步

安装完成后，您可以：

1. ✅ 在 Cursor 终端中直接使用 `codex` 命令
2. ✅ 通过快捷键快速调用 Codex 功能
3. ✅ 集成到 Git 工作流中
4. ✅ 创建自定义脚本自动化任务

**立即开始**：
```bash
# 在 Cursor 中打开 WSL2 终端 (Ctrl + `)
# 然后运行
codex "帮我开始使用 Codex CLI"
```

🎉 **享受 AI 辅助编程的强大能力！**
