# 简易零基础全栈待办清单（Todo List）项目文档

这是一个面向零基础开发者的全栈入门项目，通过 HTML+CSS+JavaScript 构建前端界面，Node.js+Express 搭建后端服务，SQLite 轻量级数据库实现数据持久化存储，完整覆盖 `前端交互-后端接口-数据库操作-前后端联调` 的全栈开发核心流程。

## 项目简介

### 核心功能

- **新增待办事项**：输入内容后点击添加，数据实时存入数据库
- **查看所有待办**：页面加载时自动渲染数据库中所有待办数据
- **删除待办事项**：点击单个待办的删除按钮，实时移除数据库对应记录

### 技术栈

| 模块       | 技术选型          | 核心作用                          |
|------------|-------------------|-----------------------------------|
| 前端       | HTML+CSS+JavaScript | 构建页面结构、美化样式、实现交互  |
| 后端       | Node.js+Express   | 快速搭建 RESTful API 接口         |
| 数据库     | SQLite            | 轻量文件型数据库，无需额外部署服务 |
| 辅助工具   | live-server、cors | 前端本地服务、解决跨域问题        |

## 环境准备

### 必备工具

- 开发编辑器：推荐 VS Code（可安装 Prettier、SQLite Viewer 插件）
- 运行环境：Node.js（LTS 版本，自带 npm 包管理工具）
- 版本控制（可选）：Git（用于代码管理和 GitHub 上传）

### 安装验证

- 安装 Node.js 后，终端输入 `node -v`，显示版本号即安装成功
- 输入 `npm -v`，显示 npm 版本号即包管理工具可用

## 项目结构

```
todo-fullstack/          # 项目根目录
├── frontend/            # 前端目录
│   ├── index.html       # 页面结构文件
│   ├── style.css        # 样式美化文件
│   └── app.js           # 交互逻辑与接口请求文件
├── backend/             # 后端目录
│   ├── server.js        # 服务入口与接口实现文件
│   └── package.json     # 后端依赖配置文件
├── .gitignore           # Git 忽略文件配置
└── README.md            # 项目说明文档（本文档）
```

## 核心代码实现

### 前端代码

#### index.html（页面结构）

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>简易待办清单</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="container">
        <h1>我的待办清单</h1>
        <div class="input-area">
            <input type="text" id="todoInput" placeholder="输入新的待办事项...">
            <button id="addBtn">添加</button>
        </div>
        <ul id="todoList"></ul>
    </div>
    <script src="app.js"></script>
</body>
</html>
```

#### style.css（样式美化）

```css
.container {
    width: 500px;
    margin: 50px auto;
    text-align: center;
    font-family: Arial, sans-serif;
}
#todoInput {
    width: 300px;
    padding: 8px;
    margin-right: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
}
button {
    padding: 8px 16px;
    cursor: pointer;
    border: none;
    border-radius: 4px;
    background-color: #4CAF50;
    color: white;
}
#todoList {
    list-style: none;
    padding: 0;
    margin-top: 20px;
}
.todo-item {
    display: flex;
    justify-content: space-between;
    padding: 10px;
    margin: 5px 0;
    background-color: #f0f0f0;
    border-radius: 4px;
}
.deleteBtn {
    background-color: #ff4444;
}
```

#### app.js（交互与接口请求）

```javascript
// 获取页面元素
const todoInput = document.getElementById('todoInput');
const addBtn = document.getElementById('addBtn');
const todoList = document.getElementById('todoList');
// 后端接口地址
const baseUrl = 'http://localhost:3000/todos';

// 加载所有待办事项
async function loadTodos() {
    try {
        const res = await fetch(baseUrl);
        const todos = await res.json();
        todoList.innerHTML = '';
        todos.forEach(todo => {
            const li = document.createElement('li');
            li.className = 'todo-item';
            li.innerHTML = `
                <span>${todo.content}</span>
                <button class="deleteBtn" data-id="${todo.id}">删除</button>
            `;
            todoList.appendChild(li);
        });
    } catch (err) {
        console.error('加载待办失败:', err);
    }
}

// 添加待办事项
addBtn.addEventListener('click', async () => {
    const content = todoInput.value.trim();
    if (!content) return;
    try {
        await fetch(baseUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content })
        });
        todoInput.value = '';
        loadTodos(); // 重新加载所有待办，更新页面
    } catch (err) {
        console.error('添加待办失败:', err);
    }
});

// 删除待办事项
todoList.addEventListener('click', async (e) => {
    if (e.target.classList.contains('deleteBtn')) {
        const id = e.target.dataset.id;
        try {
            await fetch(`${baseUrl}/${id}`, { method: 'DELETE' });
            loadTodos(); // 重新加载所有待办，更新页面
        } catch (err) {
            console.error('删除待办失败:', err);
        }
    }
});

// 页面加载时初始化数据
loadTodos();
```

### 后端代码

#### package.json（依赖配置）

```json
{
  "name": "todo-backend",
  "version": "1.0.0",
  "description": "Todo List 后端服务",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "keywords": ["todo", "express", "sqlite"],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "cors": "^2.8.5",
    "express": "^4.18.2",
    "sqlite3": "^5.1.6"
  }
}
```

#### server.js（服务与接口实现）

```javascript
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const app = express();
const port = 3000;

// 中间件：解决跨域、解析 JSON 请求体
app.use(cors());
app.use(express.json());

// 连接数据库（不存在则自动创建）
const db = new sqlite3.Database('../todo.db', (err) => {
    if (err) console.error('数据库连接失败:', err.message);
    else console.log('数据库连接成功');
});

// 初始化数据库表（不存在则创建）
db.run(`CREATE TABLE IF NOT EXISTS todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT NOT NULL,
    createTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)`);

// 接口1：查询所有待办事项
app.get('/todos', (req, res) => {
    db.all('SELECT * FROM todos ORDER BY createTime DESC', (err, rows) => {
        if (err) return res.status(500).json({ err: err.message });
        res.json(rows);
    });
});

// 接口2：新增待办事项
app.post('/todos', (req, res) => {
    const { content } = req.body;
    if (!content) return res.status(400).json({ err: '待办内容不能为空' });
    
    db.run('INSERT INTO todos (content) VALUES (?)', [content], function (err) {
        if (err) return res.status(500).json({ err: err.message });
        res.json({ id: this.lastID, content, createTime: new Date().toISOString() });
    });
});

// 接口3：删除待办事项
app.delete('/todos/:id', (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM todos WHERE id = ?', [id], (err) => {
        if (err) return res.status(500).json({ err: err.message });
        res.json({ message: '删除成功' });
    });
});

// 启动服务
app.listen(port, () => {
    console.log(`后端服务运行在 http://localhost:${port}`);
});
```

### .gitignore（Git 忽略配置）

```
# 依赖库文件夹
/node_modules
# npm 日志文件
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# 数据库文件
*.db

# 操作系统自动生成文件
.DS_Store
Thumbs.db

# 编辑器配置文件
.idea/
.vscode/
*.sublime-*

# 日志文件
*.log
```

## 快速启动步骤

### 1. 初始化后端

1. 终端进入 `backend` 目录：`cd backend`
2. 安装依赖：`npm install`
3. 启动服务：`node server.js`
4. 验证：终端显示「数据库连接成功」和「后端服务运行在 http://localhost:3000」即可

### 2. 运行前端

1. 新终端进入 `frontend` 目录：`cd frontend`
2. 安装 live-server（首次使用）：`npm install -g live-server`
3. 启动前端：`live-server`
4. 验证：浏览器自动打开页面（默认 http://127.0.0.1:8080）

### 3. 功能测试

- 输入待办内容，点击「添加」，页面实时显示新增待办
- 点击「删除」按钮，对应待办移除且数据库同步删除
- 刷新页面，待办数据从数据库重新加载，不会丢失

## 常见问题排查

- **后端启动报错「MODULE_NOT_FOUND」**：进入 `backend` 目录后先执行 `npm install`，再启动服务
- **添加按钮无反应（控制台「Invalid name」）**：`app.js` 中 `Content-Type` 需改为无空格的 `'Content-Type'`
- **跨域错误**：使用 `live-server` 启动前端，确保后端包含 `app.use(cors())`
- **live-server 未识别**：用临时命令 `npx live-server` 启动，或配置 npm 环境变量

## 项目扩展建议

- **功能扩展**：添加待办状态（已完成/未完成）、待办修改功能、搜索筛选
- **技术升级**：前端用 Vue/React 重构，后端添加用户认证，数据库替换为 MySQL
- **部署上线**：前端部署到 Netlify，后端部署到 Railway，使用云数据库

## 许可证

本项目采用 MIT 开源许可证，可自由使用、修改和分发，个人与商业用途均可，无需开源修改后的代码，需保留原始版权声明。

要不要我帮你生成一份**项目扩展功能的详细代码（如待办状态切换）**，直接复制就能集成到现有项目中？

