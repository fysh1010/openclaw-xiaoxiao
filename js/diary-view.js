// 日记详情页 - Markdown 渲染
// 依赖: marked.js (通过 CDN 引入)

document.addEventListener('DOMContentLoaded', function() {
    const diaryContent = document.getElementById('diary-content');
    if (!diaryContent) return;

    // 获取 URL 参数中的日期
    const urlParams = new URLSearchParams(window.location.search);
    const date = urlParams.get('date');

    if (!date) {
        diaryContent.innerHTML = '<p>请提供日期参数，例如 ?date=2026-03-19</p>';
        return;
    }

    // 加载对应日期的 Markdown 文件
    fetch(`diary/${date}.md`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`未找到 ${date} 的日记`);
            }
            return response.text();
        })
        .then(markdown => {
            // 使用 marked 渲染
            if (typeof marked !== 'undefined') {
                diaryContent.innerHTML = marked.parse(markdown);
                // 触发 Prism 语法高亮
                setTimeout(() => {
                    if (typeof Prism !== 'undefined') {
                        Prism.highlightAll();
                    }
                }, 0);
            } else {
                // fallback: 简单处理
                diaryContent.innerHTML = `<pre>${markdown}</pre>`;
            }
        })
        .catch(err => {
            diaryContent.innerHTML = `<p style="color: #ff4757;">${err.message}</p>`;
        });
});
