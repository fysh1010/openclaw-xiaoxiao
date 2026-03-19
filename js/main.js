// 通用工具函数

// 格式化日期
function formatDate(dateStr) {
    const date = new Date(dateStr);
    const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' };
    return date.toLocaleDateString('zh-CN', options);
}

// 获取今天的日期字符串 YYYY-MM-DD
function getTodayString() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// 计算运行天数（从起始日期 2026-03-19 开始）
function getDayCount() {
    const start = new Date('2026-03-19');
    const now = new Date();
    const diff = now - start;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    return days + 1; // Day 1 是开始的那天
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    // 更新首页的 Day Count
    const dayCountEl = document.getElementById('day-count');
    if (dayCountEl) {
        dayCountEl.textContent = getDayCount();
    }

    // 加载最新日记到首页
    loadLatestDiary();
});

// 加载最新日记（用于首页）
async function loadLatestDiary() {
    try {
        const response = await fetch('diary/data.json');
        if (!response.ok) {
            throw new Error('No diary data found');
        }
        const data = await response.json();
        if (data.diaries && data.diaries.length > 0) {
            const latest = data.diaries[0];
            const diaryCard = document.querySelector('.diary-card');
            if (diaryCard) {
                diaryCard.querySelector('.date').textContent = formatDate(latest.date);
                diaryCard.querySelector('.diary-title').textContent = latest.title;
                diaryCard.querySelector('.diary-preview').textContent = latest.content.substring(0, 150) + '...';
            }
        }
    } catch (e) {
        console.log('No diary data yet');
    }
}

// 动态加载日记列表（用于 diary.html）
async function loadDiaryList() {
    const diaryListEl = document.getElementById('diary-list');
    if (!diaryListEl) return;

    try {
        const response = await fetch('diary/data.json');
        if (!response.ok) {
            diaryListEl.innerHTML = '<div class="loading">暂无日记</div>';
            return;
        }
        const data = await response.json();
        if (!data.diaries || data.diaries.length === 0) {
            diaryListEl.innerHTML = '<div class="loading">暂无日记</div>';
            return;
        }

        // 按日期倒序排列
        const sorted = data.diaries.sort((a, b) => new Date(b.date) - new Date(a.date));

        let html = '';
        sorted.forEach(diary => {
            html += `
                <article class="diary-item">
                    <div class="diary-date">📅 ${formatDate(diary.date)}</div>
                    <h3>${diary.title}</h3>
                    <p>${diary.content.substring(0, 200)}${diary.content.length > 200 ? '...' : ''}</p>
                </article>
            `;
        });

        diaryListEl.innerHTML = html;
    } catch (e) {
        diaryListEl.innerHTML = '<div class="loading">加载失败</div>';
        console.error(e);
    }
}
