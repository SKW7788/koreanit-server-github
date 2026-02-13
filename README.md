# Koreanit Server (Spring Boot)

세션 기반 인증/인가와 권한 검증을 적용한 **게시판 백엔드 API** 프로젝트입니다.  
회원/인증, 게시글, 댓글 도메인을 중심으로 REST API를 구현했고, 공통 응답 포맷과 예외 처리, 환경 분리(dev/prod)까지 반영했습니다.

---

## 1) 프로젝트 소개

- **목표**: 실무형 백엔드 기본기(인증, 권한, 예외 처리, 계층 분리, DB 연동) 학습 및 포트폴리오화
- **핵심 포인트**
  - Spring Security + 세션 기반 인증 (`JSESSIONID`)
  - Method Security(`@PreAuthorize`) 기반 리소스 소유권 검증
  - JDBC 기반 Repository 계층 구현
  - 공통 API 응답 포맷 + 전역 예외 처리
  - Redis 기반 세션 저장소 적용
  - dev/prod 프로파일 분리

---

## 2) 기술 스택

- **Language**: Java 17
- **Framework**: Spring Boot 3.5.x
- **Security**: Spring Security, Method Security
- **DB**: MySQL (JDBC)
- **Session Store**: Redis + Spring Session
- **Validation**: Jakarta Validation
- **Build Tool**: Gradle

---

## 3) 주요 기능

### 인증/사용자
- 회원가입
- 로그인/로그아웃(세션 생성/무효화)
- 내 정보 조회(`/api/me`)
- 사용자 조회/수정/삭제
- 권한 정책
  - 사용자 목록 조회: 관리자 전용
  - 사용자 단건 조회/수정/삭제: 본인 또는 관리자

### 게시글
- 게시글 생성/조회/수정/삭제
- 목록 페이지네이션(`page`, `limit`)
- 단건 조회 시 조회수 증가
- 권한 정책
  - 목록/단건 조회: 공개
  - 생성: 로그인 필요
  - 수정/삭제: 작성자 또는 관리자

### 댓글
- 댓글 생성/목록/수정/삭제
- `before` 커서 기반 목록 조회 지원
- 댓글 생성/삭제 시 게시글 댓글 수 반영
- 권한 정책
  - 댓글 목록: 공개
  - 생성: 로그인 필요
  - 수정/삭제: 작성자 또는 관리자

---

## 4) API 엔드포인트 요약

### Auth
- `POST /api/login`
- `POST /api/logout`
- `GET /api/me`

### Users
- `POST /api/users` (회원가입, 공개)
- `GET /api/users?limit=10` (관리자)
- `GET /api/users/{id}` (본인/관리자)
- `PUT /api/users/{id}/nickname` (본인/관리자)
- `PUT /api/users/{id}/email` (본인/관리자)
- `PUT /api/users/{id}/password` (본인/관리자)
- `DELETE /api/users/{id}` (본인/관리자)

### Posts
- `POST /api/posts` (로그인 필요)
- `GET /api/posts?page=1&limit=20` (공개)
- `GET /api/posts/{id}` (공개)
- `PUT /api/posts/{id}` (작성자/관리자)
- `DELETE /api/posts/{id}` (작성자/관리자)

### Comments
- `POST /api/posts/{postId}/comments` (로그인 필요)
- `GET /api/posts/{postId}/comments?before=&limit=20` (공개)
- `PUT /api/comments/{id}` (작성자/관리자)
- `DELETE /api/comments/{id}` (작성자/관리자)

---

## 5) 공통 응답 포맷

```json
{
  "success": true,
  "message": "OK",
  "data": {},
  "code": null
}
```

에러 시:

```json
{
  "success": false,
  "message": "로그인이 필요합니다",
  "data": null,
  "code": "UNAUTHORIZED"
}
```

주요 에러 코드:
- `INVALID_REQUEST` (400)
- `UNAUTHORIZED` (401)
- `FORBIDDEN` (403)
- `NOT_FOUND_RESOURCE` (404)
- `DUPLICATE_RESOURCE` (409)
- `INTERNAL_ERROR` (500)

---

## 6) 프로젝트 구조

```text
src/main/java/com/koreanit/spring
├── common       # 공통 응답, 예외 처리, 로깅
├── security     # SecurityConfig, 세션 인증 필터, 권한 로직
├── user         # 사용자 도메인(Controller/Service/Repository/DTO)
├── post         # 게시글 도메인
└── comment      # 댓글 도메인
```

---

## 7) 실행 방법

### 1. 사전 준비
- JDK 17
- MySQL
- Redis

### 2. 로컬(dev) 실행

```bash
./gradlew bootRun
```

기본 프로파일은 `dev`이며, `application-dev.yml` 설정을 사용합니다.

### 3. 프로덕션(prod) 실행

환경변수 예시:

```bash
export PORT=8080
export DB_URL='jdbc:mysql://<host>:3306/<db>?serverTimezone=Asia/Seoul&characterEncoding=utf8'
export DB_USER='<user>'
export DB_PASSWORD='<password>'
export REDIS_HOST='127.0.0.1'
export REDIS_PORT='6379'
```

`application-prod.yml` 기준으로 실행하도록 프로파일을 지정해 배포합니다.

---

## 8) 테스트/검증

루트 경로의 HTTP 요청 파일로 API 시나리오를 빠르게 검증할 수 있습니다.

- `hello.http`
- `post.http`
- `comment.http`

예: 회원가입 → 로그인 → 게시글 생성 → 댓글 생성 → 권한 검증

---

## 9) 트러블슈팅 & 개선 포인트

- 중복 데이터 입력 시 DB 예외를 도메인 예외로 변환해 클라이언트 메시지 명확화
- 인증 실패/인가 실패 응답을 JSON으로 일관 처리
- 환경 분리(dev/prod) 및 CORS 구성 분리

향후 개선 계획:
- API 문서 자동화(Swagger/OpenAPI)
- 테스트 코드 확대(Unit/Integration)
- Docker 기반 로컬 개발 환경 표준화
- CI/CD 파이프라인 적용

---

## 10) 한 줄 요약

**"세션 기반 인증 + 역할/소유권 인가 + 게시판 핵심 기능을 실무 구조로 구현한 Spring Boot 백엔드 API"**
