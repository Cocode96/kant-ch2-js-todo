/**
 * 할일 등록, 수정, 삭제, 조회 기능
 * 
 */
let frmTodo;
const todo = {
    items: [], // 할일 목록 
    tpl: null, // 템플릿
    editingUid: null,
    query: '',
    // 할일 조회
    get(uid) {
        const items = this.items.filter(item => item.uid === Number(uid));
        return items?.length > 0 ? items[0] : null;
    },
    // 할일 등록 
    add(date, title, content) {
    
        this.items.push({
            uid: Date.now(),
            date,
            title,
            content
        });
   
        this.save();

        // 할일 등록 후 화면 갱신
        this.render();

        // 양식 초기화
        this.resetForm();
    },
    // 기존 항목을 양식으로 불러와 같은 UID로 수정한다.
    edit(uid) {
        const item = this.get(uid);
        if (!item) return;
        this.editingUid = item.uid;
        for (const key of ['date', 'title', 'content']) frmTodo[key].value = item[key];
        frmTodo.querySelector('[type="submit"]').textContent = '수정 저장';
        document.getElementById('cancel-edit').hidden = false;
        frmTodo.title.focus();
    },
    update(uid, date, title, content) {
        this.items = this.items.map(item => item.uid === Number(uid)
            ? { ...item, date, title, content } : item);
        this.save();
        this.render();
        this.resetForm();
    },
    resetForm() {
        this.editingUid = null;
        frmTodo.reset();
        frmTodo.querySelector('[type="submit"]').textContent = '등록하기';
        document.getElementById('cancel-edit').hidden = true;
    },
    // 할일 제거
    remove(uid) {
        for (let i = 0; i < this.items.length; i++) {
            if (this.items[i].uid === Number(uid)) {
                this.items.splice(i, 1);
            }
        }

        // 할일 저장
        this.save();

        if (this.editingUid === Number(uid)) this.resetForm();

        // 할일 등록 후 화면 갱신
        this.render();
    },
    // 할일 저장
    save() {
        localStorage.setItem("todos", JSON.stringify(this.items));
    },
    // Todo 템플릿 조회
    getTpl() {
        // 템플릿은 구성이 동일하므로 최초 조회시 한번만 가져오도록 구성
        if (!this.tpl) {
            this.tpl = document.getElementById("tpl-item").innerHTML;
        }

        return this.tpl;
    },
    // 화면 갱신
    render() {
        // 저장된 할일 목록 조회
        this.items = localStorage.getItem("todos");
        this.items = typeof this.items === 'string' ? JSON.parse(this.items) : [];
        const targetEl = document.getElementById("todo-items");
        // 마지막 항목 삭제나 검색 결과 0개일 때도 이전 화면을 지운다.
        targetEl.replaceChildren();
        const keyword = this.query.trim().toLowerCase();
        const visible = this.items.filter(item =>
            (item.title + ' ' + item.content).toLowerCase().includes(keyword));
        document.getElementById('todo-status').textContent = visible.length
            ? `${visible.length}개 / 전체 ${this.items.length}개`
            : this.items.length ? '검색 결과가 없습니다.' : '등록된 할 일이 없습니다.';

        // 원래 카드 HTML과 클래스를 복제하고 사용자 입력은 텍스트로만 넣는다.
        const template = document.createElement('template');
        template.innerHTML = this.getTpl();
        for (const {uid, title, content, date} of visible) {
            const card = template.content.firstElementChild.cloneNode(true);
            card.id = `item-${uid}`;
            card.dataset.uid = String(uid);
            card.firstElementChild.textContent = `[${date}] ${title}`;
            card.querySelector('.contentflex > div').textContent = content;
            card.querySelectorAll('button').forEach(button => { button.dataset.uid = String(uid); });
            targetEl.append(card);
        }

        // 삭제, 수정 이벤트 바인딩
        const removeAction = (e) => {
            if (!confirm('정말 삭제하겠습니까?')) return;

            const el = e.currentTarget;
            const { uid } = el.dataset;
            this.remove(uid);
        };
        const deleteActions = document.getElementsByClassName("delete-action");
        for (const action of deleteActions) {
            action.addEventListener("click", removeAction);

        }

        for (const action of document.getElementsByClassName('edit-action')) {
            action.addEventListener('click', event => this.edit(event.currentTarget.dataset.uid));
        }
    }
};

window.addEventListener("DOMContentLoaded", function() {
    frmTodo = document.forms.frmTodo;
    // 최초 화면 출력
    todo.render();
    document.getElementById('todo-search').addEventListener('input', function() {
        todo.query = this.value;
        todo.render();
    });
    document.getElementById('cancel-edit').addEventListener('click', () => todo.resetForm());

    // 양식 제출 처리 
    frmTodo.addEventListener("submit", function(e) {
        e.preventDefault();
        
        const requiredFields = {
            date: "날짜를 선택하세요.",
            title: "제목을 입력하세요.",
            content: "내용을 입력하세요."
        };

        try {
            for (const [key, msg] of Object.entries(requiredFields)) {

                if (!frmTodo[key]?.value?.trim()) {
                    throw new Error(msg); 
                }
            }

            const values = [frmTodo.date.value, frmTodo.title.value.trim(), frmTodo.content.value.trim()];
            if (todo.editingUid !== null) todo.update(todo.editingUid, ...values);
            else todo.add(...values);

        } catch (err) {
            console.error(err);
            alert(err.message);
        }
    });
});
