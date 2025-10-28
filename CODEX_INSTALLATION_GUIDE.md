# OpenAI Codex CLI 安装指南

## 📋 关于 Codex CLI

**Codex CLI** 是 OpenAI 推出的本地运行的 AI 编程助手，可以在您的计算机上直接运行。

### 🎯 主要特点
- ✅ **本地运行** - 在您的计算机上直接执行
- ✅ **集成 ChatGPT 账户** - 支持 Plus、Pro、Team、Enterprise 计划
- ✅ **命令行界面** - 强大的 TUI (文本用户界面)
- ✅ **自动化支持** - TypeScript SDK 和 GitHub Action
- ✅ **MCP 协议** - 支持 Model Context Protocol

### ⚠️ Windows 重要说明

**Codex CLI 在 Windows 上需要通过 WSL2 运行！**

根据官方文档：
```
Operating systems: macOS 12+, Ubuntu 20.04+/Debian 10+, or Windows 11 via WSL2
```

---

## 🚀 安装方法

### 方法 1: 通过 npm 安装（推荐）⭐

**适用于**：macOS、Linux、Windows (WSL2)

```bash
npm install -g @openai/codex
```

**验证安装**：
```bash
codex --version
```

---

### 方法 2: 通过 Homebrew 安装（仅 macOS）

```bash
brew install --cask codex
```

---

### 方法 3: 下载预编译二进制文件

访问：https://github.com/openai/codex/releases/latest

#### macOS
- Apple Silicon (M1/M2/M3): `codex-aarch64-apple-darwin.tar.gz`
- Intel x86_64: `codex-x86_64-apple-darwin.tar.gz`

#### Linux
- x86_64: `codex-x86_64-unknown-linux-musl.tar.gz`
- arm64: `codex-aarch64-unknown-linux-musl.tar.gz`

**安装步骤**：
```bash
# 下载并解压
tar -xzf codex-*.tar.gz

# 重命名（可选）
mv codex-* codex

# 移动到系统路径
sudo mv codex /usr/local/bin/

# 验证
codex --version
```

---

### 方法 4: 从源码编译

**前置要求**：
- Rust 工具链
- Git

```bash
# 克隆仓库（已完成）
cd codex-cli/codex-rs

# 安装 Rust（如果需要）
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
source "$HOME/.cargo/env"
rustup component add rustfmt
rustup component add clippy

# 编译
cargo build --release

# 安装到系统
sudo cp target/release/codex /usr/local/bin/

# 验证
codex --version
```

---

## 🪟 Windows 用户安装指南

### ⚠️ 重要：Windows 需要 WSL2

Codex CLI 在 Windows 上**必须**通过 WSL2 运行。

### 步骤 1: 安装 WSL2

**方法 A：一键安装（Windows 11/10 2004+）**

打开 PowerShell（管理员）：
```powershell
wsl --install
```

这会自动：
1. 启用 WSL 功能
2. 安装 Ubuntu（默认）
3. 设置 WSL2 为默认版本

**方法 B：手动安装**

1. 启用 WSL 功能：
```powershell
dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart
dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart
```

2. 下载并安装 WSL2 内核更新：
   - 访问：https://aka.ms/wsl2kernel
   - 下载并安装

3. 设置 WSL2 为默认：
```powershell
wsl --set-default-version 2
```

4. 从 Microsoft Store 安装 Linux 发行版：
   - 推荐：Ubuntu 22.04 LTS

### 步骤 2: 在 WSL2 中安装 Codex

启动 WSL2：
```bash
wsl
```

在 WSL2 Ubuntu 中安装 Node.js：
```bash
# 安装 Node.js 和 npm
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 验证安装
node --version
npm --version
```

安装 Codex CLI：
```bash
npm install -g @openai/codex
```

验证：
```bash
codex --version
```

---

## 🔐 配置认证

### 启动 Codex

```bash
codex
```

### 登录选项

**推荐：使用 ChatGPT 账户登录**

1. 运行 `codex`
2. 选择 **"Sign in with ChatGPT"**
3. 在浏览器中完成登录
4. 返回终端继续使用

**支持的计划**：
- ✅ ChatGPT Plus
- ✅ ChatGPT Pro
- ✅ ChatGPT Team
- ✅ ChatGPT Enterprise
- ✅ ChatGPT Edu

**替代方案：使用 API 密钥**

如果您有 OpenAI API 密钥：

```bash
# 设置环境变量
export OPENAI_API_KEY=sk-your-key-here

# 或在配置文件中设置
# ~/.codex/config.toml
```

详见：https://github.com/openai/codex/blob/main/docs/authentication.md

---

## 📖 使用示例

### 基本用法

```bash
# 启动交互式会话
codex

# 使用提示词直接运行
codex "explain this codebase to me"

# 执行特定任务
codex "refactor this file to use TypeScript"
codex "add error handling to main.js"
codex "write unit tests for utils.js"
```

### 高级用法

```bash
# 非交互模式
codex exec "analyze code quality"

# 指定配置文件
codex --config custom-config.toml

# 启用详细日志
codex --trace
```

---

## ⚙️ 配置

配置文件位置：`~/.codex/config.toml`

### 示例配置

```toml
# 默认模型
model = "gpt-4"

# 启用沙箱模式
[sandbox]
enabled = true

# MCP 服务器配置
[mcp_servers]
# 添加您的 MCP 服务器
```

完整配置选项：https://github.com/openai/codex/blob/main/docs/config.md

---

## 🎯 当前状态

### ✅ 已完成
- ✅ 克隆了 Codex 仓库到本地
- ✅ 仓库位置：`d:\chrome download\astrotemp-main (1)\astrotemp-main\codex-cli`

### ⚠️ 待完成（Windows 用户）

由于您在 Windows 环境：

1. **安装 WSL2**（如果还没有）
2. **在 WSL2 中安装 Node.js**
3. **在 WSL2 中安装 Codex CLI**

### ❌ 当前安装失败原因

尝试通过 npm 全局安装时遇到网络错误：
```
npm error code ECONNRESET
npm error network aborted
```

---

## 🛠️ 解决方案

### 方案 A：在 WSL2 中安装（推荐）⭐

1. **安装 WSL2**：
```powershell
# PowerShell（管理员）
wsl --install
```

2. **重启计算机**

3. **启动 WSL2**：
```bash
wsl
```

4. **在 WSL2 中安装**：
```bash
# 安装 Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装 Codex
npm install -g @openai/codex

# 运行
codex
```

---

### 方案 B：配置 npm 代理（如果有代理）

```bash
# 设置代理
npm config set proxy http://proxy.example.com:8080
npm config set https-proxy http://proxy.example.com:8080

# 重试安装
npm install -g @openai/codex
```

---

### 方案 C：使用淘宝镜像

```bash
# 设置镜像
npm config set registry https://registry.npmmirror.com

# 安装
npm install -g @openai/codex
```

---

## 📚 相关资源

### 官方文档
- **GitHub 仓库**：https://github.com/openai/codex
- **快速开始**：https://github.com/openai/codex/blob/main/docs/getting-started.md
- **配置文档**：https://github.com/openai/codex/blob/main/docs/config.md
- **认证文档**：https://github.com/openai/codex/blob/main/docs/authentication.md
- **FAQ**：https://github.com/openai/codex/blob/main/docs/faq.md

### 集成工具
- **VS Code 扩展**：https://developers.openai.com/codex/ide
- **GitHub Action**：https://github.com/openai/codex-action
- **TypeScript SDK**：https://github.com/openai/codex/tree/main/sdk/typescript

### 在线版本
- **Codex Web**：https://chatgpt.com/codex

---

## 💡 下一步建议

### 立即行动

1. **检查 WSL2 状态**：
```powershell
wsl --status
```

2. **如果没有 WSL2，安装它**：
```powershell
wsl --install
```

3. **在 WSL2 中安装 Codex**：
```bash
wsl
npm install -g @openai/codex
```

4. **登录并使用**：
```bash
codex
```

---

## 🆘 常见问题

### Q: 为什么 Windows 需要 WSL2？

**A:** Codex CLI 是用 Rust 编写的，主要为 Unix-like 系统优化。WSL2 提供了完整的 Linux 内核，确保最佳兼容性。

### Q: 可以在 Windows 原生运行吗？

**A:** 官方不支持 Windows 原生运行。必须使用 WSL2。

### Q: WSL2 性能如何？

**A:** WSL2 性能接近原生 Linux，文件系统访问速度快，资源占用低。

### Q: 需要 ChatGPT 订阅吗？

**A:** 推荐但不必需。也可以使用 OpenAI API 密钥（按使用量计费）。

### Q: 网络安装失败怎么办？

**A:**
1. 使用 WSL2（避免 Windows 网络问题）
2. 配置 npm 镜像
3. 下载预编译二进制文件

---

## 📝 总结

- ✅ **已克隆仓库**：`codex-cli` 目录
- ⚠️ **需要 WSL2**：Windows 用户必备
- 🚀 **推荐路径**：WSL2 + npm 安装
- 💡 **立即开始**：`wsl --install`

您想现在就安装 WSL2 并设置 Codex 吗？
