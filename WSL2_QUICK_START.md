# WSL2 快速安装指南

## 🚀 一键安装（最简单）

### 步骤 1: 打开 PowerShell（管理员）

按以下任一方式：

**方法 A**：
1. 按 `Win + X` 键
2. 选择 **"终端(管理员)"** 或 **"Windows PowerShell (管理员)"**

**方法 B**：
1. 按 `Win + S` 搜索 "PowerShell"
2. 右键点击 **"Windows PowerShell"**
3. 选择 **"以管理员身份运行"**

### 步骤 2: 运行安装命令

在 PowerShell 中复制粘贴以下命令并按回车：

```powershell
wsl --install -d Ubuntu-22.04
```

### 步骤 3: 等待下载和安装

您会看到类似输出：
```
正在下载：适用于 Linux 的 Windows 子系统
正在下载：Ubuntu 22.04 LTS
```

**这个过程可能需要 5-15 分钟**，取决于网络速度。

### 步骤 4: 重启计算机

安装完成后，运行：

```powershell
shutdown /r /t 0
```

或手动重启计算机。

### 步骤 5: 重启后首次设置

重启后，打开开始菜单搜索 **"Ubuntu"** 或打开 PowerShell 运行 `wsl`。

首次启动会要求创建用户：

```
Enter new UNIX username: 输入您的用户名（建议小写）
New password: 输入密码（不会显示）
Retype new password: 再次输入密码
```

**完成！** Ubuntu 22.04 已安装并运行在 WSL2 上。

---

## 📦 安装 Node.js 和 Codex

### 在 WSL2 Ubuntu 终端中运行：

```bash
# 1. 更新包管理器
sudo apt update && sudo apt upgrade -y

# 2. 安装 Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. 验证安装
node --version
npm --version

# 4. 安装 Codex CLI
npm install -g @openai/codex

# 5. 启动 Codex
codex
```

---

## ✅ 验证安装成功

### 在 PowerShell 中检查

```powershell
# 查看已安装的发行版
wsl --list --verbose
```

应该看到：
```
  NAME            STATE           VERSION
* Ubuntu-22.04    Running         2
```

**VERSION 必须是 2！**

---

## 🎯 常用命令

### 启动 WSL

```powershell
wsl
```

### 退出 WSL 回到 Windows

```bash
exit
```

### 关闭 WSL

```powershell
wsl --shutdown
```

### 从 Windows 访问 WSL 文件

在文件资源管理器输入：
```
\\wsl$\Ubuntu-22.04\home\your_username
```

---

## 🆘 如果遇到问题

### 错误："需要启用虚拟机平台"

**解决方案**：

```powershell
# 在 PowerShell（管理员）中运行
dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart
dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart

# 重启
shutdown /r /t 0
```

### 错误："WSL 2 需要更新其内核组件"

**解决方案**：

下载并安装：https://aka.ms/wsl2kernel

### 网络问题无法下载

**解决方案 A**：使用镜像源

在中国大陆可以使用镜像：
```powershell
# 设置环境变量使用国内镜像
$env:WSL_UTF8=1
wsl --install -d Ubuntu-22.04
```

**解决方案 B**：手动下载

1. 访问 Microsoft Store
2. 搜索 "Ubuntu 22.04"
3. 点击 "获取" 安装

---

## 📋 完整命令列表

### PowerShell（管理员）命令

```powershell
# 一键安装 WSL2 + Ubuntu 22.04
wsl --install -d Ubuntu-22.04

# 查看可安装的发行版
wsl --list --online

# 查看已安装的发行版
wsl --list --verbose

# 启动默认发行版
wsl

# 启动特定发行版
wsl -d Ubuntu-22.04

# 关闭 WSL
wsl --shutdown

# 设置默认发行版
wsl --set-default Ubuntu-22.04

# 卸载发行版（小心使用！）
wsl --unregister Ubuntu-22.04
```

### WSL Ubuntu 命令

```bash
# 安装 Codex 完整流程
sudo apt update
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
npm install -g @openai/codex
codex
```

---

## 🎊 安装成功后

您现在拥有：
- ✅ WSL2 运行环境
- ✅ Ubuntu 22.04 LTS
- ✅ 完整的 Linux 开发环境

可以在 Windows 上运行 Linux 工具和 Codex CLI 了！

---

## 💡 提示

### VS Code 集成

安装 VS Code 扩展 **"Remote - WSL"**，然后在 WSL 中运行：
```bash
code .
```

### Windows Terminal 美化

建议安装 **Windows Terminal**（Microsoft Store），获得更好的终端体验。

### 性能优化

WSL2 文件系统速度：
- Linux 文件系统（/home/）: ⚡ 超快
- Windows 文件系统（/mnt/c/）: 🐌 较慢

**建议**：将项目放在 Linux 文件系统中获得最佳性能。

---

需要完整的详细文档，请查看：**WSL2_INSTALL_STEPS.md**
