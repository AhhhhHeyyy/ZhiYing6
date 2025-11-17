// 图片模态窗口导航功能
(function() {
    let imageList = [];
    let currentIndex = 0;
    let modal = null;
    let modalImg = null;
    let prevBtn = null;
    let nextBtn = null;
    let isInitialized = false;
    let isKeyboardBound = false; // 跟踪键盘事件是否已绑定

    function initModalNavigation() {
        if (isInitialized) return;
        
        modal = document.getElementById('img-modal');
        if (!modal) {
            setTimeout(initModalNavigation, 100);
            return;
        }

        modalImg = document.getElementById('img-modal-img');
        if (!modalImg) {
            setTimeout(initModalNavigation, 100);
            return;
        }

        // 获取或创建导航按钮
        prevBtn = document.querySelector('.img-modal-nav.prev');
        nextBtn = document.querySelector('.img-modal-nav.next');

        if (!prevBtn || !nextBtn) {
            // 如果HTML中没有按钮，则创建（但通常应该在HTML中）
            if (!prevBtn) {
                prevBtn = document.createElement('button');
                prevBtn.className = 'img-modal-nav prev';
                prevBtn.innerHTML = '&#8249;';
                prevBtn.setAttribute('aria-label', '上一张');
                modal.appendChild(prevBtn);
            }
            if (!nextBtn) {
                nextBtn = document.createElement('button');
                nextBtn.className = 'img-modal-nav next';
                nextBtn.innerHTML = '&#8250;';
                nextBtn.setAttribute('aria-label', '下一张');
                modal.appendChild(nextBtn);
            }
        }

        // 收集所有可点击的图片和视频
        collectImages();

        // 绑定事件（避免重复绑定）
        if (prevBtn && !prevBtn.hasAttribute('data-bound')) {
            prevBtn.addEventListener('click', showPrevious);
            prevBtn.setAttribute('data-bound', 'true');
        }
        if (nextBtn && !nextBtn.hasAttribute('data-bound')) {
            nextBtn.addEventListener('click', showNext);
            nextBtn.setAttribute('data-bound', 'true');
        }

        // 键盘事件（只绑定一次）
        if (!isKeyboardBound) {
            document.addEventListener('keydown', handleKeyDown);
            isKeyboardBound = true;
        }

        // 触摸滑动事件（移动端）- 立即初始化
        if (!modal.hasAttribute('data-touch-bound')) {
            initTouchSwipe();
            modal.setAttribute('data-touch-bound', 'true');
        }

        // 监听模态窗口显示事件
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    if (modal.classList.contains('show')) {
                        onModalOpen();
                    }
                }
            });
        });
        observer.observe(modal, { attributes: true });

        isInitialized = true;
    }

    function collectImages() {
        imageList = [];
        
        // 收集所有图片
        const images = document.querySelectorAll('.project-gallery img, .peek-image img, .main-image img, .progress-image img');
        images.forEach(img => {
            if (img.src) {
                imageList.push({
                    type: 'image',
                    src: img.src,
                    element: img
                });
            }
        });

        // 收集所有视频（如果有视频缩略图或视频元素）
        const videos = document.querySelectorAll('.project-video video, .custom-video');
        videos.forEach(video => {
            if (video.src || video.querySelector('source')) {
                const source = video.querySelector('source');
                if (source && source.src) {
                    imageList.push({
                        type: 'video',
                        src: source.src,
                        element: video
                    });
                } else if (video.src) {
                    imageList.push({
                        type: 'video',
                        src: video.src,
                        element: video
                    });
                }
            }
        });
    }

    function findCurrentIndex() {
        if (!modalImg || !modalImg.src || imageList.length === 0) return -1;
        
        const currentSrc = modalImg.src;
        // 移除协议和域名，只比较路径
        const currentPath = currentSrc.split('/').pop().split('?')[0];
        
        const index = imageList.findIndex(item => {
            const itemPath = item.src.split('/').pop().split('?')[0];
            const itemFullPath = item.src.split('?')[0];
            const currentFullPath = currentSrc.split('?')[0];
            
            // 多种匹配方式
            return currentPath === itemPath || 
                   currentFullPath === itemFullPath ||
                   currentFullPath.endsWith(itemFullPath) ||
                   itemFullPath.endsWith(currentFullPath) ||
                   currentSrc.includes(itemPath) ||
                   itemFullPath.includes(currentPath);
        });
        
        return index >= 0 ? index : 0; // 如果找不到，默认返回0
    }

    function showImage(index) {
        if (index < 0 || index >= imageList.length) return;
        
        currentIndex = index;
        const item = imageList[currentIndex];
        
        // 添加淡出效果
        modalImg.style.opacity = '0';
        modalImg.style.transform = 'scale(0.95)';
        
        // 等待淡出完成后再切换图片
        setTimeout(function() {
            if (item.type === 'image') {
                // 先设置图片源
                modalImg.src = item.src;
                modalImg.style.display = 'block';
                
                // 等待图片加载完成后再淡入
                if (modalImg.complete) {
                    // 图片已缓存，立即淡入
                    setTimeout(function() {
                        modalImg.style.opacity = '1';
                        modalImg.style.transform = 'scale(1)';
                    }, 10);
                } else {
                    // 等待图片加载完成
                    modalImg.onload = function() {
                        modalImg.style.opacity = '1';
                        modalImg.style.transform = 'scale(1)';
                        modalImg.onload = null; // 清除事件监听
                    };
                }
            } else if (item.type === 'video') {
                // 对于视频，可以显示视频元素或缩略图
                modalImg.src = item.src;
                modalImg.style.display = 'block';
                
                // 视频也使用相同的淡入效果
                setTimeout(function() {
                    modalImg.style.opacity = '1';
                    modalImg.style.transform = 'scale(1)';
                }, 10);
            }
        }, 150); // 淡出时间的一半

        updateNavButtons();
    }

    function showPrevious() {
        if (currentIndex > 0) {
            showImage(currentIndex - 1);
        } else {
            showImage(imageList.length - 1); // 循环到最后一张
        }
    }

    function showNext() {
        if (currentIndex < imageList.length - 1) {
            showImage(currentIndex + 1);
        } else {
            showImage(0); // 循环到第一张
        }
    }

    function updateNavButtons() {
        if (!prevBtn || !nextBtn) return;
        
        // 如果只有一张图片，禁用按钮
        if (imageList.length <= 1) {
            prevBtn.disabled = true;
            nextBtn.disabled = true;
        } else {
            prevBtn.disabled = false;
            nextBtn.disabled = false;
        }
    }

    function handleKeyDown(e) {
        if (!modal || !modal.classList.contains('show')) return;
        
        if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
            e.preventDefault();
            showPrevious();
        } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
            e.preventDefault();
            showNext();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            modal.classList.remove('show');
        }
    }

    // 触摸滑动功能（移动端）
    function initTouchSwipe() {
        if (!modal || !modalImg) {
            return;
        }

        let touchStartX = 0;
        let touchStartY = 0;
        let touchEndX = 0;
        let touchEndY = 0;
        let minSwipeDistance = 50; // 最小滑动距离
        let isSwiping = false;

        // 触摸事件处理函数
        function handleTouchStart(e) {
            if (!modal.classList.contains('show')) return;
            // 如果点击的是关闭按钮或导航按钮，不处理
            if (e.target.closest('.img-modal-close') || e.target.closest('.img-modal-nav')) {
                return;
            }
            isSwiping = false;
            const touch = e.touches[0];
            touchStartX = touch.clientX;
            touchStartY = touch.clientY;
        }

        function handleTouchMove(e) {
            if (!modal.classList.contains('show')) return;
            if (touchStartX === 0) return; // 如果没有开始位置，忽略
            
            const touch = e.touches[0];
            const deltaX = Math.abs(touch.clientX - touchStartX);
            const deltaY = Math.abs(touch.clientY - touchStartY);
            // 如果水平滑动距离大于垂直滑动距离，标记为滑动中
            if (deltaX > deltaY && deltaX > 10) {
                isSwiping = true;
            }
        }

        function handleTouchEnd(e) {
            if (!modal.classList.contains('show')) return;
            if (touchStartX === 0) return; // 如果没有开始位置，忽略
            
            // 如果点击的是关闭按钮或导航按钮，不处理
            if (e.target.closest('.img-modal-close') || e.target.closest('.img-modal-nav')) {
                touchStartX = 0;
                touchStartY = 0;
                return;
            }
            
            const touch = e.changedTouches[0];
            touchEndX = touch.clientX;
            touchEndY = touch.clientY;

            const deltaX = touchEndX - touchStartX;
            const deltaY = touchEndY - touchStartY;
            const absDeltaX = Math.abs(deltaX);
            const absDeltaY = Math.abs(deltaY);

            // 判断是否为水平滑动（水平滑动距离大于垂直滑动距离，且超过最小距离）
            if (isSwiping && absDeltaX > absDeltaY && absDeltaX > minSwipeDistance) {
                e.preventDefault(); // 阻止默认行为
                e.stopPropagation(); // 阻止事件冒泡
                e.stopImmediatePropagation(); // 立即停止传播，防止其他事件处理器
                if (deltaX > 0) {
                    // 向右滑动，显示上一张
                    showPrevious();
                } else {
                    // 向左滑动，显示下一张
                    showNext();
                }
                return false; // 额外确保
            }
            
            // 重置
            touchStartX = 0;
            touchStartY = 0;
            touchEndX = 0;
            touchEndY = 0;
            isSwiping = false;
        }

        // 在模态框和图片上都绑定事件
        // 使用事件委托，确保即使元素动态变化也能工作
        modal.addEventListener('touchstart', handleTouchStart, { passive: true });
        modal.addEventListener('touchmove', handleTouchMove, { passive: true });
        modal.addEventListener('touchend', handleTouchEnd, { passive: false });
        
        // 同时在图片上绑定，确保能捕获到
        if (modalImg) {
            modalImg.addEventListener('touchstart', handleTouchStart, { passive: true });
            modalImg.addEventListener('touchmove', handleTouchMove, { passive: true });
            modalImg.addEventListener('touchend', handleTouchEnd, { passive: false });
            
            // 防止图片的默认拖拽行为干扰
            modalImg.addEventListener('dragstart', function(e) {
                e.preventDefault();
            });
        }
        
        // 调试信息（生产环境可移除）
        console.log('Touch swipe initialized for modal');
    }

    // 监听模态窗口打开事件，更新当前索引
    function onModalOpen() {
        collectImages();
        currentIndex = findCurrentIndex();
        if (currentIndex === -1 && imageList.length > 0) {
            currentIndex = 0;
        }
        updateNavButtons();
    }

    // 重写openModal函数（如果存在）
    const originalOpenModal = window.openModal;
    window.openModal = function(src) {
        if (originalOpenModal) {
            originalOpenModal(src);
        } else {
            if (modalImg) {
                modalImg.src = src;
            }
            if (modal) {
                modal.classList.add('show');
            }
        }
        setTimeout(onModalOpen, 100);
    };

    // 监听所有图片点击事件
    document.addEventListener('click', function(e) {
        const img = e.target.closest('.project-gallery img, .peek-image img, .main-image img, .progress-image img');
        if (img) {
            // 延迟执行，确保模态窗口已经打开
            setTimeout(onModalOpen, 150);
        }
    }, true); // 使用捕获阶段，确保在其他事件之前执行

    // 重写图片点击处理，确保索引更新
    function interceptImageClicks() {
        const images = document.querySelectorAll('.project-gallery img, .peek-image img, .main-image img, .progress-image img');
        images.forEach((img, index) => {
            const originalClick = img.onclick;
            img.addEventListener('click', function(e) {
                // 找到当前图片在列表中的索引
                const clickedSrc = this.src || this.getAttribute('src');
                const foundIndex = imageList.findIndex(item => {
                    const itemPath = item.src.split('/').pop().split('?')[0];
                    const clickedPath = clickedSrc.split('/').pop().split('?')[0];
                    return itemPath === clickedPath || clickedSrc.includes(itemPath);
                });
                
                if (foundIndex >= 0) {
                    currentIndex = foundIndex;
                }
                
                // 延迟更新按钮状态
                setTimeout(() => {
                    updateNavButtons();
                }, 100);
            }, true);
        });
    }

    // 初始化
    function startInit() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
                setTimeout(() => {
                    initModalNavigation();
                    setTimeout(interceptImageClicks, 200);
                }, 500);
            });
        } else {
            setTimeout(() => {
                initModalNavigation();
                setTimeout(interceptImageClicks, 200);
            }, 500);
        }
    }
    
    startInit();
})();

