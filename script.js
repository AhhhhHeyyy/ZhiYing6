// === DATA LOADING ===
gsap.registerPlugin(ScrollTrigger);

// 加载并渲染作品
async function loadAndRenderProjects() {
    try {
        const response = await fetch('projects.json');
        const projects = await response.json();
        
        // 为每个分类渲染作品
        Object.keys(projects).forEach(category => {
            const grid = document.getElementById(`${category}-grid`);
            if (!grid) return;
            
            // 按 order 排序（保持原有顺序）
            const sortedProjects = projects[category].sort((a, b) => a.order - b.order);
            
            // 清空现有内容
            grid.innerHTML = '';
            
            // 生成作品卡片
            sortedProjects.forEach(project => {
                const item = document.createElement('div');
                item.className = 'gallery-item';
                
                // 如果是 HOLOGACHA 项目，添加 coming-soon 类
                if (project.title === 'HOLOGACHA') {
                    item.classList.add('coming-soon');
                }
                
                // 如果是 installation 分类且有 hasModal 属性，添加 modal 属性
                if (category === 'installation' && project.hasModal) {
                    item.setAttribute('data-toggle', 'modal');
                    item.setAttribute('data-target', '#artModal');
                }
                
                const tagsHTML = project.tags && project.tags.length
                    ? `<div class="card-tags">${project.tags.map(t => `<span class="card-tag"><span class="card-tag-text">${t}</span></span>`).join('')}</div>`
                    : '';
                item.innerHTML = `
                    <a href="${project.link || 'project-page.html?title=' + encodeURIComponent(project.title)}">
                        <img src="${project.image}" alt="${project.title}">
                        <div class="item-overlay">
                            <h3>${project.title}</h3>
                            <p>${project.date}</p>
                        </div>
                        ${project.title === 'HOLOGACHA' ? '<div class="coming-soon-overlay"><span class="coming-soon-text">Coming Soon...</span></div>' : ''}
                        ${tagsHTML}
                    </a>
                `;
                
                grid.appendChild(item);
            });
        });
        
        return projects;
    } catch (error) {
        console.error('加载作品数据失败:', error);
        return null;
    }
}

// === POSTS TIMELINE ===

// 渲染 vb-compact 時間軸格式
function renderPostsTimeline(posts, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const sorted = [...posts].sort((a, b) => b.date.localeCompare(a.date));
    const MONTHS = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];

    container.innerHTML = sorted.map((post, i) => {
        const d = new Date(post.date);
        const day = String(d.getDate()).padStart(2, '0');
        const month = MONTHS[d.getMonth()];
        const imgHTML = post.image ? `<img src="${post.image}" alt="${post.title}">` : '';
        const chipHTML = post.tag ? `<span class="ps-chip">${post.tag}</span>` : '';

        return `
        <div class="vb-row">
            <div class="vb-date"><div class="d">${day}</div><span class="m">${month}</span></div>
            <div class="vb-dot-wrap"><div class="vb-dot"></div></div>
            <div class="vb-card" data-post-index="${i}" role="button" tabindex="0">
                <div class="vb-thumb">${imgHTML}</div>
                <div class="vb-body">
                    <div class="top-row">${chipHTML}<h3 class="title">${post.title}</h3></div>
                    <p class="cap">${post.caption || ''}</p>
                </div>
                <span class="vb-arrow">›</span>
            </div>
        </div>`;
    }).join('');

    container.addEventListener('click', e => {
        const card = e.target.closest('.vb-card[data-post-index]');
        if (!card) return;
        openPostOverlay(sorted[+card.dataset.postIndex]);
    });
}

// 開啟 vb-open-card overlay
function openPostOverlay(post) {
    const MONTHS = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
    const d = new Date(post.date);
    const dateStr = `${MONTHS[d.getMonth()]} ${d.getDate()} · ${d.getFullYear()}`;

    const links = post.links?.length
        ? post.links
        : (post.link ? [{ label: '了解更多', url: post.link }] : []);

    const linksHTML = links.map((lk, i) =>
        `<a class="vb-link${i > 0 ? ' ghost' : ''}" href="${lk.url}" target="_blank" rel="noopener">${lk.label || '連結'} →</a>`
    ).join('');

    const heroHTML = post.image
        ? `<div class="vb-open-hero"><img src="${post.image}" alt="${post.title}"></div>`
        : '';

    const chipHTML = post.tag ? `<span class="ps-chip">${post.tag}</span>` : '';

    let overlay = document.getElementById('vb-post-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'vb-post-overlay';
        document.body.appendChild(overlay);
        overlay.addEventListener('click', e => { if (e.target === overlay) closePostOverlay(); });
        document.addEventListener('keydown', e => { if (e.key === 'Escape') closePostOverlay(); });
    }

    overlay.innerHTML = `
    <div class="vb-open-card">
        <div class="vb-open-head">
            <div class="thumb">${post.image ? `<img src="${post.image}" alt="${post.title}">` : ''}</div>
            <div class="vb-open-meta">
                <div class="row1">
                    <span class="title">${post.title}</span>
                    ${chipHTML}
                </div>
                <span class="date-str">${dateStr}</span>
            </div>
            <button class="vb-open-close" aria-label="關閉">
                <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
                    <line x1="2" y1="2" x2="12" y2="12"/><line x1="12" y1="2" x2="2" y2="12"/>
                </svg>
            </button>
        </div>
        ${heroHTML}
        <div class="vb-open-body">
            <p>${post.caption || ''}</p>
        </div>
        ${linksHTML ? `<div class="vb-open-foot"><div class="vb-links">${linksHTML}</div></div>` : ''}
    </div>`;

    overlay.querySelector('.vb-open-close').addEventListener('click', closePostOverlay);
    overlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
}

function closePostOverlay() {
    const overlay = document.getElementById('vb-post-overlay');
    if (overlay) overlay.classList.remove('is-open');
    document.body.style.overflow = '';
}

// 載入近期動態並渲染到時間軸
async function loadAndRenderPosts() {
    try {
        const res = await fetch('posts.json?nocache=' + Date.now());
        const { posts } = await res.json();
        if (!posts || posts.length === 0) return;

        renderPostsTimeline(posts, 'posts-timeline');
        renderPostsTimeline(posts, 'posts-modal-timeline');

        const footEl = document.getElementById('posts-modal-foot-count');
        if (footEl) footEl.textContent = posts.length + (posts.length === 1 ? ' UPDATE' : ' UPDATES');
    } catch (err) {
        console.error('載入動態失敗:', err);
    }
}

// 展開鈕 + 全螢幕 Modal
function initPostsModal() {
    const btn   = document.getElementById('posts-expand-btn');
    const modal = document.getElementById('posts-modal');
    const close = document.getElementById('posts-modal-close');
    if (!btn || !modal) return;

    const openModal = () => {
        modal.classList.add('is-open');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    };
    const closeModal = () => {
        modal.classList.remove('is-open');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    };

    btn.addEventListener('click', openModal);
    close?.addEventListener('click', closeModal);
    modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
}

// === INTRO SLIDESHOW ===
// 初始化拍立得 Hero — 作品輪播 + 打字動畫
async function initIntroPolaroid() {
    // ── 打字動畫 ──────────────────────────────────────────────
    const TYPED_NAME = '梁芷穎';
    const typedEl = document.getElementById('introTypedName');
    const caretEl = document.getElementById('introCaret');
    if (typedEl) {
        let ci = 0;
        setTimeout(() => {
            const tid = setInterval(() => {
                ci++;
                typedEl.textContent = TYPED_NAME.slice(0, ci);
                if (ci >= TYPED_NAME.length) {
                    clearInterval(tid);
                    setTimeout(() => {
                        if (caretEl) { caretEl.style.animation = 'none'; caretEl.style.opacity = '0'; }
                    }, 1200);
                }
            }, 180);
        }, 2000);
    }

    // ── 作品資料 ──────────────────────────────────────────────
    try {
        const response = await fetch('projects.json');
        const projects = await response.json();

        const allProjects = [];
        Object.values(projects).forEach(cat => {
            cat.forEach(p => {
                if (p.image) allProjects.push({
                    img: p.image,
                    title: '＞ ' + p.title.toUpperCase(),
                    year: "'" + (p.date ? p.date.toString().slice(0, 4).slice(2) : '25'),
                    link: p.link,
                });
            });
        });

        // 隨機取最多 7 個
        const pool = allProjects.sort(() => Math.random() - 0.5).slice(0, 7);
        if (pool.length === 0) return;

        // 預加載圖片：儲存 img 物件避免 GC 清掉 decoded pixels，並用 decode() 確保
        // paint-ready，防止 backgroundImage 切換時出現 1-frame 空白閃爍
        const _imgCache = new Map(); // Map<src, { promise, img }>
        function preloadImage(src) {
            if (!src) return Promise.resolve();
            if (_imgCache.has(src)) return _imgCache.get(src).promise;
            const img = new Image();
            img.src = src;
            const promise = typeof img.decode === 'function'
                ? img.decode().catch(() => {})
                : new Promise(resolve => { img.onload = img.onerror = resolve; });
            _imgCache.set(src, { promise, img }); // 保留 img ref 防止 GC
            return promise;
        }
        // 背景預加載所有圖片
        pool.forEach(item => preloadImage(item.img));

        let idx = 0;

        // DOM refs
        const photoImg    = document.getElementById('introPhotoImg');
        const photoTitle  = document.getElementById('introPhotoTitle');
        const photoYear   = document.getElementById('introPhotoYear');
        const curIdxEl    = document.getElementById('introCurIdx');
        const totalIdxEl  = document.getElementById('introTotalIdx');
        const prevBtn     = document.getElementById('introPrevBtn');
        const nextBtn     = document.getElementById('introNextBtn');
        const shutterEl  = document.getElementById('introShutterStar');
        const flashEl    = document.getElementById('introFlash');
        const shutterTop = document.getElementById('introShutterTop');
        const shutterBot = document.getElementById('introShutterBot');

        if (!photoImg) return;

        totalIdxEl && (totalIdxEl.textContent = String(pool.length).padStart(2, '0'));

        // 重啟 CSS 動畫
        function replayAnim(el, name, dur, delay) {
            if (!el) return;
            el.style.animation = 'none';
            el.offsetHeight; // reflow
            el.style.animation = `${name} ${dur} ease-out ${delay} both`;
        }

        // 設定照片（含快門動畫）
        let _shutterTl  = null;
        let _pendingImg = null;

        // 明確用 GSAP 設定快門初始位置（不依賴 CSS transform 讓 GSAP 自己讀）
        if (shutterTop) gsap.set(shutterTop, { yPercent: -100 });
        if (shutterBot) gsap.set(shutterBot, { yPercent:  100 });

        function showPhoto(p, isFirst) {
            if (isFirst) {
                // 首次載入：淡入
                if (photoImg) {
                    photoImg.style.animation = 'none';
                    photoImg.style.opacity   = '0';
                    photoImg.style.backgroundImage = `url("${p.img}")`;
                    gsap.to(photoImg, { opacity: 1, duration: 0.9, delay: 1.5, ease: 'power2.out' });
                }
                if (photoTitle) photoTitle.textContent = p.title;
                if (photoYear) photoYear.textContent = p.year;
                replayAnim(shutterEl, 'introShutterStar', '0.7s',  '1.2s');
                replayAnim(flashEl,   'introFlash',       '0.35s', '1.55s');
            } else {
                // 停止進行中的 CSS animation
                if (photoImg) {
                    photoImg.style.animation = 'none';
                    photoImg.style.opacity   = '1';
                    photoImg.style.filter    = 'sepia(0.1) saturate(0.85)';
                }

                // Kill 上一個 timeline，立刻重置快門板位置
                if (_shutterTl) {
                    _shutterTl.kill();
                    _shutterTl = null;
                    if (_pendingImg && photoImg) photoImg.style.backgroundImage = `url("${_pendingImg}")`;
                    _pendingImg = null;
                }
                gsap.set(shutterTop, { yPercent: -100 });
                gsap.set(shutterBot, { yPercent:  100 });

                _pendingImg = p.img;

                _shutterTl = gsap.timeline({
                    onComplete: () => {
                        gsap.set(shutterTop, { yPercent: -100 });
                        gsap.set(shutterBot, { yPercent:  100 });
                        _shutterTl = null;
                        _pendingImg = null;
                    }
                })
                    // 快門開始合 + 同時觸發星星旋轉（position 0 = 同步）
                    .call(() => { replayAnim(shutterEl, 'introShutterStar', '0.6s', '0s'); }, null, 0)
                    .fromTo(shutterTop, { yPercent: -100 }, { yPercent: 0,    duration: 0.22, ease: 'power2.inOut' }, 0)
                    .fromTo(shutterBot, { yPercent:  100 }, { yPercent: 0,    duration: 0.22, ease: 'power2.inOut' }, 0)
                    // 快門完全關閉後換圖 + 換文字
                    .call(() => {
                        if (photoImg)   photoImg.style.backgroundImage = `url("${p.img}")`;
                        if (photoTitle) photoTitle.textContent = p.title;
                        if (photoYear)  photoYear.textContent  = p.year;
                    })
                    // 快門開啟
                    .fromTo(shutterTop, { yPercent: 0 }, { yPercent: -100, duration: 0.28, ease: 'power2.inOut' })
                    .fromTo(shutterBot, { yPercent: 0 }, { yPercent:  100, duration: 0.28, ease: 'power2.inOut' }, '<');
            }
        }

        // 切換函式（async：等圖片載完再開始轉場）
        async function go(delta) {
            idx = (idx + delta + pool.length) % pool.length;
            const item = pool[idx]; // await 前先捕捉，避免 idx 被後續呼叫改掉
            if (curIdxEl) curIdxEl.textContent = String(idx + 1).padStart(2, '0');
            await preloadImage(item.img);
            showPhoto(item, false);
        }

        // 初始顯示
        showPhoto(pool[0], true);
        if (curIdxEl) curIdxEl.textContent = '01';

        // 可重置的自動輪播（每 5 秒）
        let _autoTimer = null;
        function scheduleAuto() {
            clearTimeout(_autoTimer);
            _autoTimer = setTimeout(() => { go(1); scheduleAuto(); }, 5000);
        }
        scheduleAuto();

        // 按鈕：切換後重設計時器
        prevBtn && prevBtn.addEventListener('click', () => { go(-1); scheduleAuto(); });
        nextBtn && nextBtn.addEventListener('click', () => { go(1);  scheduleAuto(); });

        // 點擊拍立得跳轉作品
        const polaroidEl = document.getElementById('introPolaroidInner');
        if (polaroidEl) {
            polaroidEl.addEventListener('click', () => {
                const p = pool[idx];
                window.location.href = p.link || ('project-page.html?title=' + encodeURIComponent(p.title));
            });
        }


    } catch (err) {
        console.error('拍立得 intro 初始化失敗:', err);
    }
}

// === LOADING SCREEN ===
const _loading = {
    _current: 0,
    fillEl: null,
    pctEl: null,
    screenEl: null,

    init() {
        this.screenEl = document.getElementById('loading-screen');
        this.fillEl   = document.getElementById('loadingBarFill');
        this.pctEl    = document.getElementById('loadingPct');
        this.set(5);
    },

    set(pct) {
        this._current = Math.min(100, Math.max(this._current, Math.round(pct)));
        if (this.fillEl) this.fillEl.style.width = this._current + '%';
        if (this.pctEl)  this.pctEl.textContent =
            '▌ ' + String(this._current).padStart(2, '0') + '%';
    },

    async done() {
        this.set(100);
        await new Promise(r => setTimeout(r, 550));
        if (this.screenEl) this.screenEl.classList.add('is-done');
        document.body.classList.remove('is-loading');
        await new Promise(r => setTimeout(r, 700));
        if (this.screenEl) this.screenEl.style.display = 'none';
    }
};

// === MAIN INIT (DOMContentLoaded) ===
document.addEventListener("DOMContentLoaded", async () => {
    // 初始化 loading screen
    _loading.init();
    const _loadStart = Date.now();
    const MIN_DISPLAY_MS = 1200;

    // 立即初始化下拉式清单
    initDropdown();

    // 初始化显示第一个类别
    const firstCategory = document.querySelector('.gallery-category');
    if (firstCategory) {
        firstCategory.style.display = 'block';
        firstCategory.style.opacity = '1';
    }

    // 加載並渲染作品，拿回 projects 資料供圖片預載使用
    _loading.set(10);
    const projects = await loadAndRenderProjects();
    ScrollTrigger.refresh();
    _loading.set(30);

    // 預載所有作品圖片（確保 hero slideshow 切換時無閃爍）
    const allImgSrcs = [];
    if (projects) {
        Object.values(projects).forEach(cat =>
            cat.forEach(p => { if (p.image) allImgSrcs.push(p.image); })
        );
    }
    let _imgDone = 0;
    const _imgTotal = allImgSrcs.length || 1;
    await Promise.all(allImgSrcs.map(src => {
        const img = new Image();
        img.src = src;
        const p = typeof img.decode === 'function'
            ? img.decode().catch(() => {})
            : new Promise(r => { img.onload = img.onerror = r; });
        return p.then(() => {
            _imgDone++;
            _loading.set(30 + (_imgDone / _imgTotal) * 65);
        });
    }));

    // 確保 loading screen 至少顯示 MIN_DISPLAY_MS 毫秒
    const _elapsed = Date.now() - _loadStart;
    if (_elapsed < MIN_DISPLAY_MS) await new Promise(r => setTimeout(r, MIN_DISPLAY_MS - _elapsed));

    // 收起 loading screen，同時解凍 intro CSS 動畫
    await _loading.done();

    // 載入近期動態時間軸 + 初始化展開 Modal
    loadAndRenderPosts();
    initPostsModal();
    // 初始化拍立得 Hero（typed name、快門動畫從這裡起計時）
    initIntroPolaroid();
    // --- Lenis Smooth Scroll ---
    // 初始化Lenis平滑滚动 - 优化性能
    const lenis = new Lenis({
        duration: 0.8,  // 减少延迟，从1.2改为0.8
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
        smoothTouch: false,
        touchMultiplier: 2,
        wheelMultiplier: 1,  // 增加滚轮响应速度
        infinite: false
    });

    // 将Lenis与GSAP ScrollTrigger集成
    lenis.on('scroll', ScrollTrigger.update);

    // 请求动画帧 - 优化性能
    function raf(time) {
        lenis.raf(time);
        ScrollTrigger.update();  // 确保ScrollTrigger同步更新
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // 导航链接点击事件
    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const headerHeight = document.querySelector('.main-header').offsetHeight;
                lenis.scrollTo(targetElement, {
                    offset: -headerHeight,
                    duration: 0.8,  // 减少延迟
                    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
                });
            }
        });
    });

    // --- Skills Text Switch ---
    // Skill 文字框切换功能
    function initSkillTextSwitch() {
        const arrowBtn = document.getElementById('skillArrowBtn');
        const textItems = document.querySelectorAll('.skill-text-item');
        const paginationDots = document.querySelectorAll('.pagination-dot');
        let currentIndex = 0;
        let isAnimating = false;

        if (!arrowBtn || textItems.length === 0) return;

        function updatePagination() {
            paginationDots.forEach((dot, index) => {
                if (index === currentIndex) {
                    dot.classList.add('active');
                } else {
                    dot.classList.remove('active');
                }
            });
        }

        function switchSkillText() {
            // 防止动画进行中重复点击
            if (isAnimating) return;
            isAnimating = true;

            const currentItem = textItems[currentIndex];
            const nextIndex = (currentIndex + 1) % textItems.length;
            const nextItem = textItems[nextIndex];
            const arrowImg = arrowBtn.querySelector('img');
            
            // 判断方向：0→1 往左滑，1→0 往右滑
            const isMovingLeft = currentIndex === 0;
            
            // 翻转箭头方向（反过来）
            if (isMovingLeft) {
                // 往左滑：箭头指向左边（scaleX(1)）
                arrowImg.style.transform = 'scaleX(1)';
            } else {
                // 往右滑：箭头指向右边（scaleX(-1)）
                arrowImg.style.transform = 'scaleX(-1)';
            }

            // 移除当前活动项
            currentItem.classList.remove('active');
            
            // 根据方向设置动画
            if (isMovingLeft) {
                // 往左滑：当前项向左滑出，下一项从右边滑入
                currentItem.classList.add('prev');
                
                // 先设置下一项在右边位置
                nextItem.classList.remove('active', 'prev', 'next');
                nextItem.style.transform = 'translateX(100%)';
                nextItem.style.opacity = '0';
            } else {
                // 往右滑：当前项向右滑出，下一项从左边滑入
                currentItem.classList.add('next');
                
                // 先设置下一项在左边位置
                nextItem.classList.remove('active', 'prev', 'next');
                nextItem.style.transform = 'translateX(-100%)';
                nextItem.style.opacity = '0';
            }

            // 更新索引
            currentIndex = nextIndex;

            // 短暂延迟后触发滑入动画
            setTimeout(() => {
                // 强制重排以触发动画
                void nextItem.offsetWidth;
                
                // 添加 active 类，触发滑入动画
                nextItem.classList.add('active');
                nextItem.style.transform = '';
                nextItem.style.opacity = '';
                
                // 更新分页指示器
                updatePagination();
                
                // 动画完成后重置标志
                setTimeout(() => {
                    isAnimating = false;
                }, 600);
            }, 50);
        }

        arrowBtn.addEventListener('click', switchSkillText);
        
        // 初始化分页指示器
        updatePagination();
        
        // 初始化箭头方向（第一句时箭头指向右边）
        const arrowImg = arrowBtn.querySelector('img');
        if (arrowImg) {
            arrowImg.style.transform = 'scaleX(-1)';
        }
    }

    // 初始化文字切换功能
    initSkillTextSwitch();

    // --- Art Modal ---
    // 初始化模态窗口功能（在作品加载后调用）
    function initModal() {
        // 获取模态窗口
        var modal = document.getElementById("artModal");
        var span = document.getElementsByClassName("close")[0];

        // 确保元素存在才添加事件监听
        if (modal && span) {
            // 点击作品时打开模态窗口（重新绑定，因为作品是动态生成的）
            var items = document.querySelectorAll('.gallery-item[data-toggle="modal"]');
            items.forEach(item => {
                // 移除旧的事件监听器（如果存在）
                item.replaceWith(item.cloneNode(true));
            });
            
            // 重新获取元素并绑定事件
            var newItems = document.querySelectorAll('.gallery-item[data-toggle="modal"]');
            newItems.forEach(item => {
                item.addEventListener('click', function() {
                    modal.style.display = "block";
                });
            });

            // 点击关闭按钮时关闭模态窗口（只需要绑定一次）
            if (!span.hasAttribute('data-modal-initialized')) {
                span.setAttribute('data-modal-initialized', 'true');
                span.addEventListener('click', function() {
                    modal.style.display = "none";
                });

                // 点击模态窗口外部时关闭模态窗口
                window.addEventListener('click', function(event) {
                    if (event.target == modal) {
                        modal.style.display = "none";
                    }
                });
            }
        }
    }

    // --- GSAP Animations ---
        // 确保DOM完全加载后再初始化GSAP动画
    setTimeout(() => {
        // 添加skill-H2的动画 - 优化ScrollTrigger性能
        const skillH2 = document.querySelector('.skill-H2');
        const skillH2Bg = document.querySelector('.skill-H2-bg');
        const skillH2Text = document.querySelector('.skill-H2 h2');

        if (skillH2 && skillH2Bg && skillH2Text) {
            const width = window.innerWidth;
            let triggerStart;

            if (width <= 540) {
                triggerStart = "top 80%";
            } else if (width <= 1024) {
                triggerStart = "top 30%";
            } else {
                triggerStart = "top 50%";
            }

            // 設定初始狀態，確保 y 位移在觸發前就存在
            gsap.set(skillH2, { y: 50 });

            // 合併成單一 timeline，確保 y 滑動與文字/背景完全同步
            gsap.timeline({
                scrollTrigger: {
                    trigger: skillH2,
                    start: triggerStart,
                    toggleActions: "play none none reverse",
                    refreshPriority: -1
                }
            })
            .to(skillH2,     { y: 0,       duration: 0.8, ease: "power2.out" }, 0)
            .fromTo(skillH2Bg,   { scaleX: 0 }, { scaleX: 1,  duration: 0.6, ease: "power2.out" }, 0)
            .fromTo(skillH2Text, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }, 0.1);
        }

        // 画廊动画 - 优化性能
        const gallerySection = document.querySelector(".gallery-section");
        if (gallerySection) {
            ScrollTrigger.create({
                trigger: gallerySection,
                start: "top top",
                end: "+=3000",
                pin: false,
                pinSpacing: false,
                refreshPriority: -1  // 优化性能
            });
        }

        // 画廊导航切换
        const navItems = document.querySelectorAll('.nav-item');
        const categories = document.querySelectorAll('.gallery-category');

        if (navItems.length > 0 && categories.length > 0) {
            // 隐藏所有类别
            categories.forEach(category => {
                category.style.display = 'none';
                category.style.opacity = '0';
            });

            // 显示当前激活的类别并设置初始颜色
            const activeItem = document.querySelector('.nav-item.active');
            if (activeItem) {
                const activeCategory = activeItem.getAttribute('data-category');
                const targetElement = document.getElementById(activeCategory);
                if (targetElement) {
                    targetElement.style.display = 'block';
                    targetElement.style.opacity = '1';
                }
                // 设置初始 active 状态的颜色
                gsap.set(activeItem, {
                    backgroundColor: "#92C7CF",
                    color: "#000",
                    boxShadow: "0 4px 16px rgba(146,199,207,0.15)"
                });
                gsap.set(activeItem.querySelector('h2'), {
                    color: "#000"
                });
            }
            
            // 确保所有非 active 的导航项使用默认颜色
            navItems.forEach(nav => {
                if (!nav.classList.contains('active')) {
                    gsap.set(nav, {
                        backgroundColor: "transparent",
                        color: "#404F63"
                    });
                    gsap.set(nav.querySelector('h2'), {
                        color: "#404F63"
                    });
                }
            });

            // 为每个导航项添加点击事件
            navItems.forEach(item => {
                item.addEventListener('click', () => {
                    const targetCategory = item.getAttribute('data-category');
                    
                    // 更新导航项状态并恢复颜色
                    navItems.forEach(nav => {
                        nav.classList.remove('active');
                        // 恢复非 active 状态的颜色
                        gsap.to(nav, {
                            backgroundColor: "transparent",
                            color: "#404F63",
                            boxShadow: "0 0 0 rgba(0,0,0,0)",
                            duration: 0.2,
                            overwrite: "auto"
                        });
                        gsap.to(nav.querySelector('h2'), {
                            color: "#404F63",
                            duration: 0.2,
                            overwrite: "auto"
                        });
                    });
                    
                    item.classList.add('active');
                    // 设置 active 状态的颜色
                    gsap.to(item, {
                        backgroundColor: "#92C7CF",
                        color: "#000",
                        boxShadow: "0 4px 16px rgba(146,199,207,0.15)",
                        duration: 0.2,
                        overwrite: "auto"
                    });
                    gsap.to(item.querySelector('h2'), {
                        color: "#000",
                        duration: 0.2,
                        overwrite: "auto"
                    });

                    // 隐藏所有类别
                    categories.forEach(category => {
                        category.style.display = 'none';
                        category.style.opacity = '0';
                    });

                    // 显示目标类别
                    const targetElement = document.getElementById(targetCategory);
                    if (targetElement) {
                        targetElement.style.display = 'block';
                        gsap.to(targetElement, {
                            opacity: 1,
                            duration: 0.3
                        });
                    }
                });
            });
        }

        // 技能区域动画 - 优化性能
        const skillsSection = document.querySelector('.skills');
        if (skillsSection) {
            // 圆点图案动画
            gsap.from('.pattern-container', {
                scrollTrigger: {
                    trigger: skillsSection,
                    start: "top 80%",
                    toggleActions: "play none none reverse",
                    pin: false,
                    refreshPriority: -1  // 优化性能
                },
                scale: 0.5,
                opacity: 0,
                duration: 1,
                ease: "power2.out"
            });


            // work-title动画 - 从下往上
            if (!document.querySelector('.work-title')) return;
            gsap.from('.work-title .title-group', {
                scrollTrigger: {
                    trigger: '.work-title',
                    start: "top 90%",
                    toggleActions: "play none none reverse",
                    pin: false,
                    refreshPriority: -1  // 优化性能
                },
                y: 100,
                opacity: 0,
                duration: 0.8,
                stagger: 0.2,
                ease: "power2.out"
            });

            // 箭头动画
            let arrowTimeline = gsap.timeline({repeat: -1});

            arrowTimeline
                .from('.skills-arrows img', {
                    y: 30,
                    opacity: 0,
                    duration: 0.5,
                    stagger: 0.1,
                    ease: "bounce.out"
                })
                .to('.skills-arrows img', {
                    y: 0,
                    opacity: 1,
                    duration: 0.5,
                    stagger: 0.1
                })
                .to('.skills-arrows img', {
                    y: -20,
                    opacity: 0,
                    duration: 0.2,
                    stagger: 0.05,
                    ease: "power2.in"
                })
                .set('.skills-arrows img', {y: 30})
                .delay(0.3);
        }
        
        // 在作品加载完成后初始化模态窗口
        initModal();
    }, 100); // 给DOM一些时间完全加载

    // --- Steps / Cards Carousel ---
    const gallerySection = document.querySelector(".steps");
    const cards = document.querySelectorAll(".card");
    const countContainer = document.querySelector(".count-container");

    if (gallerySection && cards.length > 0 && countContainer) {
        const totalCards = cards.length;
        
        ScrollTrigger.create({
            trigger: gallerySection,
            start: "top top",
            end: "+=3000",
            pin: true,
            pinSpacing: true,
            onUpdate: (self) => {
                const progress = self.progress;
                updateGallery(progress);
            }
        });
    }

    const getRadius = () => {
        return window.innerWidth < 900
            ? window.innerWidth * 7.5
            : window.innerWidth * 2.5;
    };
    
    const arcAngle = Math.PI * 0.4;
    const startAngle = Math.PI / 2 - arcAngle / 2;
    
    function updateGallery(progress) {
        if (!cards || cards.length === 0) return;
        
        // 更新卡片位置
        cards.forEach((card, index) => {
            if (!card) return;
            const cardProgress = (progress - index * 0.2) * 2;
            const scale = Math.max(0.8, 1 - Math.abs(cardProgress));
            const x = cardProgress * 500;
            const rotation = cardProgress * 10;
            
            gsap.to(card, {
                x: x,
                scale: scale,
                rotation: rotation,
                opacity: scale,
                ease: "power2.out"
            });
        });

        // 更新计数器
        if (countContainer) {
            const countProgress = progress * (totalCards - 1);
            const currentCount = Math.floor(countProgress) + 1;
            const countY = -currentCount * 150;
            
            gsap.to(countContainer, {
                y: countY,
                ease: "power2.out"
            });
        }
    }

    // --- Animation Gallery Items ---
    // 为动画类别的卡片添加点击事件
    const animationItems = document.querySelectorAll('#animation .gallery-item');
    animationItems.forEach(item => {
        item.addEventListener('click', () => {
            const videoUrl = item.getAttribute('data-video');
            if (videoUrl) {
                window.open(videoUrl, '_blank');
            }
        });
    });

    // 初始化时为动画类别添加进入动画
    const initialItems = document.querySelectorAll('#animation .gallery-item');
    if (initialItems.length > 0) {
        gsap.from(initialItems, {
            y: 30,
            opacity: 0,
            duration: 0.5,
            stagger: 0.1
        });
    }

    // --- Mobile Dropdown ---
    // 移动端下拉菜单初始化
    function initDropdown() {
        console.log('开始初始化下拉菜单');
        
        const dropdownBtn = document.querySelector('.dropdown-btn');
        const dropdownList = document.querySelector('.dropdown-list');
        const dropdownItems = document.querySelectorAll('.dropdown-item');
        const selectedText = dropdownBtn.querySelector('.selected-text');
        
        if (!dropdownBtn || !dropdownList) {
            console.error('找不到下拉菜单元素');
            return;
        }
        
        console.log('找到下拉菜单元素');
        
        // 初始化下拉列表状态
        gsap.set(dropdownList, {
            opacity: 0,
            y: -10,
            display: 'none'
        });
        
        // 初始化 active 项目：如果没有active项目，设置第一个为active
        let activeDropdownItem = document.querySelector('.dropdown-item.active');
        if (!activeDropdownItem && dropdownItems.length > 0) {
            dropdownItems[0].classList.add('active');
            activeDropdownItem = dropdownItems[0];
        }
        
        if (activeDropdownItem) {
            gsap.set(activeDropdownItem, {
                backgroundColor: "#92C7CF",
                color: "#404F63",
                fontWeight: "700"
            });
        }
        
        // 确保所有非 active 的下拉菜单项使用默认颜色
        dropdownItems.forEach(item => {
            if (!item.classList.contains('active')) {
                gsap.set(item, {
                    backgroundColor: "white",
                    color: "#005C80",
                    fontWeight: "600"
                });
            }
        });
        
        dropdownBtn.onclick = function(e) {
            e.preventDefault(); // 防止默认行为
            e.stopPropagation(); // 阻止事件冒泡
            
            // 立即切换显示状态，不等待动画
            const isOpen = dropdownList.style.display === 'block';
            dropdownList.style.display = isOpen ? 'none' : 'block';
            
            if (isOpen) {
                // 关闭动画（缩短时间）
                gsap.to(dropdownList, {
                    opacity: 0,
                    y: -10,
                    duration: 0.15, // 从 0.3 缩短到 0.15
                    ease: 'power2.in',
                    onComplete: () => {
                        dropdownList.style.display = 'none';
                    }
                });
            } else {
                // 打开动画（缩短时间）
                gsap.to(dropdownList, {
                    opacity: 1,
                    y: 0,
                    duration: 0.15, // 从 0.3 缩短到 0.15
                    ease: 'power2.out'
                });
            }
        };
        
        // 下拉菜单项点击切换分类（優化動畫）
        dropdownItems.forEach(item => {
            item.addEventListener('click', function(e) {
                e.preventDefault(); // 防止默认行为
                e.stopPropagation(); // 阻止事件冒泡
                
                // 更新选中文本（立即更新）
                if (selectedText) selectedText.textContent = item.textContent;

                // 更新活动状态并恢复颜色（缩短动画时间）
                dropdownItems.forEach(i => {
                    i.classList.remove('active');
                    // 恢复非 active 状态的颜色
                    gsap.to(i, {
                        backgroundColor: "white",
                        color: "#005C80",
                        fontWeight: "600",
                        duration: 0.1, // 从 0.2 缩短到 0.1
                        overwrite: "auto"
                    });
                });
                item.classList.add('active');
                // 设置 active 状态的颜色
                gsap.to(item, {
                    backgroundColor: "#92C7CF",
                    color: "#404F63",
                    fontWeight: "700",
                    duration: 0.1, // 从 0.2 缩短到 0.1
                    overwrite: "auto"
                });

                // 切換內容動畫
                const category = item.getAttribute('data-category');
                const categories = document.querySelectorAll('.gallery-category');
                const currentVisible = Array.from(categories).find(cat => cat.style.display === 'block' || cat.style.opacity === '1');

                // 先淡出舊內容（缩短动画时间）
                if (currentVisible && currentVisible.id !== category) {
                    gsap.to(currentVisible, {
                        opacity: 0,
                        duration: 0.15, // 从 0.25 缩短到 0.15
                        pointerEvents: "none",
                        onComplete: () => {
                            currentVisible.style.display = 'none';
                            // 顯示新內容並淡入
                            const targetElement = document.getElementById(category);
                            if (targetElement) {
                                targetElement.style.display = 'block';
                                gsap.fromTo(targetElement, {opacity: 0}, {
                                    opacity: 1,
                                    duration: 0.2, // 从 0.35 缩短到 0.2
                                    pointerEvents: "auto"
                                });
                            }
                        }
                    });
                } else {
                    // 沒有舊內容，直接顯示新內容
                    const targetElement = document.getElementById(category);
                    if (targetElement) {
                        targetElement.style.display = 'block';
                        gsap.fromTo(targetElement, {opacity: 0}, {
                            opacity: 1,
                            duration: 0.35,
                            pointerEvents: "auto"
                        });
                    }
                }

                // 關閉下拉菜單動畫
                gsap.to(dropdownList, {
                    opacity: 0,
                    y: -10,
                    duration: 0.3,
                    ease: 'power2.in',
                    onComplete: () => {
                        dropdownList.style.display = 'none';
                    }
                });
            });
        });
        
        // 点击其他地方关闭菜单
        document.onclick = function(e) {
            if (!dropdownBtn.contains(e.target) && !dropdownList.contains(e.target)) {
                console.log('点击了外部区域');
                gsap.to(dropdownList, {
                    opacity: 0,
                    y: -10,
                    duration: 0.3,
                    ease: 'power2.in',
                    onComplete: () => {
                        dropdownList.style.display = 'none';
                    }
                });
            }
        };
    }

    // window.onload 已不再需要，因为下拉式清单已在 DOMContentLoaded 中初始化
    // 这样可以避免等待所有资源（图片、字体等）加载完成，提升响应速度

    // --- Desktop Nav Hover ---
    // 桌面版 nav-item hover 動畫
    const galleryNavItems = document.querySelectorAll('.gallery-nav .nav-item');
    galleryNavItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            gsap.to(item, {
                scale: 1.08,
                backgroundColor: "#005C80",
                color: "#000",
                boxShadow: "0 4px 16px rgba(0,92,128,0.3)",
                duration: 0.25,
                overwrite: "auto"
            });
            gsap.to(item.querySelector('h2'), {
                color: "#fff",
                duration: 0.2,
                overwrite: "auto"
            });
        });
        item.addEventListener('mouseleave', () => {
            const isActive = item.classList.contains('active');
            gsap.to(item, {
                scale: 1,
                backgroundColor: isActive ? "#92C7CF" : "transparent",
                color: isActive ? "#000" : "#404F63",
                boxShadow: "0 0 0 rgba(0,0,0,0)",
                duration: 0.25,
                overwrite: "auto"
            });
            gsap.to(item.querySelector('h2'), {
                color: isActive ? "#000" : "#404F63",
                duration: 0.2,
                overwrite: "auto"
            });
        });
    });

    // --- Mobile Dropdown Hover ---
    // 手機版 dropdown-item hover 動畫
    document.querySelectorAll('.dropdown-item').forEach(item => {
        item.addEventListener('mouseenter', () => {
            gsap.to(item, {
                scale: 1.06,
                backgroundColor: "#005C80",
                color: "#fff",
                duration: 0.2,
                overwrite: "auto"
            });
        });
        item.addEventListener('mouseleave', () => {
            const isActive = item.classList.contains('active');
            gsap.to(item, {
                scale: 1,
                backgroundColor: isActive ? "#92C7CF" : "white",
                color: isActive ? "#404F63" : "#005C80",
                duration: 0.2,
                overwrite: "auto"
            });
        });
    });

    // --- Social Icons Mask ---
    // 社群 logo 遮罩：intro 展示區內顯示深藍色
    const maskedIcons = document.querySelector('.social-icons-masked');
    const introSection = document.querySelector('.intro');
    if (maskedIcons && introSection) {
        const mainIconLinks = document.querySelectorAll('body > .social-icons:not(.social-icons-masked) a');
        const maskedIconLinks = maskedIcons.querySelectorAll('a');

        function updateSocialMask() {
            const intro = introSection.getBoundingClientRect();
            maskedIconLinks.forEach((maskedLink) => {
                const rect = maskedLink.getBoundingClientRect();
                const center = (rect.top + rect.bottom) / 2;
                const inIntro = center >= intro.top && center <= intro.bottom;
                maskedLink.style.visibility = inIntro ? 'visible' : 'hidden';
            });
        }
        updateSocialMask();
        window.addEventListener('scroll', updateSocialMask, { passive: true });
        window.addEventListener('resize', updateSocialMask, { passive: true });
        mainIconLinks.forEach((link, i) => {
            const maskedLink = maskedIconLinks[i];
            if (!maskedLink) return;
            link.addEventListener('mouseenter', () => {
                gsap.to([link, maskedLink], { x: 5, duration: 0.3, ease: 'power2.out', overwrite: 'auto' });
                maskedLink.classList.add('masked-hover');
            });
            link.addEventListener('mouseleave', () => {
                gsap.to([link, maskedLink], { x: 0, duration: 0.3, ease: 'power2.out', overwrite: 'auto' });
                maskedLink.classList.remove('masked-hover');
            });
        });
    }
});

