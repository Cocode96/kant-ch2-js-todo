'use strict';
const form = document.querySelector('#todo-form');
const list = document.querySelector('#todo-items');
const search = document.querySelector('#search');
const message = document.querySelector('#message');
const saveButton = document.querySelector('#save-button');
const cancelButton = document.querySelector('#cancel-button');
const storageKey = 'seokho-kant-todos-v1';
let items = [];
let editingId = null;

try {
  const saved = JSON.parse(localStorage.getItem(storageKey) || '[]');
  if (!Array.isArray(saved) || !saved.every(item =>
    item && ['id', 'date', 'title', 'content'].every(key => typeof item[key] === 'string'))) {
    throw new Error('저장 데이터 형식 오류');
  }
  items = saved;
} catch {
  message.textContent = '저장 목록을 읽지 못했습니다. 빈 목록으로 시작합니다.';
}

function resetForm() {
  editingId = null;
  form.reset();
  saveButton.textContent = '추가';
  cancelButton.hidden = true;
}

function render() {
  const keyword = search.value.trim().toLowerCase();
  const visible = items.filter(item =>
    (item.title + ' ' + item.content).toLowerCase().includes(keyword));
  list.replaceChildren();
  document.querySelector('#count').textContent = visible.length + '개 / 전체 ' + items.length + '개';
  if (!visible.length) {
    const empty = document.createElement('li');
    empty.textContent = '표시할 할 일이 없습니다.';
    list.append(empty);
  }
  visible.forEach(item => {
    const li = document.createElement('li');
    const title = document.createElement('h2');
    const date = document.createElement('time');
    const content = document.createElement('p');
    title.textContent = item.title;
    date.dateTime = item.date;
    date.textContent = item.date;
    content.textContent = item.content; // 사용자 입력을 HTML로 해석하지 않는다.
    li.append(title, date, content);
    ['수정', '삭제'].forEach((label, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = label;
      button.dataset.action = index === 0 ? 'edit' : 'delete';
      button.dataset.id = item.id;
      li.append(button);
    });
    list.append(li);
  });
}

function persist() {
  try {
    localStorage.setItem(storageKey, JSON.stringify(items));
    return true;
  } catch {
    message.textContent = '화면에는 반영했지만 저장하지 못했습니다. 새로고침하면 사라질 수 있습니다.';
    return false;
  }
}

form.addEventListener('submit', event => {
  event.preventDefault();
  const data = {
    date: form.elements.date.value,
    title: form.elements.title.value.trim(),
    content: form.elements.content.value.trim()
  };
  if (!data.date || !data.title || !data.content) {
    message.textContent = '날짜, 제목, 내용을 모두 입력하세요.';
    return;
  }
  const action = editingId ? '수정' : '추가';
  if (editingId) {
    items = items.map(item => item.id === editingId ? { ...item, ...data } : item);
  } else {
    items = [...items, { id: crypto.randomUUID(), ...data }];
  }
  if (persist()) message.textContent = action + '했습니다.';
  resetForm();
  render();
});

list.addEventListener('click', event => {
  const button = event.target.closest('button[data-id]');
  if (!button) return;
  const item = items.find(value => value.id === button.dataset.id);
  if (!item) return;
  if (button.dataset.action === 'edit') {
    editingId = item.id;
    ['date', 'title', 'content'].forEach(key => { form.elements[key].value = item[key]; });
    saveButton.textContent = '수정 저장';
    cancelButton.hidden = false;
    form.elements.title.focus();
  } else {
    items = items.filter(value => value.id !== item.id);
    if (editingId === item.id) resetForm();
    if (persist()) message.textContent = '삭제했습니다.';
    render();
  }
});
cancelButton.addEventListener('click', resetForm);
search.addEventListener('input', render);
render();

