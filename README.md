# JavaScript Todo

## 실행

`index.html`을 브라우저에서 열거나, 저장소 폴더에서 아래 명령을 실행한 뒤 `http://127.0.0.1:8023`에 접속한다.

```bash
python -m http.server 8023 --bind 127.0.0.1
```

## 구현 기능

- 날짜·제목·내용을 입력해 할 일 추가
- 제목과 내용으로 목록 검색
- 기존 항목 수정과 삭제
- localStorage 저장 및 새로고침 후 목록 유지
- 필수 입력·공백 제목 검사, 빈 목록 표시
- 사용자 입력을 textContent로 출력

## 시연

[Todo 시연 영상 — 31초, WebM](evidence/crud-demo.webm)

입력·추가 → 목록·검색 조회 → 수정 → 새로고침으로 저장 유지 확인 → 삭제·빈 목록 확인.
