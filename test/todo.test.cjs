const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
function setup(stored = '[]') {
    let value = stored;
    const storage = { getItem: () => value, setItem: (_, next) => { value = next; } };
    const context = vm.createContext({localStorage: storage, window: {addEventListener() {}}, document: {getElementById: () => ({})}});
    vm.runInContext(fs.readFileSync(path.join(__dirname, '../js/todo.js'), 'utf8') + '\nthis.todo = todo;', context);
    const todo = context.todo;
    todo.render = () => {};
    todo.resetForm = () => {};
    todo.load();
    return {todo, storage, read: () => value};
}
test('연속 추가 시 숫자 ID가 중복되지 않고 기존 항목을 유지한다', () => {
    const {todo} = setup(JSON.stringify([{uid: Date.now() + 100000, date: '2026-11-16', title: '기존', content: '보존'}]));
    todo.add('2026-11-16', '하나', '내용');
    todo.add('2026-11-16', '둘', '내용');
    assert.equal(new Set(todo.items.map(item => item.uid)).size, 3);
    assert.equal(todo.items[0].title, '기존');
});
test('저장 공간 오류가 나면 수정과 삭제를 반영하지 않는다', () => {
    const {todo, storage, read} = setup();
    todo.add('2026-11-16', '원본', '내용');
    const before = read();
    storage.setItem = () => { throw new Error('quota'); };
    assert.throws(() => todo.update(todo.items[0].uid, '2026-11-16', '변경', '내용'), /저장하지/);
    assert.throws(() => todo.remove(todo.items[0].uid), /저장하지/);
    assert.equal(read(), before);
    assert.equal(todo.items[0].title, '원본');
});
test('손상된 JSON과 잘못된 행을 기존 저장소에 보존한다', () => {
    for (const source of ['{broken', 'null', '[{"uid":1}]']) {
        const {todo, read} = setup(source);
        assert.equal(todo.loadFailed, true);
        assert.throws(() => todo.add('2026-11-16', '새 항목', '내용'), /복구/);
        assert.equal(read(), source);
    }
});
test('등록, ID 조회, 수정, 삭제와 재로딩 후 빈 목록을 유지한다', () => {
    const {todo, read} = setup();
    todo.add('2026-11-16', '원본', '내용');
    const id = todo.items[0].uid;
    assert.equal(todo.get(id).title, '원본');
    todo.update(id, '2026-11-17', '변경', '수정 내용');
    assert.equal(todo.get(id).title, '변경');
    assert.equal(setup(read()).todo.get(id).date, '2026-11-17');
    todo.remove(id);
    assert.equal(todo.get(id), null);
    assert.equal(read(), '[]');
    assert.equal(setup(read()).todo.items.length, 0);
});
