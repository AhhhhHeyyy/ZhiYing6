// === DARK MODE TOGGLE ===
(function () {
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
    }
    document.addEventListener('DOMContentLoaded', function () {
        var btn = document.getElementById('themeToggle');
        if (btn) {
            btn.addEventListener('click', function () {
                document.body.classList.toggle('dark-mode');
                localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
            });
            setTimeout(function () { btn.classList.add('visible'); }, 500);
        }
    });
})();

// 项目页面专用的平滑滚动初始化
(function() {
    let lenisInstance = null;
    let rafId = null;
    let retryCount = 0;
    const maxRetries = 100; // 增加重试次数到 100 次（约 5 秒）

    function initLenis() {
        // 检查 Lenis 是否已加载
        if (typeof Lenis === 'undefined') {
            retryCount++;
            if (retryCount < maxRetries) {
                // 如果还没加载，等待一下再试
                setTimeout(initLenis, 50);
            } else {
                console.error('Lenis 加载超时，请检查网络连接或 CDN 是否可访问');
                console.error('尝试访问的 CDN: https://cdn.jsdelivr.net/gh/studio-freight/lenis@1.0.29/bundled/lenis.min.js');
            }
            return;
        }

        // 如果已经初始化过，不再重复初始化
        if (lenisInstance) {
            return;
        }

        try {
            // 初始化Lenis平滑滚动
            lenisInstance = new Lenis({
                duration: 0.8,
                easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
                direction: 'vertical',
                gestureDirection: 'vertical',
                smooth: true,
                smoothTouch: false,
                touchMultiplier: 2,
                wheelMultiplier: 1,
                infinite: false
            });

            // 将Lenis与GSAP ScrollTrigger集成（如果已加载）
            if (typeof ScrollTrigger !== 'undefined') {
                lenisInstance.on('scroll', ScrollTrigger.update);
            }

            // 请求动画帧
            function raf(time) {
                if (lenisInstance) {
                    lenisInstance.raf(time);
                    if (typeof ScrollTrigger !== 'undefined') {
                        ScrollTrigger.update();
                    }
                    rafId = requestAnimationFrame(raf);
                }
            }
            rafId = requestAnimationFrame(raf);
            
            console.log('Lenis 平滑滚动已初始化');
        } catch (error) {
            console.error('Lenis 初始化失败:', error);
        }
    }

    // 使用多种方式确保 Lenis 加载完成后再初始化
    function startInit() {
        // 方法1: 延迟初始化（给脚本加载时间）
        setTimeout(initLenis, 300);
        
        // 方法2: 监听 window load 事件
        if (document.readyState === 'complete') {
            // 页面已完全加载
            setTimeout(initLenis, 100);
        } else {
            window.addEventListener('load', function() {
                if (!lenisInstance && typeof Lenis !== 'undefined') {
                    setTimeout(initLenis, 100);
                }
            });
        }
        
        // 方法3: 监听所有 script 标签的加载事件
        const lenisScript = document.querySelector('script[src*="lenis"]');
        if (lenisScript) {
            lenisScript.addEventListener('load', function() {
                setTimeout(initLenis, 100);
            });
            lenisScript.addEventListener('error', function() {
                console.error('Lenis 脚本加载失败，请检查 CDN 链接:', this.src);
            });
        }
    }
    
    // 开始初始化流程
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', startInit);
    } else {
        startInit();
    }
})();

// === PIXEL SUNGLASSES CURSOR ===
(function () {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    const cur = document.getElementById('pixel-cursor');
    if (!cur) return;
    let lastPx = -999, lastPy = -999;
    document.addEventListener('mousemove', function (e) {
        const x = e.clientX, y = e.clientY;
        cur.style.left = x + 'px';
        cur.style.top  = y + 'px';
        cur.classList.add('is-visible');
        const dist = Math.hypot(x - lastPx, y - lastPy);
        if (dist > 16) {
            spawnParticles(x, y, Math.random() < 0.5 ? 1 : 2);
            lastPx = x; lastPy = y;
        }
    }, { passive: true });
    document.addEventListener('mouseleave', () => cur.classList.remove('is-visible'));
    document.addEventListener('mousedown', () => cur.classList.add('is-clicking'));
    document.addEventListener('mouseup',   () => cur.classList.remove('is-clicking'));
    const HOVER_SEL = 'a, button, [data-toggle], input, textarea, select, label, [role="button"]';
    document.addEventListener('mouseover', function (e) {
        if (e.target.closest(HOVER_SEL)) cur.classList.add('is-hover');
    });
    document.addEventListener('mouseout', function (e) {
        if (e.target.closest(HOVER_SEL)) cur.classList.remove('is-hover');
    });
    const COLORS = ['#92C7CF', '#AAD7D9', '#005C80', '#FBF8EE', '#bed7e8'];
    const SIZES  = [10, 10, 12, 12, 14];
    function spawnParticles(x, y, count) {
        for (let i = 0; i < count; i++) {
            const p = document.createElement('div');
            p.className = 'px-particle';
            const sz  = SIZES[Math.floor(Math.random() * SIZES.length)];
            const tx  = (Math.random() - 0.5) * 52;
            const ty  = Math.random() * 36 + 8;
            const dur = (0.38 + Math.random() * 0.38).toFixed(2) + 's';
            p.style.cssText =
                'left:' + (x + (Math.random() - 0.5) * 10) + 'px;' +
                'top:'  + (y + (Math.random() - 0.5) * 10) + 'px;' +
                'width:' + sz + 'px;height:' + sz + 'px;' +
                'background:' + COLORS[Math.floor(Math.random() * COLORS.length)] + ';' +
                '--tx:' + tx + 'px;--ty:' + ty + 'px;--dur:' + dur + ';';
            document.body.appendChild(p);
            setTimeout(() => p.remove(), parseFloat(dur) * 1000 + 80);
        }
    }
}());

