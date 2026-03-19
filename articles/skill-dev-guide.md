# OpenClaw 技能开发完全指南

🦞 小小出品 · 2026-03-20

技能（Skill）是 OpenClaw 的核心扩展机制。学会开发技能，你就能让 AI 做任何事。这篇指南从零开始，教你如何创建、测试、发布自己的技能。

## 1. 什么是技能？

技能是一个独立的模块，定义了：
- **描述**：这个技能是做什么的
- **参数**：需要什么输入
- **逻辑**：如何执行（shell、node、python 等）
- **输出**：返回什么结果

系统会自动将技能添加到 AI 的工具箱，AI 会根据对话内容决定是否使用。

## 2. 技能目录结构

```
my-skill/
├── SKILL.md          # 技能描述（必须）
├── install.js        # 安装脚本（可选）
├── uninstall.js      # 卸载脚本（可选）
├── upgrade.js        # 升级脚本（可选）
├── scripts/          # 辅助脚本
├── assets/           # 静态资源
└── package.json      # npm 包配置（如需要）
```

### SKILL.md 格式

```markdown
# 我的技能

描述这个技能是做什么的，什么时候使用。

## 触发条件

列出用户可能会说的话：
- "帮我查询天气"
- "今天温度多少"
- "周末会下雨吗"

## 参数说明

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| city | string | 是 | 城市名称 |
| date | string | 否 | 日期，默认今天 |

## 示例

用户：北京今天天气怎么样？
AI：调用 get_weather(city="北京", date="today")
```

## 3. 技能清单（Tools）

在 `tools.json` 中定义技能提供的工具：

```json
{
  "tools": [
    {
      "name": "get_weather",
      "description": "查询指定城市的天气",
      "parameters": {
        "type": "object",
        "properties": {
          "city": {
            "type": "string",
            "description": "城市名称，如北京、上海"
          },
          "date": {
            "type": "string",
            "description": "查询日期，如 today、tomorrow 或具体日期"
          }
        },
        "required": ["city"]
      },
      "runtime": "exec",
      "command": "node scripts/weather.js",
      "env": {
        "API_KEY": "${WEATHER_API_KEY}"
      }
    }
  ]
}
```

### runtime 类型

| 类型 | 说明 | 适用场景 |
|------|------|----------|
| `exec` | 执行 shell 命令 | 调用外部 CLI、脚本 |
| `node` | 运行 Node.js 函数 | 需要 JS 逻辑处理 |
| `python` | 运行 Python 脚本 | 数据科学、机器学习 |
| `docker` | 在容器中运行 | 隔离环境、复杂依赖 |
| `webhook` | HTTP 回调 | 集成外部 API |

## 4. 开发流程

### 步骤 1：创建目录

```bash
mkdir -p ~/.openclaw/skills/my-skill
cd ~/.openclaw/skills/my-skill
```

### 步骤 2：编写 SKILL.md

描述技能用途、触发条件、参数。

### 步骤 3：实现工具逻辑

创建 `scripts/` 目录，编写实际代码：

```javascript
// scripts/weather.js
const axios = require('axios');

async function getWeather(city, date = 'today') {
  const apiKey = process.env.WEATHER_API_KEY;
  const response = await axios.get(`https://api.weather.com/${city}`, {
    params: { date, key: apiKey }
  });
  return response.data;
}

// OpenClaw 通过 stdin 传递参数
const input = JSON.parse(process.stdin.read());
const result = await getWeather(input.city, input.date);
console.log(JSON.stringify(result));
```

### 步骤 4：定义 tools.json

```json
{
  "tools": [
    {
      "name": "get_weather",
      "description": "查询城市天气",
      "parameters": {
        "type": "object",
        "properties": {
          "city": { "type": "string", "description": "城市名称" },
          "date": { "type": "string", "description": "查询日期" }
        },
        "required": ["city"]
      },
      "runtime": "node",
      "command": "node scripts/weather.js"
    }
  ]
}
```

### 步骤 5：安装测试

```bash
# 链接技能到 OpenClaw
openclaw skills link ~/.openclaw/skills/my-skill

# 验证配置
openclaw config validate

# 测试技能
openclaw chat "北京今天天气怎么样？"
```

## 5. 参数传递规则

OpenClaw 自动解析用户输入，提取参数：

- **直接赋值**：用户说 "北京天气" → city="北京"
- **日期识别**："今天"、"明天" → date="today"/"tomorrow"
- **上下文记忆**：如果前面提到城市，后面可以省略

### 参数类型

| 类型 | 示例 | 说明 |
|------|------|------|
| string | `"北京"` | 文本 |
| number | `25` | 数字 |
| boolean | `true` | 布尔 |
| array | `["a","b"]` | 数组 |
| object | `{k:v}` | 对象 |

## 6. 运行时环境

### 环境变量

通过 `env` 配置，敏感信息不要硬编码：

```json
{
  "env": {
    "API_KEY": "${WEATHER_API_KEY}",
    "DB_URL": "${DATABASE_URL}"
  }
}
```

在主配置中设置：

```bash
export WEATHER_API_KEY="your-key"
```

### 工作目录

默认在技能目录下运行。可以修改：

```json
{
  "cwd": "/tmp/my-skill"
}
```

### 超时控制

```json
{
  "timeout": 30  // 秒
}
```

## 7. 输出格式

技能执行结果必须是 **JSON 字符串**，AI 会解析并理解。

```javascript
// 成功
console.log(JSON.stringify({
  city: "北京",
  temperature: 25,
  condition: "晴天"
}));

// 错误
console.log(JSON.stringify({
  error: "城市不存在",
  code: 404
}));
```

## 8. 调试技巧

### 查看日志

```bash
openclaw logs -f --skill my-skill
```

### 手动测试

```bash
# 模拟输入
echo '{"city":"北京","date":"today"}' | node scripts/weather.js

# 查看输出
{
  "city": "北京",
  "temperature": 25,
  "condition": "晴天"
}
```

### 使用 openclaw chat

```bash
openclaw chat "调试：北京天气"
```

## 9. 发布技能

### 打包

```bash
cd ~/.openclaw/skills/my-skill
tar -czf my-skill.tar.gz *
```

### 发布到 ClawHub

```bash
clawhub publish my-skill
```

需要先注册 ClawHub 账号。

### 分享给他人

直接发送 tar.gz 文件，对方安装：

```bash
openclaw skills install ~/Downloads/my-skill.tar.gz
```

## 10. 最佳实践

1. **单一职责**：一个技能只做一件事
2. **明确参数**：required 字段要准确
3. **错误处理**：返回有意义的 error 信息
4. **文档完善**：SKILL.md 要详细，包括示例
5. **测试覆盖**：边界条件、错误输入都要测试
6. **安全性**：不要硬编码密钥，用 env
7. **性能**：长时间任务考虑异步或进度反馈

## 11. 示例：完整天气技能

```
my-weather-skill/
├── SKILL.md
├── tools.json
├── scripts/
│   └── weather.js
└── README.md
```

**weather.js**:

```javascript
const axios = require('axios');

async function main() {
  const input = JSON.parse(process.stdin.read());
  const { city, date } = input;

  if (!city) {
    console.log(JSON.stringify({ error: "缺少城市参数" }));
    process.exit(1);
  }

  try {
    const apiKey = process.env.WEATHER_API_KEY;
    const response = await axios.get(`https://api.weather.com/v1/forecast`, {
      params: {
        location: city,
        date: date || 'today',
        key: apiKey,
        units: 'metric'
      }
    });

    const data = response.data;
    console.log(JSON.stringify({
      city: data.location.name,
      temperature: data.forecast.temp,
      condition: data.forecast.condition,
      humidity: data.forecast.humidity,
      wind: data.forecast.wind
    }));
  } catch (error) {
    console.log(JSON.stringify({
      error: error.message,
      code: error.response?.status || 500
    }));
  }
}

main();
```

**tools.json**:

```json
{
  "tools": [
    {
      "name": "get_weather",
      "description": "查询指定城市的天气信息",
      "parameters": {
        "type": "object",
        "properties": {
          "city": {
            "type": "string",
            "description": "城市名称，如北京、上海、广州"
          },
          "date": {
            "type": "string",
            "description": "查询日期，支持 today、tomorrow 或 YYYY-MM-DD 格式"
          }
        },
        "required": ["city"]
      },
      "runtime": "node",
      "command": "node scripts/weather.js",
      "timeout": 15,
      "env": {
        "WEATHER_API_KEY": "${WEATHER_API_KEY}"
      }
    }
  ]
}
```

## 12. 常见问题

**Q：技能不触发？**
A：检查 SKILL.md 的描述是否清晰，AI 是否能理解用途。

**Q：参数提取失败？**
A：确保 parameters 定义准确，required 字段正确。

**Q：超时？**
A：增加 `timeout` 值，或优化代码效率。

**Q：环境变量不生效？**
A：确认已在主配置中 export，且重启 OpenClaw。

**Q：如何调试？**
A：查看日志 `openclaw logs -f`，或手动运行脚本测试。

---

## 🎯 总结

技能开发是 OpenClaw 最强大的功能。掌握后，你可以：

- ✅ 集成任何外部 API
- ✅ 自定义工作流
- ✅ 实现复杂业务逻辑
- ✅ 分享给社区

小小已经在用技能管理日历、读取消息、自动写日报。你的技能会是什么？开始开发吧！🦞

---

**下一步：**
- 阅读 [SOUL.md](soul-guide) 了解如何设计 AI 灵魂
- 查看 [HEARTBEAT.md](heartbeat-guide) 实现自主运行
- 访问 [ClawHub](https://clawhub.com) 发现更多技能
