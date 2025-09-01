document.addEventListener('DOMContentLoaded', () => {
    const todoForm = document.getElementById('todo-form');
    const todoTitleInput = document.getElementById('todo-title');
    const todoDetailsInput = document.getElementById('todo-details');
    const todoStartInput = document.getElementById('todo-start');
    const todoEndInput = document.getElementById('todo-end');
    const manualSaveBtn = document.getElementById('manual-save');
    const resetAllBtn = document.getElementById('reset-all');
    const columns = document.querySelectorAll('.tasks');

    let todos = [];

    const saveToLocalStorage = () => {
        localStorage.setItem('todos', JSON.stringify(todos));
    };

    const loadFromLocalStorage = () => {
        const storedTodos = localStorage.getItem('todos');
        if (storedTodos) {
            todos = JSON.parse(storedTodos);
        }
    };

    const renderTodos = () => {
        columns.forEach(column => column.innerHTML = '');

        todos.forEach(todo => {
            const taskElement = document.createElement('div');
            taskElement.classList.add('task');
            taskElement.setAttribute('draggable', 'true');
            taskElement.dataset.id = todo.id;

            taskElement.innerHTML = `
                <h4>${todo.title}</h4>
                <p class="details">${todo.details || ''}</p>
                <div class="dates">
                    <p>開始: ${todo.start ? new Date(todo.start).toLocaleString() : '未設定'}</p>
                    <p>終了: ${todo.end ? new Date(todo.end).toLocaleString() : '未設定'}</p>
                    <p>作成: ${new Date(todo.createdAt).toLocaleString()}</p>
                </div>
                <div class="actions">
                    <select class="status-select">
                        <option value="waiting" ${todo.status === 'waiting' ? 'selected' : ''}>対応待ち</option>
                        <option value="in-progress" ${todo.status === 'in-progress' ? 'selected' : ''}>対応中</option>
                        <option value="done" ${todo.status === 'done' ? 'selected' : ''}>対応済み</option>
                    </select>
                    <button class="delete-btn">削除</button>
                </div>
            `;

            document.querySelector(`.tasks[data-status="${todo.status}"]`).appendChild(taskElement);
        });
        addDragAndDropListeners();
        addEventListenersToTasks();
        saveToLocalStorage();
    };

    const addTodo = (e) => {
        e.preventDefault();
        const title = todoTitleInput.value.trim();
        if (!title) return;

        const newTodo = {
            id: `todo-${Date.now()}`,
            title,
            details: todoDetailsInput.value.trim(),
            start: todoStartInput.value,
            end: todoEndInput.value,
            createdAt: new Date().toISOString(),
            status: 'waiting'
        };

        todos.push(newTodo);
        todoForm.reset();
        renderTodos();
    };
    
    const updateTodoStatus = (todoId, newStatus) => {
        const todo = todos.find(t => t.id === todoId);
        if (todo) {
            todo.status = newStatus;
            renderTodos();
        }
    };

    const deleteTodo = (todoId) => {
        todos = todos.filter(t => t.id !== todoId);
        renderTodos();
    };

    const addEventListenersToTasks = () => {
        document.querySelectorAll('.task').forEach(task => {
            const todoId = task.dataset.id;
            task.querySelector('.status-select').addEventListener('change', (e) => {
                updateTodoStatus(todoId, e.target.value);
            });
            task.querySelector('.delete-btn').addEventListener('click', () => {
                deleteTodo(todoId);
            });
        });
    };
    
    const addDragAndDropListeners = () => {
        const tasks = document.querySelectorAll('.task');
        const taskContainers = document.querySelectorAll('.tasks');

        tasks.forEach(task => {
            task.addEventListener('dragstart', () => {
                task.classList.add('dragging');
            });

            task.addEventListener('dragend', () => {
                task.classList.remove('dragging');
            });
        });

        taskContainers.forEach(container => {
            container.addEventListener('dragover', e => {
                e.preventDefault();
                const afterElement = getDragAfterElement(container, e.clientY);
                const draggable = document.querySelector('.dragging');
                if (afterElement == null) {
                    container.appendChild(draggable);
                } else {
                    container.insertBefore(draggable, afterElement);
                }
            });
            
            container.addEventListener('drop', e => {
                e.preventDefault();
                const draggable = document.querySelector('.dragging');
                const newStatus = container.dataset.status;
                updateTodoStatus(draggable.dataset.id, newStatus);
            });
        });
    };

    function getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.task:not(.dragging)')];

        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }


    const resetAll = () => {
        if (confirm('本当にすべてのTodoをリセットしますか？')) {
            todos = [];
            renderTodos();
        }
    };

    todoForm.addEventListener('submit', addTodo);
    manualSaveBtn.addEventListener('click', saveToLocalStorage);
    resetAllBtn.addEventListener('click', resetAll);

    loadFromLocalStorage();
    renderTodos();
});