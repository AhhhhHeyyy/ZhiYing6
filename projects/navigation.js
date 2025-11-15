// 自动化项目导航脚本
// 基于 projects.json 自动生成上一个/下一个项目链接

(async function() {
    try {
        // 获取当前页面路径
        const currentPath = window.location.pathname;
        const currentFile = currentPath.split('/').pop();
        
        // 计算 projects.json 的相对路径
        // projects.json 在 ZhiYing5 目录下
        // 从 projects/xxx/xxx.html 到 projects.json 需要 ../../projects.json
        const jsonPath = '../../projects.json';
        
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
        
        if (prevBtn) {
            if (prevProject) {
                // 计算相对路径
                const prevPath = prevProject.link.replace('projects/', '../');
                prevBtn.href = prevPath;
                prevBtn.style.visibility = 'visible';
                prevBtn.style.pointerEvents = 'auto';
                prevBtn.style.opacity = '0.8';
            } else {
                // 如果是第一个项目，隐藏上一个按钮但保持布局
                prevBtn.style.visibility = 'hidden';
                prevBtn.style.pointerEvents = 'none';
                prevBtn.style.opacity = '0';
            }
        }
        
        if (nextBtn) {
            if (nextProject) {
                // 计算相对路径
                const nextPath = nextProject.link.replace('projects/', '../');
                nextBtn.href = nextPath;
                nextBtn.style.visibility = 'visible';
                nextBtn.style.pointerEvents = 'auto';
                nextBtn.style.opacity = '0.8';
            } else {
                // 如果是最后一个项目，隐藏下一个按钮但保持布局
                nextBtn.style.visibility = 'hidden';
                nextBtn.style.pointerEvents = 'none';
                nextBtn.style.opacity = '0';
            }
        }
        
    } catch (error) {
        console.error('加载导航数据失败:', error);
        // 如果加载失败，保持原有的导航链接不变
    }
})();

