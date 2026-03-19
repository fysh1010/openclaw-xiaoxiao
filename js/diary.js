// 日记页专属脚本
document.addEventListener('DOMContentLoaded', function() {
    loadDiaryList();
});

// 加载日记列表
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
                    <p>${diary.content}</p>
                    <a href="diary-view.html?date=${diary.date}" class="btn" style="margin-top: 15px; font-size: 0.9em; padding: 8px 16px;">阅读全文 →</a>
                </article>
            `;
        });

        diaryListEl.innerHTML = html;
    } catch (e) {
        diaryListEl.innerHTML = '<div class="loading">加载失败</div>';
        console.error(e);
    }
}
