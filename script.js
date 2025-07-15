const listNamesEl = document.getElementById('list-names');
const todoListEl = document.getElementById('todo-list');
const addListBtn = document.getElementById('add-list-btn');
const addTaskBtn = document.getElementById('add-task-btn');
const listTitle = document.getElementById('list-title');

let lists = JSON.parse(localStorage.getItem('lists')) || {};
let selectedList = null;

addListBtn.addEventListener('click', () => {
  showInlineInput({
    containerId: 'list-input-row',
    placeholder: 'New list name...',
    onSubmit: (listName) => {
      if (listName && !lists[listName]) {
        lists[listName] = [];
        saveAndRender();
      }
    }
  });
});

addTaskBtn.addEventListener('click', () => {
  if (!selectedList) return;
  showInlineInput({
    containerId: 'task-input-row',
    placeholder: 'New task...',
    onSubmit: (taskText) => {
      if (taskText) {
        lists[selectedList].push({ text: taskText, done: false });
        saveAndRender();
      }
    }
  });
});


function saveAndRender() {
  localStorage.setItem('lists', JSON.stringify(lists));
  renderListNames();
  if (selectedList && lists[selectedList]) {
    renderTodoItems();
  } else {
    listTitle.textContent = 'Select a list';
    todoListEl.innerHTML = '';
    addTaskBtn.disabled = true;
  }
}

function renderListNames() {
  listNamesEl.innerHTML = '';
  for (let name in lists) {
    const li = document.createElement('li');

    const nameSpan = document.createElement('span');
    nameSpan.textContent = name;
    nameSpan.style.cursor = 'pointer';
    nameSpan.addEventListener('click', () => {
      selectedList = name;
      listTitle.textContent = name;
      addTaskBtn.disabled = false;
      renderTodoItems();
    });

    const actions = document.createElement('div');
    actions.className = 'list-actions';

    const editBtn = document.createElement('button');
    editBtn.innerHTML = '<span class="material-icons">edit</span>';
    editBtn.addEventListener('click', () => {
      const newName = prompt('Rename list:', name);
      if (newName && newName !== name && !lists[newName]) {
        lists[newName] = lists[name];
        delete lists[name];
        if (selectedList === name) selectedList = newName;
        saveAndRender();
      }
    });

    const deleteBtn = document.createElement('button');
    deleteBtn.innerHTML = '<span class="material-icons">delete</span>';
    deleteBtn.addEventListener('click', () => {
      if (confirm(`Delete list "${name}"?`)) {
        delete lists[name];
        if (selectedList === name) selectedList = null;
        saveAndRender();
      }
    });

    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);
    li.appendChild(nameSpan);
    li.appendChild(actions);
    listNamesEl.appendChild(li);
  }
}

function renderTodoItems() {
  todoListEl.innerHTML = '';
  if (!selectedList) return;
  const tasks = lists[selectedList];

  tasks.forEach((task, index) => {
    const li = document.createElement('li');
    li.setAttribute('draggable', 'true');
    li.dataset.index = index;

    const taskContainer = document.createElement('div');
    taskContainer.className = 'task';

    const checkbox = document.createElement('input');
checkbox.type = 'checkbox';
checkbox.checked = task.done;
checkbox.classList.add('round-checkbox'); // ✅ Add a custom class

checkbox.addEventListener('change', () => {
  task.done = checkbox.checked;
  saveAndRender();
});

    const span = document.createElement('span');
    span.textContent = task.text;
    if (task.done) {
      span.style.textDecoration = 'line-through';
      span.style.color = '#999';
    }

    taskContainer.appendChild(checkbox);
    taskContainer.appendChild(span);

    const actions = document.createElement('div');
    actions.className = 'task-actions';

    const editBtn = document.createElement('button');
    editBtn.textContent = '✏️';
    editBtn.addEventListener('click', () => {
      const newText = prompt('Edit task:', task.text);
      if (newText !== null) {
        task.text = newText;
        saveAndRender();
      }
    });

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = '🗑️';
    deleteBtn.addEventListener('click', () => {
      tasks.splice(index, 1);
      saveAndRender();
    });

    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);

    li.appendChild(taskContainer);
    li.appendChild(actions);
    todoListEl.appendChild(li);

    // 🔄 Drag and Drop events
    li.addEventListener('dragstart', () => {
      li.classList.add('dragging');
    });

    li.addEventListener('dragend', () => {
      li.classList.remove('dragging');
      updateTaskOrder();
    });
  });

  // Allow drop in between
  todoListEl.addEventListener('dragover', (e) => {
    e.preventDefault();
    const afterElement = getDragAfterElement(todoListEl, e.clientY);
    const dragging = document.querySelector('.dragging');
    if (afterElement == null) {
      todoListEl.appendChild(dragging);
    } else {
      todoListEl.insertBefore(dragging, afterElement);
    }
  });
}

function getDragAfterElement(container, y) {
  const elements = [...container.querySelectorAll('li:not(.dragging)')];
  return elements.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;
    if (offset < 0 && offset > closest.offset) {
      return { offset: offset, element: child };
    } else {
      return closest;
    }
  }, { offset: -Infinity }).element;
}

function updateTaskOrder() {
  const newOrder = [...todoListEl.querySelectorAll('li')].map(li => {
    const index = parseInt(li.dataset.index);
    return lists[selectedList][index];
  });
  lists[selectedList] = newOrder;
  saveAndRender();
}

renderListNames();

function showInlineInput({ containerId, placeholder, onSubmit }) {
  const container = document.getElementById(containerId);
  container.innerHTML = ''; // Clear previous input

  const wrapper = document.createElement('div');
  wrapper.className = 'input-row';

  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = placeholder;

  const cancelBtn = document.createElement('button');
  cancelBtn.textContent = '<span class="material-icons">cancel</span>';
  cancelBtn.addEventListener('click', () => {
    container.innerHTML = '';
  });

  let submitted = false; // ✅ Prevent duplicate submits

  const submit = () => {
    if (submitted) return; // ✅ Skip if already submitted
    submitted = true;

    const value = input.value.trim();
    if (value) onSubmit(value);
    container.innerHTML = '';
  };

  // Submit on Enter
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      submit();
    }
  });

  // Submit on blur
  input.addEventListener('blur', () => {
    setTimeout(() => {
      if (!container.contains(document.activeElement)) {
        submit();
      }
    }, 100);
  });

  wrapper.appendChild(input);
  wrapper.appendChild(cancelBtn);
  container.appendChild(wrapper);

  input.focus();
}
