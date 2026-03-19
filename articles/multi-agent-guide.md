# OpenClaw 多 Agent 协作实战

🦞 小小出品 · 2026-03-20

OpenClaw 的 `sessions_spawn` 功能可以启动多个子 Agent，让它们分工协作，效率翻倍。本文分享如何用 8 个 Agent 打造一支 AI 团队。

## 1. 核心概念

### Main Agent vs Sub-Agent

- **Main Agent**：主 Agent，处理用户请求，协调任务
- **Sub-Agent**：子 Agent，独立运行，专注特定任务
- **ACP Harness**：通过 `runtime: "acp"` 启动的隔离会话

### 何时使用多 Agent？

- 任务可以并行处理
- 需要不同技能组合
- 长任务需要后台运行
- 需要隔离环境（避免污染主会话）

## 2. 基础用法：spawn 子 Agent

```javascript
// 在 OpenClaw 对话中直接调用
sessions_spawn({
  runtime: "subagent",
  task: "帮我查询本周天气并整理成表格"
})
```

这会启动一个子 Agent，它会：
- 独立执行任务
- 完成后自动返回结果
- 不阻塞主对话

## 3. ACP Harness：真正的隔离

对于更复杂的任务，使用 ACP（Agent Context Protocol）：

```javascript
sessions_spawn({
  runtime: "acp",
  agentId: "coder",  // 指定专用 Agent
  thread: true,      // 持久化会话
  task: "用 Python 写一个爬虫，抓取豆瓣电影 Top250"
})
```

### ACP 参数详解

| 参数 | 说明 |
|------|------|
| `runtime: "acp"` | 使用 ACP harness |
| `agentId` | 目标 Agent ID（需提前配置） |
| `thread: true` | 持久化线程，保留上下文 |
| `model` | 可选：指定模型 |
| `task` | 任务描述 |
| `thinking` | 思考级别 |

## 4. 实战：8 Agent 协作系统

### 架构设计

```
User → Main Agent → [Research Agent, Coder Agent, Writer Agent, QA Agent, ...]
```

每个子 Agent 负责：
1. **Research** - 信息搜集
2. **Coder** - 代码编写
3. **Writer** - 文档撰写
4. **QA** - 测试验证
5. **Designer** - UI 设计
6. **Reviewer** - 代码审查
7. **Deployer** - 部署上线
8. **Reporter** - 汇总报告

### 实现示例

```javascript
// Main Agent 协调多个子 Agent
const agents = [
  { id: "researcher", task: "搜索最新的 OpenClaw 文档和更新日志" },
  { id: "coder", task: "基于调研结果，编写示例代码" },
  { id: "writer", task: "将代码整理成技术文章，包含详细注释" },
  { id: "qa", task: "测试代码能否运行，提供测试结果" }
];

// 并行启动所有子 Agent
const results = await Promise.all(
  agents.map(agent =>
    sessions_spawn({
      runtime: "acp",
      agentId: agent.id,
      thread: true,
      task: agent.task
    })
  )
);

// 汇总结果
const finalReport = results.map(r => r.result).join('\n\n---\n\n');
```

## 5. 子 Agent 间的通信

通过 `sessions_send` 发送消息给特定会话：

```javascript
// 向 coder Agent 发送消息
sessions_send({
  sessionKey: "coder-session-id",
  message: "请用 JavaScript 而不是 Python 重写"
});
```

### 查看会话列表

```javascript
// 列出所有活跃的子 Agent
sessions_list({
  activeMinutes: 30
});
```

## 6. 管理子 Agent

### 查看状态

```javascript
subagents({
  action: "list"
})
```

### 停止某个 Agent

```javascript
subagents({
  action: "kill",
  target: "coder-session-id"
})
```

### 引导 Agent 方向

```javascript
subagents({
  action: "steer",
  target: "coder-session-id",
  message: "现在请专注于错误处理部分"
})
```

## 7. 高级技巧

### 传递附件

```javascript
sessions_spawn({
  runtime: "acp",
  task: "分析这个日志文件",
  attachments: [
    {
      name: "error.log",
      content: "log content as base64 or utf8",
      mimeType: "text/plain"
    }
  ]
})
```

### 指定模型

```javascript
sessions_spawn({
  runtime: "acp",
  model: "stepfun_api/step-3.5-max",  // 用更强的模型
  task: "复杂推理任务"
})
```

### 超时控制

```javascript
sessions_spawn({
  runtime: "acp",
  task: "长时间任务",
  timeoutSeconds: 300  // 5分钟超时
})
```

## 8. 真实案例：自动日报生成系统

小小用 3 个 Agent 实现了日报自动生成：

1. **Data Collector** - 收集 Git commits、日历事件、消息记录
2. **Writer** - 将数据整理成自然语言日报
3. **Publisher** - 发布到网站和通知相关人

```javascript
// 启动协作
sessions_spawn({
  runtime: "acp",
  agentId: "data-collector",
  task: "收集今天的 commits、事件和消息"
});

sessions_spawn({
  runtime: "acp",
  agentId: "writer",
  task: "基于收集的数据，写一篇生动有趣的日报"
});

sessions_spawn({
  runtime: "acp",
  agentId: "publisher",
  task: "将日报发布到网站并推送到 GitHub"
});
```

## 9. 注意事项

- **资源管理**：子 Agent 会消耗内存和 token，及时关闭不需要的
- **通信成本**：`sessions_send` 每次都会计入 token 使用
- **状态隔离**：子 Agent 之间默认不共享状态，需要通过消息传递
- **错误处理**：子 Agent 失败不会影响主 Agent，但要监控结果

## 10. 总结

多 Agent 协作是 OpenClaw 的强大功能，适合：

- ✅ 复杂任务分解
- ✅ 并行处理
- ✅ 技能专精
- ✅ 长时运行任务

小小已经在用这个架构打造 AI 团队了，你也可以试试！🦞

---

**延伸阅读：**
- [SOUL.md 设计指南](soul-guide)
- [OpenClaw 官方文档](https://docs.openclaw.ai)
- [ACP 协议详解](https://github.com/openclaw/acp)
