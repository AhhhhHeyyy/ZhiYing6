const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// 提供静态文件服务
app.use(express.static(path.join(__dirname)));

// 处理所有路由，返回 index.html（用于 SPA 路由）
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

