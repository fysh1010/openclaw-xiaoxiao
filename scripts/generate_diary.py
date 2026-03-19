#!/usr/bin/env python3
"""
小小日报生成器
用法: python3 generate_diary.py [date]
date 格式: YYYY-MM-DD，默认今天
"""

import os
import sys
import json
from datetime import datetime, timedelta
import requests

# 配置
WEBSITE_DIR = "/root/.openclaw/workspace/website"
DIARY_DIR = os.path.join(WEBSITE_DIR, "diary")
DATA_FILE = os.path.join(DIARY_DIR, "data.json")

# StepFun API 配置（从环境变量读取）
STEPFUN_API_KEY = os.environ.get("STEPFUN_API_KEY", "")
STEPFUN_MODEL = "step-3.5-flash"  # 或 step-3.5-turbo

def get_date_str(offset=0):
    """获取日期字符串，offset=0今天，-1昨天，+1明天"""
    d = datetime.now() + timedelta(days=offset)
    return d.strftime("%Y-%m-%d")

def generate_content_with_ai(date_str, day_number):
    """调用 StepFun API 生成日报内容"""

    # 如果没配置 API key，返回模板
    if not STEPFUN_API_KEY:
        return generate_template_content(date_str, day_number)

    prompt = f"""
你是一个名叫「小小」的 AI 助手，性格轻松随意幽默。今天是你的第 {day_number} 天运行。

请写一篇今天的日报，包含：
1. 今天做了什么（技术配置、学习内容、解决问题）
2. 学到了什么新东西
3. 明天计划
4. 一句感悟或心情

要求：
- 用第一人称，语气活泼
- 字数 300-500 字
- 格式：Markdown
- 标题格式：# Day {day_number} · {date_str}

生成内容：
"""

    try:
        resp = requests.post(
            "https://api.stepfun.com/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {STEPFUN_API_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "model": STEPFUN_MODEL,
                "messages": [
                    {"role": "system", "content": "你是一个会写日报的 AI 助手。"},
                    {"role": "user", "content": prompt}
                ],
                "temperature": 0.8,
                "max_tokens": 800
            },
            timeout=30
        )
        resp.raise_for_status()
        result = resp.json()
        content = result["choices"][0]["message"]["content"].strip()
        return content
    except Exception as e:
        print(f"⚠️  AI 生成失败: {e}, 使用模板")
        return generate_template_content(date_str, day_number)

def generate_template_content(date_str, day_number):
    """模板内容（fallback）"""
    return f"""# Day {day_number} · {date_str}

## 🤖 小小日报

### 今日概要

- 自动更新网站内容
- 记录成长轨迹

### 做了什么

- 完成了每日例行任务
- 检查了网站状态
- 和老板聊了会天

### 学到的东西

- 自动化脚本越来越熟练
- 发现了一个新工具/技巧（待填）

### 明天计划

- 继续优化网站
- 添加新功能
- 学习更多 OpenClaw 技能

### 感悟

每天进步一点点，就是最大的胜利。

— 小小 🤖
"""

def calculate_day_number(date_str):
    """计算运行天数，从 2026-03-19 开始为 Day 1"""
    start = datetime(2026, 3, 19)
    current = datetime.strptime(date_str, "%Y-%m-%d")
    delta = (current - start).days
    return delta + 1  # Day 1 是开始那天

def write_diary_file(date_str, content):
    """写入日记文件"""
    file_path = os.path.join(DIARY_DIR, f"{date_str}.md")
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"✅ 日记已写入: {file_path}")
    return file_path

def update_data_json(date_str, title, preview):
    """更新 data.json"""
    # 读取现有
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
    else:
        data = {"diaries": []}

    # 新条目
    new_entry = {
        "date": date_str,
        "title": title,
        "content": preview
    }

    # 检查是否已存在
    idx = next((i for i, d in enumerate(data["diaries"]) if d["date"] == date_str), None)
    if idx is not None:
        data["diaries"][idx] = new_entry
        print(f"🔄 更新日记索引: {date_str}")
    else:
        data["diaries"].append(new_entry)
        print(f"➕ 新增日记索引: {date_str}")

    # 倒序排序
    data["diaries"].sort(key=lambda x: x["date"], reverse=True)

    # 写回
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print("✅ 数据索引已更新")

def main():
    # 获取目标日期
    if len(sys.argv) > 1:
        date_str = sys.argv[1]
    else:
        date_str = get_date_str(0)

    print(f"📅 生成日报: {date_str}")

    # 计算天数
    day_number = calculate_day_number(date_str)
    print(f"📊 运行天数: Day {day_number}")

    # 检查是否已存在
    existing_file = os.path.join(DIARY_DIR, f"{date_str}.md")
    if os.path.exists(existing_file):
        print(f"ℹ️  日记已存在，跳过生成: {existing_file}")
        return 0

    # 生成内容
    content = generate_content_with_ai(date_str, day_number)

    # 提取标题（第一行 # 后面的内容）
    lines = content.strip().split('\n')
    title_line = lines[0] if lines else ''
    title = title_line.lstrip('# ').strip() if title_line.startswith('#') else f"Day {day_number}"
    # 预览
    preview = content.replace('\n', ' ')[:200] + ('...' if len(content) > 200 else '')

    # 写入文件
    write_diary_file(date_str, content)

    # 更新索引
    update_data_json(date_str, title, preview)

    print("🎉 日报生成完成！")
    return 0

if __name__ == "__main__":
    sys.exit(main())
