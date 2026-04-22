// 自动化项目导航脚本
// 基于 projects.json 自动生成上一个/下一个项目链接

(async function() {
    try {
        // 获取当前页面路径
        const currentPath = window.location.pathname;
        const currentFile = currentPath.split('/').pop();
        
        // projects-nav.json 是精簡版（僅含 title/link/order），避免載入含 base64 圖片的 4MB+ projects.json
        const jsonPath = '../../projects-nav.json';
        
        // 加载项目数据
        const response = await fetch(jsonPath);
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
        
        // 找到当前项目
        const currentProjectIndex = allProjects.findIndex(project => {
            const projectPath = project.link.replace('projects/', '');
            return projectPath.includes(currentFile) || currentPath.includes(projectPath);
        });
        
        if (currentProjectIndex === -1) {
            console.warn('未找到当前项目，导航链接将不会显示');
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

        if (prevBtn) {
            if (prevProject) {
                prevBtn.href = resolveLink(prevProject.link);
                prevBtn.style.visibility = 'visible';
                prevBtn.style.pointerEvents = 'auto';
                prevBtn.style.opacity = '';
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
            } else {
                nextBtn.style.visibility = 'hidden';
                nextBtn.style.pointerEvents = 'none';
                nextBtn.style.opacity = '';
            }
        }
        
    } catch (error) {
        console.error('加载导航数据失败:', error);
        // 如果加载失败，保持原有的导航链接不变
    }
})();

