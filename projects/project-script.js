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

