// 图片模态窗口导航功能
(function() {
    let imageList = [];
    let currentIndex = 0;
    let modal = null;
    let modalImg = null;
    let prevBtn = null;
    let nextBtn = null;
    let isInitialized = false;

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
        if (!document.hasAttribute('data-modal-keyboard-bound')) {
            document.addEventListener('keydown', handleKeyDown);
            document.setAttribute('data-modal-keyboard-bound', 'true');
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
        const images = document.querySelectorAll('.project-gallery img, .peek-image img, .main-image img');
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
        
        if (item.type === 'image') {
            modalImg.src = item.src;
            modalImg.style.display = 'block';
        } else if (item.type === 'video') {
            // 对于视频，可以显示视频元素或缩略图
            modalImg.src = item.src;
            modalImg.style.display = 'block';
        }

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
        const img = e.target.closest('.project-gallery img, .peek-image img, .main-image img');
        if (img) {
            // 延迟执行，确保模态窗口已经打开
            setTimeout(onModalOpen, 150);
        }
    }, true); // 使用捕获阶段，确保在其他事件之前执行

    // 重写图片点击处理，确保索引更新
    function interceptImageClicks() {
        const images = document.querySelectorAll('.project-gallery img, .peek-image img, .main-image img');
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

