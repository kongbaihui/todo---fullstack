const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const app = express();
const port = 3000;

// 中间件
app.use(cors());
app.use(express.json());

// 连接数据库
const db = new sqlite3.Database('../todo.db', (err) => {
    if (err) console.error(err.message);
    console.log('连接数据库成功');
});

// 初始化数据库表
db.run(`CREATE TABLE IF NOT EXISTS todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT NOT NULL,
    createTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)`);

// 接口1：查询所有待办事项
app.get('/todos', (req, res) => {
    db.all('SELECT * FROM todos', (err, rows) => {
        if (err) return res.status(500).json({ err: err.message });
        res.json(rows);
    });
});

// 接口2：新增待办事项
app.post('/todos', (req, res) => {
    const { content } = req.body;
    db.run('INSERT INTO todos (content) VALUES (?)', [content], function (err) {
        if (err) return res.status(500).json({ err: err.message });
        res.json({ id: this.lastID, content });
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