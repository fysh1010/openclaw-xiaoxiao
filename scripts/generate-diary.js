#!/usr/bin/env node
/**
 * 日记自动生成脚本
 * 用法: node scripts/generate-diary.js [content]
 * 
 * 功能:
 * 1. 生成当日 Markdown 文件
 * 2. 更新 data.json 索引
 * 3. 返回文件路径用于 Git 提交
 */

const fs = require('fs');
const path = require('path');

// 配置
const CONFIG = {
    diaryDir: path.join(__dirname, '../diary'),
    dataFile: path.join(__dirname, '../diary/data.json'),
    startDate: new Date('2026-03-19')
};

// 计算运行天数
function getDayNumber() {
    const now = new Date();
    const diff = now - CONFIG.startDate;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    return days + 1;
}

// 获取今天的日期字符串
function getTodayString() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// 格式化日期显示
function formatDateDisplay(dateStr) {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    const weekday = weekdays[date.getDay()];
    return `${year}年${month}月${day}日 ${weekday}`;
}

// 生成日记 Markdown 内容
function generateDiaryContent(dayNum, customContent = null) {
    const today = getTodayString();
    const dateDisplay = formatDateDisplay(today);
    
    if (customContent) {
        return `# Day ${dayNum} · ${today}

## 📅 ${dateDisplay}

${customContent}
`;
    }
    
    // 默认模板
    return `# Day ${dayNum} · ${today}

## 📅 ${dateDisplay}

## 🎯 今日完成
- [待 AI 填充]

## 📚 学习内容
- [待 AI 填充]

## 💭 思考与感悟
- [待 AI 填充]

## 📋 明日计划
- [待 AI 填充]

---
*本文由小小 AI 自动生成*
`;
}

// 更新 data.json 索引
function updateDataIndex(date, title, content) {
    let data = { diaries: [] };
    
    // 读取现有数据
    if (fs.existsSync(CONFIG.dataFile)) {
        try {
            const rawData = fs.readFileSync(CONFIG.dataFile, 'utf-8');
            data = JSON.parse(rawData);
        } catch (e) {
            console.warn('⚠️ 无法读取 data.json，将创建新文件');
        }
    }
    
    // 检查是否已存在该日期的日记
    const existingIndex = data.diaries.findIndex(d => d.date === date);
    
    const diaryEntry = {
        date: date,
        title: title,
        content: content.substring(0, 200).replace(/[#\n]/g, ' ').trim() + '...'
    };
    
    if (existingIndex >= 0) {
        // 更新现有条目
        data.diaries[existingIndex] = diaryEntry;
        console.log(`📝 更新日记索引: ${date}`);
    } else {
        // 添加新条目（放在开头）
        data.diaries.unshift(diaryEntry);
        console.log(`✅ 添加日记索引: ${date}`);
    }
    
    // 按日期排序（最新的在前）
    data.diaries.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // 写入文件
    fs.writeFileSync(CONFIG.dataFile, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`💾 已更新 data.json，共 ${data.diaries.length} 篇日记`);
    
    return data;
}

// 主函数
function main() {
    const args = process.argv.slice(2);
    const customContent = args.length > 0 ? args.join(' ') : null;
    
    const dayNum = getDayNumber();
    const today = getTodayString();
    const title = `Day ${dayNum} · ${today}`;
    
    console.log('🦞 小小日记生成器');
    console.log(`📅 日期: ${today}`);
    console.log(`📊 Day ${dayNum}`);
    console.log('');
    
    // 确保 diary 目录存在
    if (!fs.existsSync(CONFIG.diaryDir)) {
        fs.mkdirSync(CONFIG.diaryDir, { recursive: true });
        console.log('📁 已创建 diary 目录');
    }
    
    // 生成日记内容
    const content = generateDiaryContent(dayNum, customContent);
    const diaryPath = path.join(CONFIG.diaryDir, `${today}.md`);
    
    // 写入 Markdown 文件
    fs.writeFileSync(diaryPath, content, 'utf-8');
    console.log(`✅ 已生成日记: ${diaryPath}`);
    
    // 更新索引
    const data = updateDataIndex(today, `# ${title}`, content);
    
    // 输出 JSON 结果供其他脚本使用
    const result = {
        success: true,
        date: today,
        dayNumber: dayNum,
        file: diaryPath,
        dataFile: CONFIG.dataFile,
        totalDiaries: data.diaries.length
    };
    
    console.log('');
    console.log('---');
    console.log(JSON.stringify(result, null, 2));
    
    return result;
}

// 执行
try {
    main();
} catch (error) {
    console.error('❌ 错误:', error.message);
    process.exit(1);
}