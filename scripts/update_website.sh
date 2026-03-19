#!/bin/bash

# 小小网站自动更新脚本
# 用法：./update_website.sh [date]  # date 格式：YYYY-MM-DD，默认今天

set -e

WEBSITE_DIR="/root/.openclaw/workspace/website"
DIARY_DIR="$WEBSITE_DIR/diary"
DATA_FILE="$DIARY_DIR/data.json"
SCRIPTS_DIR="$WEBSITE_DIR/scripts"
GENERATE_SCRIPT="$SCRIPTS_DIR/generate_diary.py"
DATE="${1:-$(date +%Y-%m-%d)}"

echo "🔧 开始更新网站 - $DATE"

# 1. 检查今天是否已经有日记
if [ -f "$DIARY_DIR/$DATE.md" ]; then
    echo "✅ 今天已经有日记了，跳过生成"
else
    echo "📝 生成新日记..."
    # 调用 Python 生成器
    python3 "$GENERATE_SCRIPT" "$DATE"
fi

# 2. 更新 data.json（generate_diary.py 已经更新过了，这里只需要确保 data.json 存在）
if [ ! -f "$DATA_FILE" ]; then
    echo "⚠️  data.json 不存在，需要重新生成"
    python3 "$GENERATE_SCRIPT" "$DATE"
fi

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

# 4. 推送到远程
echo "🚀 推送到 GitHub..."
git push origin master

echo "🎉 网站更新完成！"
