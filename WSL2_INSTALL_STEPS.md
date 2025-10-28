# WSL2 安装步骤指南

## 🎯 目标
在 Windows 上安装 WSL2 (Windows Subsystem for Linux 2) 以运行 OpenAI Codex CLI

---

## ⚠️ 重要提示

**以下所有命令必须在 PowerShell（管理员）中运行**

如何打开 PowerShell（管理员）：
1. 按 `Win + X` 键
2. 选择 **"Windows PowerShell (管理员)"** 或 **"终端(管理员)"**
3. 点击 "是" 允许权限

---

## 📋 方法一：一键安装（推荐）⭐

### 步骤 1: 打开 PowerShell（管理员）

### 步骤 2: 运行安装命令

```powershell
wsl --install
```

**这个命令会自动完成以下操作**：
1. ✅ 启用 WSL 功能
2. ✅ 启用虚拟机平台
3. ✅ 下载 WSL2 Linux 内核
4. ✅ 设置 WSL2 为默认版本
5. ✅ 安装 Ubuntu（默认发行版）

### 步骤 3: 重启计算机

**非常重要**：安装完成后**必须重启计算机**才能生效！

```powershell
# 重启命令（可选）
shutdown /r /t 0
```

### 步骤 4: 首次启动 Ubuntu

重启后，打开 PowerShell 或命令提示符：

```powershell
wsl
```

或者在开始菜单搜索 **"Ubuntu"** 并启动。

### 步骤 5: 设置 Ubuntu 用户

首次启动会要求创建用户：

```
Enter new UNIX username: your_username
New password: ********
Retype new password: ********
```

**注意**：
- 用户名建议使用小写字母
- 密码输入时不会显示任何字符（正常现象）

### 步骤 6: 验证安装

在 Ubuntu 中运行：

```bash
# 检查 WSL 版本
cat /etc/os-release

# 检查内核版本
uname -r
```

应该显示 Ubuntu 信息和 WSL2 内核。

---

## 📋 方法二：手动安装（如果一键安装失败）

### 步骤 1: 启用 WSL 功能

在 PowerShell（管理员）中运行：

```powershell
dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart
```

### 步骤 2: 启用虚拟机平台

```powershell
dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart
```

### 步骤 3: 重启计算机

```powershell
shutdown /r /t 0
```

### 步骤 4: 下载并安装 WSL2 内核更新包

**重启后**，下载内核更新：

访问：https://aka.ms/wsl2kernel

或直接下载：
https://wslstorestorage.blob.core.windows.net/wslblob/wsl_update_x64.msi

下载后双击安装。

### 步骤 5: 设置 WSL2 为默认版本

在 PowerShell（管理员）中：

```powershell
wsl --set-default-version 2
```

### 步骤 6: 安装 Ubuntu

**方法 A：通过命令行**

```powershell
wsl --install -d Ubuntu
```

**方法 B：通过 Microsoft Store**

1. 打开 Microsoft Store
2. 搜索 "Ubuntu"
3. 选择 "Ubuntu 22.04 LTS"（推荐）
4. 点击 "获取" 或 "安装"

### 步骤 7: 首次启动并设置用户

参考方法一的步骤 4-6

---

## 🔍 验证安装是否成功

### 在 PowerShell 中检查

```powershell
# 查看已安装的发行版
wsl --list --verbose

# 应该看到类似输出：
#   NAME      STATE           VERSION
# * Ubuntu    Running         2
```

**VERSION 必须是 2**（不是 1）！

### 检查 WSL 版本

```powershell
wsl --version
```

应该显示 WSL 版本信息。

### 进入 Ubuntu

```powershell
wsl
```

应该进入 Ubuntu 终端，提示符类似：
```
username@computername:~$
```

---

## 📦 安装 Node.js 和 Codex CLI

### 步骤 1: 进入 WSL2

```powershell
wsl
```

### 步骤 2: 更新包管理器

```bash
sudo apt update
sudo apt upgrade -y
```

### 步骤 3: 安装 Node.js 20.x

```bash
# 添加 NodeSource 仓库
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# 安装 Node.js 和 npm
sudo apt-get install -y nodejs

# 验证安装
node --version    # 应该显示 v20.x.x
npm --version     # 应该显示 10.x.x
```

### 步骤 4: 安装 Codex CLI

```bash
npm install -g @openai/codex
```

### 步骤 5: 验证 Codex 安装

```bash
codex --version
```

### 步骤 6: 启动 Codex

```bash
codex
```

首次运行会提示登录。选择 **"Sign in with ChatGPT"**。

---

## 🛠️ 常见问题解决

### 问题 1: "WSL 2 需要更新其内核组件"

**解决方案**：
1. 下载并安装：https://aka.ms/wsl2kernel
2. 重新运行 `wsl --install`

### 问题 2: "请启用虚拟机平台 Windows 功能并确保在 BIOS 中启用虚拟化"

**解决方案**：
1. 确保在 BIOS 中启用了虚拟化（VT-x/AMD-V）
2. 运行启用命令：
```powershell
dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart
```
3. 重启计算机

### 问题 3: WSL 版本是 1 而不是 2

**解决方案**：
```powershell
# 将现有发行版升级到 WSL2
wsl --set-version Ubuntu 2

# 或设置默认版本为 2
wsl --set-default-version 2
```

### 问题 4: 无法连接网络

**解决方案**：
```bash
# 在 WSL2 中重启网络
sudo service networking restart

# 或在 PowerShell 中重启 WSL
wsl --shutdown
wsl
```

### 问题 5: "wsl: 检测到 localhost 代理配置，但未镜像到 WSL"

**解决方案**：
在 WSL2 中配置代理（如果需要）：
```bash
# 编辑 .bashrc
nano ~/.bashrc

# 添加以下行（如果有代理）
export http_proxy=http://proxy.example.com:port
export https_proxy=http://proxy.example.com:port

# 保存并生效
source ~/.bashrc
```

---

## 🎯 快速命令参考

### PowerShell（管理员）命令

```powershell
# 安装 WSL2
wsl --install

# 查看可用的 Linux 发行版
wsl --list --online

# 安装特定发行版
wsl --install -d Ubuntu

# 查看已安装的发行版
wsl --list --verbose

# 启动 WSL
wsl

# 关闭 WSL
wsl --shutdown

# 卸载发行版
wsl --unregister Ubuntu
```

### WSL2 Ubuntu 中的命令

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装 Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装 Codex CLI
npm install -g @openai/codex

# 启动 Codex
codex

# 退出 WSL 返回 Windows
exit
```

---

## 📊 安装进度检查清单

### 在 PowerShell（管理员）中

- [ ] 运行 `wsl --install`
- [ ] 重启计算机
- [ ] 运行 `wsl --list --verbose` 确认 VERSION 为 2
- [ ] 运行 `wsl` 成功进入 Ubuntu

### 在 WSL2 Ubuntu 中

- [ ] 运行 `sudo apt update` 成功
- [ ] 安装 Node.js: `node --version` 显示 v20.x.x
- [ ] 安装 Codex: `codex --version` 显示版本号
- [ ] 启动 Codex: `codex` 显示登录界面

---

## 🎊 完成后

安装成功后，您可以：

### 从 Windows 访问 WSL 文件

在文件资源管理器地址栏输入：
```
\\wsl$\Ubuntu\home\your_username
```

### 从 WSL 访问 Windows 文件

Windows 驱动器挂载在 `/mnt/` 下：
```bash
cd /mnt/c/Users/YourName/Desktop
```

### 在 VS Code 中使用 WSL

1. 安装 VS Code 扩展：**Remote - WSL**
2. 在 WSL 中运行：`code .`
3. VS Code 会在 WSL 模式下打开

---

## 📞 需要帮助？

如果遇到问题：

1. **查看官方文档**：https://docs.microsoft.com/zh-cn/windows/wsl/install
2. **WSL 疑难解答**：https://docs.microsoft.com/zh-cn/windows/wsl/troubleshooting
3. **社区支持**：https://github.com/microsoft/WSL/issues

---

## 🚀 准备就绪！

完成以上步骤后，您将拥有：

✅ 功能完整的 WSL2 环境
✅ Ubuntu 22.04 LTS
✅ Node.js 20.x 和 npm
✅ OpenAI Codex CLI

可以开始使用 Codex 进行 AI 辅助编程了！

---

## 💡 下一步

**立即开始**：

1. 打开 PowerShell（管理员）
2. 运行：`wsl --install`
3. 重启计算机
4. 按照本指南继续操作

祝您使用愉快！🎉
