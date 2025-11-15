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
                
                // 如果是 installation 分类且有 hasModal 属性，添加 modal 属性
                if (category === 'installation' && project.hasModal) {
                    item.setAttribute('data-toggle', 'modal');
                    item.setAttribute('data-target', '#artModal');
                }
                
                item.innerHTML = `
                    <a href="${project.link}">
                        <img src="${project.image}" alt="${project.title}">
                        <div class="item-overlay">
                            <h3>${project.title}</h3>
                            <p>${project.date}</p>
                        </div>
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

// 初始化横向滚动项目画廊
async function initScrollGallery() {
    try {
        const response = await fetch('projects.json');
        const projects = await response.json();
        
        // 合并所有分类的项目
        const allProjects = [];
        Object.keys(projects).forEach(category => {
            projects[category].forEach(project => {
                allProjects.push(project);
            });
        });
        
        // 随机打乱项目顺序
        const shuffledProjects = allProjects.sort(() => Math.random() - 0.5);
        
        const track = document.getElementById('projectsScrollTrack');
        if (!track) return;
        
        // 清空现有内容
        track.innerHTML = '';
        
        // 创建项目卡片（原始 + 复制，用于无缝循环）
        const createProjectItem = (project) => {
            const item = document.createElement('div');
            item.className = 'project-scroll-item';
            
            item.innerHTML = `
                <a href="${project.link}">
                    <img src="${project.image}" alt="${project.title}">
                    <div class="item-overlay">
                        <h3>${project.title}</h3>
                        <p>${project.date}</p>
                    </div>
                </a>
            `;
            
            return item;
        };
        
        // 添加原始项目
        shuffledProjects.forEach(project => {
            track.appendChild(createProjectItem(project));
        });
        
        // 添加复制项目（用于无缝循环）
        shuffledProjects.forEach(project => {
            track.appendChild(createProjectItem(project));
        });
        
        // 等待DOM渲染完成
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // 计算滚动距离（一个完整列表的宽度）
        const firstItem = track.querySelector('.project-scroll-item');
        if (!firstItem) return;
        
        const itemWidth = firstItem.offsetWidth;
        const gap = 30; // 与CSS中的gap保持一致
        const scrollDistance = shuffledProjects.length * (itemWidth + gap);
        
        // 确保所有链接都可以点击
        const allLinks = track.querySelectorAll('.project-scroll-item a');
        allLinks.forEach(link => {
            link.style.pointerEvents = 'auto';
            link.style.zIndex = '20';
        });
        
        // 使用GSAP创建无限循环滚动动画
        // 滚动一个完整列表的距离，然后重置到0实现无缝循环
        let scrollAnimation = null;
        
        function animateScroll() {
            scrollAnimation = gsap.to(track, {
                x: -scrollDistance,
                duration: 30, // 30秒滚动一个完整列表
                ease: "none",
                onComplete: () => {
                    // 动画完成后立即重置位置
                    gsap.set(track, { x: 0 });
                    // 重新开始动画
                    animateScroll();
                }
            });
        }
        
        // 开始动画
        animateScroll();
        
        // 检测是否为移动设备
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                         (window.innerWidth <= 1024 && 'ontouchstart' in window);
        
        // 为所有项目卡片添加交互功能
        const allItems = track.querySelectorAll('.project-scroll-item');
        
        allItems.forEach(item => {
            if (isMobile) {
                // 移动端：长按停止+放大
                let touchTimer = null;
                let isLongPress = false;
                let touchStartTime = 0;
                
                item.addEventListener('touchstart', (e) => {
                    isLongPress = false;
                    touchStartTime = Date.now();
                    touchTimer = setTimeout(() => {
                        isLongPress = true;
                        // 停止滚动
                        if (scrollAnimation) {
                            scrollAnimation.pause();
                        }
                        // 添加放大效果
                        item.classList.add('active');
                        // 触觉反馈（如果支持）
                        if (navigator.vibrate) {
                            navigator.vibrate(50);
                        }
                    }, 300); // 300ms视为长按
                }, { passive: true });
                
                item.addEventListener('touchend', (e) => {
                    const touchDuration = Date.now() - touchStartTime;
                    clearTimeout(touchTimer);
                    
                    // 无论是否长按，都确保移除active类和恢复滚动
                    if (item.classList.contains('active')) {
                        // 恢复滚动
                        if (scrollAnimation) {
                            scrollAnimation.resume();
                        }
                        // 移除放大效果
                        item.classList.remove('active');
                        // 如果是长按，阻止点击事件
                        if (isLongPress) {
                            e.preventDefault();
                            // 延迟一下再允许点击，避免误触
                            setTimeout(() => {
                                isLongPress = false;
                            }, 100);
                        }
                    }
                });
                
                item.addEventListener('touchcancel', () => {
                    clearTimeout(touchTimer);
                    // 无论是否长按，都确保移除active类和恢复滚动
                    if (item.classList.contains('active')) {
                        // 恢复滚动
                        if (scrollAnimation) {
                            scrollAnimation.resume();
                        }
                        // 移除放大效果
                        item.classList.remove('active');
                        isLongPress = false;
                    }
                });
                
                // 防止长按后立即触发点击
                item.addEventListener('click', (e) => {
                    if (isLongPress) {
                        e.preventDefault();
                        e.stopPropagation();
                    }
                }, true);
            } else {
                // 桌面端：hover停止+放大
                item.addEventListener('mouseenter', () => {
                    if (scrollAnimation) {
                        scrollAnimation.pause();
                    }
                });
                
                item.addEventListener('mouseleave', () => {
                    if (scrollAnimation) {
                        scrollAnimation.resume();
                    }
                });
            }
        });
        
        return true;
    } catch (error) {
        console.error('初始化横向滚动画廊失败:', error);
        return false;
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    // 先加载作品
    await loadAndRenderProjects();
    // 初始化横向滚动画廊
    await initScrollGallery();
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
            gsap.fromTo(skillH2Bg, 
                {
                    scaleX: 0
                },
                {
                    scrollTrigger: {
                        trigger: skillH2,
                        start: "top 60%",
                        toggleActions: "play none none reverse",
                        pin: false,
                        refreshPriority: -1  // 优化性能
                    },
                    scaleX: 1,
                    duration: 0.5,
                    ease: "power2.out"
                }
            );

            gsap.fromTo(skillH2Text,
                {
                    opacity: 0,
                    y: 20
                },
                {
                    scrollTrigger: {
                        trigger: skillH2,
                        start: "top 60%",
                        toggleActions: "play none none reverse",
                        pin: false,
                        refreshPriority: -1  // 优化性能
                    },
                    opacity: 1,
                    y: 0,
                    duration: 0.5,
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
        
        // 初始化 active 项目的颜色
        const activeDropdownItem = document.querySelector('.dropdown-item.active');
        if (activeDropdownItem) {
            gsap.set(activeDropdownItem, {
                backgroundColor: "#92C7CF",
                color: "#000"
            });
        }
        
        // 确保所有非 active 的下拉菜单项使用默认颜色
        dropdownItems.forEach(item => {
            if (!item.classList.contains('active')) {
                gsap.set(item, {
                    backgroundColor: "rgba(0,0,0,0.9)",
                    color: "#92C7CF"
                });
            }
        });
        
        dropdownBtn.onclick = function(e) {
            console.log('点击了下拉按钮');
            e.stopPropagation();
            
            if (dropdownList.style.display === 'block') {
                // 关闭动画
                gsap.to(dropdownList, {
                    opacity: 0,
                    y: -10,
                    duration: 0.3,
                    ease: 'power2.in',
                    onComplete: () => {
                        dropdownList.style.display = 'none';
                    }
                });
            } else {
                // 打开动画
                dropdownList.style.display = 'block';
                gsap.to(dropdownList, {
                    opacity: 1,
                    y: 0,
                    duration: 0.3,
                    ease: 'power2.out'
                });
            }
        };
        
        // 下拉菜单项点击切换分类（優化動畫）
        dropdownItems.forEach(item => {
            item.addEventListener('click', function() {
                // 更新选中文本
                if (selectedText) selectedText.textContent = item.textContent;

                // 更新活动状态并恢复颜色
                dropdownItems.forEach(i => {
                    i.classList.remove('active');
                    // 恢复非 active 状态的颜色
                    gsap.to(i, {
                        backgroundColor: "rgba(0,0,0,0.9)",
                        color: "#92C7CF",
                        duration: 0.2,
                        overwrite: "auto"
                    });
                });
                item.classList.add('active');
                // 设置 active 状态的颜色
                gsap.to(item, {
                    backgroundColor: "#92C7CF",
                    color: "#000",
                    duration: 0.2,
                    overwrite: "auto"
                });

                // 切換內容動畫
                const category = item.getAttribute('data-category');
                const categories = document.querySelectorAll('.gallery-category');
                const currentVisible = Array.from(categories).find(cat => cat.style.display === 'block' || cat.style.opacity === '1');

                // 先淡出舊內容
                if (currentVisible && currentVisible.id !== category) {
                    gsap.to(currentVisible, {
                        opacity: 0,
                        duration: 0.25,
                        pointerEvents: "none",
                        onComplete: () => {
                            currentVisible.style.display = 'none';
                            // 顯示新內容並淡入
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

    // 确保在DOM加载完成后执行
    window.onload = function() {
        console.log('页面加载完成');
        initDropdown();
        
        // 初始化显示第一个类别
        const firstCategory = document.querySelector('.gallery-category');
        if (firstCategory) {
            firstCategory.style.display = 'block';
            firstCategory.style.opacity = '1';
        }
    };

    // 测试下拉菜单
    const testDropdown = () => {
        const btn = document.getElementById('dropdownBtn');
        const list = document.getElementById('dropdownList');
        
        if (btn && list) {
            btn.addEventListener('click', () => {
                console.log('点击按钮');
                list.style.display = list.style.display === 'block' ? 'none' : 'block';
            });
        }
    };

    // 在DOM加载完成后运行测试
    document.addEventListener('DOMContentLoaded', testDropdown);

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
                backgroundColor: isActive ? "#92C7CF" : "rgba(0,0,0,0.9)",
                color: isActive ? "#000" : "#92C7CF",
                duration: 0.2,
                overwrite: "auto"
            });
        });
    });
});

