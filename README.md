# JavaScript Todo

`index.html`, `css/style.css`, `js/todo.js` 세 파일이 실행 코드다. index.html을 브라우저에서 열거나 이 폴더에서 `python -m http.server 8023 --bind 127.0.0.1`로 실행한다.

## 원본과 구현

로컬 `Desktop/js_todo-main/js_todo-main/js/todo.js`의 배열/객체, localStorage, 폼 이벤트 흐름을 참고했다. 원본에 없던 수정과 검색 조회를 구현하고 마지막 삭제 후 빈 목록도 다시 렌더링한다.

- 추가: 입력값을 검사해 UUID가 있는 객체를 배열에 추가한다.
- 조회: filter로 제목/내용을 검색하고 DOM을 만든다.
- 수정: find로 원본을 폼에 불러오고 map으로 같은 ID의 객체만 교체한다.
- 삭제: filter로 해당 ID를 제외한다.
- localStorage에 저장하고 새로고침 시 읽는다. 사용자 입력은 textContent로 출력해 HTML로 실행하지 않는다.

수정 중인 항목을 삭제하면 수정 상태도 해제한다. 빈 입력과 공백 제목을 막는다. 저장 실패는 화면에 알린다. 브라우저의 로컬 목록이며 계정/서버 동기화는 없다.

## 실제 시연 영상과 검증

[CRUD 브라우저 시연 영상 (WebM, 약 7초)](evidence/crud-demo.webm)

2026-11-16 임시 Edge 프로필에서 자동 조작한 실제 화면 녹화다. 합성 영상이나 예상 결과가 아니다. 순서는 추가 → 검색 조회 → 수정 → 새로고침 → 삭제다. 후반에는 HTML 모양의 문자열이 실행되지 않는지도 확인했다. 파일을 다운로드하거나 브라우저로 열어 재생할 수 있다.


추가, 검색 일치/불일치, 수정, 새로고침 유지, 마지막 삭제/빈 상태, 텍스트의 HTML 실행 차단을 실제 DOM에서 검증했다. 페이지 오류 없음. 수업에서 본인이 직접 조작하고 설명하는 영상이 별도로 요구되면 이 자동 시연을 참고해 다시 녹화해야 한다.

## 직접 설명하고 검토할 지점

- items 배열을 상태의 기준으로 두고 render가 화면을 다시 만드는 흐름.
- find/filter/map 각각의 반환값과 쓰임.
- submit의 preventDefault, 목록에 이벤트 하나를 붙이는 이벤트 위임.
- textContent와 innerHTML의 차이, localStorage가 브라우저에만 남는다는 한계.

