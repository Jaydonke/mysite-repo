# 修复 Codex 401 Unauthorized 错误

## 🔴 错误信息

```
exceeded retry limit, last status: 401 Unauthorized
```

---

## 🔍 原因分析

401 Unauthorized 错误表示 OpenAI API 密钥验证失败，可能的原因：

### 1. **API 密钥已过期或被撤销** ⭐ 最常见
   - OpenAI 项目密钥（`sk-proj-*`）可能有时间限制
   - 密钥可能已被删除或禁用

### 2. **API 密钥格式错误**
   - 密钥被截断或包含多余空格
   - 复制粘贴时出现问题

### 3. **权限不足**
   - 密钥没有访问所需 API 的权限
   - 组织设置限制了密钥使用

### 4. **账户问题**
   - OpenAI 账户余额不足
   - 账户被暂停或限制

---

## ✅ 解决方案

### 方案 1: 生成新的 API 密钥（推荐）⭐

#### 步骤 1: 访问 OpenAI 平台

打开浏览器访问：
```
https://platform.openai.com/api-keys
```

登录您的 OpenAI 账户

#### 步骤 2: 撤销旧密钥并创建新密钥

1. **找到旧密钥**（名称可能包含日期或项目名）
2. **点击 "Revoke"** 撤销旧密钥
3. **点击 "+ Create new secret key"**
4. **命名密钥**（例如：`Codex-CLI-2024`）
5. **选择权限**：
   - 如果可选，选择 **"All"** 或至少包含 **"Model capabilities"**
6. **复制密钥**：
   ```
   sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```
   ⚠️ **重要**：密钥只显示一次，务必立即复制！

#### 步骤 3: 更新项目 .env 文件

打开您的 `.env` 文件并替换旧密钥：

```bash
# 旧密钥（删除）
# OPENAI_API_KEY=sk-proj-NkWmUjg0VnZ1aWV0...

# 新密钥（替换）
OPENAI_API_KEY=sk-proj-YOUR_NEW_KEY_HERE
```

#### 步骤 4: 更新 WSL2 中的配置

**在 Cursor 的 WSL 终端中运行**（`` Ctrl + ` ``）：

```bash
# 方法 A: 更新 auth.json
mkdir -p ~/.codex
cat > ~/.codex/auth.json << 'EOF'
{
    "OPENAI_API_KEY": "sk-proj-YOUR_NEW_KEY_HERE"
}
EOF

# 方法 B: 更新 .bashrc 环境变量
# 先删除旧的
sed -i '/OPENAI_API_KEY/d' ~/.bashrc

# 添加新的
echo 'export OPENAI_API_KEY="sk-proj-YOUR_NEW_KEY_HERE"' >> ~/.bashrc

# 重新加载配置
source ~/.bashrc

# 验证
echo $OPENAI_API_KEY
cat ~/.codex/auth.json
```

#### 步骤 5: 测试新密钥

```bash
# 测试 Codex
codex "Hello, test new API key"

# 如果成功，应该看到 Codex 的响应
```

---

### 方案 2: 检查 API 密钥格式

#### 检查密钥是否完整

正确的项目密钥格式：
```
sk-proj-[一长串字符，通常 100+ 字符]
```

您当前的密钥：
```
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
```

长度：**约 139 字符** ✅ 格式看起来正确

#### 检查是否有隐藏字符

```bash
# 在 WSL 中检查
cat ~/.codex/auth.json | od -c
# 查看是否有额外的空格、换行符等
```

---

### 方案 3: 使用用户密钥替代项目密钥

项目密钥（`sk-proj-*`）有时会有限制。您可以尝试使用用户密钥：

#### 在 OpenAI 平台创建用户密钥

1. 访问：https://platform.openai.com/api-keys
2. 点击 "+ Create new secret key"
3. **不要选择项目**，创建用户级密钥
4. 复制以 `sk-` 开头的密钥（而非 `sk-proj-`）

用户密钥格式：
```
sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

### 方案 4: 检查账户状态

#### 检查余额

访问：https://platform.openai.com/usage

确认：
- ✅ 账户有可用余额
- ✅ 没有超出使用限制
- ✅ 付款方式有效

#### 检查配额

访问：https://platform.openai.com/account/limits

确认：
- ✅ API 配额未用尽
- ✅ 速率限制正常

---

### 方案 5: 测试 API 密钥有效性

#### 使用 curl 直接测试

**在 WSL 终端中**：

```bash
# 设置 API 密钥（替换为您的密钥）
export OPENAI_API_KEY="sk-proj-YOUR_KEY"

# 测试 API 连接
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json"
```

**预期结果**：

✅ **成功**（密钥有效）：
```json
{
  "object": "list",
  "data": [
    {
      "id": "gpt-4",
      ...
    }
  ]
}
```

❌ **失败**（密钥无效）：
```json
{
  "error": {
    "message": "Incorrect API key provided...",
    "type": "invalid_request_error",
    "code": "invalid_api_key"
  }
}
```

---

### 方案 6: 重新配置 Codex

如果更新密钥后仍有问题，完全清除并重新配置：

```bash
# 删除旧配置
rm -rf ~/.codex
rm -f ~/.config/codex/*

# 重新创建配置
mkdir -p ~/.codex
cat > ~/.codex/auth.json << 'EOF'
{
    "OPENAI_API_KEY": "sk-proj-YOUR_NEW_KEY"
}
EOF

# 重新安装 Codex CLI（可选）
npm uninstall -g @openai/codex
npm install -g @openai/codex

# 测试
codex --version
codex "test"
```

---

## 🔧 快速修复脚本

我为您创建了一个自动化修复脚本：

```bash
#!/bin/bash
# fix-codex-401.sh

echo "========================================="
echo "  修复 Codex 401 错误"
echo "========================================="
echo ""

# 提示输入新的 API 密钥
echo "请输入您的新 OpenAI API 密钥："
echo "(从 https://platform.openai.com/api-keys 获取)"
read -p "API Key: " NEW_API_KEY

if [ -z "$NEW_API_KEY" ]; then
    echo "❌ 未输入 API 密钥"
    exit 1
fi

echo ""
echo "更新配置..."

# 更新 auth.json
mkdir -p ~/.codex
cat > ~/.codex/auth.json << EOF
{
    "OPENAI_API_KEY": "$NEW_API_KEY"
}
EOF

echo "✅ 更新 ~/.codex/auth.json"

# 更新 .bashrc
sed -i '/OPENAI_API_KEY/d' ~/.bashrc
echo "export OPENAI_API_KEY=\"$NEW_API_KEY\"" >> ~/.bashrc
source ~/.bashrc

echo "✅ 更新 ~/.bashrc"

# 测试 API 密钥
echo ""
echo "测试 API 密钥..."

RESPONSE=$(curl -s -w "%{http_code}" -o /tmp/api_test.json \
    https://api.openai.com/v1/models \
    -H "Authorization: Bearer $NEW_API_KEY")

if [ "$RESPONSE" = "200" ]; then
    echo "✅ API 密钥有效！"
    echo ""
    echo "测试 Codex..."
    codex "Hello, Codex!"
else
    echo "❌ API 密钥无效（HTTP $RESPONSE）"
    echo "错误详情："
    cat /tmp/api_test.json
    exit 1
fi

echo ""
echo "========================================="
echo "  ✅ 修复完成！"
echo "========================================="
```

**使用方法**：

```bash
# 保存脚本
cat > fix-codex-401.sh << 'SCRIPT_END'
[上面的脚本内容]
SCRIPT_END

# 赋予执行权限
chmod +x fix-codex-401.sh

# 运行
./fix-codex-401.sh
```

---

## 📊 问题诊断流程

```
401 Unauthorized 错误
    ↓
检查 API 密钥是否过期
    ↓
    ├─ 是 → 生成新密钥 → 更新配置 → 测试
    └─ 否 → 检查账户余额
             ↓
             ├─ 余额不足 → 充值
             └─ 余额充足 → 检查权限设置
                           ↓
                           └─ 创建新的用户级密钥
```

---

## ✅ 推荐操作（最简单）

1. **访问** https://platform.openai.com/api-keys
2. **创建新密钥**（点击 "+ Create new secret key"）
3. **复制密钥**
4. **在 Cursor WSL 终端运行**：

```bash
# 一键更新
export NEW_KEY="sk-proj-YOUR_NEW_KEY_HERE"

mkdir -p ~/.codex
cat > ~/.codex/auth.json << EOF
{
    "OPENAI_API_KEY": "$NEW_KEY"
}
EOF

sed -i '/OPENAI_API_KEY/d' ~/.bashrc
echo "export OPENAI_API_KEY=\"$NEW_KEY\"" >> ~/.bashrc
source ~/.bashrc

# 测试
codex "Hello, new API key!"
```

5. **同时更新 Windows 项目的 .env 文件**

---

## 🆘 仍然无法解决？

### 检查项清单

- [ ] 生成了新的 API 密钥
- [ ] 密钥已复制完整（无空格、无截断）
- [ ] 更新了 `~/.codex/auth.json`
- [ ] 更新了 `~/.bashrc`
- [ ] 运行了 `source ~/.bashrc`
- [ ] 更新了项目 `.env` 文件
- [ ] OpenAI 账户有余额
- [ ] curl 测试通过
- [ ] 重启了 WSL 终端

### 替代方案

如果 Codex CLI 持续有问题，您可以：

1. **使用 OpenAI SDK 直接调用**
   ```bash
   npm install openai
   ```

2. **使用 Cursor 内置的 AI 功能**
   - Cursor 已经集成了 AI 编程助手
   - 可能不需要单独的 Codex CLI

3. **使用 GitHub Copilot**
   - 类似的 AI 编程助手
   - 可能更稳定

---

## 📞 联系支持

如果问题持续存在：

- **OpenAI 支持**：https://help.openai.com/
- **查看状态**：https://status.openai.com/
- **社区论坛**：https://community.openai.com/

---

**建议：立即生成新的 API 密钥，这是解决 401 错误最快的方法！** 🔑
