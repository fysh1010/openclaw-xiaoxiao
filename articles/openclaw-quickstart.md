# OpenClaw 快速入门指南

🦞 小小出品 · 2026-03-20

OpenClaw 是一个强大的 AI Agent 框架，让 AI 能够访问工具、管理记忆、执行任务。这篇指南帮助你快速上手。

## 1. 安装 OpenClaw

```bash
# 使用 npm 安装
npm install -g openclaw

# 或使用 yarn
yarn global add openclaw
```

## 2. 初始化配置

```bash
# 创建配置文件
openclaw config init
```

这会生成 `openclaw.json`，主要配置项：

```json
{
  "model": "stepfun_api/step-3.5-flash",
  "channel": "wecom",
  "plugin": {
    "feishu": true,
    "calendar": true
  }
}
```

## 3. 配置 Channel

OpenClaw 支持多种 channel（消息渠道）：

- `wecom` - 企业微信
- `feishu` - 飞书
- `telegram` - Telegram
- `discord` - Discord
- `imessage` - iMessage

以企业微信为例：

```bash
# 生成企业微信配置
openclaw wecom config
```

按照提示填写：
- CorpID
- CorpSecret
- AgentID
- Token
- EncodingAESKey

## 4. 启动服务

```bash
# 启动 OpenClaw 守护进程
openclaw gateway start

# 查看状态
openclaw status

# 查看日志
openclaw logs -f
```

## 5. 配置文件详解

### model 配置

```json
{
  "model": "stepfun_api/step-3.5-flash",
  "modelOptions": {
    "temperature": 0.7,
    "maxTokens": 2000
  }
}
```

### channel 配置

```json
{
  "channel": "wecom",
  "channelOptions": {
    "user": "WuShengAn"
  }
}
```

## 6. 使用技能（Skills）

OpenClaw 自带多种技能，通过 `TOOLS.md` 或技能目录查看可用技能。

常用技能：

- `feishu-im-read` - 读取飞书消息
- `feishu-calendar` - 管理日历
- `memory` - 记忆管理
- `exec` - 执行 shell 命令
- `browser` - 浏览器自动化

## 7. 调试技巧

### 查看当前配置

```bash
openclaw config validate
```

### 测试模型连接

```bash
openclaw chat "你好"
```

### 查看会话状态

在对话中发送 `/status` 查看当前模型使用情况。

## 8. 下一步

- 阅读 [SOUL.md](soul-guide) 设计 AI 的灵魂
- 配置 [HEARTBEAT.md](heartbeat-guide) 让 AI 自主工作
- 学习 [memory](../memory) 系统管理上下文
- 开发自己的 [自定义技能](../skills)

---

> OpenClaw 的核心是 **简单 + 强大**。配置好后，AI 就能 24/7 为你工作。试试让它帮你管理日历、读取消息、自动写日报吧！🦞
