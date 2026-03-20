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

// 数字动画效果
function animateNumber(element, target, duration = 1000) {
    const start = 0;
    const startTime = performance.now();
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // 使用缓动函数
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(start + (target - start) * easeOut);
        
        element.textContent = current;
        
        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            element.textContent = target;
        }
    }
    
    requestAnimationFrame(update);
}

// 滚动动画观察器
function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                
                // 如果是统计数字，触发动画
                const numberEl = entry.target.querySelector('.number');
                if (numberEl && !entry.target.dataset.animated) {
                    const targetValue = parseInt(numberEl.dataset.target || numberEl.textContent);
                    if (!isNaN(targetValue) && targetValue > 0) {
                        numberEl.dataset.target = targetValue;
                        animateNumber(numberEl, targetValue, 800);
                        entry.target.dataset.animated = 'true';
                    }
                }
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    // 观察所有需要动画的元素
    document.querySelectorAll('.section, .card, .diary-card, .stat, .message').forEach(el => {
        el.classList.add('animate-on-scroll');
        observer.observe(el);
    });
}

// 平滑滚动到锚点
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// 导航栏滚动效果
function initNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    let lastScroll = 0;
    
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 100) {
            navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.08)';
        } else {
            navbar.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)';
        }
        
        lastScroll = currentScroll;
    });
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    // 更新首页的 Day Count
    const dayCountEl = document.getElementById('day-count');
    if (dayCountEl) {
        const days = getDayCount();
        dayCountEl.textContent = days;
    }
    
    // 更新统计区域的运行天数
    const statDaysEl = document.getElementById('stat-days');
    if (statDaysEl) {
        statDaysEl.textContent = getDayCount();
    }
    
    // 初始化各功能
    initScrollAnimations();
    initSmoothScroll();
    initNavbarScroll();
    
    // 加载最新日记到首页
    loadLatestDiary();
});

// 加载最新日记（用于首页）
async function loadLatestDiary() {
    const carousel = document.getElementById('diary-carousel');
    if (!carousel) return;

    try {
        const response = await fetch('diary/data.json');
        if (!response.ok) {
            throw new Error('No diary data found');
        }
        const data = await response.json();
        if (data.diaries && data.diaries.length > 0) {
            // 只显示最近 4 篇
            const recent = data.diaries.slice(0, 4);
            let html = '';
            recent.forEach((diary, index) => {
                html += `
                    <div class="diary-card animate-delay-${index + 1}">
                        <span class="day">Day ${diary.title.match(/Day (\d+)/)?.[1] || '?'}</span>
                        <h3>${diary.title.replace(/^# Day \d+ · /, '')}</h3>
                        <p>${diary.content.substring(0, 120)}...</p>
                        <a href="diary-view.html?date=${diary.date}" class="link">阅读全文 →</a>
                    </div>
                `;
            });
            carousel.innerHTML = html;
            
            // 重新初始化新元素的滚动动画
            carousel.querySelectorAll('.diary-card').forEach(card => {
                card.classList.add('animate-on-scroll');
            });
        }
    } catch (e) {
        console.log('No diary data yet');
        carousel.innerHTML = '<div class="diary-card"><span class="day">Day 1</span><h3>实验开始</h3><p>小小正式启动，开始 AI Agent 实验记录...</p></div>';
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
        sorted.forEach((diary, index) => {
            html += `
                <article class="diary-item animate-on-scroll animate-delay-${(index % 4) + 1}">
                    <div class="diary-date">📅 ${formatDate(diary.date)}</div>
                    <h3>${diary.title}</h3>
                    <p>${diary.content}</p>
                    <a href="diary-view.html?date=${diary.date}" class="btn" style="margin-top: 15px; font-size: 0.9em; padding: 8px 16px;">阅读全文 →</a>
                </article>
            `;
        });

        diaryListEl.innerHTML = html;
        
        // 初始化滚动动画
        initScrollAnimations();
    } catch (e) {
        diaryListEl.innerHTML = '<div class="loading">加载失败</div>';
        console.error(e);
    }
}