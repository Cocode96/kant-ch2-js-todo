/** 기존 todos 저장 키와 숫자 UID를 유지하는 Todo CRUD. */
let frmTodo;
const todo = {
    items: [],
    tpl: null,
    editingUid: null,
    query: '',
    loadFailed: false,
    load() {
        try {
            const parsed = JSON.parse(localStorage.getItem('todos') ?? '[]');
            const valid = Array.isArray(parsed) && parsed.every(item =>
                item && Number.isSafeInteger(item.uid) && item.uid > 0 &&
                ['date', 'title', 'content'].every(key => typeof item[key] === 'string'));
            if (!valid || new Set(parsed.map(item => item.uid)).size !== parsed.length) throw new Error('저장 형식 오류');
            this.items = parsed;
            this.loadFailed = false;
        } catch {
            this.loadFailed = true;
            this.showError('저장된 목록을 읽지 못했습니다. 기존 데이터는 유지됩니다. 저장소 설정을 확인한 뒤 새로고침하세요.');
        }
    },
    get(uid) {
        return this.items.find(item => item.uid === Number(uid)) ?? null;
    },
    commit(nextItems) {
        if (this.loadFailed) throw new Error('저장된 목록을 먼저 복구한 뒤 새로고침하세요.');
        // 저장에 성공한 뒤에만 메모리와 화면에 반영한다.
        try { localStorage.setItem('todos', JSON.stringify(nextItems)); }
        catch { throw new Error('저장하지 못했습니다. 저장 공간과 브라우저 설정을 확인하세요.'); }
        this.items = nextItems;
        this.showError('');
        this.render();
    },
    add(date, title, content) {
        const uid = this.items.reduce((next, item) => Math.max(next, item.uid + 1), Date.now());
        if (!Number.isSafeInteger(uid)) throw new Error('새 ID를 만들 수 없습니다.');
        this.commit([...this.items, { uid, date, title, content }]);
        this.resetForm();
    },
    edit(uid) {
        const item = this.get(uid);
        if (!item) return;
        this.editingUid = item.uid;
        for (const key of ['date', 'title', 'content']) frmTodo.elements.namedItem(key).value = item[key];
        frmTodo.querySelector('[type="submit"]').textContent = '수정 저장';
        document.getElementById('cancel-edit').hidden = false;
        frmTodo.elements.namedItem('title').focus();
    },
    update(uid, date, title, content) {
        if (!this.get(uid)) throw new Error('수정할 항목이 없습니다.');
        this.commit(this.items.map(item => item.uid === Number(uid) ? { ...item, date, title, content } : item));
        this.resetForm();
    },
    remove(uid) {
        this.commit(this.items.filter(item => item.uid !== Number(uid)));
        if (this.editingUid === Number(uid)) this.resetForm();
    },
    resetForm() {
        this.editingUid = null;
        frmTodo.reset();
        frmTodo.querySelector('[type="submit"]').textContent = '등록하기';
        document.getElementById('cancel-edit').hidden = true;
    },
    showError(message) {
        document.getElementById('todo-error').textContent = message;
    },
    render() {
        const target = document.getElementById('todo-items');
        const keyword = this.query.trim().toLowerCase();
        const visible = this.items.filter(item => (item.title + ' ' + item.content).toLowerCase().includes(keyword));
        document.getElementById('todo-status').textContent = this.loadFailed ? '목록을 불러올 수 없습니다.' : visible.length
            ? visible.length + '개 / 전체 ' + this.items.length + '개'
            : this.items.length ? '검색 결과가 없습니다.' : '등록된 할 일이 없습니다.';
        if (!this.tpl) {
            this.tpl = document.createElement('template');
            this.tpl.innerHTML = document.getElementById('tpl-item').innerHTML;
        }
        const fragment = document.createDocumentFragment();
        for (const {uid, title, content, date} of visible) {
            const card = this.tpl.content.firstElementChild.cloneNode(true);
            card.id = 'item-' + uid;
            card.dataset.uid = String(uid);
            // 템플릿만 HTML로 읽고 사용자 입력은 항상 textContent로 출력한다.
            card.firstElementChild.textContent = '[' + date + '] ' + title;
            card.querySelector('.contentflex > div').textContent = content;
            card.querySelectorAll('button').forEach(button => { button.dataset.uid = String(uid); });
            fragment.append(card);
        }
        target.replaceChildren(fragment);
    }
};
window.addEventListener('DOMContentLoaded', () => {
    frmTodo = document.forms.frmTodo;
    todo.load();
    todo.render();
    document.getElementById('todo-search').addEventListener('input', event => {
        todo.query = event.currentTarget.value;
        todo.render();
    });
    document.getElementById('cancel-edit').addEventListener('click', () => todo.resetForm());
    // 목록 컨테이너에 한 번만 바인딩한다. 재렌더링 후에도 동일하게 동작한다.
    document.getElementById('todo-items').addEventListener('click', event => {
        const button = event.target.closest('button[data-uid]');
        if (!button || !event.currentTarget.contains(button)) return;
        try {
            if (button.classList.contains('edit-action')) todo.edit(button.dataset.uid);
            if (button.classList.contains('delete-action') && confirm('정말 삭제하겠습니까?')) todo.remove(button.dataset.uid);
        } catch (error) { todo.showError(error.message); }
    });
    frmTodo.addEventListener('submit', event => {
        event.preventDefault();
        const fields = ['date', 'title', 'content'].map(key => frmTodo.elements.namedItem(key).value.trim());
        try {
            if (fields.some(value => !value)) throw new Error('날짜, 제목, 내용을 입력하세요.');
            if (todo.editingUid !== null) todo.update(todo.editingUid, ...fields);
            else todo.add(...fields);
        } catch (error) { todo.showError(error.message); }
    });
});
