// 自动化项目导航脚本
// 基于 projects.json 自动生成上一个/下一个项目链接

(async function() {
    try {
        // 获取当前页面路径
        const currentPath = window.location.pathname;
        const currentFile = currentPath.split('/').pop();

        console.log('[NAV] currentPath:', currentPath, '| currentFile:', currentFile);

        // projects-nav.json 是精簡版（僅含 title/link/order），避免載入含 base64 圖片的 4MB+ projects.json
        const jsonPath = '../../projects-nav.json';

        // 加载项目数据
        const response = await fetch(jsonPath);
        console.log('[NAV] fetch status:', response.status, response.url);
        const projectsData = await response.json();

        // 将所有分类的项目合并成一个扁平数组，保持顺序
        const allProjects = [];
        Object.keys(projectsData).forEach(category => {
            const sortedProjects = projectsData[category]
                .sort((a, b) => a.order - b.order)
                .map(project => ({
                    ...project,
                    category: category
                }));
            allProjects.push(...sortedProjects);
        });

        console.log('[NAV] allProjects count:', allProjects.length, allProjects.map(p => p.title));

        // 找到当前项目（大小寫不敏感 + 忽略 .html，兼容 Netlify Pretty URLs）
        const currentProjectIndex = allProjects.findIndex(project => {
            const projectPath = project.link.replace('projects/', '').toLowerCase().replace('.html', '');
            const normalizedFile = currentFile.toLowerCase().replace('.html', '');
            const normalizedPath = currentPath.toLowerCase().replace('.html', '');
            return projectPath.includes(normalizedFile) || normalizedPath.includes(projectPath);
        });

        console.log('[NAV] currentProjectIndex:', currentProjectIndex);

        if (currentProjectIndex === -1) {
            console.warn('[NAV] 未找到当前项目，导航链接将不会显示');
            // 找不到時仍顯示按鈕（保留 href="#"），避免永久隱藏
            const pb = document.querySelector('.prev-btn-fixed');
            const nb = document.querySelector('.next-btn-fixed');
            if (pb) pb.style.visibility = 'visible';
            if (nb) nb.style.visibility = 'visible';
            return;
        }
        
        // 获取上一个和下一个项目
        const prevProject = currentProjectIndex > 0 ? allProjects[currentProjectIndex - 1] : null;
        const nextProject = currentProjectIndex < allProjects.length - 1 ? allProjects[currentProjectIndex + 1] : null;
        
        // 更新导航链接
        const prevBtn = document.querySelector('.prev-btn-fixed');
        const nextBtn = document.querySelector('.next-btn-fixed');
        
        // Compute path relative to current page (which is 2 dirs deep: projects/xxx/xxx.html)
        function resolveLink(link) {
            if (link.startsWith('projects/')) return link.replace('projects/', '../');
            return '../../' + link;
        }

        console.log('[NAV] prev:', prevProject?.title, '| next:', nextProject?.title);

        if (prevBtn) {
            if (prevProject) {
                prevBtn.href = resolveLink(prevProject.link);
                prevBtn.style.visibility = 'visible';
                prevBtn.style.pointerEvents = 'auto';
                prevBtn.style.opacity = '';
                console.log('[NAV] prevBtn.href set to:', prevBtn.href);
            } else {
                prevBtn.style.visibility = 'hidden';
                prevBtn.style.pointerEvents = 'none';
                prevBtn.style.opacity = '';
            }
        }

        if (nextBtn) {
            if (nextProject) {
                nextBtn.href = resolveLink(nextProject.link);
                nextBtn.style.visibility = 'visible';
                nextBtn.style.pointerEvents = 'auto';
                nextBtn.style.opacity = '';
                console.log('[NAV] nextBtn.href set to:', nextBtn.href);
            } else {
                nextBtn.style.visibility = 'hidden';
                nextBtn.style.pointerEvents = 'none';
                nextBtn.style.opacity = '';
            }
        }
        
    } catch (error) {
        console.error('[NAV] 加载导航数据失败:', error);
        // fetch/解析失敗時仍顯示按鈕，避免 visibility:hidden 永久生效
        const pb = document.querySelector('.prev-btn-fixed');
        const nb = document.querySelector('.next-btn-fixed');
        if (pb) pb.style.visibility = 'visible';
        if (nb) nb.style.visibility = 'visible';
    }
})();

