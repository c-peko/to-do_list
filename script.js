const addBtn = document.getElementById('add-btn');
const reminderList = document.getElementById('reminder-list');

addBtn.addEventListener('click', () => {
  const newInput = document.createElement('input');
  newInput.type = 'text';
  newInput.className = 'reminder-item';
  newInput.placeholder = 'Enter your reminder...';

  reminderList.appendChild(newInput);
});

