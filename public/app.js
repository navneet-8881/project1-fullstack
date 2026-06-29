const apiUrl = '/api/todos';
const todoList = document.getElementById('todo-list');
const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const message = document.getElementById('message');

function showMessage(text, isError = false) {
  message.textContent = text;
  message.style.color = isError ? '#b91c1c' : '#1f2937';
}

async function fetchTodos() {
  try {
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error('Unable to load todos');
    return await response.json();
  } catch (error) {
    showMessage(error.message, true);
    return [];
  }
}

function renderTodos(todos) {
  todoList.innerHTML = '';
  if (todos.length === 0) {
    todoList.innerHTML = '<li class="todo-item">No todos found. Add one above!</li>';
    return;
  }

  todos.forEach((todo) => {
    const item = document.createElement('li');
    item.className = 'todo-item';

    const left = document.createElement('div');
    left.className = 'todo-left';

    const title = document.createElement('p');
    title.className = 'todo-title' + (todo.completed ? ' completed' : '');
    title.textContent = todo.title;

    left.appendChild(title);

    const actions = document.createElement('div');
    actions.className = 'todo-actions';

    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'toggle-btn';
    toggleBtn.textContent = todo.completed ? 'Mark Incomplete' : 'Mark Complete';
    toggleBtn.addEventListener('click', () => toggleTodo(todo.id, !todo.completed));

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.textContent = 'Delete';
    deleteBtn.addEventListener('click', () => deleteTodo(todo.id));

    actions.appendChild(toggleBtn);
    actions.appendChild(deleteBtn);
    item.appendChild(left);
    item.appendChild(actions);
    todoList.appendChild(item);
  });
}

async function loadTodos() {
  showMessage('Loading todos...');
  const todos = await fetchTodos();
  renderTodos(todos);
  showMessage('');
}

async function addTodo(event) {
  event.preventDefault();
  const title = todoInput.value.trim();
  if (!title) return;

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    });
    if (!response.ok) throw new Error('Unable to add todo');
    todoInput.value = '';
    await loadTodos();
    showMessage('Todo added successfully!');
  } catch (error) {
    showMessage(error.message, true);
  }
}

async function toggleTodo(id, completed) {
  try {
    const response = await fetch(`${apiUrl}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed }),
    });
    if (!response.ok) throw new Error('Unable to update todo');
    await loadTodos();
    showMessage('Todo updated.');
  } catch (error) {
    showMessage(error.message, true);
  }
}

async function deleteTodo(id) {
  try {
    const response = await fetch(`${apiUrl}/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Unable to delete todo');
    await loadTodos();
    showMessage('Todo deleted.');
  } catch (error) {
    showMessage(error.message, true);
  }
}

todoForm.addEventListener('submit', addTodo);
loadTodos();
