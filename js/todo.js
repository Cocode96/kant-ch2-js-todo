/**
 * ���� ���, ����, ����, ��ȸ ���
 * 
 */
let frmTodo;
const todo = {
    items: [], // ���� ��� 
    tpl: null, // ���ø�
    editingUid: null,
    query: '',
    // ���� ��ȸ
    get(uid) {
        const items = this.items.filter(item => item.uid === Number(uid));
        return items?.length > 0 ? items[0] : null;
    },
    // ���� ��� 
    add(date, title, content) {
    
        this.items.push({
            uid: Date.now(),
            date,
            title,
            content
        });
   
        this.save();

        // ���� ��� �� ȭ�� ����
        this.render();

        // ��� �ʱ�ȭ
        this.resetForm();
    },
    // ���� �׸��� ������� �ҷ��� ���� UID�� �����Ѵ�.
    edit(uid) {
        const item = this.get(uid);
        if (!item) return;
        this.editingUid = item.uid;
        for (const key of ['date', 'title', 'content']) frmTodo[key].value = item[key];
        frmTodo.querySelector('[type="submit"]').textContent = '���� ����';
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
        frmTodo.querySelector('[type="submit"]').textContent = '����ϱ�';
        document.getElementById('cancel-edit').hidden = true;
    },
    // ���� ����
    remove(uid) {
        for (let i = 0; i < this.items.length; i++) {
            if (this.items[i].uid === Number(uid)) {
                this.items.splice(i, 1);
            }
        }

        // ���� ����
        this.save();

        if (this.editingUid === Number(uid)) this.resetForm();

        // ���� ��� �� ȭ�� ����
        this.render();
    },
    // ���� ����
    save() {
        localStorage.setItem("todos", JSON.stringify(this.items));
    },
    // Todo ���ø� ��ȸ
    getTpl() {
        // ���ø��� ������ �����ϹǷ� ���� ��ȸ�� �ѹ��� ���������� ����
        if (!this.tpl) {
            this.tpl = document.getElementById("tpl-item").innerHTML;
        }

        return this.tpl;
    },
    // ȭ�� ����
    render() {
        // ����� ���� ��� ��ȸ
        this.items = localStorage.getItem("todos");
        this.items = typeof this.items === 'string' ? JSON.parse(this.items) : [];
        const targetEl = document.getElementById("todo-items");
        // ������ �׸� ������ �˻� ��� 0���� ���� ���� ȭ���� �����.
        targetEl.replaceChildren();
        const keyword = this.query.trim().toLowerCase();
        const visible = this.items.filter(item =>
            (item.title + ' ' + item.content).toLowerCase().includes(keyword));
        document.getElementById('todo-status').textContent = visible.length
            ? `${visible.length}�� / ��ü ${this.items.length}��`
            : this.items.length ? '�˻� ����� �����ϴ�.' : '��ϵ� �� ���� �����ϴ�.';

        // ���� ī�� HTML�� Ŭ������ �����ϰ� ����� �Է��� �ؽ�Ʈ�θ� �ִ´�.
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

        // ����, ���� �̺�Ʈ ���ε�
        const removeAction = (e) => {
            if (!confirm('���� �����ϰڽ��ϱ�?')) return;

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
    // ���� ȭ�� ���
    todo.render();
    document.getElementById('todo-search').addEventListener('input', function() {
        todo.query = this.value;
        todo.render();
    });
    document.getElementById('cancel-edit').addEventListener('click', () => todo.resetForm());

    // ��� ���� ó�� 
    frmTodo.addEventListener("submit", function(e) {
        e.preventDefault();
        
        const requiredFields = {
            date: "��¥�� �����ϼ���.",
            title: "������ �Է��ϼ���.",
            content: "������ �Է��ϼ���."
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
