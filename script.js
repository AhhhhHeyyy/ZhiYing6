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
        
        return true;
    } catch (error) {
        console.error('加载作品数据失败:', error);
        return false;
    }
}

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

// 初始化 intro-images 随机项目显示
async function initIntroProjects() {
    try {
        const response = await fetch('projects.json');
        const projects = await response.json();
        
        // 收集所有项目的图片
        const allProjects = [];
        Object.keys(projects).forEach(category => {
            projects[category].forEach(project => {
                allProjects.push({
                    image: project.image,
                    title: project.title,
                    link: project.link
                });
            });
        });
        
        // 随机打乱数组
        const shuffledProjects = allProjects.sort(() => Math.random() - 0.5);
        
        // 限制显示的项目数量（例如显示 5 个）
        const displayCount = Math.min(5, shuffledProjects.length);
        const selectedProjects = shuffledProjects.slice(0, displayCount);
        
        // 获取 DOM 元素
        const introImage = document.getElementById('introProjectImage');
        const paginationContainer = document.getElementById('introPagination');
        
        if (!introImage || !paginationContainer) return;
        
        let currentIndex = 0;
        
        // 创建分页圆点
        selectedProjects.forEach((project, index) => {
            const dot = document.createElement('span');
            dot.className = 'intro-pagination-dot';
            if (index === 0) dot.classList.add('active');
            dot.setAttribute('data-index', index);
            dot.addEventListener('click', () => {
                switchToProject(index);
            });
            paginationContainer.appendChild(dot);
        });
        
        // 切换项目函数
        function switchToProject(index) {
            if (index === currentIndex || index < 0 || index >= selectedProjects.length) return;
            
            const project = selectedProjects[index];
            const dots = paginationContainer.querySelectorAll('.intro-pagination-dot');
            
            // 更新圆点状态
            dots.forEach((dot, i) => {
                if (i === index) {
                    dot.classList.add('active');
                } else {
                    dot.classList.remove('active');
                }
            });
            
            // 停止当前的动画
            gsap.killTweensOf(introImage);
            
            // 淡出并缩小当前图片
            gsap.to(introImage, {
                opacity: 0,
                scale: 0.95,
                duration: 0.4,
                ease: "power2.in",
                onComplete: () => {
                    // 切换图片
                    introImage.src = project.image;
                    introImage.alt = project.title;
                    
                    // 设置初始状态（放大并透明）
                    gsap.set(introImage, {
                        opacity: 0,
                        scale: 1.05
                    });
                    
                    // 淡入并缩小到正常大小，然后开始缓慢放大动画
                    const tl = gsap.timeline();
                    tl.to(introImage, {
                        opacity: 1,
                        scale: 1,
                        duration: 0.5,
                        ease: "power2.out"
                    })
                    .to(introImage, {
                        scale: 1.08,
                        duration: 4.5,
                        ease: "power1.inOut"
                    }, "-=0.2");
                }
            });
            
            currentIndex = index;
        }
        
        // 设置初始图片
        if (selectedProjects.length > 0) {
            introImage.src = selectedProjects[0].image;
            introImage.alt = selectedProjects[0].title;
            gsap.set(introImage, {
                opacity: 1,
                scale: 1
            });
            
            // 初始图片也添加缓慢放大动画
            gsap.to(introImage, {
                scale: 1.08,
                duration: 5,
                ease: "power1.inOut"
            });
        }
        
        // 自动轮播（每 5 秒切换一次，不受 hover 影响）
        let autoPlayInterval = setInterval(() => {
            const nextIndex = (currentIndex + 1) % selectedProjects.length;
            switchToProject(nextIndex);
        }, 5000);
        
        // 点击图片可以跳转到项目页面
        introImage.style.cursor = 'pointer';
        introImage.addEventListener('click', () => {
            const p = selectedProjects[currentIndex];
            window.location.href = p.link || ('project-page.html?title=' + encodeURIComponent(p.title));
        });
        
    } catch (error) {
        console.error('加载 intro 项目失败:', error);
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    // 立即初始化下拉式清单（不等待所有资源加载）
    initDropdown();
    
    // 初始化显示第一个类别
    const firstCategory = document.querySelector('.gallery-category');
    if (firstCategory) {
        firstCategory.style.display = 'block';
        firstCategory.style.opacity = '1';
    }
    
    // 先加载作品
    await loadAndRenderProjects();
    ScrollTrigger.refresh();
    // 載入近期動態時間軸 + 初始化展開 Modal
    loadAndRenderPosts();
    initPostsModal();
    // 初始化 intro-images 随机项目显示
    initIntroProjects();
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

        // 确保DOM完全加载后再初始化GSAP动画
    setTimeout(() => {
        // 添加skill-H2的动画 - 优化ScrollTrigger性能
        const skillH2 = document.querySelector('.skill-H2');
        const skillH2Bg = document.querySelector('.skill-H2-bg');
        const skillH2Text = document.querySelector('.skill-H2 h2');

        if (skillH2 && skillH2Bg && skillH2Text) {
            // 检测设备类型
            const width = window.innerWidth;
            let triggerStart;
            
            if (width <= 540) {
                // 手机端：更早触发
                triggerStart = "top 90%";
            } else if (width <= 1024) {
                // 平板端
                triggerStart = "top 80%";
            } else {
                // 桌面端
                triggerStart = "top 60%";
            }
            
            // 背景动画（和电脑端一样的方法）
            gsap.fromTo(skillH2Bg, 
                {
                    scaleX: 0
                },
                {
                    scrollTrigger: {
                        trigger: skillH2,
                        start: triggerStart,
                        toggleActions: "play none none reverse",
                        pin: false,
                        refreshPriority: -1
                    },
                    scaleX: 1,
                    duration: 0.6,
                    ease: "power2.out"
                }
            );

            // 文字动画（和电脑端一样的方法）
            gsap.fromTo(skillH2Text,
                {
                    opacity: 0,
                    y: 20
                },
                {
                    scrollTrigger: {
                        trigger: skillH2,
                        start: triggerStart,
                        toggleActions: "play none none reverse",
                        pin: false,
                        refreshPriority: -1
                    },
                    opacity: 1,
                    y: 0,
                    duration: 0.6,
                    delay: 0.1,
                    ease: "power2.out"
                }
            );
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

            // 标题动画
            gsap.from('.skill-H2', {
                scrollTrigger: {
                    trigger: skillsSection,
                    start: "top 70%",
                    toggleActions: "play none none reverse",
                    pin: false,
                    refreshPriority: -1  // 优化性能
                },
                y: 50,
                opacity: 0,
                duration: 0.8,
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

    // 社群 logo 遮罩：intro 展示區內顯示深藍色
    const maskedIcons = document.querySelector('.social-icons-masked');
    const introSection = document.querySelector('.intro');
    if (maskedIcons && introSection) {
        function updateSocialMask() {
            const el = maskedIcons.getBoundingClientRect();
            const intro = introSection.getBoundingClientRect();
            // 從上方裁切：icon 在 intro 頂部以上的部分
            const clipTop = Math.max(0, intro.top - el.top);
            // 從下方裁切：icon 在 intro 底部以下的部分
            const clipBottom = Math.max(0, el.bottom - intro.bottom);
            maskedIcons.style.clipPath = `inset(${clipTop}px 0 ${clipBottom}px 0)`;
        }
        updateSocialMask();
        window.addEventListener('scroll', updateSocialMask, { passive: true });
        window.addEventListener('resize', updateSocialMask, { passive: true });
    }
});

