// 获取页面元素
const todoInput = document.getElementById('todoInput');
const addBtn = document.getElementById('addBtn');
const todoList = document.getElementById('todoList');
// 后端接口地址
const baseUrl = 'http://localhost:3000/todos';

// 加载所有待办事项
async function loadTodos() {
    const res = await fetch(baseUrl);
    const todos = await res.json();
    todoList.innerHTML = '';
    todos.forEach(todo => {
        const li = document.createElement('li');
        li.className = 'todo - item';
        li.innerHTML = `
            <span>${todo.content}</span>
            <button class="deleteBtn" data - id="${todo.id}">删除</button>
        `;
        todoList.appendChild(li);
    });
}

// 添加待办事项
addBtn.addEventListener('click', async () => {
    const content = todoInput.value.trim();
    if (!content) return;
    await fetch(baseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
    });
    todoInput.value = '';
    loadTodos();
});

// 删除待办事项
todoList.addEventListener('click', async (e) => {
    if (e.target.classList.contains('deleteBtn')) {
        const id = e.target.dataset.id;
        await fetch(`${baseUrl}/${id}`, { method: 'DELETE' });
        loadTodos();
    }
});

// 页面加载时初始化数据
loadTodos();