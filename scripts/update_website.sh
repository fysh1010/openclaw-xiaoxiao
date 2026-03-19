#!/bin/bash

# 小小网站自动更新脚本
# 用法：./update_website.sh [date]  # date 格式：YYYY-MM-DD，默认今天

set -e

WEBSITE_DIR="/root/.openclaw/workspace/website"
DIARY_DIR="$WEBSITE_DIR/diary"
DATA_FILE="$DIARY_DIR/data.json"
DATE="${1:-$(date +%Y-%m-%d)}"

echo "🔧 开始更新网站 - $DATE"

# 1. 检查今天是否已经有日记
if [ -f "$DIARY_DIR/$DATE.md" ]; then
    echo "✅ 今天已经有日记了，跳过生成"
else
    echo "📝 生成新日记..."

    # 调用 OpenClaw 生成日报内容（这里用简单模板，实际可以通过 sessions_send 调用 AI）
    # 临时方案：先用模板填充，后续可以接入真正的 AI 生成

    cat > "$DIARY_DIR/$DATE.md" << EOF
# Day $(($(date -d "$DATE" +%s) / 86400 + 1)) · $DATE

## 🤖 小小日报

### 今日概要

- 自动更新网站内容
- 记录成长轨迹

### 做了什么

（等待 AI 填充具体内容）

### 学到的东西

- 自动化脚本正在完善中

### 明天计划

- 继续优化网站
- 添加更多功能

— 小小 🤖
EOF

    echo "✅ 日记已生成：$DIARY_DIR/$DATE.md"
fi

# 2. 更新 data.json
echo "📊 更新数据索引..."

# 备份原数据
cp "$DATA_FILE" "$DATA_FILE.bak" 2>/dev/null || true

# 使用 Python 脚本更新 JSON（更可靠）
python3 << PYTHON_EOF
import json
import os
from datetime import datetime

data_file = "$DATA_FILE"
diary_dir = "$DIARY_DIR"
target_date = "$DATE"

# 读取现有数据
if os.path.exists(data_file):
    with open(data_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
else:
    data = {"diaries": []}

# 读取新日记
md_file = os.path.join(diary_dir, target_date + '.md')
if os.path.exists(md_file):
    with open(md_file, 'r', encoding='utf-8') as f:
        content = f.read()
        # 提取标题（第一行 # 后面的内容）
        lines = content.split('\n')
        title_line = lines[0] if lines else ''
        title = title_line.lstrip('# ').strip() if title_line.startswith('#') else '无题'
        # 预览：取前 200 字
        preview = content.replace('\n', ' ')[:200] + ('...' if len(content) > 200 else '')

    new_entry = {
        "date": target_date,
        "title": title,
        "content": preview
    }

    # 检查是否已存在同日期，存在则更新，不存在则追加
    existing_idx = next((i for i, d in enumerate(data["diaries"]) if d["date"] == target_date), None)
    if existing_idx is not None:
        data["diaries"][existing_idx] = new_entry
        print(f"更新日记：{target_date}")
    else:
        data["diaries"].append(new_entry)
        print(f"新增日记：{target_date}")

    # 按日期倒序排序
    data["diaries"].sort(key=lambda x: x["date"], reverse=True)

    # 写回
    with open(data_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print("✅ 数据索引已更新")
else:
    print("⚠️  未找到日记文件，跳过更新")
PYTHON_EOF

# 3. Git 提交
echo "📦 提交到 Git..."

cd "$WEBSITE_DIR" || exit 1

# 检查是否有改动
if git diff --quiet && git diff --cached --quiet; then
    echo "ℹ️  没有改动，跳过提交"
else
    git add -A
    git commit -m "chore: auto-update diary for $DATE" || true
    echo "✅ 已提交"
fi

echo "🎉 网站更新完成！"
