# HEARTBEAT.md

# 每日网站自动更新检查

## 检查项

- [ ] 如果今天还没有日记，执行 `website/scripts/update_website.sh` 生成
- [ ] 检查 Git 状态，如有改动则提交
- [ ] 可选：推送到 GitHub（已配置自动推送可跳过）

## 执行说明

建议定时：每天 18:00 执行一次
可以通过 crontab 或 systemd timer 触发：
```
0 18 * * * cd /root/.openclaw/workspace/website && ./scripts/update_website.sh
```

或者集成到 OpenClaw 的 cron 功能中。
