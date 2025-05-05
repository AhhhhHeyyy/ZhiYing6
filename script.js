gsap.registerPlugin(ScrollTrigger);

document.addEventListener("DOMContentLoaded", () => {
    // 初始化Lenis平滑滚动
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
        smoothTouch: false,
        touchMultiplier: 2
    });

    // 请求动画帧
    function raf(time) {
        lenis.raf(time);
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
                    duration: 1.2,
                    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
                });
            }
        });
    });

    // 确保DOM完全加载后再初始化GSAP动画
    setTimeout(() => {
        // 添加skill-H2的动画
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
                        pin: false  // 移除固定定位
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
                        pin: false  // 移除固定定位
                    },
                    opacity: 1,
                    y: 0,
                    duration: 0.5,
                    ease: "power2.out"
                }
            );
        }

        // 画廊动画
        const gallerySection = document.querySelector(".gallery-section");
        if (gallerySection) {
            ScrollTrigger.create({
                trigger: gallerySection,
                start: "top top",
                end: "+=3000",
                pin: false,
                pinSpacing: false
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

            // 显示当前激活的类别
            const activeItem = document.querySelector('.nav-item.active');
            if (activeItem) {
                const activeCategory = activeItem.getAttribute('data-category');
                const targetElement = document.getElementById(activeCategory);
                if (targetElement) {
                    targetElement.style.display = 'block';
                    targetElement.style.opacity = '1';
                }
            }

            // 为每个导航项添加点击事件
            navItems.forEach(item => {
                item.addEventListener('click', () => {
                    const targetCategory = item.getAttribute('data-category');
                    
                    // 更新导航项状态
                    navItems.forEach(nav => nav.classList.remove('active'));
                    item.classList.add('active');

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

        // 技能区域动画
        const skillsSection = document.querySelector('.skills');
        if (skillsSection) {
            // 圆点图案动画
            gsap.from('.pattern-container', {
                scrollTrigger: {
                    trigger: skillsSection,
                    start: "top 80%",
                    toggleActions: "play none none reverse",
                    pin: false  // 移除固定定位
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
                    pin: false  // 移除固定定位
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
                    pin: false  // 移除固定定位
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

    // 获取模态窗口
    var modal = document.getElementById("artModal");
    var span = document.getElementsByClassName("close")[0];

    // 确保元素存在才添加事件监听
    if (modal && span) {
        // 点击作品时打开模态窗口
        var items = document.querySelectorAll('.gallery-item[data-toggle="modal"]');
        items.forEach(item => {
            item.addEventListener('click', function() {
                modal.style.display = "block";
            });
        });

        // 点击关闭按钮时关闭模态窗口
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

                // 更新活动状态
                dropdownItems.forEach(i => i.classList.remove('active'));
                item.classList.add('active');

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
                backgroundColor: "#FAFF60",
                color: "#000",
                boxShadow: "0 4px 16px rgba(250,255,96,0.3)",
                duration: 0.25,
                overwrite: "auto"
            });
            gsap.to(item.querySelector('h2'), {
                color: "#000",
                duration: 0.2,
                overwrite: "auto"
            });
        });
        item.addEventListener('mouseleave', () => {
            gsap.to(item, {
                scale: 1,
                backgroundColor: "transparent",
                color: "#fff",
                boxShadow: "0 0 0 rgba(0,0,0,0)",
                duration: 0.25,
                overwrite: "auto"
            });
            gsap.to(item.querySelector('h2'), {
                color: "#fff",
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
                backgroundColor: "#FAFF60",
                color: "#000",
                duration: 0.2,
                overwrite: "auto"
            });
        });
        item.addEventListener('mouseleave', () => {
            gsap.to(item, {
                scale: 1,
                backgroundColor: "rgba(250,255,96,0.1)",
                color: "#FAFF60",
                duration: 0.2,
                overwrite: "auto"
            });
        });
    });
});

