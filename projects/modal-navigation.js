// 图片模态窗口导航功能
(function() {
    let imageList = [];
    let currentIndex = 0;
    let modal = null;
    let modalImg = null;
    let modalVideo = null;
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

        modalVideo = document.getElementById('img-modal-video');
        if (!modalVideo) {
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
        
        // 按照页面顺序收集所有媒体元素
        // 1. 主图区域
        const mainImages = document.querySelectorAll('.project-gallery img, .main-image img');
        mainImages.forEach(img => {
            if (img.src) {
                imageList.push({
                    type: 'image',
                    src: img.src,
                    element: img
                });
            }
        });

        // 2. 开发过程区域（按顺序收集图片和视频）
        const progressItems = document.querySelectorAll('.progress-item');
        progressItems.forEach(item => {
            // 先检查是否有图片
            const img = item.querySelector('img');
            if (img && img.src) {
                imageList.push({
                    type: 'image',
                    src: img.src,
                    element: img
                });
            }
            
            // 再检查是否有视频
            const video = item.querySelector('.custom-video');
            if (video) {
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

        // 3. 展场纪录区域（documentation-item，按顺序收集图片和视频）
        const documentationItems = document.querySelectorAll('.documentation-item');
        documentationItems.forEach(item => {
            // 先检查是否有图片
            const img = item.querySelector('img');
            if (img && img.src) {
                imageList.push({
                    type: 'image',
                    src: img.src,
                    element: img
                });
            }
            
            // 再检查是否有视频
            const video = item.querySelector('.custom-video');
            if (video) {
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

        // 4. 兼容旧的 progress-image 选择器
        const progressImages = document.querySelectorAll('.progress-image img');
        progressImages.forEach(img => {
            if (img.src) {
                // 检查是否已经添加过（避免重复）
                const alreadyAdded = imageList.some(item => {
                    const itemPath = item.src.split('/').pop().split('?')[0];
                    const imgPath = img.src.split('/').pop().split('?')[0];
                    return itemPath === imgPath;
                });
                if (!alreadyAdded) {
                    imageList.push({
                        type: 'image',
                        src: img.src,
                        element: img
                    });
                }
            }
        });

        // 5. 专案概述区域（peek-image）
        const peekImages = document.querySelectorAll('.peek-image img');
        peekImages.forEach(img => {
            if (img.src) {
                imageList.push({
                    type: 'image',
                    src: img.src,
                    element: img
                });
            }
        });

        // 6b. 頁面建構器 grid 圖片（eb-grid-cell）
        const gridCellImages = document.querySelectorAll('.eb-grid-cell img');
        gridCellImages.forEach(img => {
            if (img.src) {
                const alreadyAdded = imageList.some(item => {
                    const itemPath = item.src.split('/').pop().split('?')[0];
                    const imgPath = img.src.split('/').pop().split('?')[0];
                    return itemPath === imgPath;
                });
                if (!alreadyAdded) {
                    imageList.push({
                        type: 'image',
                        src: img.src,
                        element: img
                    });
                }
            }
        });

        // 6. 其他视频（不在 progress-item 或 documentation-item 中的，如 .project-video）
        const otherVideos = document.querySelectorAll('.project-video video');
        otherVideos.forEach(video => {
            // 检查这个视频是否已经在 progress-item 或 documentation-item 中
            const isInGrid = video.closest('.progress-item') || video.closest('.documentation-item');
            if (isInGrid) {
                return; // 跳过已经在 Grid 中的视频
            }
            
            if (video.src || video.querySelector('source')) {
                const source = video.querySelector('source');
                if (source && source.src) {
                    // 检查是否已经添加过
                    const alreadyAdded = imageList.some(item => {
                        const itemPath = item.src.split('/').pop().split('?')[0];
                        const videoPath = source.src.split('/').pop().split('?')[0];
                        return itemPath === videoPath;
                    });
                    if (!alreadyAdded) {
                        imageList.push({
                            type: 'video',
                            src: source.src,
                            element: video
                        });
                    }
                } else if (video.src) {
                    const alreadyAdded = imageList.some(item => {
                        const itemPath = item.src.split('/').pop().split('?')[0];
                        const videoPath = video.src.split('/').pop().split('?')[0];
                        return itemPath === videoPath;
                    });
                    if (!alreadyAdded) {
                        imageList.push({
                            type: 'video',
                            src: video.src,
                            element: video
                        });
                    }
                }
            }
        });
    }

    function findCurrentIndex() {
        if (imageList.length === 0) return -1;
        
        let currentSrc = '';
        
        // 检查当前显示的是图片还是视频
        if (modalVideo && modalVideo.style.display !== 'none' && modalVideo.querySelector('source')) {
            const source = modalVideo.querySelector('source');
            if (source && source.src) {
                currentSrc = source.src;
            }
        } else if (modalImg && modalImg.style.display !== 'none' && modalImg.src) {
            currentSrc = modalImg.src;
        } else {
            // 如果都不可见，尝试从可见的元素获取
            if (modalVideo && modalVideo.querySelector('source')) {
                const source = modalVideo.querySelector('source');
                if (source && source.src) {
                    currentSrc = source.src;
                }
            } else if (modalImg && modalImg.src) {
                currentSrc = modalImg.src;
            }
        }
        
        if (!currentSrc) return -1;
        
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
        if (modalImg) {
            modalImg.style.opacity = '0';
            modalImg.style.transform = 'scale(0.95)';
        }
        if (modalVideo) {
            modalVideo.style.opacity = '0';
            modalVideo.style.transform = 'scale(0.95)';
        }
        
        // 等待淡出完成后再切换媒体
        setTimeout(function() {
            if (item.type === 'image') {
                // 隐藏视频，显示图片
                if (modalVideo) {
                    modalVideo.pause();
                    modalVideo.style.display = 'none';
                }
                if (modalImg) {
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
                }
            } else if (item.type === 'video') {
                // 隐藏图片，显示视频
                if (modalImg) {
                    modalImg.style.display = 'none';
                }
                if (modalVideo) {
                    // 清空并重新设置视频源
                    modalVideo.innerHTML = '';
                    const source = document.createElement('source');
                    source.src = item.src;
                    source.type = 'video/mp4';
                    modalVideo.appendChild(source);
                    
                    // 设置视频初始状态（和图片一样）
                    modalVideo.style.display = 'block';
                    modalVideo.style.opacity = '0';
                    modalVideo.style.transform = 'scale(0.95)';
                    modalVideo.style.transition = 'opacity 0.3s ease-in-out, transform 0.3s ease-in-out';
                    
                    // 模态框中的视频应该有控制栏，不自动播放，不静音
                    modalVideo.setAttribute('controls', '');
                    modalVideo.removeAttribute('autoplay');
                    modalVideo.removeAttribute('loop');
                    modalVideo.removeAttribute('muted');
                    
                    // 暂停视频，让用户手动播放
                    modalVideo.pause();
                    
                    // 加载视频
                    modalVideo.load();
                    
                    // 等待视频元数据加载完成后再淡入（和图片一样）
                    const showVideo = function() {
                        modalVideo.style.opacity = '1';
                        modalVideo.style.transform = 'scale(1)';
                    };
                    
                    if (modalVideo.readyState >= 1) {
                        // 视频元数据已加载，立即淡入
                        setTimeout(function() {
                            showVideo();
                        }, 10);
                    } else {
                        // 等待视频元数据加载完成
                        const onVideoLoadedMetadata = function() {
                            showVideo();
                            modalVideo.removeEventListener('loadedmetadata', onVideoLoadedMetadata);
                            modalVideo.removeEventListener('canplay', onVideoCanPlay);
                        };
                        
                        const onVideoCanPlay = function() {
                            showVideo();
                            modalVideo.removeEventListener('loadedmetadata', onVideoLoadedMetadata);
                            modalVideo.removeEventListener('canplay', onVideoCanPlay);
                        };
                        
                        modalVideo.addEventListener('loadedmetadata', onVideoLoadedMetadata);
                        modalVideo.addEventListener('canplay', onVideoCanPlay);
                    }
                }
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
        const img = e.target.closest('.project-gallery img, .peek-image img, .main-image img, .progress-image img, .progress-item img, .documentation-item img, .eb-grid-cell img');
        if (img) {
            // 延迟执行，确保模态窗口已经打开
            setTimeout(onModalOpen, 150);
        }
        
        // 监听视频点击事件（通过 progress-item 或 documentation-item）
        const progressItem = e.target.closest('.progress-item');
        const documentationItem = e.target.closest('.documentation-item');
        const item = progressItem || documentationItem;
        if (item) {
            const video = item.querySelector('.custom-video');
            if (video && !item.querySelector('img')) {
                // 这是一个只有视频的项目，延迟执行确保模态窗口已经打开
                setTimeout(onModalOpen, 150);
            }
        }
    }, true); // 使用捕获阶段，确保在其他事件之前执行

    // 重写图片点击处理，确保索引更新
    function interceptImageClicks() {
        const images = document.querySelectorAll('.project-gallery img, .peek-image img, .main-image img, .progress-image img, .progress-item img, .documentation-item img, .eb-grid-cell img');
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

    // 设置 Grid 中的视频自动循环播放且静音
    function initGridVideos() {
        // 获取所有 Grid 中的视频（progress-item 和 documentation-item 中的视频）
        const gridVideos = document.querySelectorAll('.progress-item .custom-video, .documentation-item .custom-video');
        
        // 如果没有找到视频，延迟重试
        if (gridVideos.length === 0) {
            setTimeout(initGridVideos, 200);
            return;
        }
        
        gridVideos.forEach(video => {
            // 找到对应的播放按钮
            const wrapper = video.closest('.custom-video-wrapper');
            const playBtn = wrapper ? wrapper.querySelector('.custom-play-btn') : null;
            
            // 设置自动播放、循环和静音
            video.setAttribute('autoplay', '');
            video.setAttribute('loop', '');
            video.setAttribute('muted', '');
            video.setAttribute('playsinline', ''); // 移动端自动播放需要这个属性
            
            // 移除 controls 属性（Grid 中的视频不需要控制栏，因为会自动播放）
            video.removeAttribute('controls');
            
            // 隐藏播放按钮（因为视频会自动播放）
            if (playBtn) {
                playBtn.classList.add('hide');
            }
            
            // 确保视频静音（某些浏览器需要明确设置）
            video.muted = true;
            
            // 设置循环播放
            video.loop = true;
            
            // 函数：尝试播放视频
            function tryPlayVideo() {
                if (video.readyState >= 2) { // HAVE_CURRENT_DATA
                    video.play().then(() => {
                        // 播放成功，确保播放按钮隐藏
                        if (playBtn) {
                            playBtn.classList.add('hide');
                        }
                    }).catch(err => {
                        // 如果自动播放失败（某些浏览器需要用户交互），显示播放按钮
                        if (playBtn) {
                            playBtn.classList.remove('hide');
                        }
                        console.log('Video autoplay prevented:', err);
                    });
                } else {
                    // 视频还没准备好，等待加载
                    video.addEventListener('loadedmetadata', tryPlayVideo, { once: true });
                    video.addEventListener('canplay', tryPlayVideo, { once: true });
                }
            }
            
            // 如果视频已经加载，立即尝试播放
            if (video.readyState >= 2) {
                tryPlayVideo();
            } else {
                // 等待视频加载完成
                video.addEventListener('loadedmetadata', tryPlayVideo, { once: true });
                video.addEventListener('canplay', tryPlayVideo, { once: true });
                // 加载视频
                video.load();
            }
            
            // 监听视频播放事件，确保播放按钮隐藏
            // 使用 addEventListener 而不是 onplay，避免覆盖其他脚本的事件监听器
            video.addEventListener('play', function() {
                if (playBtn) {
                    playBtn.classList.add('hide');
                }
            }, { passive: true });
            
            // 监听视频暂停事件，显示播放按钮（虽然 Grid 中的视频不应该暂停）
            // 使用 addEventListener 而不是 onpause，避免覆盖其他脚本的事件监听器
            video.addEventListener('pause', function() {
                // 只在非自动播放的情况下显示播放按钮
                // 如果视频有 autoplay 属性，不显示播放按钮
                if (playBtn && !video.hasAttribute('autoplay')) {
                    playBtn.classList.remove('hide');
                }
            }, { passive: true });
            
            // 监听视频结束事件，确保循环播放（虽然 loop 属性应该已经处理了）
            video.addEventListener('ended', function() {
                // 确保循环播放
                if (this.loop) {
                    this.currentTime = 0;
                    this.play().catch(err => {
                        console.log('Video loop play error:', err);
                    });
                }
            });
            
            // 监听视频加载完成事件，确保自动播放
            video.addEventListener('loadeddata', function() {
                if (this.paused && this.hasAttribute('autoplay')) {
                    this.play().catch(err => {
                        console.log('Video autoplay on loadeddata prevented:', err);
                    });
                }
            });
        });
    }

    // 初始化
    function startInit() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
                setTimeout(() => {
                    initModalNavigation();
                    // 延迟初始化视频，确保页面完全加载
                    setTimeout(() => {
                        initGridVideos();
                    }, 300);
                    setTimeout(interceptImageClicks, 200);
                }, 500);
            });
        } else {
            setTimeout(() => {
                initModalNavigation();
                // 延迟初始化视频，确保页面完全加载
                setTimeout(() => {
                    initGridVideos();
                }, 300);
                setTimeout(interceptImageClicks, 200);
            }, 500);
        }
    }
    
    startInit();
})();

