# Cursor + Codex CLI 快速启动指南 ⚡

## 🎯 5 分钟快速安装

### 方法 1: 自动安装（推荐）⭐

**1. 以管理员身份打开 PowerShell**

右键点击 PowerShell → "以管理员身份运行"

**2. 运行自动安装脚本**

```powershell
cd "d:\chrome download\astrotemp-main (1)\astrotemp-main"
.\install-codex-for-cursor.ps1
```

**3. 等待安装完成并重启**（如果需要）

**4. 重启后，设置 OpenAI API 密钥**

在 Cursor 中打开终端（`` Ctrl + ` ``），选择 "Ubuntu (WSL)"：

```bash
export OPENAI_API_KEY='sk-your-api-key-here'
echo 'export OPENAI_API_KEY="sk-your-api-key-here"' >> ~/.bashrc
```

**5. 测试**

```bash
codex "Hello, Codex!"
```

✅ **完成！**

---

### 方法 2: 手动安装

#### 步骤 1: 安装 WSL2 + Ubuntu

**PowerShell（管理员）**：
```powershell
wsl --install -d Ubuntu-22.04
```

**重启计算机**：
```powershell
shutdown /r /t 0
```

#### 步骤 2: 设置 Ubuntu

重启后，打开 "Ubuntu" 应用（从开始菜单）

创建用户：
```
Username: your_username
Password: ********
```

#### 步骤 3: 安装 Node.js 和 Codex

**在 Ubuntu 中运行**：
```bash
# 安装 Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装 Codex CLI
npm install -g @openai/codex

# 验证
codex --version
```

#### 步骤 4: 配置 API 密钥

```bash
export OPENAI_API_KEY='sk-your-api-key-here'
echo 'export OPENAI_API_KEY="sk-your-api-key-here"' >> ~/.bashrc
```

获取 API 密钥：https://platform.openai.com/api-keys

#### 步骤 5: 在 Cursor 中使用

1. 打开 Cursor
2. 按 `` Ctrl + ` `` 打开终端
3. 选择 "Ubuntu (WSL)" 作为终端配置
4. 直接使用 `codex` 命令

---

## 🚀 快速使用

### 在 Cursor 终端中

```bash
# 交互模式
codex

# 提问
codex "如何在 TypeScript 中使用泛型？"

# 生成代码
codex generate "创建一个 React 计数器组件"

# 解释代码
codex explain "const [count, setCount] = useState(0);"

# 代码审查
codex review "$(cat src/App.tsx)"
```

### 使用 Cursor 任务（快捷方式）

1. 按 `Ctrl + Shift + P`
2. 输入 "Tasks: Run Task"
3. 选择：
   - **Codex: Interactive Mode** - 交互式对话
   - **Codex: Ask Question** - 快速提问
   - **Codex: Generate Code** - 生成代码

---

## 🛠️ 常用命令别名

在 WSL Ubuntu 中添加快捷命令：

```bash
# 编辑 .bashrc
nano ~/.bashrc

# 添加以下内容
alias cx='codex'
alias cxg='codex generate'
alias cxr='codex review'
alias cxe='codex explain'

# 保存后重新加载
source ~/.bashrc
```

现在可以使用：
```bash
cx "问题"
cxg "生成一个函数"
cxr "$(cat file.js)"
cxe "代码片段"
```

---

## 📊 实用场景

### 场景 1: 快速学习

```bash
codex "解释 React useEffect 的工作原理"
codex "JavaScript 闭包是什么？给个例子"
codex "TypeScript 的 type 和 interface 有什么区别？"
```

### 场景 2: 代码生成

```bash
codex generate "创建一个防抖函数"
codex generate "写一个二分查找算法"
codex generate "创建一个带表单验证的登录组件"
```

### 场景 3: 代码审查

```bash
# 审查当前文件
codex review "$(cat src/utils/helper.ts)"

# 审查 Git 变更
codex review "$(git diff)"

# 审查特定提交
codex review "$(git show HEAD)"
```

### 场景 4: 调试帮助

```bash
codex "为什么这段代码报错：const x: number = 'hello';"
codex "如何修复 'Cannot read property of undefined' 错误？"
codex debug "$(cat error.log)"
```

### 场景 5: 重构建议

```bash
codex refactor "$(cat legacy-code.js)"
codex "将这个类组件转换为函数组件: $(cat OldComponent.jsx)"
codex "优化这个函数的性能: $(cat slow-function.ts)"
```

---

## 🔧 Cursor 集成技巧

### 设置默认 WSL 终端

1. `Ctrl + ,` 打开设置
2. 搜索 "terminal default profile"
3. 选择 "Ubuntu (WSL)"

或编辑 `.vscode/settings.json`：
```json
{
  "terminal.integrated.defaultProfile.windows": "Ubuntu (WSL)"
}
```

### 创建快捷键

编辑 `.vscode/keybindings.json`：
```json
[
  {
    "key": "ctrl+shift+c ctrl+shift+i",
    "command": "workbench.action.tasks.runTask",
    "args": "Codex: Interactive Mode"
  }
]
```

### 添加到右键菜单

编辑 `.vscode/tasks.json`（已通过安装脚本创建）：
```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Codex: Explain Selected",
      "type": "shell",
      "command": "wsl",
      "args": ["bash", "-c", "codex explain '${selectedText}'"]
    }
  ]
}
```

---

## 🐛 故障排除

### 问题 1: `codex: command not found`

**解决**：
```bash
# 检查安装
npm list -g @openai/codex

# 如果未安装
npm install -g @openai/codex

# 如果网络错误，使用镜像
npm config set registry https://registry.npmmirror.com
npm install -g @openai/codex
npm config set registry https://registry.npmjs.org
```

### 问题 2: API 密钥错误

**解决**：
```bash
# 检查环境变量
echo $OPENAI_API_KEY

# 重新设置
export OPENAI_API_KEY='sk-your-key'
echo 'export OPENAI_API_KEY="sk-your-key"' >> ~/.bashrc
source ~/.bashrc
```

### 问题 3: Cursor 终端找不到 WSL

**解决**：
```bash
# 检查 WSL 状态
wsl --status

# 重启 WSL
wsl --shutdown
wsl
```

### 问题 4: 网络连接失败

**解决**：
```bash
# 测试 API 连接
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"

# 如果失败，检查代理设置
echo $HTTP_PROXY
echo $HTTPS_PROXY
```

---

## 📚 更多资源

- **完整文档**: [CURSOR_CODEX_INTEGRATION.md](CURSOR_CODEX_INTEGRATION.md)
- **网络问题**: [NPM_NETWORK_FIX.md](NPM_NETWORK_FIX.md)
- **WSL2 安装**: [WSL2_QUICK_START.md](WSL2_QUICK_START.md)
- **OpenAI API**: https://platform.openai.com/docs
- **Codex GitHub**: https://github.com/openai/codex

---

## ✅ 安装检查清单

- [ ] WSL2 已安装 (`wsl --version`)
- [ ] Ubuntu 已安装 (`wsl --list`)
- [ ] Node.js 已安装 (`node --version` in WSL)
- [ ] Codex CLI 已安装 (`codex --version` in WSL)
- [ ] API 密钥已配置 (`echo $OPENAI_API_KEY`)
- [ ] Cursor 终端设为 WSL
- [ ] 测试成功 (`codex "test"`)

---

## 🎉 开始使用

现在您可以在 Cursor IDE 中享受 AI 辅助编程了！

**立即尝试**：
1. 在 Cursor 中按 `` Ctrl + ` `` 打开终端
2. 确保选择 "Ubuntu (WSL)"
3. 运行：`codex "帮我开始使用 Codex CLI"`

**祝编程愉快！** 🚀
