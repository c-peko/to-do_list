const listNamesEl = document.getElementById('list-names');
const todoListEl = document.getElementById('todo-list');
const addListBtn = document.getElementById('add-list-btn');
const addTaskBtn = document.getElementById('add-task-btn');
const listTitle = document.getElementById('list-title');

let lists = {};
let selectedList = null;

addListBtn.addEventListener('click', () => {
  const listName = prompt('Enter new list name:');
  if (listName && !lists[listName]) {
    lists[listName] = [];
    renderListNames();
  }
});

addTaskBtn.addEventListener('click', () => {
  if (!selectedList) return;
  const task = prompt(`Add a task to "${selectedList}":`);
  if (task) {
    lists[selectedList].push(task);
    renderTodoItems();
  }
});

function renderListNames() {
  listNamesEl.innerHTML = '';
  for (let name in lists) {
    const li = document.createElement('li');
    li.textContent = name;
    li.addEventListener('click', () => {
      selectedList = name;
      listTitle.textContent = name;
      addTaskBtn.disabled = false;
      renderTodoItems();
    });
    listNamesEl.appendChild(li);
  }
}

function renderTodoItems() {
  todoListEl.innerHTML = '';
  if (!selectedList) return;
  const tasks = lists[selectedList];
  tasks.forEach(task => {
    const li = document.createElement('li');
    li.textContent = task;
    todoListEl.appendChild(li);
  });
}
